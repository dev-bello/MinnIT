/*
  # Visitor Management History System

  1. New Tables
    - `visitor_history` - Comprehensive visitor activity tracking
    - `visitor_sessions` - Track visitor entry/exit sessions
    - `visitor_feedback` - Collect visitor experience feedback
    - `guard_shift_reports` - Guard shift summaries and reports

  2. Enhanced Features
    - Complete visitor journey tracking
    - Real-time status updates
    - Performance analytics
    - Audit trail for all visitor activities
    - Integration with existing visitor_logs and visitor_invites

  3. Security
    - Enable RLS on all new tables
    - Role-based access policies
    - Audit logging for sensitive operations

  4. Performance
    - Optimized indexes for common queries
    - Efficient data retrieval for dashboards
*/

-- Visitor History table - Central tracking for all visitor activities
CREATE TABLE IF NOT EXISTS visitor_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_id text UNIQUE NOT NULL,
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  invite_id uuid REFERENCES visitor_invites(id) ON DELETE SET NULL,
  visitor_log_id uuid REFERENCES visitor_logs(id) ON DELETE SET NULL,
  
  -- Visitor Information
  visitor_name text NOT NULL,
  visitor_phone text,
  visitor_email text,
  visitor_id_number text, -- For ID verification
  visitor_photo_url text, -- Optional photo storage
  
  -- Visit Details
  resident_id uuid REFERENCES residents(id) ON DELETE SET NULL,
  resident_name text NOT NULL,
  apartment_number text NOT NULL,
  purpose text NOT NULL,
  expected_duration interval, -- How long the visit should last
  
  -- Timing Information
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  actual_arrival_time timestamptz,
  actual_departure_time timestamptz,
  total_visit_duration interval GENERATED ALWAYS AS (actual_departure_time - actual_arrival_time) STORED,
  
  -- Verification & Security
  verification_method text CHECK (verification_method IN ('otp', 'qr_code', 'manual', 'id_check', 'biometric')),
  otp_code text,
  verified_by_guard_id uuid REFERENCES guards(id) ON DELETE SET NULL,
  verified_by_guard_name text,
  verification_notes text,
  
  -- Status Tracking
  status text DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'arrived', 'in_progress', 'departed', 'overstayed', 
    'cancelled', 'no_show', 'denied_entry', 'emergency_exit'
  )),
  
  -- Additional Information
  vehicle_info jsonb, -- {plate_number, make, model, color}
  accompanying_persons jsonb, -- Array of additional visitors
  items_brought jsonb, -- Items brought by visitor
  special_instructions text,
  
  -- Ratings & Feedback
  visitor_rating integer CHECK (visitor_rating >= 1 AND visitor_rating <= 5),
  guard_rating integer CHECK (guard_rating >= 1 AND guard_rating <= 5),
  feedback_notes text,
  
  -- System Fields
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  last_updated_by uuid REFERENCES auth.users(id)
);

-- Visitor Sessions table - Track active visitor sessions
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_history_id uuid REFERENCES visitor_history(id) ON DELETE CASCADE,
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  
  -- Session Information
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  session_duration interval GENERATED ALWAYS AS (session_end - session_start) STORED,
  
  -- Location Tracking
  entry_point text, -- Main gate, side entrance, etc.
  current_location text, -- Last known location within estate
  exit_point text,
  
  -- Guard Information
  entry_guard_id uuid REFERENCES guards(id),
  exit_guard_id uuid REFERENCES guards(id),
  
  -- Session Status
  is_active boolean DEFAULT true,
  session_type text DEFAULT 'normal' CHECK (session_type IN ('normal', 'emergency', 'extended', 'overnight')),
  
  -- Security Alerts
  alerts jsonb DEFAULT '[]', -- Array of security alerts during session
  violations jsonb DEFAULT '[]', -- Any policy violations
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Visitor Feedback table - Collect visitor experience data
CREATE TABLE IF NOT EXISTS visitor_feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_history_id uuid REFERENCES visitor_history(id) ON DELETE CASCADE,
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  
  -- Feedback Details
  overall_rating integer CHECK (overall_rating >= 1 AND overall_rating <= 5),
  security_rating integer CHECK (security_rating >= 1 AND security_rating <= 5),
  facility_rating integer CHECK (facility_rating >= 1 AND facility_rating <= 5),
  staff_rating integer CHECK (staff_rating >= 1 AND staff_rating <= 5),
  
  -- Detailed Feedback
  positive_feedback text,
  negative_feedback text,
  suggestions text,
  
  -- Experience Categories
  wait_time_rating integer CHECK (wait_time_rating >= 1 AND wait_time_rating <= 5),
  process_clarity_rating integer CHECK (process_clarity_rating >= 1 AND process_clarity_rating <= 5),
  
  -- Visitor Information
  visitor_name text,
  visitor_email text,
  would_recommend boolean,
  
  -- System Fields
  submitted_at timestamptz DEFAULT now(),
  is_anonymous boolean DEFAULT false
);

