-- =====================================================
-- MinnIT Super Admin Dashboard Setup Script
-- =====================================================
-- This script sets up the super admin dashboard functionality
-- with proper authentication and role management for Supabase
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. SUPER ADMIN MANAGEMENT TABLES
-- =====================================================

-- Create super_admins table for platform-wide administrators
CREATE TABLE IF NOT EXISTS public.super_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    unique_id VARCHAR(50) UNIQUE NOT NULL DEFAULT ('SA' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{"manage_estates": true, "manage_admins": true, "view_analytics": true, "system_settings": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.super_admins(id),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create admin_credentials table for shared authentication
CREATE TABLE IF NOT EXISTS public.admin_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL, -- References either super_admins.id or estate_admins.id
    admin_type VARCHAR(20) NOT NULL CHECK (admin_type IN ('super_admin', 'estate_admin')),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_password_change TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(admin_id, admin_type)
);

-- Create admin_sessions table for session management
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL,
    admin_type VARCHAR(20) NOT NULL CHECK (admin_type IN ('super_admin', 'estate_admin')),
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ENHANCED ESTATE MANAGEMENT
-- =====================================================

-- Add super admin tracking to estates table
ALTER TABLE public.estates 
ADD COLUMN IF NOT EXISTS super_admin_id UUID REFERENCES public.super_admins(id),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_units INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS occupied_units INTEGER DEFAULT 0;

-- Add super admin reference to estate_admins
ALTER TABLE public.estate_admins 
ADD COLUMN IF NOT EXISTS created_by_super_admin UUID REFERENCES public.super_admins(id),
ADD COLUMN IF NOT EXISTS is_primary_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"manage_residents": true, "manage_guards": true, "view_reports": true}'::jsonb;

-- =====================================================
-- 3. DASHBOARD ANALYTICS TABLES
-- =====================================================

-- Create system_analytics table for dashboard metrics
CREATE TABLE IF NOT EXISTS public.system_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'count', 'percentage', 'currency', etc.
    estate_id UUID REFERENCES public.estates(id), -- NULL for system-wide metrics
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL,
    admin_type VARCHAR(20) NOT NULL CHECK (admin_type IN ('super_admin', 'estate_admin')),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- 'estate', 'admin', 'resident', etc.
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. UTILITY FUNCTIONS
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

