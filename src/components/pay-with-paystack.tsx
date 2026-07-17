import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatNairaFull } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import {
  getPaystackPublicKey,
  initPayment,
  verifyPayment,
  type PaymentPlan,
} from "@/lib/paystack.functions";

type PaystackHandler = {
  openIframe: () => void;
};
declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: {
        key: string;
        email: string;
        amount: number; // kobo
        currency?: string;
        ref: string;
        onClose: () => void;
        callback: (res: { reference: string }) => void;
      }) => PaystackHandler;
    };
  }
}

function useScript(src: string) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (document.querySelector(`script[src="${src}"]`)) {
      setReady(true);
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => setReady(true);
    document.body.appendChild(s);
  }, [src]);
  return ready;
}

type Props = {
  propertyId: string;
  price: number; // base price
  listingType: "buy" | "rent" | "shortlet";
  disabled?: boolean;
};

export function PayWithPaystack({ propertyId, price, listingType, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<PaymentPlan>("full");
  const [email, setEmail] = useState("");
  const [nights, setNights] = useState(1);
  const [loading, setLoading] = useState(false);

  const scriptReady = useScript("https://js.paystack.co/v1/inline.js");
  const keyFn = useServerFn(getPaystackPublicKey);
  const initFn = useServerFn(initPayment);
  const verifyFn = useServerFn(verifyPayment);
  const { data: keyData } = useQuery({
    queryKey: ["paystack-public-key"],
    queryFn: () => keyFn(),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!open) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email && !email) setEmail(data.user.email);
    });
  }, [open, email]);

  const displayed =
    listingType === "shortlet" ? price * Math.max(1, nights) : price;
  const dueNow = plan === "half" ? displayed / 2 : displayed;

  const label =
    listingType === "buy" ? "Buy" : listingType === "rent" ? "Pay rent" : "Book stay";

  async function handlePay() {
    if (!email) {
      toast.error("Enter your email to continue");
      return;
    }
    if (!keyData?.publicKey) {
      toast.error("Payments not configured. Please try again later.");
      return;
    }
    if (!scriptReady || !window.PaystackPop) {
      toast.error("Payment library still loading — try again in a moment");
      return;
    }
    setLoading(true);
    try {
      const init = await initFn({
        data: { propertyId, plan, email, nights: listingType === "shortlet" ? nights : undefined },
      });
      const handler = window.PaystackPop.setup({
        key: keyData.publicKey,
        email,
        amount: Math.round(dueNow * (1 + 0.025) * 100), // matches server hidden fee (info only, server is source of truth)
        currency: "NGN",
        ref: init.reference,
        onClose: () => {
          setLoading(false);
          toast("Payment window closed");
        },
        callback: (res) => {
          verifyFn({ data: { reference: res.reference } })
            .then((v) => {
              if (v.status === "success") {
                toast.success("Payment successful! The agent will be in touch shortly.");
                setOpen(false);
              } else {
                toast.error("Payment could not be verified");
              }
            })
            .catch((e) => toast.error(e?.message ?? "Verification failed"))
            .finally(() => setLoading(false));
        },
      });
      handler.openIframe();
    } catch (e) {
      setLoading(false);
      toast.error(e instanceof Error ? e.message : "Could not start payment");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg" variant="secondary" disabled={disabled}>
          <CreditCard className="size-4" /> {label} with Paystack
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Secure payment</DialogTitle>
          <DialogDescription>
            Pay securely via Paystack. Your funds are protected and only released to the verified agent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Property price</p>
            <p className="mt-1 text-2xl font-semibold">{formatNairaFull(displayed)}</p>
            {listingType === "shortlet" ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatNairaFull(price)} × {nights} night{nights > 1 ? "s" : ""}
              </p>
            ) : null}
          </div>

          {listingType === "shortlet" ? (
            <div className="space-y-1.5">
              <Label htmlFor="nights">Number of nights</Label>
              <Input
                id="nights"
                type="number"
                min={1}
                value={nights}
                onChange={(e) => setNights(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Payment plan</Label>
            <RadioGroup value={plan} onValueChange={(v) => setPlan(v as PaymentPlan)}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 p-3 hover:bg-muted/40">
                <RadioGroupItem value="full" id="full" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Full payment</span>
                    <span className="font-semibold">{formatNairaFull(displayed)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Pay the entire amount now.</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 p-3 hover:bg-muted/40">
                <RadioGroupItem value="half" id="half" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Half payment</span>
                    <span className="font-semibold">{formatNairaFull(displayed / 2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pay 50% now, balance due later (arranged with agent).
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-email">Email for receipt</Label>
            <Input
              id="pay-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-primary-soft/50 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              Total due now: <strong className="text-foreground">{formatNairaFull(dueNow)}</strong>.
              Powered by Paystack — bank-grade encryption.
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handlePay} disabled={loading || !scriptReady}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
            Pay {formatNairaFull(dueNow)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
