-- Test User Role Assignment Script
-- Run this in Supabase SQL Editor to test and verify your setup

-- 1. Check current auth users
SELECT 
    'Current Auth Users:' as info,
    id,
    email,
    created_at,
    email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check role assignments
SELECT 'Estate Admins:' as info, unique_id, name, email, user_id, 
       CASE WHEN user_id IS NOT NULL THEN 'LINKED' ELSE 'NOT LINKED' END as status
FROM estate_admins
UNION ALL
SELECT 'Guards:' as info, unique_id, name, email, user_id,
       CASE WHEN user_id IS NOT NULL THEN 'LINKED' ELSE 'NOT LINKED' END as status  
FROM guards
UNION ALL
SELECT 'Residents:' as info, unique_id, name, email, user_id,
       CASE WHEN user_id IS NOT NULL THEN 'LINKED' ELSE 'NOT LINKED' END as status
FROM residents;

-- 3. Test role lookup for a specific user (replace with your email)
-- SELECT link_user_to_role('your-email@example.com', 'admin', 'Your Name');

-- 4. Quick link existing users (uncomment and modify as needed)
/*
-- Link first user as admin
SELECT link_user_to_role(
    (SELECT email FROM auth.users ORDER BY created_at LIMIT 1), 
    'admin', 
    'Test Admin'
);

-- Link second user as guard  
SELECT link_user_to_role(
    (SELECT email FROM auth.users ORDER BY created_at OFFSET 1 LIMIT 1), 
    'guard', 
    'Test Guard'
);

-- Link third user as resident
SELECT link_user_to_role(
    (SELECT email FROM auth.users ORDER BY created_at OFFSET 2 LIMIT 1), 
    'resident', 
    'Test Resident'
);
*/

-- 5. Verify RLS policies are working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('estate_admins', 'guards', 'residents')
ORDER BY tablename, policyname;