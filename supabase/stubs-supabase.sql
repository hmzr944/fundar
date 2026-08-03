-- Doublures minimales des objets fournis par Supabase.
--
-- Ce fichier n'est JAMAIS appliqué en production : Supabase fournit déjà
-- auth.users, storage.buckets, storage.objects et les fonctions associées.
-- Il n'existe que pour rejouer les migrations sur un Postgres nu et vérifier
-- qu'elles s'appliquent proprement, dans l'ordre, avant de les lancer sur la
-- vraie base — où une erreur de syntaxe se découvre au pire moment.
--
-- Usage : scripts/verifier-migrations.sh

create extension if not exists pgcrypto;

create schema if not exists auth;
create schema if not exists storage;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text
);

-- Renvoie null hors session authentifiée, comme sur Supabase quand aucun
-- JWT n'est présent.
create or replace function auth.uid() returns uuid
  language sql stable as $$ select null::uuid $$;

create or replace function auth.jwt() returns jsonb
  language sql stable as $$ select '{}'::jsonb $$;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text not null,
  owner uuid
);

alter table storage.objects enable row level security;

-- Découpe "user/claim/fichier.pdf" en {user,claim}, comme storage.foldername.
create or replace function storage.foldername(name text) returns text[]
  language sql immutable as $$
    select (string_to_array(name, '/'))[1:greatest(array_length(string_to_array(name, '/'), 1) - 1, 0)]
  $$;

-- Les rôles PostgREST, référencés par les triggers de protection.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon;
  end if;
end
$$;