-- Function to create admin session
CREATE OR REPLACE FUNCTION public.create_admin_session(
    p_admin_id UUID,
    p_admin_type TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    session_token TEXT;
    expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    session_token := encode(gen_random_bytes(32), 'hex');
    expires_at := NOW() + INTERVAL '24 hours';
    
    INSERT INTO public.admin_sessions (
        admin_id, admin_type, session_token, expires_at, ip_address, user_agent
    ) VALUES (
        p_admin_id, p_admin_type, session_token, expires_at, p_ip_address, p_user_agent
    );
    
    RETURN session_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate admin session
CREATE OR REPLACE FUNCTION public.validate_admin_session(p_session_token TEXT)
RETURNS TABLE(
    admin_id UUID,
    admin_type TEXT,
    is_valid BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.admin_id,
        s.admin_type,
        (s.expires_at > NOW() AND s.is_active) as is_valid
    FROM public.admin_sessions s
    WHERE s.session_token = p_session_token;
    
    -- Update last activity
    UPDATE public.admin_sessions 
    SET last_activity = NOW()
    WHERE session_token = p_session_token 
    AND expires_at > NOW() 
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate admin
CREATE OR REPLACE FUNCTION public.authenticate_admin(p_email TEXT, p_password TEXT)
RETURNS TABLE(
    admin_id UUID,
    admin_type TEXT,
    name TEXT,
    permissions JSONB,
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
    WHERE email = p_email AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::JSONB, false, 'Invalid credentials';
        RETURN;
    END IF;
    
    -- Check if account is locked
    IF cred_record.locked_until IS NOT NULL AND cred_record.locked_until > NOW() THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::JSONB, false, 'Account temporarily locked';
        RETURN;
    END IF;
    
    -- Verify password
    SELECT public.verify_password(p_password, cred_record.password_hash, cred_record.salt) INTO is_password_valid;
    
    IF NOT is_password_valid THEN
        -- Increment failed attempts
        UPDATE public.admin_credentials 
        SET failed_login_attempts = failed_login_attempts + 1,
            locked_until = CASE 
                WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '30 minutes'
                ELSE NULL 
            END
        WHERE id = cred_record.id;
        
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::JSONB, false, 'Invalid credentials';
        RETURN;
    END IF;
    
    -- Reset failed attempts on successful login
    UPDATE public.admin_credentials 
    SET failed_login_attempts = 0, locked_until = NULL
    WHERE id = cred_record.id;
    
    -- Get admin details based on type
    IF cred_record.admin_type = 'super_admin' THEN
        SELECT * INTO admin_record
        FROM public.super_admins
        WHERE id = cred_record.admin_id AND is_active = true;
        
        IF FOUND THEN
            UPDATE public.super_admins SET last_login = NOW() WHERE id = admin_record.id;
            RETURN QUERY SELECT 
                admin_record.id,
                'super_admin'::TEXT,
                admin_record.name,
                admin_record.permissions,
                true,
                'Login successful'::TEXT;
        END IF;
    ELSE
        SELECT * INTO admin_record
        FROM public.estate_admins
        WHERE id = cred_record.admin_id AND is_active = true;
        
        IF FOUND THEN
            RETURN QUERY SELECT 
                admin_record.id,
                'estate_admin'::TEXT,
                admin_record.name,
                COALESCE(admin_record.permissions, '{}'::jsonb),
                true,
                'Login successful'::TEXT;
        END IF;
    END IF;
    
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::JSONB, false, 'Admin account not found or inactive';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION public.get_super_admin_dashboard_stats()
RETURNS TABLE(
    total_estates BIGINT,
    active_estates BIGINT,
    total_admins BIGINT,
    total_residents BIGINT,
    total_guards BIGINT,
    total_visitors_today BIGINT,
    total_visitors_month BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.estates) as total_estates,
        (SELECT COUNT(*) FROM public.estates WHERE status = 'active') as active_estates,
        (SELECT COUNT(*) FROM public.estate_admins WHERE is_active = true) as total_admins,
        (SELECT COUNT(*) FROM public.residents WHERE is_active = true) as total_residents,
        (SELECT COUNT(*) FROM public.guards WHERE is_active = true) as total_guards,
        (SELECT COUNT(*) FROM public.visitor_logs WHERE DATE(created_at) = CURRENT_DATE) as total_visitors_today,
        (SELECT COUNT(*) FROM public.visitor_logs WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as total_visitors_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Super Admin policies
CREATE POLICY "Super admins can view all super admins" ON public.super_admins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.user_id = auth.uid() AND sa.is_active = true
        )
    );

CREATE POLICY "Super admins can manage super admins" ON public.super_admins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.user_id = auth.uid() AND sa.is_active = true
        )
    );

-- Admin credentials policies (only accessible via functions)
CREATE POLICY "No direct access to admin credentials" ON public.admin_credentials
    FOR ALL USING (false);

-- Admin sessions policies
CREATE POLICY "Admins can view their own sessions" ON public.admin_sessions
    FOR SELECT USING (
        admin_id IN (
            SELECT id FROM public.super_admins WHERE user_id = auth.uid()
            UNION
            SELECT id FROM public.estate_admins WHERE user_id = auth.uid()
        )
    );

-- System analytics policies
CREATE POLICY "Super admins can view all analytics" ON public.system_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.user_id = auth.uid() AND sa.is_active = true
        )
    );

CREATE POLICY "Estate admins can view their estate analytics" ON public.system_analytics
    FOR SELECT USING (
        estate_id IN (
            SELECT estate_id FROM public.estate_admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Audit logs policies
CREATE POLICY "Super admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.user_id = auth.uid() AND sa.is_active = true
        )
    );

CREATE POLICY "Estate admins can view their own audit logs" ON public.audit_logs
    FOR SELECT USING (
        admin_id IN (
            SELECT id FROM public.estate_admins WHERE user_id = auth.uid()
        )
    );