-- Guard Shift Reports table - Track guard performance and activities
CREATE TABLE IF NOT EXISTS guard_shift_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  unique_id text UNIQUE NOT NULL,
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  guard_id uuid REFERENCES guards(id) ON DELETE CASCADE,
  
  -- Shift Information
  shift_date date NOT NULL,
  shift_start_time timestamptz NOT NULL,
  shift_end_time timestamptz,
  shift_duration interval GENERATED ALWAYS AS (shift_end_time - shift_start_time) STORED,
  
  -- Activity Summary
  total_visitors_processed integer DEFAULT 0,
  total_visitors_approved integer DEFAULT 0,
  total_visitors_denied integer DEFAULT 0,
  total_emergencies_handled integer DEFAULT 0,
  
  -- Performance Metrics
  average_processing_time interval,
  incidents_reported integer DEFAULT 0,
  policy_violations_detected integer DEFAULT 0,
  
  -- Shift Notes
  shift_summary text,
  incidents_details jsonb DEFAULT '[]',
  maintenance_issues jsonb DEFAULT '[]',
  recommendations text,
  
  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'incomplete', 'emergency_ended')),
  
  -- System Fields
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  submitted_by uuid REFERENCES auth.users(id)
);

-- Enhanced visitor analytics view
CREATE OR REPLACE VIEW visitor_analytics AS
SELECT 
  vh.estate_id,
  e.name as estate_name,
  
  -- Time-based metrics
  DATE_TRUNC('month', vh.scheduled_date) as month,
  DATE_TRUNC('week', vh.scheduled_date) as week,
  vh.scheduled_date as date,
  
  -- Visitor counts
  COUNT(*) as total_visitors,
  COUNT(*) FILTER (WHERE vh.status = 'departed') as successful_visits,
  COUNT(*) FILTER (WHERE vh.status = 'no_show') as no_shows,
  COUNT(*) FILTER (WHERE vh.status = 'denied_entry') as denied_entries,
  COUNT(*) FILTER (WHERE vh.status = 'overstayed') as overstays,
  
  -- Timing metrics
  AVG(EXTRACT(EPOCH FROM vh.total_visit_duration)/3600) as avg_visit_duration_hours,
  AVG(EXTRACT(EPOCH FROM (vh.actual_arrival_time - (vh.scheduled_date + vh.scheduled_time)))/60) as avg_arrival_delay_minutes,
  
  -- Ratings
  AVG(vh.visitor_rating) as avg_visitor_rating,
  AVG(vh.guard_rating) as avg_guard_rating,
  
  -- Popular times
  EXTRACT(HOUR FROM vh.scheduled_time) as hour_of_day,
  EXTRACT(DOW FROM vh.scheduled_date) as day_of_week,
  
  -- Purpose analysis
  vh.purpose,
  COUNT(*) FILTER (WHERE vh.purpose = vh.purpose) as purpose_count
  
FROM visitor_history vh
JOIN estates e ON e.id = vh.estate_id
GROUP BY 
  vh.estate_id, e.name, 
  DATE_TRUNC('month', vh.scheduled_date),
  DATE_TRUNC('week', vh.scheduled_date),
  vh.scheduled_date,
  EXTRACT(HOUR FROM vh.scheduled_time),
  EXTRACT(DOW FROM vh.scheduled_date),
  vh.purpose;

-- Real-time visitor status view
CREATE OR REPLACE VIEW active_visitors AS
SELECT 
  vh.id,
  vh.unique_id,
  vh.estate_id,
  e.name as estate_name,
  vh.visitor_name,
  vh.visitor_phone,
  vh.resident_name,
  vh.apartment_number,
  vh.purpose,
  vh.actual_arrival_time,
  vh.status,
  vs.current_location,
  vs.session_start,
  EXTRACT(EPOCH FROM (now() - vs.session_start))/3600 as hours_on_premises,
  CASE 
    WHEN vh.expected_duration IS NOT NULL AND (now() - vs.session_start) > vh.expected_duration 
    THEN true 
    ELSE false 
  END as is_overstaying,
  vh.verified_by_guard_name,
  vh.verification_method
