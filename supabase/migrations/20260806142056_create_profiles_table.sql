-- ============================================================================
-- NEBULA JOB IMMERSION PLATFORM — SCHEMA SUPABASE (PostgreSQL)
-- À exécuter dans Supabase Dashboard > SQL Editor
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. PROFILES (extension de auth.users avec le rôle métier)
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student', 'coach', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-création du profil à l'inscription (role par défaut = student)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================================
-- 2. PROGRAMS
-- ============================================================================

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  domain text not null,
  target_audience text not null default '',
  difficulty text not null default 'Beginner' check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  sessions_count int not null check (sessions_count between 2 and 4),
  recommended_cohort_size int not null default 3,
  max_cohort_size int not null check (max_cohort_size between 1 and 20),
  learning_outcomes text[] not null default '{}',
  status text not null default 'Draft' check (status in ('Draft', 'Published', 'Archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_programs_coach on public.programs(coach_id);
create index idx_programs_status on public.programs(status);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_programs_updated_at
  before update on public.programs
  for each row execute function public.set_updated_at();


-- ============================================================================
-- 3. COHORTS
-- ============================================================================

create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  max_participants int not null check (max_participants between 1 and 20),
  status text not null default 'Open' check (status in ('Open', 'Full', 'Closed')),
  created_at timestamptz not null default now(),
  constraint chk_cohort_dates check (end_date > start_date)
);

create index idx_cohorts_program on public.cohorts(program_id);


-- ============================================================================
-- 4. SESSIONS
-- ============================================================================

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  title text not null,
  description text not null default '',
  session_date date not null,
  session_time time not null default '10:00',
  duration_minutes int not null default 45,
  order_index int not null check (order_index between 1 and 4),
  created_at timestamptz not null default now(),
  unique (cohort_id, order_index)
);

create index idx_sessions_cohort on public.sessions(cohort_id);

-- Règle métier : la date de session doit être dans la fenêtre de la cohorte
create or replace function public.check_session_date_within_cohort()
returns trigger language plpgsql as $$
declare
  v_start date;
  v_end date;
begin
  select start_date, end_date into v_start, v_end
  from public.cohorts where id = new.cohort_id;

  if new.session_date < v_start or new.session_date > v_end then
    raise exception 'Session date must be between cohort start_date (%) and end_date (%)', v_start, v_end;
  end if;

  return new;
end;
$$;

create trigger trg_check_session_date
  before insert or update on public.sessions
  for each row execute function public.check_session_date_within_cohort();

-- Note : la règle "nombre de sessions de la cohorte = program.sessions_count"
-- est une contrainte d'AGRÉGAT (compte de lignes), difficile à garantir proprement
-- avec un trigger row-level. Elle est donc validée côté application (use case
-- CreateCohortWithSessions), comme documenté dans ARCHITECTURE.md.


-- ============================================================================
-- 5. ENROLLMENTS
-- ============================================================================

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (student_id, cohort_id) -- empêche l'inscription en double au niveau DB
);

create index idx_enrollments_student on public.enrollments(student_id);
create index idx_enrollments_cohort on public.enrollments(cohort_id);

-- Règle métier : refuser l'inscription si la cohorte est pleine ou fermée
create or replace function public.check_enrollment_capacity()
returns trigger language plpgsql as $$
declare
  v_status text;
  v_max int;
  v_current int;
begin
  select status, max_participants into v_status, v_max
  from public.cohorts where id = new.cohort_id;

  if v_status <> 'Open' then
    raise exception 'Cannot enroll: cohort is not open (status = %)', v_status;
  end if;

  select count(*) into v_current
  from public.enrollments where cohort_id = new.cohort_id;

  if v_current >= v_max then
    raise exception 'Cannot enroll: cohort is full (% / %)', v_current, v_max;
  end if;

  return new;
end;
$$;

create trigger trg_check_enrollment_capacity
  before insert on public.enrollments
  for each row execute function public.check_enrollment_capacity();

-- Après inscription : passer la cohorte à "Full" si elle atteint le max
create or replace function public.update_cohort_status_after_enrollment()
returns trigger language plpgsql as $$
declare
  v_max int;
  v_current int;
begin
  select max_participants into v_max from public.cohorts where id = new.cohort_id;
  select count(*) into v_current from public.enrollments where cohort_id = new.cohort_id;

  if v_current >= v_max then
    update public.cohorts set status = 'Full' where id = new.cohort_id;
  end if;

  return new;
end;
$$;

create trigger trg_update_cohort_status
  after insert on public.enrollments
  for each row execute function public.update_cohort_status_after_enrollment();


-- ============================================================================
-- 6. EXPLORATIONS
-- ============================================================================

