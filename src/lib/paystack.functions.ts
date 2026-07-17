import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Hidden platform fee added on top of the price shown to buyers.
// Agent is disbursed the full displayed amount; platform silently keeps the delta.
const HIDDEN_FEE_RATE = 0.025; // 2.5%

export type PaymentPlan = "full" | "half";
export type ListingType = "buy" | "rent" | "shortlet";

export const getPaystackPublicKey = createServerFn({ method: "GET" }).handler(async () => {
  return { publicKey: process.env.PAYSTACK_PUBLIC_KEY ?? "" };
});

export const initPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    propertyId: string;
    plan: PaymentPlan;
    email: string;
    nights?: number;
  }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Fetch property (RLS applies as buyer)
    const { data: property, error: pErr } = await supabase
      .from("properties")
      .select("id, title, price, listing_type, agent_id")
      .eq("id", data.propertyId)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!property) throw new Error("Property not found");

    const listingType = property.listing_type as ListingType;
    const basePrice = Number(property.price);
    let displayed = basePrice;
    if (listingType === "shortlet") {
      const nights = Math.max(1, data.nights ?? 1);
      displayed = basePrice * nights;
    }

    const isHalf = data.plan === "half";
    const displayedInstallment = isHalf ? displayed / 2 : displayed;
    const chargedAmount = Math.round(displayedInstallment * (1 + HIDDEN_FEE_RATE) * 100) / 100;
    // Agent disbursement is the full displayed portion buyer paid for
    const agentDisbursement = displayedInstallment;

    const reference = `HT-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("Payment provider not configured");

    // Initialize Paystack transaction (server-side)
    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        amount: Math.round(chargedAmount * 100), // kobo
        currency: "NGN",
        reference,
        metadata: {
          property_id: property.id,
          property_title: property.title,
          plan: data.plan,
          listing_type: listingType,
          buyer_id: userId,
        },
      }),
    });
    const initJson = await initRes.json();
    if (!initRes.ok || !initJson?.status) {
      throw new Error(initJson?.message || "Failed to initialize payment");
    }

    // Record payment (as authenticated buyer)
    const { error: insErr } = await supabase.from("payments").insert({
      property_id: property.id,
      buyer_id: userId,
      agent_id: property.agent_id,
      listing_type: listingType,
      payment_plan: data.plan,
      displayed_amount: displayedInstallment,
      charged_amount: chargedAmount,
      agent_disbursement: agentDisbursement,
      reference,
      status: "pending",
      buyer_email: data.email,
      metadata: { nights: data.nights ?? null },
    });
    if (insErr) throw new Error(insErr.message);

    return {
      reference,
      access_code: initJson.data.access_code as string,
      authorization_url: initJson.data.authorization_url as string,
      displayed_amount: displayedInstallment,
    };
  });

export const verifyPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { reference: string }) => data)
  .handler(async ({ data, context }) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("Payment provider not configured");

    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`,
      { headers: { Authorization: `Bearer ${secret}` } },
    );
    const json = await res.json();
    const status: string = json?.data?.status ?? "failed";
    const dbStatus = status === "success" ? "success" : status === "abandoned" ? "abandoned" : "failed";

    const { supabase, userId } = context;
    const { error } = await supabase
      .from("payments")
      .update({ status: dbStatus, paystack_response: json?.data ?? null })
      .eq("reference", data.reference)
      .eq("buyer_id", userId);
    if (error) throw new Error(error.message);

    return { status: dbStatus };
  });
