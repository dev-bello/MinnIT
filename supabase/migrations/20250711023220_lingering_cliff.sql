/*
  # Fix User Roles and Authentication System

  1. Clean Up and Reset
    - Clean existing data that might be causing conflicts
    - Reset user role assignments
    
  2. Create Proper User-Role Linkage
    - Link existing auth users to proper roles
    - Ensure RLS policies work correctly
    
  3. Create Test Users with Proper Roles
    - Set up admin, guard, and resident test accounts
    - Link them properly to auth system
*/

-- First, let's clean up any existing problematic data
DELETE FROM estate_admins WHERE user_id IS NULL;
DELETE FROM guards WHERE user_id IS NULL;
DELETE FROM residents WHERE user_id IS NULL;

-- Create a sample estate if it doesn't exist
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
  'EST-MAIN-001',
  'MinnIT Sample Estate',
  '123 Innovation Drive',
  'Lagos',
  'Lagos State',
  'Nigeria',
  100,
  0,
  'contact@minnitestate.com',
  '+234-800-MINNIT',
  'active'
) ON CONFLICT (unique_id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address;

-- Get the estate ID for linking
DO $$
DECLARE
    sample_estate_id uuid;
    existing_user_id uuid;
BEGIN
    -- Get the sample estate ID
    SELECT id INTO sample_estate_id FROM estates WHERE unique_id = 'EST-MAIN-001';
    
    -- Check if we have any existing auth users and link them
    -- Link the first user as admin if they exist
    SELECT id INTO existing_user_id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1;
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO estate_admins (
            unique_id,
            estate_id,
            user_id,
            name,
            email,
            phone,
            role,
            status
        ) VALUES (
            'ADMIN-001',
            sample_estate_id,
            existing_user_id,
            'Estate Administrator',
            'admin@example.com',
            '+234-800-ADMIN',
            'admin',
            'active'
        ) ON CONFLICT (email) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            estate_id = EXCLUDED.estate_id;
    END IF;
    
    -- Link guard user if exists
    SELECT id INTO existing_user_id FROM auth.users WHERE email = 'guard@example.com' LIMIT 1;
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO guards (
            unique_id,
            estate_id,
            user_id,
            name,
            email,
            phone,
            shift_schedule,
            status
        ) VALUES (
            'GUARD-001',
            sample_estate_id,
            existing_user_id,
            'Security Guard Alpha',
            'guard@example.com',
            '+234-800-GUARD',
            'Morning Shift (6AM-2PM)',
            'active'
        ) ON CONFLICT (email) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            estate_id = EXCLUDED.estate_id;
    END IF;
    
    -- Link resident user if exists
    SELECT id INTO existing_user_id FROM auth.users WHERE email = 'resident@example.com' LIMIT 1;
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO residents (
            unique_id,
            estate_id,
            user_id,
            name,
            email,
            phone,
            apartment_number,
            apartment_type,
            status
        ) VALUES (
            'RES-001',
            sample_estate_id,
            existing_user_id,
            'Sample Resident',
            'resident@example.com',
            '+234-800-RESIDENT',
            'A-101',
            '2 Bedroom',
            'active'
        ) ON CONFLICT (email) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            estate_id = EXCLUDED.estate_id;
    END IF;
    
    -- Also link any existing users by their actual emails from auth.users
    FOR existing_user_id IN 
        SELECT id FROM auth.users 
        WHERE email NOT IN ('admin@example.com', 'guard@example.com', 'resident@example.com')
        LIMIT 3
    LOOP
        -- Check if this user is already linked
        IF NOT EXISTS (
            SELECT 1 FROM estate_admins WHERE user_id = existing_user_id
            UNION
            SELECT 1 FROM guards WHERE user_id = existing_user_id  
            UNION
            SELECT 1 FROM residents WHERE user_id = existing_user_id
        ) THEN
            -- Link as admin for testing (you can change this)
            INSERT INTO estate_admins (
                unique_id,
                estate_id,
                user_id,
                name,
                email,
                phone,
                role,
                status
            ) 
            SELECT 
                'ADMIN-' || EXTRACT(EPOCH FROM NOW())::text,
                sample_estate_id,
                existing_user_id,
                COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = existing_user_id), 'Test Admin'),
                (SELECT email FROM auth.users WHERE id = existing_user_id),
                '+234-800-TEST',
                'admin',
                'active'
            ON CONFLICT (email) DO UPDATE SET
                user_id = EXCLUDED.user_id,
                estate_id = EXCLUDED.estate_id;
            
            EXIT; -- Only link one user as admin for now
        END IF;
    END LOOP;
END $$;

-- Update estate occupied units count
UPDATE estates 
SET occupied_units = (
    SELECT COUNT(*) FROM residents 
    WHERE estate_id = estates.id AND status = 'active'
);