-- Enhanced estate policies for super admins
CREATE POLICY "Super admins can manage all estates" ON public.estates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.super_admins sa
            WHERE sa.user_id = auth.uid() AND sa.is_active = true
        )
    );

-- =====================================================
-- 6. TRIGGERS FOR AUTOMATION
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_super_admins_updated_at 
    BEFORE UPDATE ON public.super_admins
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_credentials_updated_at 
    BEFORE UPDATE ON public.admin_credentials
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action()
RETURNS TRIGGER AS $$
DECLARE
    admin_id_val UUID;
    admin_type_val TEXT;
BEGIN
    -- Determine admin ID and type from current user
    SELECT sa.id, 'super_admin' INTO admin_id_val, admin_type_val
    FROM public.super_admins sa WHERE sa.user_id = auth.uid();
    
    IF admin_id_val IS NULL THEN
        SELECT ea.id, 'estate_admin' INTO admin_id_val, admin_type_val
        FROM public.estate_admins ea WHERE ea.user_id = auth.uid();
    END IF;
    
    IF admin_id_val IS NOT NULL THEN
        INSERT INTO public.audit_logs (
            admin_id, admin_type, action, resource_type, resource_id, 
            old_values, new_values, ip_address
        ) VALUES (
            admin_id_val, admin_type_val, TG_OP, TG_TABLE_NAME, 
            COALESCE(NEW.id, OLD.id),
            CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
            CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
            inet_client_addr()
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_estates_changes 
    AFTER INSERT OR UPDATE OR DELETE ON public.estates
    FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

CREATE TRIGGER audit_estate_admins_changes 
    AFTER INSERT OR UPDATE OR DELETE ON public.estate_admins
    FOR EACH ROW EXECUTE FUNCTION public.log_admin_action();

-- =====================================================
-- 7. INITIAL DATA SETUP
-- =====================================================

-- Create the first super admin (update with your details)
DO $$
DECLARE
    super_admin_id UUID;
    password_data RECORD;
BEGIN
    -- Insert super admin
    INSERT INTO public.super_admins (
        name, email, phone, permissions
    ) VALUES (
        'System Administrator',
        'admin@minnit.com',
        '+1234567890',
        '{"manage_estates": true, "manage_admins": true, "view_analytics": true, "system_settings": true, "create_super_admins": true}'::jsonb
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
-- 8. HELPER FUNCTIONS FOR ESTATE ADMIN CREATION
-- =====================================================

-- Function to create estate admin with credentials
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
        estate_id, name, email, phone, role, is_active, created_by_super_admin
    ) VALUES (
        p_estate_id, p_name, p_email, p_phone, 'admin', true, p_created_by_super_admin
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

-- Function to update admin password
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
        salt = password_data.salt,
        last_password_change = NOW(),
        failed_login_attempts = 0,
        locked_until = NULL
    WHERE admin_id = p_admin_id AND admin_type = p_admin_type;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for super_admins
CREATE INDEX IF NOT EXISTS idx_super_admins_user_id ON public.super_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_super_admins_email ON public.super_admins(email);
CREATE INDEX IF NOT EXISTS idx_super_admins_active ON public.super_admins(is_active);

-- Indexes for admin_credentials
CREATE INDEX IF NOT EXISTS idx_admin_credentials_email ON public.admin_credentials(email);
CREATE INDEX IF NOT EXISTS idx_admin_credentials_admin ON public.admin_credentials(admin_id, admin_type);

-- Indexes for admin_sessions
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin ON public.admin_sessions(admin_id, admin_type);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions(expires_at);

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON public.audit_logs(admin_id, admin_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- Indexes for system_analytics
CREATE INDEX IF NOT EXISTS idx_system_analytics_estate ON public.system_analytics(estate_id);
CREATE INDEX IF NOT EXISTS idx_system_analytics_metric ON public.system_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_analytics_recorded ON public.system_analytics(recorded_at);

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Final verification query
SELECT 
    'Super Admin Setup Complete!' as status,
    COUNT(*) as super_admins_created
FROM public.super_admins;

-- Display important information
SELECT 
    'IMPORTANT: Default super admin credentials' as notice,
    'Email: admin@minnit.com' as email,
    'Password: SuperAdmin123!' as password,
    'Please change password after first login!' as warning;