FROM visitor_history vh
JOIN estates e ON e.id = vh.estate_id
LEFT JOIN visitor_sessions vs ON vs.visitor_history_id = vh.id AND vs.is_active = true
WHERE vh.status IN ('arrived', 'in_progress')
ORDER BY vh.actual_arrival_time DESC;

-- Enable Row Level Security
ALTER TABLE visitor_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE guard_shift_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visitor_history
CREATE POLICY "Estate staff can manage visitor history"
  ON visitor_history
  FOR ALL
  TO authenticated
  USING (
    estate_id IN (
      SELECT estate_id FROM estate_admins WHERE user_id = auth.uid()
      UNION
      SELECT estate_id FROM guards WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Residents can view their visitor history"
  ON visitor_history
  FOR SELECT
  TO authenticated
  USING (
    resident_id IN (
      SELECT id FROM residents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Developers can view their estate visitor history"
  ON visitor_history
  FOR SELECT
  TO authenticated
  USING (
    estate_id IN (
      SELECT id FROM estates WHERE developer_id = auth.uid()
    )
  );

-- RLS Policies for visitor_sessions
CREATE POLICY "Estate staff can manage visitor sessions"
  ON visitor_sessions
  FOR ALL
  TO authenticated
  USING (
    estate_id IN (
      SELECT estate_id FROM estate_admins WHERE user_id = auth.uid()
      UNION
      SELECT estate_id FROM guards WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for visitor_feedback
CREATE POLICY "Anyone can submit visitor feedback"
  ON visitor_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Estate staff can view visitor feedback"
  ON visitor_feedback
  FOR SELECT
  TO authenticated
  USING (
    estate_id IN (
      SELECT estate_id FROM estate_admins WHERE user_id = auth.uid()
      UNION
      SELECT estate_id FROM guards WHERE user_id = auth.uid()
      UNION
      SELECT id FROM estates WHERE developer_id = auth.uid()
    )
  );

-- RLS Policies for guard_shift_reports
CREATE POLICY "Guards can manage their shift reports"
  ON guard_shift_reports
  FOR ALL
  TO authenticated
  USING (guard_id IN (SELECT id FROM guards WHERE user_id = auth.uid()));

CREATE POLICY "Estate admins can view guard shift reports"
  ON guard_shift_reports
  FOR SELECT
  TO authenticated
  USING (
    estate_id IN (
      SELECT estate_id FROM estate_admins WHERE user_id = auth.uid()
    )
  );

-- Functions for unique ID generation
CREATE OR REPLACE FUNCTION generate_visitor_history_id()
RETURNS text AS $$
DECLARE
  new_id text;
  counter integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(unique_id FROM 4) AS integer)), 0) + 1
  INTO counter
  FROM visitor_history;
  
  new_id := 'VH' || LPAD(counter::text, 4, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_shift_report_id()
RETURNS text AS $$
DECLARE
  new_id text;
  counter integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(unique_id FROM 3) AS integer)), 0) + 1
  INTO counter
  FROM guard_shift_reports;
  
  new_id := 'SR' || LPAD(counter::text, 4, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Update the set_unique_id function to handle new tables
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
      WHEN 'visitor_history' THEN NEW.unique_id := generate_visitor_history_id();
      WHEN 'guard_shift_reports' THEN NEW.unique_id := generate_shift_report_id();
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-generating unique IDs
CREATE TRIGGER visitor_history_unique_id_trigger
  BEFORE INSERT ON visitor_history
  FOR EACH ROW EXECUTE FUNCTION set_unique_id();

CREATE TRIGGER guard_shift_reports_unique_id_trigger
  BEFORE INSERT ON guard_shift_reports
  FOR EACH ROW EXECUTE FUNCTION set_unique_id();

-- Updated timestamp triggers for new tables
CREATE TRIGGER visitor_history_updated_at_trigger
  BEFORE UPDATE ON visitor_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER visitor_sessions_updated_at_trigger
  BEFORE UPDATE ON visitor_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER guard_shift_reports_updated_at_trigger
  BEFORE UPDATE ON guard_shift_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to automatically create visitor history from visitor logs
CREATE OR REPLACE FUNCTION sync_visitor_history()
RETURNS trigger AS $$
DECLARE
  history_record visitor_history%ROWTYPE;
  invite_record visitor_invites%ROWTYPE;
  resident_record residents%ROWTYPE;
BEGIN
  -- Get invite information if available
  IF NEW.invite_id IS NOT NULL THEN
    SELECT * INTO invite_record FROM visitor_invites WHERE id = NEW.invite_id;
    
    -- Get resident information
    IF invite_record.resident_id IS NOT NULL THEN
      SELECT * INTO resident_record FROM residents WHERE id = invite_record.resident_id;
    END IF;
  END IF;
  
  -- Create or update visitor history record
  INSERT INTO visitor_history (
    estate_id,
    invite_id,
    visitor_log_id,
    visitor_name,
    visitor_phone,
    resident_id,
    resident_name,
    apartment_number,
    purpose,
    scheduled_date,
    scheduled_time,
    actual_arrival_time,
    verification_method,
    verified_by_guard_id,
    status,
    created_by
  ) VALUES (
    NEW.estate_id,
    NEW.invite_id,
    NEW.id,
    NEW.visitor_name,
    NEW.visitor_phone,
    invite_record.resident_id,
    COALESCE(resident_record.name, 'Unknown Resident'),
    COALESCE(resident_record.apartment_number, 'Unknown'),
    COALESCE(invite_record.purpose, 'Walk-in Visit'),
    COALESCE(invite_record.visit_date, CURRENT_DATE),
    COALESCE(invite_record.visit_time, CURRENT_TIME),
    NEW.entry_time,
    NEW.verification_method,
    NEW.guard_id,
    CASE 
      WHEN NEW.status = 'entered' THEN 'arrived'
      WHEN NEW.status = 'exited' THEN 'departed'
      WHEN NEW.status = 'denied' THEN 'denied_entry'
      ELSE 'in_progress'
    END,
    auth.uid()
  )
  ON CONFLICT (visitor_log_id) 
  DO UPDATE SET
    actual_departure_time = CASE WHEN NEW.exit_time IS NOT NULL THEN NEW.exit_time ELSE visitor_history.actual_departure_time END,
    status = CASE 
      WHEN NEW.status = 'entered' THEN 'arrived'
      WHEN NEW.status = 'exited' THEN 'departed'
      WHEN NEW.status = 'denied' THEN 'denied_entry'
      ELSE visitor_history.status
    END,
    updated_at = now(),
    last_updated_by = auth.uid();
  
  -- Create or update visitor session
  IF NEW.status = 'entered' THEN
    INSERT INTO visitor_sessions (
      visitor_history_id,
      estate_id,
      entry_guard_id,
      entry_point
    ) 
    SELECT 
      vh.id,
      NEW.estate_id,
      NEW.guard_id,
      'Main Gate'
    FROM visitor_history vh 
    WHERE vh.visitor_log_id = NEW.id
    ON CONFLICT DO NOTHING;
  ELSIF NEW.status = 'exited' THEN
    UPDATE visitor_sessions 
    SET 
      session_end = NEW.exit_time,
      exit_guard_id = NEW.guard_id,
      exit_point = 'Main Gate',
      is_active = false,
      updated_at = now()
    WHERE visitor_history_id IN (
      SELECT id FROM visitor_history WHERE visitor_log_id = NEW.id
    ) AND is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync visitor logs with visitor history
CREATE TRIGGER sync_visitor_history_trigger
  AFTER INSERT OR UPDATE ON visitor_logs
  FOR EACH ROW EXECUTE FUNCTION sync_visitor_history();

-- Function to check for overstaying visitors
CREATE OR REPLACE FUNCTION check_overstaying_visitors()
RETURNS void AS $$
BEGIN
  UPDATE visitor_history 
  SET 
    status = 'overstayed',
    updated_at = now()
  WHERE 
    status = 'in_progress' 
    AND expected_duration IS NOT NULL 
    AND actual_arrival_time + expected_duration < now()
    AND actual_departure_time IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_visitor_history_estate_id ON visitor_history(estate_id);
CREATE INDEX IF NOT EXISTS idx_visitor_history_status ON visitor_history(status);
CREATE INDEX IF NOT EXISTS idx_visitor_history_scheduled_date ON visitor_history(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_visitor_history_resident_id ON visitor_history(resident_id);
CREATE INDEX IF NOT EXISTS idx_visitor_history_visitor_name ON visitor_history(visitor_name);

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_active ON visitor_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_estate_id ON visitor_sessions(estate_id);

CREATE INDEX IF NOT EXISTS idx_visitor_feedback_estate_id ON visitor_feedback(estate_id);
CREATE INDEX IF NOT EXISTS idx_visitor_feedback_rating ON visitor_feedback(overall_rating);

CREATE INDEX IF NOT EXISTS idx_guard_shift_reports_guard_id ON guard_shift_reports(guard_id);
CREATE INDEX IF NOT EXISTS idx_guard_shift_reports_date ON guard_shift_reports(shift_date);
CREATE INDEX IF NOT EXISTS idx_guard_shift_reports_estate_id ON guard_shift_reports(estate_id);

-- Sample data for testing
DO $$
DECLARE
    sample_estate_id uuid;
    sample_resident_id uuid;
    sample_guard_id uuid;
    sample_invite_id uuid;
BEGIN
    -- Get sample estate ID
    SELECT id INTO sample_estate_id FROM estates WHERE unique_id = 'EST-SAMPLE-001' LIMIT 1;
    
    IF sample_estate_id IS NOT NULL THEN
        -- Get sample resident and guard
        SELECT id INTO sample_resident_id FROM residents WHERE estate_id = sample_estate_id LIMIT 1;
        SELECT id INTO sample_guard_id FROM guards WHERE estate_id = sample_estate_id LIMIT 1;
        
        -- Create sample visitor history records
        INSERT INTO visitor_history (
            estate_id,
            visitor_name,
            visitor_phone,
            visitor_email,
            resident_id,
            resident_name,
            apartment_number,
            purpose,
            scheduled_date,
            scheduled_time,
            actual_arrival_time,
            actual_departure_time,
            verification_method,
            verified_by_guard_id,
            status,
            visitor_rating,
            guard_rating
        ) VALUES 
        (
            sample_estate_id,
            'John Sample Visitor',
            '+234-800-555-1001',
            'john.visitor@example.com',
            sample_resident_id,
            'Sample Resident',
            'A101',
            'Business Meeting',
            CURRENT_DATE - INTERVAL '1 day',
            '14:00:00',
            CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours',
            CURRENT_TIMESTAMP - INTERVAL '23 hours',
            'otp',
            sample_guard_id,
            'departed',
            5,
            4
        ),
        (
            sample_estate_id,
            'Jane Sample Guest',
            '+234-800-555-1002',
            'jane.guest@example.com',
            sample_resident_id,
            'Sample Resident',
            'A101',
            'Personal Visit',
            CURRENT_DATE,
            '10:30:00',
            CURRENT_TIMESTAMP - INTERVAL '2 hours',
            NULL,
            'qr_code',
            sample_guard_id,
            'in_progress',
            NULL,
            5
        );
        
        -- Create sample visitor feedback
        INSERT INTO visitor_feedback (
            visitor_history_id,
            estate_id,
            overall_rating,
            security_rating,
            facility_rating,
            staff_rating,
            positive_feedback,
            wait_time_rating,
            process_clarity_rating,
            visitor_name,
            visitor_email,
            would_recommend
        ) VALUES (
            (SELECT id FROM visitor_history WHERE visitor_name = 'John Sample Visitor' LIMIT 1),
            sample_estate_id,
            5,
            5,
            4,
            5,
            'Excellent security process and very professional staff. The digital check-in was smooth and efficient.',
            4,
            5,
            'John Sample Visitor',
            'john.visitor@example.com',
            true
        );
        
        -- Create sample guard shift report
        INSERT INTO guard_shift_reports (
            estate_id,
            guard_id,
            shift_date,
            shift_start_time,
            shift_end_time,
            total_visitors_processed,
            total_visitors_approved,
            total_visitors_denied,
            shift_summary,
            status
        ) VALUES (
            sample_estate_id,
            sample_guard_id,
            CURRENT_DATE - INTERVAL '1 day',
            CURRENT_TIMESTAMP - INTERVAL '1 day 8 hours',
            CURRENT_TIMESTAMP - INTERVAL '1 day',
            15,
            14,
            1,
            'Smooth shift with good visitor flow. One visitor denied due to invalid OTP. All security protocols followed.',
            'completed'
        );
    END IF;
END $$;