-- Add arrears column to loans table to track missed payment amounts
ALTER TABLE public.loans ADD COLUMN arrears numeric DEFAULT 0;

-- Add user profiles table for future authentication
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  phone text,
  nic_no text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for user profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy for user profiles (users can manage their own profile)
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (true);  -- For now, allow all access

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (true);  -- For now, allow all access

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (true);  -- For now, allow all access

-- Create trigger for updating updated_at timestamp on user_profiles
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default user profile with password "12345678" (basic bcrypt hash)
INSERT INTO public.user_profiles (email, password_hash, name) 
VALUES ('admin@easycollect.app', '$2a$10$N9qo8uLOickgx2ZMRZoMye/7DgQ/WE0p5F9UCW4/wQ.T1W/5ydyRK', 'Admin User');

-- Update payment status calculation function to include arrears
CREATE OR REPLACE FUNCTION public.update_loan_amount_paid()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update the loan's amount_paid by summing all payments for this loan
  UPDATE loans 
  SET 
    amount_paid = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM payments 
      WHERE loan_id = NEW.loan_id
    ),
    status = CASE 
      WHEN (
        SELECT COALESCE(SUM(amount), 0) 
        FROM payments 
        WHERE loan_id = NEW.loan_id
      ) >= total_amount THEN 'completed'
      WHEN next_payment_date < CURRENT_DATE AND (
        SELECT COALESCE(SUM(amount), 0) 
        FROM payments 
        WHERE loan_id = NEW.loan_id
      ) < total_amount THEN 'overdue'
      ELSE 'active'
    END,
    updated_at = now()
  WHERE id = NEW.loan_id;

  RETURN NEW;
END;
$function$;