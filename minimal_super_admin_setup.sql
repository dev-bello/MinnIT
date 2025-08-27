-- =====================================================
-- Minimal Super Admin Dashboard Setup Script
-- =====================================================
-- Simplified version with only essential fields
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. SUPER ADMIN TABLE (MINIMAL)
-- =====================================================

-- Create super_admins table with only essential fields
CREATE TABLE IF NOT EXISTS public.super_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ADMIN CREDENTIALS TABLE (SIMPLIFIED)
-- =====================================================

-- Create admin_credentials table for shared authentication
CREATE TABLE IF NOT EXISTS public.admin_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL,
    admin_type VARCHAR(20) NOT NULL CHECK (admin_type IN ('super_admin', 'estate_admin')),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(admin_id, admin_type)
);

-- =====================================================
-- 3. ENHANCE EXISTING TABLES (MINIMAL)
-- =====================================================

-- Add super admin reference to estates table
ALTER TABLE public.estates 
ADD COLUMN IF NOT EXISTS super_admin_id UUID REFERENCES public.super_admins(id);

-- Add super admin reference to estate_admins
ALTER TABLE public.estate_admins 
ADD COLUMN IF NOT EXISTS created_by_super_admin UUID REFERENCES public.super_admins(id);

-- =====================================================
-- 4. ESSENTIAL FUNCTIONS ONLY
-- =====================================================

-- Function to generate secure password hash
CREATE OR REPLACE FUNCTION public.generate_password_hash(password TEXT)
RETURNS TABLE(hash TEXT, salt TEXT) AS $$
DECLARE
    generated_salt TEXT;
    password_hash TEXT;
BEGIN
    generated_salt := encode(gen_random_bytes(32), 'hex');
    password_hash := encode(digest(password || generated_salt, 'sha256'), 'hex');
    RETURN QUERY SELECT password_hash, generated_salt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify password
CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, stored_hash TEXT, stored_salt TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN stored_hash = encode(digest(password || stored_salt, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate admin (simplified)
CREATE OR REPLACE FUNCTION public.authenticate_admin(p_email TEXT, p_password TEXT)
RETURNS TABLE(
    admin_id UUID,
    admin_type TEXT,
    name TEXT,
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    cred_record RECORD;
    admin_record RECORD;
    is_password_valid BOOLEAN;
BEGIN
    -- Get credentials
    SELECT * INTO cred_record
    FROM public.admin_credentials
    WHERE email = p_email;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, false, 'Invalid credentials';
        RETURN;
    END IF;
    
    -- Verify password
    SELECT public.verify_password(p_password, cred_record.password_hash, cred_record.salt) INTO is_password_valid;
    
    IF NOT is_password_valid THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, false, 'Invalid credentials';
        RETURN;
    END IF;
    
    -- Get admin details based on type
    IF cred_record.admin_type = 'super_admin' THEN
        SELECT * INTO admin_record
        FROM public.super_admins
        WHERE id = cred_record.admin_id;
        
        IF FOUND THEN
            RETURN QUERY SELECT 
                admin_record.id,
                'super_admin'::TEXT,
                admin_record.name,
                true,
                'Login successful'::TEXT;
        END IF;
    ELSE
        SELECT * INTO admin_record
        FROM public.estate_admins
        WHERE id = cred_record.admin_id;
        
        IF FOUND THEN
            RETURN QUERY SELECT 
                admin_record.id,
                'estate_admin'::TEXT,
                admin_record.name,
                true,
                'Login successful'::TEXT;
        END IF;
    END IF;
    
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, false, 'Admin account not found';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get basic dashboard statistics
CREATE OR REPLACE FUNCTION public.get_super_admin_dashboard_stats()
RETURNS TABLE(
    total_estates BIGINT,
    total_admins BIGINT,
    total_residents BIGINT,
    total_guards BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.estates) as total_estates,
        (SELECT COUNT(*) FROM public.estate_admins) as total_admins,
        (SELECT COUNT(*) FROM public.residents) as total_residents,
        (SELECT COUNT(*) FROM public.guards) as total_guards;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create estate admin with credentials (simplified)
CREATE OR REPLACE FUNCTION public.create_estate_admin_with_credentials(
    p_estate_id UUID,
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_password TEXT,
    p_created_by_super_admin UUID DEFAULT NULL
)
RETURNS TABLE(
    admin_id UUID,
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    new_admin_id UUID;
    password_data RECORD;
BEGIN
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM public.admin_credentials WHERE email = p_email) THEN
        RETURN QUERY SELECT NULL::UUID, false, 'Email already exists';
        RETURN;
    END IF;
    
    -- Create estate admin
    INSERT INTO public.estate_admins (
        estate_id, name, email, phone, role, created_by_super_admin
    ) VALUES (
        p_estate_id, p_name, p_email, p_phone, 'admin', p_created_by_super_admin
    ) RETURNING id INTO new_admin_id;
    
    -- Generate password hash
    SELECT * INTO password_data FROM public.generate_password_hash(p_password);
    
    -- Create credentials
    INSERT INTO public.admin_credentials (
        admin_id, admin_type, email, password_hash, salt
    ) VALUES (
        new_admin_id, 'estate_admin', p_email, password_data.hash, password_data.salt
    );
    
    RETURN QUERY SELECT new_admin_id, true, 'Estate admin created successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update admin password (simplified)
CREATE OR REPLACE FUNCTION public.update_admin_password(
    p_admin_id UUID,
    p_admin_type TEXT,
    p_new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    password_data RECORD;
BEGIN
    -- Generate new password hash
    SELECT * INTO password_data FROM public.generate_password_hash(p_new_password);
    
    -- Update credentials
    UPDATE public.admin_credentials 
    SET password_hash = password_data.hash,
        salt = password_data.salt
    WHERE admin_id = p_admin_id AND admin_type = p_admin_type;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. BASIC RLS POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Super Admin policies
CREATE POLICY "Super admins can view all super admins" ON public.super_admins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.id = (
                SELECT admin_id FROM public.admin_credentials 
                WHERE email = auth.jwt() ->> 'email' AND admin_type = 'super_admin'
            )
        )
    );

-- Admin credentials policies (only accessible via functions)
CREATE POLICY "No direct access to admin credentials" ON public.admin_credentials
    FOR ALL USING (false);

-- Enhanced estate policies for super admins
CREATE POLICY "Super admins can manage all estates" ON public.estates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.id = (
                SELECT admin_id FROM public.admin_credentials 
                WHERE email = auth.jwt() ->> 'email' AND admin_type = 'super_admin'
            )
        )
    );

-- =====================================================
-- 6. CREATE DEFAULT SUPER ADMIN
-- =====================================================

-- Create the first super admin
DO $$
DECLARE
    super_admin_id UUID;
    password_data RECORD;
BEGIN
    -- Insert super admin
    INSERT INTO public.super_admins (
        name, email, phone
    ) VALUES (
        'System Administrator',
        'admin@minnit.com',
        '+1234567890'
    ) RETURNING id INTO super_admin_id;
    
    -- Generate password hash for default password "SuperAdmin123!"
    SELECT * INTO password_data FROM public.generate_password_hash('SuperAdmin123!');
    
    -- Insert credentials
    INSERT INTO public.admin_credentials (
        admin_id, admin_type, email, password_hash, salt
    ) VALUES (
        super_admin_id, 'super_admin', 'admin@minnit.com', password_data.hash, password_data.salt
    );
    
    RAISE NOTICE 'Super admin created with email: admin@minnit.com and password: SuperAdmin123!';
    RAISE NOTICE 'Please change the password after first login!';
END $$;

-- =====================================================
-- 7. BASIC INDEXES
-- =====================================================

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_super_admins_email ON public.super_admins(email);
CREATE INDEX IF NOT EXISTS idx_admin_credentials_email ON public.admin_credentials(email);
CREATE INDEX IF NOT EXISTS idx_admin_credentials_admin ON public.admin_credentials(admin_id, admin_type);

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Final verification
SELECT 
    'Minimal Super Admin Setup Complete!' as status,
    COUNT(*) as super_admins_created
FROM public.super_admins;

-- Display credentials
SELECT 
    'Default Login Credentials' as notice,
    'Email: admin@minnit.com' as email,
    'Password: SuperAdmin123!' as password,
    'Change password after first login!' as warning;