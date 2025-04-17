-- Create users table extension (handled by Supabase Auth)
-- Note: This is auto-created by Supabase, but we're adding it here for documentation

-- Create profiles table
create table public.profiles (
    id uuid references auth.users on delete cascade,
    email text unique,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    preferences jsonb default '{}'::jsonb,
    primary key (id)
);

-- Create RLS policies for profiles
-- Even though we're using service role, having proper RLS is good practice
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;


-- Create a trigger to create profiles when users are created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (
    new.id,
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to create profiles when users are created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update updated_at timestamp when profiles are updated
CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 