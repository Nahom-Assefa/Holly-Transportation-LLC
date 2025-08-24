-- Check all users in the database
-- This script just shows the current state without making any changes

SELECT 
    id,
    email,
    first_name,
    last_name,
    phone,
    username,
    is_admin,
    created_at,
    updated_at
FROM users 
ORDER BY created_at DESC;
