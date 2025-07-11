/*
  # Create sample estate and profiles for testing

  1. New Tables Data
    - Sample estate without developer reference
    - Sample profiles for admin, guard, and resident without user_id references
  
  2. Security
    - All existing RLS policies remain active
    - Sample data follows the same security model
  
  3. Notes
    - User IDs will be populated when actual users sign up through Supabase Auth
    - This creates the foundation data structure for testing
*/

-- First, let's create a sample estate for testing (without developer_id initially)
INSERT INTO estates (
  unique_id,
  name,
  address,
  city,
  state,
  country,
  total_units,
  occupied_units,
  contact_email,
  contact_phone,
  status
) VALUES (
  'EST-SAMPLE-001',
  'Sample Estate',
  '123 Sample Street',
  'Lagos',
  'Lagos',
  'Nigeria',
  50,
  25,
  'contact@sampleestate.com',
  '+234-800-123-4567',
  'active'
) ON CONFLICT (unique_id) DO NOTHING;

-- Get the estate ID for reference in subsequent inserts
DO $$
DECLARE
    sample_estate_id uuid;
BEGIN
    -- Get the sample estate ID
    SELECT id INTO sample_estate_id FROM estates WHERE unique_id = 'EST-SAMPLE-001';
    
    -- Create estate admin profile (without user_id initially)
    INSERT INTO estate_admins (
      unique_id,
      estate_id,
      name,
      email,
      phone,
      role,
      permissions,
      status
    ) VALUES (
      'ADM-SAMPLE-001',
      sample_estate_id,
      'Sample Admin',
      'admin@example.com',
      '+234-800-123-4568',
      'admin',
      '{"view_reports": true, "manage_guards": true, "manage_residents": true}'::jsonb,
      'active'
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Create guard profile (without user_id initially)
    INSERT INTO guards (
      unique_id,
      estate_id,
      name,
      email,
      phone,
      shift_schedule,
      emergency_contact,
      address,
      status
    ) VALUES (
      'GRD-SAMPLE-001',
      sample_estate_id,
      'Sample Guard',
      'guard@example.com',
      '+234-800-123-4569',
      'Day Shift (6AM - 6PM)',
      '+234-800-123-4570',
      '456 Guard Street, Lagos',
      'active'
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Create resident profile (without user_id initially)
    INSERT INTO residents (
      unique_id,
      estate_id,
      name,
      email,
      phone,
      apartment_number,
      apartment_type,
      lease_start_date,
      lease_end_date,
      monthly_rent,
      payment_status,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
      status
    ) VALUES (
      'RES-SAMPLE-001',
      sample_estate_id,
      'Sample Resident',
      'resident@example.com',
      '+234-800-123-4571',
      'A101',
      '2 Bedroom',
      '2024-01-01'::timestamptz,
      '2024-12-31'::timestamptz,
      150000.00,
      'current',
      'Emergency Contact',
      '+234-800-123-4572',
      'Spouse',
      'active'
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Create some sample visitor invites for testing
    INSERT INTO visitor_invites (
      unique_id,
      estate_id,
      visitor_name,
      visitor_phone,
      visitor_email,
      visit_date,
      visit_time,
      purpose,
      otp_code,
      status,
      expires_at
    ) VALUES 
    (
      'VIS-SAMPLE-001',
      sample_estate_id,
      'John Visitor',
      '+234-800-555-0001',
      'john.visitor@example.com',
      CURRENT_DATE + INTERVAL '1 day',
      '14:00:00',
      'Business Meeting',
      '123456',
      'pending',
      CURRENT_TIMESTAMP + INTERVAL '2 days'
    ),
    (
      'VIS-SAMPLE-002',
      sample_estate_id,
      'Jane Guest',
      '+234-800-555-0002',
      'jane.guest@example.com',
      CURRENT_DATE,
      '10:30:00',
      'Personal Visit',
      '789012',
      'approved',
      CURRENT_TIMESTAMP + INTERVAL '1 day'
    ) ON CONFLICT (unique_id) DO NOTHING;
    
    -- Create some sample visitor logs for testing
    INSERT INTO visitor_logs (
      estate_id,
      visitor_name,
      visitor_phone,
      entry_time,
      verification_method,
      notes,
      status
    ) VALUES 
    (
      sample_estate_id,
      'Mike Delivery',
      '+234-800-555-0003',
      CURRENT_TIMESTAMP - INTERVAL '2 hours',
      'manual',
      'Package delivery for resident A101',
      'exited'
    ),
    (
      sample_estate_id,
      'Sarah Friend',
      '+234-800-555-0004',
      CURRENT_TIMESTAMP - INTERVAL '30 minutes',
      'otp',
      'Social visit',
      'entered'
    );
    
    -- Create some sample notifications for testing
    INSERT INTO notifications (
      estate_id,
      type,
      title,
      message,
      data
    ) VALUES 
    (
      sample_estate_id,
      'visitor_arrival',
      'New Visitor Arrived',
      'John Visitor has arrived for a business meeting',
      '{"visitor_name": "John Visitor", "purpose": "Business Meeting"}'::jsonb
    ),
    (
      sample_estate_id,
      'system_update',
      'System Maintenance',
      'Scheduled maintenance will occur tonight from 2AM to 4AM',
      '{"maintenance_window": "2AM-4AM"}'::jsonb
    );
    
END $$;

-- Final migration: SaaS features, subdomain support, and subscription management

-- Add SaaS and subscription fields to estates table
ALTER TABLE estates ADD COLUMN IF NOT EXISTS subdomain text UNIQUE;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'trial' CHECK (subscription_plan IN ('trial', 'basic', 'premium', 'enterprise'));
ALTER TABLE estates ADD COLUMN IF NOT EXISTS trial_start timestamptz DEFAULT now();
ALTER TABLE estates ADD COLUMN IF NOT EXISTS trial_end timestamptz DEFAULT (now() + interval '14 days');
ALTER TABLE estates ADD COLUMN IF NOT EXISTS subscription_start timestamptz;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS subscription_end timestamptz;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS max_residents integer DEFAULT 50;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS max_guards integer DEFAULT 10;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '{"visitor_management": true, "notifications": true, "reports": true, "api_access": false}';

-- Add subscription management table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('trial', 'basic', 'premium', 'enterprise')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  amount numeric(10,2),
  currency text DEFAULT 'NGN',
  payment_method text,
  auto_renew boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add subscription usage tracking
CREATE TABLE IF NOT EXISTS subscription_usage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  metric_value integer NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

-- Add estate settings table
CREATE TABLE IF NOT EXISTS estate_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(estate_id, setting_key)
);

-- Add audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE estate_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Developers can manage their estate subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    estate_id IN (
      SELECT id FROM estates WHERE developer_id = auth.uid()
    )
  );

CREATE POLICY "Estate admins can view their estate subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    estate_id IN (
      SELECT estate_id FROM estate_admins WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for subscription_usage
CREATE POLICY "Developers can view their estate usage"
  ON subscription_usage
  FOR SELECT
  TO authenticated
  USING (
    estate_id IN (
      SELECT id FROM estates WHERE developer_id = auth.uid()
    )
  );

CREATE POLICY "Estate admins can view their estate usage"
  ON subscription_usage
  FOR SELECT
  TO authenticated
  USING (
    estate_id IN (
      SELECT estate_id FROM estate_admins WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for estate_settings
CREATE POLICY "Developers can manage their estate settings"
  ON estate_settings
  FOR ALL
  TO authenticated
  USING (
    estate_id IN (
      SELECT id FROM estates WHERE developer_id = auth.uid()
    )
  );

CREATE POLICY "Estate admins can view their estate settings"
  ON estate_settings
  FOR SELECT
  TO authenticated
  USING (
    estate_id IN (
      SELECT estate_id FROM estate_admins WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for audit_logs
CREATE POLICY "Developers can view their estate audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    estate_id IN (
      SELECT id FROM estates WHERE developer_id = auth.uid()
    )
  );

CREATE POLICY "Estate admins can view their estate audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    estate_id IN (
      SELECT estate_id FROM estate_admins WHERE user_id = auth.uid()
    )
  );

-- Function to check if user can access estate
CREATE OR REPLACE FUNCTION can_access_estate(estate_uuid uuid)
RETURNS boolean AS $$
BEGIN
  -- Developers can access any estate they own
  IF EXISTS (
    SELECT 1 FROM estates 
    WHERE id = estate_uuid AND developer_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  -- Estate admins can access their assigned estate
  IF EXISTS (
    SELECT 1 FROM estate_admins 
    WHERE estate_id = estate_uuid AND user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  -- Guards can access their assigned estate
  IF EXISTS (
    SELECT 1 FROM guards 
    WHERE estate_id = estate_uuid AND user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  -- Residents can access their assigned estate
  IF EXISTS (
    SELECT 1 FROM residents 
    WHERE estate_id = estate_uuid AND user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's estate access
CREATE OR REPLACE FUNCTION get_user_estate_access()
RETURNS TABLE (
  estate_id uuid,
  estate_name text,
  user_role text,
  can_manage boolean
) AS $$
BEGIN
  RETURN QUERY
  -- Developer estates
  SELECT 
    e.id as estate_id,
    e.name as estate_name,
    'developer' as user_role,
    true as can_manage
  FROM estates e
  WHERE e.developer_id = auth.uid()
  
  UNION ALL
  
  -- Estate admin estates
  SELECT 
    e.id as estate_id,
    e.name as estate_name,
    ea.role as user_role,
    true as can_manage
  FROM estate_admins ea
  JOIN estates e ON e.id = ea.estate_id
  WHERE ea.user_id = auth.uid()
  
  UNION ALL
  
  -- Guard estates
  SELECT 
    e.id as estate_id,
    e.name as estate_name,
    'guard' as user_role,
    false as can_manage
  FROM guards g
  JOIN estates e ON e.id = g.estate_id
  WHERE g.user_id = auth.uid()
  
  UNION ALL
  
  -- Resident estates
  SELECT 
    e.id as estate_id,
    e.name as estate_name,
    'resident' as user_role,
    false as can_manage
  FROM residents r
  JOIN estates e ON e.id = r.estate_id
  WHERE r.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check subscription status
CREATE OR REPLACE FUNCTION check_estate_subscription_status(estate_uuid uuid)
RETURNS TABLE (
  is_active boolean,
  plan_type text,
  trial_end timestamptz,
  subscription_end timestamptz,
  days_remaining integer
) AS $$
DECLARE
  estate_record estates%ROWTYPE;
  days_remaining integer;
BEGIN
  SELECT * INTO estate_record FROM estates WHERE id = estate_uuid;
  
  IF estate_record.subscription_plan = 'trial' THEN
    days_remaining := EXTRACT(DAY FROM (estate_record.trial_end - now()));
  ELSE
    days_remaining := EXTRACT(DAY FROM (estate_record.subscription_end - now()));
  END IF;
  
  RETURN QUERY
  SELECT 
    estate_record.is_active,
    estate_record.subscription_plan,
    estate_record.trial_end,
    estate_record.subscription_end,
    GREATEST(days_remaining, 0)::integer;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  p_estate_id uuid,
  p_action text,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (
    estate_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    p_estate_id,
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      NEW.estate_id,
      'CREATE',
      TG_TABLE_NAME,
      NEW.id,
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM create_audit_log(
      NEW.estate_id,
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      OLD.estate_id,
      'DELETE',
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for key tables
CREATE TRIGGER audit_estate_admins_trigger
  AFTER INSERT OR UPDATE OR DELETE ON estate_admins
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_guards_trigger
  AFTER INSERT OR UPDATE OR DELETE ON guards
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_residents_trigger
  AFTER INSERT OR UPDATE OR DELETE ON residents
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_visitor_invites_trigger
  AFTER INSERT OR UPDATE OR DELETE ON visitor_invites
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Function to get estate by subdomain
CREATE OR REPLACE FUNCTION get_estate_by_subdomain(p_subdomain text)
RETURNS TABLE (
  id uuid,
  name text,
  subdomain text,
  subscription_plan text,
  is_active boolean,
  trial_end timestamptz,
  subscription_end timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    e.subdomain,
    e.subscription_plan,
    e.is_active,
    e.trial_end,
    e.subscription_end
  FROM estates e
  WHERE e.subdomain = p_subdomain AND e.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing RLS policies to use the new access function
DROP POLICY IF EXISTS "Estate admins can view their estate" ON estates;
CREATE POLICY "Estate admins can view their estate"
  ON estates
  FOR SELECT
  TO authenticated
  USING (can_access_estate(id));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_estates_subdomain ON estates(subdomain);
CREATE INDEX IF NOT EXISTS idx_estates_developer_id ON estates(developer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_estate_id ON subscriptions(estate_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_estate_id ON audit_logs(estate_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Insert default estate settings
INSERT INTO estate_settings (estate_id, setting_key, setting_value)
SELECT 
  id,
  'default_settings',
  '{"allow_self_registration": false, "require_approval": true, "max_visitors_per_day": 10, "notification_email": true, "notification_sms": false}'::jsonb
FROM estates
ON CONFLICT (estate_id, setting_key) DO NOTHING;