-- ============================================
-- SECURITY FIX: Comprehensive RLS Overhaul
-- ============================================

-- 1. Create app_role enum for role-based access control
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'staff', 'viewer');
  END IF;
END $$;

-- 2. Create user_roles table (separate from users table for security)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    role app_role NOT NULL DEFAULT 'staff',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles (prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id text, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function to check if user is admin or manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'manager')
  )
$$;

-- 5. RLS policies for user_roles table
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_admin_or_manager(auth.uid()::text));

-- 6. Enable RLS on sessions table and restrict access
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Sessions should only be accessible by service role (backend)
CREATE POLICY "Service role only for sessions" ON public.sessions
  FOR ALL USING (
    (current_setting('request.jwt.claims', true)::json->>'role')::text = 'service_role'
  );

-- 7. Fix overly permissive policies on users table
DROP POLICY IF EXISTS "Allow read for all on users" ON public.users;
DROP POLICY IF EXISTS "Allow insert for authenticated on users" ON public.users;
DROP POLICY IF EXISTS "Allow update for authenticated on users" ON public.users;

-- Users can read their own data
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (id = auth.uid()::text);

-- Admins/managers can read all users
CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (public.is_admin_or_manager(auth.uid()::text));

-- Users can insert their own record (for signup)
CREATE POLICY "Users can insert own record" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid()::text);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (id = auth.uid()::text);

-- Admins can update any user
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.is_admin_or_manager(auth.uid()::text));

-- 8. Fix overly permissive policies on tickets table
DROP POLICY IF EXISTS "Allow all operations for authenticated users on tickets" ON public.tickets;

-- Users can read tickets they're assigned to, reported, or if admin/manager
CREATE POLICY "Users can read relevant tickets" ON public.tickets
  FOR SELECT USING (
    "assignedToUserId" = auth.uid()::text OR
    "reportedByUserId" = auth.uid()::text OR
    public.is_admin_or_manager(auth.uid()::text)
  );

-- Users can insert tickets
CREATE POLICY "Authenticated users can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update tickets they're assigned to or if admin/manager
CREATE POLICY "Users can update assigned tickets" ON public.tickets
  FOR UPDATE USING (
    "assignedToUserId" = auth.uid()::text OR
    public.is_admin_or_manager(auth.uid()::text)
  );

-- Only admins can delete tickets
CREATE POLICY "Only admins can delete tickets" ON public.tickets
  FOR DELETE USING (public.is_admin_or_manager(auth.uid()::text));

-- 9. Fix ticket-related tables
DROP POLICY IF EXISTS "Allow all for authenticated on ticketComments" ON public."ticketComments";
DROP POLICY IF EXISTS "Allow all for authenticated on ticketHistory" ON public."ticketHistory";
DROP POLICY IF EXISTS "Allow all for authenticated on ticketAttachments" ON public."ticketAttachments";
DROP POLICY IF EXISTS "Allow all for authenticated on ticketWatchers" ON public."ticketWatchers";
DROP POLICY IF EXISTS "Allow all for authenticated on customerFeedback" ON public."customerFeedback";
DROP POLICY IF EXISTS "Allow all for authenticated on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow all for authenticated on userStudioAccess" ON public."userStudioAccess";

-- ticketComments: Users can access comments on tickets they have access to
CREATE POLICY "Users can read comments on accessible tickets" ON public."ticketComments"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = "ticketId" 
      AND (t."assignedToUserId" = auth.uid()::text OR t."reportedByUserId" = auth.uid()::text OR public.is_admin_or_manager(auth.uid()::text))
    )
  );

CREATE POLICY "Authenticated users can create comments" ON public."ticketComments"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND "userId" = auth.uid()::text);

CREATE POLICY "Users can update own comments" ON public."ticketComments"
  FOR UPDATE USING ("userId" = auth.uid()::text);

