-- Update websites table
alter table public.websites 
add column if not exists api_key uuid default uuid_generate_v4(),
alter column config set default '{
  "primaryColor": "#2563eb",
  "position": "right",
  "preamble": "How can I help you today?"
}'::jsonb;

-- Create chat_sessions table if not exists
create table if not exists public.chat_sessions (
  id uuid default uuid_generate_v4() primary key,
  website_id uuid references websites not null,
  messages_count int default 0,
  started_at timestamp with time zone default timezone('utc'::text, now()),
  ended_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create messages table if not exists
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references chat_sessions not null,
  content text not null,
  role text check (role in ('user', 'assistant')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Set up RLS policies
alter table public.websites enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.messages enable row level security;

-- Website access policies
create policy if not exists "Allow public access with API key"
  on public.websites for select
  to anon
  using (api_key::text = current_setting('request.headers')::json->>'x-api-key');

create policy if not exists "Allow website owners to manage their websites"
  on public.websites for all
  to authenticated
  using (user_id = auth.uid());

-- Chat session policies
create policy if not exists "Allow chat sessions with valid API key"
  on public.chat_sessions for all
  to anon
  using (
    exists (
      select 1 from websites
      where websites.id = website_id
      and websites.api_key::text = current_setting('request.headers')::json->>'x-api-key'
    )
  );

-- Message policies
create policy if not exists "Allow messages with valid API key"
  on public.messages for all
  to anon
  using (
    exists (
      select 1 from chat_sessions
      join websites on websites.id = chat_sessions.website_id
      where chat_sessions.id = session_id
      and websites.api_key::text = current_setting('request.headers')::json->>'x-api-key'
    )
  );
