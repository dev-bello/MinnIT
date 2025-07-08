-- Seed data for MinnIT Visitor Management System
-- Run this after setting up your database and creating your first user

-- Sample Estate (you'll need to replace the developer_id with your actual user ID)
INSERT INTO estates (
  unique_id,
  name,
  address,
  city,
  state,
  country,
  total_units,
  occupied_units,
  developer_id,
  contact_email,
  contact_phone,
  status
) VALUES (
  'EST001',
  'MinnIT Luxury Apartments',
  '123 Innovation Drive',
  'Lagos',
  'Lagos State',
  'Nigeria',
  50,
  35,
  'your-user-id-here', -- Replace with your actual user ID from auth.users
  'admin@minnitluxury.com',
  '+2348012345678',
  'active'
) ON CONFLICT (unique_id) DO NOTHING;

-- Sample Estate Admin (replace user_id with actual user ID)
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
  'ADMIN001',
  (SELECT id FROM estates WHERE unique_id = 'EST001'),
  'your-admin-user-id-here', -- Replace with actual user ID
  'John Admin',
  'admin@example.com',
  '+2348012345679',
  'admin',
  'active'
) ON CONFLICT (unique_id) DO NOTHING;

-- Sample Guards
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
) VALUES 
(
  'GUARD001',
  (SELECT id FROM estates WHERE unique_id = 'EST001'),
  'your-guard-user-id-here', -- Replace with actual user ID
  'Alpha Guard',
  'guard001@example.com',
  '+2348012345680',
  'Morning Shift (6AM-2PM)',
  '+2348012345681',
  '456 Security Street, Lagos',
  'active'
),
(
  'GUARD002',
  (SELECT id FROM estates WHERE unique_id = 'EST001'),
  'your-guard2-user-id-here', -- Replace with actual user ID
  'Beta Guard',
  'guard002@example.com',
  '+2348012345682',
  'Evening Shift (2PM-10PM)',
  '+2348012345683',
  '789 Patrol Avenue, Lagos',
  'active'
) ON CONFLICT (unique_id) DO NOTHING;

-- Sample Residents
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
  can_edit,
  status
) VALUES 
(
  'RES001',
  (SELECT id FROM estates WHERE unique_id = 'EST001'),
  'your-resident-user-id-here', -- Replace with actual user ID
  'Sarah Resident',
  'resident001@example.com',
  '+2348012345684',
  'A101',
  '2 Bedroom',
  '2024-01-01',
  '2024-12-31',
  250000.00,
  'current',
  'John Resident',
  '+2348012345685',
  'Spouse',
  true,
  'active'
),
(
  'RES002',
  (SELECT id FROM estates WHERE unique_id = 'EST001'),
  'your-resident2-user-id-here', -- Replace with actual user ID
  'Mike Tenant',
  'resident002@example.com',
  '+2348012345686',
  'B205',
  '1 Bedroom',
  '2024-02-01',
  '2025-01-31',
  180000.00,
  'current',
  'Lisa Tenant',
  '+2348012345687',
  'Sister',
  true,
  'active'
) ON CONFLICT (unique_id) DO NOTHING;

-- Sample Visitor Invites
INSERT INTO visitor_invites (
  unique_id,
  estate_id,
  resident_id,
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
  'INV001',
  (SELECT id FROM estates WHERE unique_id = 'EST001'),
  (SELECT id FROM residents WHERE unique_id = 'RES001'),
  'David Visitor',
  '+2348012345688',
  'david@example.com',
  CURRENT_DATE + INTERVAL '1 day',
  '14:00:00',
  'Personal Visit',
  '123456',
  'pending',
  CURRENT_TIMESTAMP + INTERVAL '24 hours'
),
(
  'INV002',
  (SELECT id FROM estates WHERE unique_id = 'EST001'),
  (SELECT id FROM residents WHERE unique_id = 'RES002'),
  'Emma Guest',
  '+2348012345689',
  'emma@example.com',
  CURRENT_DATE + INTERVAL '2 days',
  '16:00:00',
  'Business Meeting',
  '654321',
  'pending',
  CURRENT_TIMESTAMP + INTERVAL '48 hours'
) ON CONFLICT (unique_id) DO NOTHING;

-- Sample Notifications
INSERT INTO notifications (
  estate_id,
  user_id,
  type,
  title,
  message,
  data,
  is_read
) VALUES 
(
  (SELECT id FROM estates WHERE unique_id = 'EST001'),
  (SELECT user_id FROM estate_admins WHERE unique_id = 'ADMIN001'),
  'system',
  'Welcome to MinnIT',
  'Your estate management system is now active',
  '{"welcome": true}',
  false
),
(
  (SELECT id FROM estates WHERE unique_id = 'EST001'),
  (SELECT user_id FROM residents WHERE unique_id = 'RES001'),
  'visitor_invite',
  'New Visitor Invitation',
  'You have a new visitor invitation for tomorrow',
  '{"invite_id": "INV001"}',
  false
) ON CONFLICT DO NOTHING;

-- Sample Residency Requests
INSERT INTO residency_requests (
  estate_id,
  resident_id,
  type,
  title,
  details,
  current_apartment,
  requested_apartment,
  priority,
  status
) VALUES 
(
  (SELECT id FROM estates WHERE unique_id = 'EST001'),
  (SELECT id FROM residents WHERE unique_id = 'RES001'),
  'maintenance_request',
  'AC Unit Not Working',
  'The air conditioning unit in the living room is not cooling properly. It makes strange noises when turned on.',
  'A101',
  NULL,
  'high',
  'pending'
),
(
  (SELECT id FROM estates WHERE unique_id = 'EST001'),
  (SELECT id FROM residents WHERE unique_id = 'RES002'),
  'apartment_change_request',
  'Request for Larger Apartment',
  'I would like to move to a larger apartment as my family is growing. Prefer a 2-bedroom unit.',
  'B205',
  'C301',
  'medium',
  'pending'
) ON CONFLICT DO NOTHING;

-- Update estate occupied units count
UPDATE estates 
SET occupied_units = (
  SELECT COUNT(*) FROM residents 
  WHERE estate_id = estates.id AND status = 'active'
)
WHERE unique_id = 'EST001';

-- Display setup summary
SELECT 
  'Database seeded successfully!' as status,
  COUNT(*) as total_estates,
  (SELECT COUNT(*) FROM estate_admins) as total_admins,
  (SELECT COUNT(*) FROM guards) as total_guards,
  (SELECT COUNT(*) FROM residents) as total_residents,
  (SELECT COUNT(*) FROM visitor_invites) as total_invites,
  (SELECT COUNT(*) FROM notifications) as total_notifications,
  (SELECT COUNT(*) FROM residency_requests) as total_requests
FROM estates; 