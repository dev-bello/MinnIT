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