
-- Enums
CREATE TYPE public.user_role AS ENUM ('buyer', 'agent', 'developer', 'admin');
CREATE TYPE public.listing_type AS ENUM ('sale', 'rent', 'shortlet');
CREATE TYPE public.property_type AS ENUM ('house', 'duplex', 'apartment', 'land', 'commercial', 'office', 'warehouse', 'estate');
CREATE TYPE public.property_status AS ENUM ('available', 'reserved', 'sold', 'rented', 'draft');
CREATE TYPE public.verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role public.user_role NOT NULL DEFAULT 'buyer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Agents (agent-specific extension)
CREATE TABLE public.agents (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company TEXT,
  bio TEXT,
  years_experience INT DEFAULT 0,
  license_number TEXT,
  verification public.verification_status NOT NULL DEFAULT 'unverified',
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  languages TEXT[] DEFAULT ARRAY['English']::TEXT[],
  response_time_hours INT DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.agents TO authenticated;
GRANT SELECT ON public.agents TO anon;
GRANT ALL ON public.agents TO service_role;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents are viewable by everyone" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Users can insert own agent profile" ON public.agents FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own agent profile" ON public.agents FOR UPDATE USING (auth.uid() = id);

-- Properties
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  listing_type public.listing_type NOT NULL DEFAULT 'sale',
  property_type public.property_type NOT NULL DEFAULT 'house',
  status public.property_status NOT NULL DEFAULT 'available',
  state TEXT NOT NULL,
  city TEXT,
  area TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  toilets INT DEFAULT 0,
  parking INT DEFAULT 0,
  sqm INT,
  year_built INT,
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  nearby TEXT[] DEFAULT ARRAY[]::TEXT[],
  cover_image TEXT,
  gallery TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured BOOLEAN NOT NULL DEFAULT false,
  views INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX properties_state_idx ON public.properties(state);
CREATE INDEX properties_type_idx ON public.properties(property_type);
CREATE INDEX properties_listing_idx ON public.properties(listing_type);
CREATE INDEX properties_status_idx ON public.properties(status);
CREATE INDEX properties_featured_idx ON public.properties(featured);
GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published properties are viewable by everyone" ON public.properties FOR SELECT USING (status <> 'draft');
CREATE POLICY "Owners can view their own listings" ON public.properties FOR SELECT USING (auth.uid() = agent_id);
CREATE POLICY "Agents can create their own listings" ON public.properties FOR INSERT WITH CHECK (auth.uid() = agent_id);
CREATE POLICY "Owners can update their listings" ON public.properties FOR UPDATE USING (auth.uid() = agent_id);
CREATE POLICY "Owners can delete their listings" ON public.properties FOR DELETE USING (auth.uid() = agent_id);

-- Favorites
CREATE TABLE public.favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, property_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
