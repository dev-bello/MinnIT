/*
  # Create Example Users and Profiles

  1. New Tables
    - No new tables needed, using existing schema
    
  2. Data Setup
    - Creates example users for testing different roles
    - Sets up corresponding profiles in estate_admins, guards, residents tables
    - Links users to a sample estate
    
  3. Security
    - Uses existing RLS policies
    - Ensures proper role-based access
*/

-- First, let's create a sample estate for testing
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

-- Get the estate ID for reference
DO $$
DECLARE
    sample_estate_id uuid;
    developer_user_id uuid := '550e8400-e29b-41d4-a716-446655440001'::uuid;
    admin_user_id uuid := '550e8400-e29b-41d4-a716-446655440002'::uuid;
    guard_user_id uuid := '550e8400-e29b-41d4-a716-446655440003'::uuid;
    resident_user_id uuid := '550e8400-e29b-41d4-a716-446655440004'::uuid;
BEGIN
    -- Get the sample estate ID
    SELECT id INTO sample_estate_id FROM estates WHERE unique_id = 'EST-SAMPLE-001';
    
    -- Update the estate with developer_id
    UPDATE estates 
    SET developer_id = developer_user_id 
    WHERE unique_id = 'EST-SAMPLE-001';
    
    -- Create estate admin profile
    INSERT INTO estate_admins (
      unique_id,
      estate_id,
      user_id,
      name,
      email,
      phone,
      role,
      permissions,
      status
    ) VALUES (
      'ADM-SAMPLE-001',
      sample_estate_id,
      admin_user_id,
      'Sample Admin',
      'admin@example.com',
      '+234-800-123-4568',
      'admin',
      '{"view_reports": true, "manage_guards": true, "manage_residents": true}'::jsonb,
      'active'
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Create guard profile
    INSERT INTO guards (
      unique_id,
      estate_id,
      user_id,
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
      guard_user_id,
      'Sample Guard',
      'guard@example.com',
      '+234-800-123-4569',
      'Day Shift (6AM - 6PM)',
      '+234-800-123-4570',
      '456 Guard Street, Lagos',
      'active'
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Create resident profile
    INSERT INTO residents (
      unique_id,
      estate_id,
      user_id,
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
      resident_user_id,
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
END $$;