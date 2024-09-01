-- USERS Table
create table users (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  billing_address jsonb,
  payment_method jsonb
);
alter table users enable row level security;
create policy "Can view own user data." on users for select using (auth.uid() = id);
create policy "Can update own user data." on users for update using (auth.uid() = id);

create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- CUSTOMERS Table
create table customers (
  id uuid references auth.users not null primary key,
  stripe_customer_id text
);
alter table customers enable row level security;

-- PRODUCTS Table
create table products (
  id text primary key,
  active boolean,
  name text,
  description text,
  image text,
  metadata jsonb
);
alter table products enable row level security;
create policy "Allow public read-only access." on products for select using (true);

-- PRICES Table with ON DELETE CASCADE
create type pricing_type as enum ('one_time', 'recurring');
create type pricing_plan_interval as enum ('day', 'week', 'month', 'year');
create table prices (
  id text primary key,
  product_id text references products(id) on delete cascade, 
  active boolean,
  description text,
  unit_amount bigint,
  currency text check (char_length(currency) = 3),
  type pricing_type,
  interval pricing_plan_interval,
  interval_count integer,
  trial_period_days integer,
  metadata jsonb
);
alter table prices enable row level security;
create policy "Allow public read-only access." on prices for select using (true);

-- SUBSCRIPTIONS Table
create type subscription_status as enum ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');
create table subscriptions (
  id text primary key,
  user_id uuid references auth.users not null,
  status subscription_status,
  metadata jsonb,
  price_id text references prices(id) on delete cascade,
  quantity integer,
  cancel_at_period_end boolean,
  created timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_start timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_end timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone default timezone('utc'::text, now()),
  cancel_at timestamp with time zone default timezone('utc'::text, now()),
  canceled_at timestamp with time zone default timezone('utc'::text, now()),
  trial_start timestamp with time zone default timezone('utc'::text, now()),
  trial_end timestamp with time zone default timezone('utc'::text, now())
);
alter table subscriptions enable row level security;
create policy "Can only view own subs data." on subscriptions for select using (auth.uid() = user_id);

-- REALTIME SUBSCRIPTIONS
drop publication if exists supabase_realtime;
create publication supabase_realtime for table products, prices;

-- DECKS Table
create table decks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table decks enable row level security;
create policy "Can view own decks" on decks for select using (auth.uid() = user_id);
create policy "Can modify own decks" on decks for update using (auth.uid() = user_id);
create policy "Can delete own decks" on decks for delete using (auth.uid() = user_id);

-- FLASHCARDS Table
create table flashcards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  front_text text not null,
  back_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  deck_id uuid references decks(id) on delete cascade
);
alter table flashcards enable row level security;
create policy "Can view own flashcards" on flashcards for select using (auth.uid() = user_id);
create policy "Can modify own flashcards" on flashcards for update using (auth.uid() = user_id);
create policy "Can delete own flashcards" on flashcards for delete using (auth.uid() = user_id);
create policy "Can only modify flashcards in own decks" on flashcards for update using (
  auth.uid() = (select user_id from decks where id = flashcards.deck_id)
);
create policy "Can only delete flashcards in own decks" on flashcards for delete using (
  auth.uid() = (select user_id from decks where id = flashcards.deck_id)
);

-- USER_PROGRESS Table
create table user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  flashcard_id uuid references flashcards(id) on delete cascade not null,
  deck_id uuid references decks(id) on delete cascade,
  status text check (status in ('new', 'in_progress', 'mastered')) default 'new',
  attempts int default 0,
  last_reviewed_at timestamp with time zone default timezone('utc'::text, now())
);
alter table user_progress enable row level security;
create policy "Can view own progress" on user_progress for select using (auth.uid() = user_id);
create policy "Can update own progress" on user_progress for update using (auth.uid() = user_id);

-- AI_SUGGESTIONS Table
create table ai_suggestions (
  id uuid default uuid_generate_v4() primary key,
  flashcard_id uuid references flashcards(id) on delete cascade not null,
  suggestion_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table ai_suggestions enable row level security;
create policy "Allow viewing suggestions" on ai_suggestions for select using (true);

-- Update Realtime Subscriptions
drop publication if exists supabase_realtime;
create publication supabase_realtime for table products, prices, flashcards, user_progress, decks;

-- First, create the enum type if it doesn't exist already
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visibility') THEN
        CREATE TYPE visibility AS ENUM ('public', 'unlisted', 'private');
    END IF;
END $$;

-- Then, add the column to the decks table with the default value set to 'private'
ALTER TABLE decks
ADD COLUMN visibility visibility NOT NULL DEFAULT 'private';