CREATE POLICY "Admins can manage all comments" ON public."ticketComments"
  FOR ALL USING (public.is_admin_or_manager(auth.uid()::text));

-- ticketHistory: Same pattern as comments
CREATE POLICY "Users can read history on accessible tickets" ON public."ticketHistory"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = "ticketId" 
      AND (t."assignedToUserId" = auth.uid()::text OR t."reportedByUserId" = auth.uid()::text OR public.is_admin_or_manager(auth.uid()::text))
    )
  );

CREATE POLICY "Authenticated users can create history" ON public."ticketHistory"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all history" ON public."ticketHistory"
  FOR ALL USING (public.is_admin_or_manager(auth.uid()::text));

-- ticketAttachments: Same pattern
CREATE POLICY "Users can read attachments on accessible tickets" ON public."ticketAttachments"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = "ticketId" 
      AND (t."assignedToUserId" = auth.uid()::text OR t."reportedByUserId" = auth.uid()::text OR public.is_admin_or_manager(auth.uid()::text))
    )
  );

CREATE POLICY "Authenticated users can upload attachments" ON public."ticketAttachments"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND "uploadedByUserId" = auth.uid()::text);

CREATE POLICY "Users can delete own attachments" ON public."ticketAttachments"
  FOR DELETE USING ("uploadedByUserId" = auth.uid()::text);

CREATE POLICY "Admins can manage all attachments" ON public."ticketAttachments"
  FOR ALL USING (public.is_admin_or_manager(auth.uid()::text));

-- ticketWatchers: Same pattern
CREATE POLICY "Users can see watchers on accessible tickets" ON public."ticketWatchers"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = "ticketId" 
      AND (t."assignedToUserId" = auth.uid()::text OR t."reportedByUserId" = auth.uid()::text OR public.is_admin_or_manager(auth.uid()::text))
    )
  );

CREATE POLICY "Users can add themselves as watchers" ON public."ticketWatchers"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND "userId" = auth.uid()::text);

CREATE POLICY "Users can remove themselves as watchers" ON public."ticketWatchers"
  FOR DELETE USING ("userId" = auth.uid()::text);

CREATE POLICY "Admins can manage all watchers" ON public."ticketWatchers"
  FOR ALL USING (public.is_admin_or_manager(auth.uid()::text));

-- customerFeedback: Users can read/write feedback on their accessible tickets
CREATE POLICY "Users can read feedback on accessible tickets" ON public."customerFeedback"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = "ticketId" 
      AND (t."assignedToUserId" = auth.uid()::text OR t."reportedByUserId" = auth.uid()::text OR public.is_admin_or_manager(auth.uid()::text))
    )
  );

CREATE POLICY "Authenticated users can create feedback" ON public."customerFeedback"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all feedback" ON public."customerFeedback"
  FOR ALL USING (public.is_admin_or_manager(auth.uid()::text));

-- notifications: Users can only see their own notifications
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING ("userId" = auth.uid()::text);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING ("userId" = auth.uid()::text);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (public.is_admin_or_manager(auth.uid()::text));

-- userStudioAccess: Users can see their own access, admins can manage all
CREATE POLICY "Users can read own studio access" ON public."userStudioAccess"
  FOR SELECT USING ("userId" = auth.uid()::text);

CREATE POLICY "Admins can manage all studio access" ON public."userStudioAccess"
  FOR ALL USING (public.is_admin_or_manager(auth.uid()::text));

-- 10. Add trigger to update updated_at on user_roles
CREATE OR REPLACE FUNCTION public.update_user_roles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_roles_updated_at();

-- 11. Migrate existing user roles to the new table
INSERT INTO public.user_roles (user_id, role)
SELECT id, 
  CASE 
    WHEN role = 'admin' THEN 'admin'::app_role
    WHEN role = 'manager' THEN 'manager'::app_role
    WHEN role = 'viewer' THEN 'viewer'::app_role
    ELSE 'staff'::app_role
  END
FROM public.users
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;