create table public.explorations (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  title text not null,
  description text not null default '',
  due_date date,
  created_at timestamptz not null default now()
);

create index idx_explorations_program on public.explorations(program_id);


-- ============================================================================
-- 7. EXPLORATION SUBMISSIONS (bonus)
-- ============================================================================

create table public.exploration_submissions (
  id uuid primary key default gen_random_uuid(),
  exploration_id uuid not null references public.explorations(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  response_text text not null default '',
  coach_feedback text,
  submitted_at timestamptz not null default now(),
  unique (exploration_id, student_id)
);


-- ============================================================================
-- 8. HELPER FUNCTIONS POUR RLS (évite la répétition dans chaque policy)
-- ============================================================================

create or replace function public.current_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_role() = 'admin';
$$;

create or replace function public.is_coach_of_program(p_program_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.programs
    where id = p_program_id and coach_id = auth.uid()
  );
$$;

create or replace function public.is_enrolled_in_cohort(p_cohort_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.enrollments
    where cohort_id = p_cohort_id and student_id = auth.uid()
  );
$$;


-- ============================================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.cohorts enable row level security;
alter table public.sessions enable row level security;
alter table public.enrollments enable row level security;
alter table public.explorations enable row level security;
alter table public.exploration_submissions enable row level security;

-- --- PROFILES ---
create policy "Users can view own profile" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "Users can update own profile (not role)" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

-- --- PROGRAMS ---
create policy "Anyone can view published programs" on public.programs
  for select using (status = 'Published' or coach_id = auth.uid() or public.is_admin());

create policy "Coaches can create programs" on public.programs
  for insert with check (coach_id = auth.uid() and public.current_role() = 'coach');

create policy "Coaches can update own programs" on public.programs
  for update using (coach_id = auth.uid() or public.is_admin());

-- --- COHORTS ---
create policy "View cohorts of visible programs" on public.cohorts
  for select using (
    exists (
      select 1 from public.programs p
      where p.id = program_id
      and (p.status = 'Published' or p.coach_id = auth.uid() or public.is_admin())
    )
  );

create policy "Coaches can create cohorts for own programs" on public.cohorts
  for insert with check (public.is_coach_of_program(program_id));

create policy "Coaches can update own cohorts" on public.cohorts
  for update using (public.is_coach_of_program(program_id) or public.is_admin());

-- --- SESSIONS ---
create policy "View sessions of visible cohorts" on public.sessions
  for select using (
    exists (
      select 1 from public.cohorts c
      join public.programs p on p.id = c.program_id
      where c.id = cohort_id
      and (p.status = 'Published' or p.coach_id = auth.uid() or public.is_admin())
    )
  );

create policy "Coaches can manage sessions of own cohorts" on public.sessions
  for all using (
    exists (
      select 1 from public.cohorts c
      where c.id = cohort_id and public.is_coach_of_program(c.program_id)
    ) or public.is_admin()
  );

-- --- ENROLLMENTS ---
create policy "Students view own enrollments" on public.enrollments
  for select using (
    student_id = auth.uid()
    or exists (
      select 1 from public.cohorts c
      where c.id = cohort_id and public.is_coach_of_program(c.program_id)
    )
    or public.is_admin()
  );

create policy "Students can enroll themselves" on public.enrollments
  for insert with check (student_id = auth.uid());

-- --- EXPLORATIONS ---
create policy "View explorations if enrolled or owner coach" on public.explorations
  for select using (
    public.is_coach_of_program(program_id)
    or public.is_admin()
    or exists (
      select 1 from public.cohorts c
      where c.program_id = explorations.program_id
      and public.is_enrolled_in_cohort(c.id)
    )
  );

create policy "Coaches manage explorations of own programs" on public.explorations
  for all using (public.is_coach_of_program(program_id) or public.is_admin());

-- --- EXPLORATION SUBMISSIONS ---
create policy "Students manage own submissions" on public.exploration_submissions
  for all using (
    student_id = auth.uid()
    or exists (
      select 1 from public.explorations e
      where e.id = exploration_id and public.is_coach_of_program(e.program_id)
    )
    or public.is_admin()
  );


-- ============================================================================
-- 10. VUE POUR LE DASHBOARD ADMIN (simplifie les requêtes côté app)
-- ============================================================================

create view public.admin_dashboard_stats as
select
  (select count(*) from public.programs) as total_programs,
  (select count(*) from public.programs where status = 'Published') as published_programs,
  (select count(*) from public.cohorts where status = 'Open') as active_cohorts,
  (select count(*) from public.enrollments) as total_enrollments,
  (select count(*) from public.profiles where role = 'student') as total_students,
  (select count(*) from public.profiles where role = 'coach') as total_coaches;