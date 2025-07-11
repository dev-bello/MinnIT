/*
  # Estate Management System Database Schema

  1. New Tables
    - `estates` - Top level: Registered estates
    - `estate_admins` - Secondary level: Estate administrators
    - `guards` - Estate security personnel
    - `residents` - Estate residents
    - `visitor_invites` - Visitor invitation system
    - `visitor_logs` - Visitor entry/exit logs
    - `notifications` - System notifications
    - `residency_requests` - Resident requests and changes

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each user role
    - Implement hierarchical access control

  3. Features
    - Unique ID generation for all entities
    - Hierarchical data structure (Developer -> Estate -> Admin -> Guards/Residents)
    - Complete visitor management system
    - Notification system
    - Request management system
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Estates table (Top level)
CREATE TABLE IF NOT EXISTS estates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_id text UNIQUE NOT NULL,
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  country text DEFAULT 'Nigeria',
  total_units integer DEFAULT 0,
  occupied_units integer DEFAULT 0,
  developer_id uuid REFERENCES auth.users(id),
  contact_email text,
  contact_phone text,
  registration_date timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Estate Admins table (Secondary level)
CREATE TABLE IF NOT EXISTS estate_admins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_id text UNIQUE NOT NULL,
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions jsonb DEFAULT '{"manage_guards": true, "manage_residents": true, "view_reports": true}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Guards table
CREATE TABLE IF NOT EXISTS guards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_id text UNIQUE NOT NULL,
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  shift_schedule text NOT NULL,
  emergency_contact text,
  address text,
  employment_date timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Residents table
CREATE TABLE IF NOT EXISTS residents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_id text UNIQUE NOT NULL,
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  apartment_number text NOT NULL,
  apartment_type text,
  lease_start_date timestamptz,
  lease_end_date timestamptz,
  monthly_rent numeric(10,2),
  payment_status text DEFAULT 'current' CHECK (payment_status IN ('current', 'overdue', 'pending')),
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relation text,
  can_edit boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'moved_out')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Visitor Invites table
CREATE TABLE IF NOT EXISTS visitor_invites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_id text UNIQUE NOT NULL,
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  resident_id uuid REFERENCES residents(id) ON DELETE CASCADE,
  visitor_name text NOT NULL,
  visitor_phone text NOT NULL,
  visitor_email text,
  visit_date date NOT NULL,
  visit_time time NOT NULL,
  purpose text NOT NULL,
  otp_code text UNIQUE NOT NULL,
  qr_code text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'expired', 'used')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Visitor Logs table
CREATE TABLE IF NOT EXISTS visitor_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  invite_id uuid REFERENCES visitor_invites(id),
  guard_id uuid REFERENCES guards(id),
  visitor_name text NOT NULL,
  visitor_phone text,
  entry_time timestamptz DEFAULT now(),
  exit_time timestamptz,
  verification_method text CHECK (verification_method IN ('otp', 'qr_code', 'manual')),
  notes text,
  status text DEFAULT 'entered' CHECK (status IN ('entered', 'exited', 'denied')),
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Residency Requests table
CREATE TABLE IF NOT EXISTS residency_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  resident_id uuid REFERENCES residents(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text,
  details text NOT NULL,
  current_apartment text,
  requested_apartment text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed')),
  admin_notes text,
  submitted_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE estates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estate_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE guards ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE residency_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Estates
CREATE POLICY "Developers can manage their estates"
  ON estates
  FOR ALL
  TO authenticated
  USING (developer_id = auth.uid());

CREATE POLICY "Estate admins can view their estate"
  ON estates
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT estate_id FROM estate_admins WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for Estate Admins
CREATE POLICY "Developers can manage estate admins"
  ON estate_admins
  FOR ALL
  TO authenticated
  USING (
    estate_id IN (
      SELECT id FROM estates WHERE developer_id = auth.uid()
    )
  );

CREATE POLICY "Estate admins can view themselves"
  ON estate_admins
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for Guards
CREATE POLICY "Estate admins can manage guards"
  ON guards
  FOR ALL
  TO authenticated
  USING (
    estate_id IN (
      SELECT estate_id FROM estate_admins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Guards can view themselves"
  ON guards
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for Residents
CREATE POLICY "Estate admins can manage residents"
  ON residents
  FOR ALL
  TO authenticated
  USING (
    estate_id IN (
      SELECT estate_id FROM estate_admins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Residents can view and update themselves"
  ON residents
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for Visitor Invites
CREATE POLICY "Residents can manage their invites"
  ON visitor_invites
  FOR ALL
  TO authenticated
  USING (
    resident_id IN (
      SELECT id FROM residents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Estate staff can view invites"
  ON visitor_invites
  FOR SELECT
  TO authenticated
  USING (
    estate_id IN (
      SELECT estate_id FROM estate_admins WHERE user_id = auth.uid()
      UNION
      SELECT estate_id FROM guards WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for Visitor Logs
CREATE POLICY "Estate staff can manage visitor logs"
  ON visitor_logs
  FOR ALL
  TO authenticated
  USING (
    estate_id IN (
      SELECT estate_id FROM estate_admins WHERE user_id = auth.uid()
      UNION
      SELECT estate_id FROM guards WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Residents can view logs for their visitors"
  ON visitor_logs
  FOR SELECT
  TO authenticated
  USING (
    invite_id IN (
      SELECT id FROM visitor_invites 
      WHERE resident_id IN (
        SELECT id FROM residents WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for Notifications
CREATE POLICY "Users can view their notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for Residency Requests
CREATE POLICY "Residents can manage their requests"
  ON residency_requests
  FOR ALL
  TO authenticated
  USING (
    resident_id IN (
      SELECT id FROM residents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Estate admins can manage requests"
  ON residency_requests
  FOR ALL
  TO authenticated
  USING (
    estate_id IN (
      SELECT estate_id FROM estate_admins WHERE user_id = auth.uid()
    )
  );

-- Functions for unique ID generation
CREATE OR REPLACE FUNCTION generate_estate_id()
RETURNS text AS $$
DECLARE
  new_id text;
  counter integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(unique_id FROM 4) AS integer)), 0) + 1
  INTO counter
  FROM estates;
  
  new_id := 'EST' || LPAD(counter::text, 3, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_admin_id()
RETURNS text AS $$
DECLARE
  new_id text;
  counter integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(unique_id FROM 4) AS integer)), 0) + 1
  INTO counter
  FROM estate_admins;
  
  new_id := 'ADM' || LPAD(counter::text, 3, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_guard_id()
RETURNS text AS $$
DECLARE
  new_id text;
  counter integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(unique_id FROM 4) AS integer)), 0) + 1
  INTO counter
  FROM guards;
  
  new_id := 'GRD' || LPAD(counter::text, 3, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_resident_id()
RETURNS text AS $$
DECLARE
  new_id text;
  counter integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(unique_id FROM 4) AS integer)), 0) + 1
  INTO counter
  FROM residents;
  
  new_id := 'RES' || LPAD(counter::text, 3, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_visitor_id()
RETURNS text AS $$
DECLARE
  new_id text;
  counter integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(unique_id FROM 4) AS integer)), 0) + 1
  INTO counter
  FROM visitor_invites;
  
  new_id := 'VIS' || LPAD(counter::text, 3, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-generating unique IDs
CREATE OR REPLACE FUNCTION set_unique_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.unique_id IS NULL THEN
    CASE TG_TABLE_NAME
      WHEN 'estates' THEN NEW.unique_id := generate_estate_id();
      WHEN 'estate_admins' THEN NEW.unique_id := generate_admin_id();
      WHEN 'guards' THEN NEW.unique_id := generate_guard_id();
      WHEN 'residents' THEN NEW.unique_id := generate_resident_id();
      WHEN 'visitor_invites' THEN NEW.unique_id := generate_visitor_id();
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER estates_unique_id_trigger
  BEFORE INSERT ON estates
  FOR EACH ROW EXECUTE FUNCTION set_unique_id();

CREATE TRIGGER estate_admins_unique_id_trigger
  BEFORE INSERT ON estate_admins
  FOR EACH ROW EXECUTE FUNCTION set_unique_id();

CREATE TRIGGER guards_unique_id_trigger
  BEFORE INSERT ON guards
  FOR EACH ROW EXECUTE FUNCTION set_unique_id();

CREATE TRIGGER residents_unique_id_trigger
  BEFORE INSERT ON residents
  FOR EACH ROW EXECUTE FUNCTION set_unique_id();

CREATE TRIGGER visitor_invites_unique_id_trigger
  BEFORE INSERT ON visitor_invites
  FOR EACH ROW EXECUTE FUNCTION set_unique_id();

-- Function to generate OTP codes
CREATE OR REPLACE FUNCTION generate_otp()
RETURNS text AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Updated timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER estates_updated_at_trigger
  BEFORE UPDATE ON estates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER estate_admins_updated_at_trigger
  BEFORE UPDATE ON estate_admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER guards_updated_at_trigger
  BEFORE UPDATE ON guards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER residents_updated_at_trigger
  BEFORE UPDATE ON residents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER visitor_invites_updated_at_trigger
  BEFORE UPDATE ON visitor_invites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();