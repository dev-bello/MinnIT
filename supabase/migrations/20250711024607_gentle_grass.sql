/*
  # Direct Fix for User Role Authentication

  1. Clean up existing data
  2. Link auth users to roles
  3. Verify setup
*/

-- First, let's see what auth users exist
DO $$
BEGIN
    RAISE NOTICE 'Current Auth Users:';
END $$;

-- Clean up any orphaned records (records without user_id)
DELETE FROM estate_admins WHERE user_id IS NULL;
DELETE FROM guards WHERE user_id IS NULL;
DELETE FROM residents WHERE user_id IS NULL;

-- Get the sample estate ID
DO $$
DECLARE
    sample_estate_id uuid;
    admin_user_id uuid;
    guard_user_id uuid;
    resident_user_id uuid;
BEGIN
    -- Get sample estate
    SELECT id INTO sample_estate_id FROM estates WHERE name ILIKE '%sample%' OR unique_id ILIKE '%sample%' LIMIT 1;
    
    IF sample_estate_id IS NULL THEN
        -- Create a sample estate if none exists
        INSERT INTO estates (
            unique_id, name, address, city, state, country, 
            total_units, contact_email, contact_phone, status
        ) VALUES (
            'EST-SAMPLE-001',
            'Sample Estate',
            '123 Sample Street',
            'Lagos',
            'Lagos State',
            'Nigeria',
            50,
            'contact@sampleestate.com',
            '+234-800-SAMPLE',
            'active'
        ) RETURNING id INTO sample_estate_id;
    END IF;

    -- Link existing auth users to roles
    
    -- Admin user
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1;
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO estate_admins (
            unique_id, estate_id, user_id, name, email, role, status
        ) VALUES (
            'ADMIN-001',
            sample_estate_id,
            admin_user_id,
            'Sample Admin',
            'admin@example.com',
            'admin',
            'active'
        ) ON CONFLICT (email) DO UPDATE SET 
            user_id = admin_user_id,
            estate_id = sample_estate_id;
        
        RAISE NOTICE 'Linked admin user: %', admin_user_id;
    END IF;

    -- Guard user
    SELECT id INTO guard_user_id FROM auth.users WHERE email = 'guard@example.com' LIMIT 1;
    IF guard_user_id IS NOT NULL THEN
        INSERT INTO guards (
            unique_id, estate_id, user_id, name, email, shift_schedule, status
        ) VALUES (
            'GUARD-001',
            sample_estate_id,
            guard_user_id,
            'Sample Guard',
            'guard@example.com',
            'Day Shift (8AM-4PM)',
            'active'
        ) ON CONFLICT (email) DO UPDATE SET 
            user_id = guard_user_id,
            estate_id = sample_estate_id;
        
        RAISE NOTICE 'Linked guard user: %', guard_user_id;
    END IF;

    -- Resident user
    SELECT id INTO resident_user_id FROM auth.users WHERE email = 'resident@example.com' LIMIT 1;
    IF resident_user_id IS NOT NULL THEN
        INSERT INTO residents (
            unique_id, estate_id, user_id, name, email, apartment_number, status
        ) VALUES (
            'RES-001',
            sample_estate_id,
            resident_user_id,
            'Sample Resident',
            'resident@example.com',
            'A-101',
            'active'
        ) ON CONFLICT (email) DO UPDATE SET 
            user_id = resident_user_id,
            estate_id = sample_estate_id;
        
        RAISE NOTICE 'Linked resident user: %', resident_user_id;
    END IF;

    -- Also try linking any other existing auth users
    FOR admin_user_id IN SELECT id FROM auth.users WHERE email ILIKE '%admin%' AND email != 'admin@example.com'
    LOOP
        INSERT INTO estate_admins (
            unique_id, estate_id, user_id, name, email, role, status
        ) 
        SELECT 
            'ADMIN-' || EXTRACT(EPOCH FROM NOW())::text,
            sample_estate_id,
            admin_user_id,
            COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = admin_user_id), 'Admin User'),
            (SELECT email FROM auth.users WHERE id = admin_user_id),
            'admin',
            'active'
        ON CONFLICT (email) DO UPDATE SET 
            user_id = admin_user_id,
            estate_id = sample_estate_id;
        
        RAISE NOTICE 'Linked additional admin user: %', admin_user_id;
    END LOOP;

    FOR guard_user_id IN SELECT id FROM auth.users WHERE email ILIKE '%guard%' AND email != 'guard@example.com'
    LOOP
        INSERT INTO guards (
            unique_id, estate_id, user_id, name, email, shift_schedule, status
        ) 
        SELECT 
            'GUARD-' || EXTRACT(EPOCH FROM NOW())::text,
            sample_estate_id,
            guard_user_id,
            COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = guard_user_id), 'Guard User'),
            (SELECT email FROM auth.users WHERE id = guard_user_id),
            'Day Shift (8AM-4PM)',
            'active'
        ON CONFLICT (email) DO UPDATE SET 
            user_id = guard_user_id,
            estate_id = sample_estate_id;
        
        RAISE NOTICE 'Linked additional guard user: %', guard_user_id;
    END LOOP;

    FOR resident_user_id IN SELECT id FROM auth.users WHERE email ILIKE '%resident%' AND email != 'resident@example.com'
    LOOP
        INSERT INTO residents (
            unique_id, estate_id, user_id, name, email, apartment_number, status
        ) 
        SELECT 
            'RES-' || EXTRACT(EPOCH FROM NOW())::text,
            sample_estate_id,
            resident_user_id,
            COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = resident_user_id), 'Resident User'),
            (SELECT email FROM auth.users WHERE id = resident_user_id),
            'A-' || (100 + ROW_NUMBER() OVER())::text,
            'active'
        ON CONFLICT (email) DO UPDATE SET 
            user_id = resident_user_id,
            estate_id = sample_estate_id;
        
        RAISE NOTICE 'Linked additional resident user: %', resident_user_id;
    END LOOP;

END $$;

-- Verification queries
SELECT 'AUTH USERS' as type, email, id, created_at FROM auth.users
UNION ALL
SELECT 'ESTATE ADMINS' as type, email, user_id, created_at FROM estate_admins
UNION ALL  
SELECT 'GUARDS' as type, email, user_id, created_at FROM guards
UNION ALL
SELECT 'RESIDENTS' as type, email, user_id, created_at FROM residents
ORDER BY type, email;