-- Verify the setup
DO $$
DECLARE
    auth_user_count integer;
    admin_count integer;
    guard_count integer;
    resident_count integer;
    linked_admin_count integer;
    linked_guard_count integer;
    linked_resident_count integer;
BEGIN
    -- Count auth users
    SELECT COUNT(*) INTO auth_user_count FROM auth.users;
    
    -- Count role records
    SELECT COUNT(*) INTO admin_count FROM estate_admins;
    SELECT COUNT(*) INTO guard_count FROM guards;
    SELECT COUNT(*) INTO resident_count FROM residents;
    
    -- Count properly linked records
    SELECT COUNT(*) INTO linked_admin_count FROM estate_admins WHERE user_id IS NOT NULL;
    SELECT COUNT(*) INTO linked_guard_count FROM guards WHERE user_id IS NOT NULL;
    SELECT COUNT(*) INTO linked_resident_count FROM residents WHERE user_id IS NOT NULL;
    
    -- Output summary
    RAISE NOTICE 'Setup Summary:';
    RAISE NOTICE 'Auth Users: %', auth_user_count;
    RAISE NOTICE 'Estate Admins: % (% linked)', admin_count, linked_admin_count;
    RAISE NOTICE 'Guards: % (% linked)', guard_count, linked_guard_count;
    RAISE NOTICE 'Residents: % (% linked)', resident_count, linked_resident_count;
    
    IF auth_user_count = 0 THEN
        RAISE NOTICE 'WARNING: No auth users found. Create users first, then run this migration again.';
    END IF;
    
    IF linked_admin_count = 0 AND linked_guard_count = 0 AND linked_resident_count = 0 THEN
        RAISE NOTICE 'WARNING: No users were linked to roles. Check auth.users table.';
    END IF;
END $$;

-- Create a helper function to link new users to roles
CREATE OR REPLACE FUNCTION link_user_to_role(
    user_email text,
    role_type text DEFAULT 'admin',
    user_name text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid uuid;
    estate_uuid uuid;
    result_message text;
BEGIN
    -- Get user ID from auth
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RETURN 'Error: User with email ' || user_email || ' not found in auth.users';
    END IF;
    
    -- Get sample estate ID
    SELECT id INTO estate_uuid FROM estates WHERE unique_id = 'EST-MAIN-001';
    
    IF estate_uuid IS NULL THEN
        RETURN 'Error: Sample estate not found';
    END IF;
    
    -- Link based on role type
    CASE role_type
        WHEN 'admin' THEN
            INSERT INTO estate_admins (
                unique_id,
                estate_id,
                user_id,
                name,
                email,
                role,
                status
            ) VALUES (
                'ADMIN-' || EXTRACT(EPOCH FROM NOW())::text,
                estate_uuid,
                user_uuid,
                COALESCE(user_name, 'Estate Admin'),
                user_email,
                'admin',
                'active'
            ) ON CONFLICT (email) DO UPDATE SET
                user_id = EXCLUDED.user_id,
                estate_id = EXCLUDED.estate_id;
            result_message := 'User linked as Estate Admin';
            
        WHEN 'guard' THEN
            INSERT INTO guards (
                unique_id,
                estate_id,
                user_id,
                name,
                email,
                shift_schedule,
                status
            ) VALUES (
                'GUARD-' || EXTRACT(EPOCH FROM NOW())::text,
                estate_uuid,
                user_uuid,
                COALESCE(user_name, 'Security Guard'),
                user_email,
                'Day Shift (8AM-4PM)',
                'active'
            ) ON CONFLICT (email) DO UPDATE SET
                user_id = EXCLUDED.user_id,
                estate_id = EXCLUDED.estate_id;
            result_message := 'User linked as Security Guard';
            
        WHEN 'resident' THEN
            INSERT INTO residents (
                unique_id,
                estate_id,
                user_id,
                name,
                email,
                apartment_number,
                status
            ) VALUES (
                'RES-' || EXTRACT(EPOCH FROM NOW())::text,
                estate_uuid,
                user_uuid,
                COALESCE(user_name, 'Resident'),
                user_email,
                'A-' || (100 + (EXTRACT(EPOCH FROM NOW())::integer % 900))::text,
                'active'
            ) ON CONFLICT (email) DO UPDATE SET
                user_id = EXCLUDED.user_id,
                estate_id = EXCLUDED.estate_id;
            result_message := 'User linked as Resident';
            
        ELSE
            RETURN 'Error: Invalid role type. Use admin, guard, or resident';
    END CASE;
    
    RETURN result_message || ' - Email: ' || user_email;
END $$;

-- Show final status
SELECT 
    'Database setup complete!' as status,
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM estate_admins WHERE user_id IS NOT NULL) as linked_admins,
    (SELECT COUNT(*) FROM guards WHERE user_id IS NOT NULL) as linked_guards,
    (SELECT COUNT(*) FROM residents WHERE user_id IS NOT NULL) as linked_residents;