create table subreddits (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  member_count integer not null,
  description text,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
); 