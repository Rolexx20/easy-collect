-- Create borrowers table
CREATE TABLE public.borrowers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  first_name TEXT,
  last_name TEXT,
  name TEXT NOT NULL,
  nic_number TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loans table
CREATE TABLE public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  borrower_id UUID NOT NULL,
  principal_amount NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  duration_months INTEGER NOT NULL,
  total_amount NUMERIC NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  next_payment_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (borrower_id) REFERENCES public.borrowers(id) ON DELETE CASCADE
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE
);

-- Create borrower_stats view
CREATE VIEW public.borrower_stats AS
SELECT 
  b.id,
  b.name,
  b.phone,
  b.address,
  COUNT(l.id) AS total_loans,
  COUNT(CASE WHEN l.status = 'active' THEN 1 END) AS active_loans,
  COALESCE(SUM(l.total_amount), 0) AS total_amount,
  COALESCE(SUM(l.amount_paid), 0) AS total_paid,
  COALESCE(SUM(l.total_amount - l.amount_paid), 0) AS remaining_amount
FROM public.borrowers b
LEFT JOIN public.loans l ON b.id = l.borrower_id
GROUP BY b.id, b.name, b.phone, b.address;

-- Create function to calculate loan total
CREATE OR REPLACE FUNCTION public.calculate_loan_total(principal NUMERIC, rate NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN principal + (principal * rate / 100);
END;
$$;

-- Create function to update loan amount paid and status
CREATE OR REPLACE FUNCTION public.update_loan_amount_paid()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the loan's amount_paid by summing all payments for this loan
  UPDATE public.loans 
  SET 
    amount_paid = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM public.payments 
      WHERE loan_id = NEW.loan_id
    ),
    status = CASE 
      WHEN (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.payments 
        WHERE loan_id = NEW.loan_id
      ) >= total_amount THEN 'completed'
      WHEN next_payment_date < CURRENT_DATE AND (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.payments 
        WHERE loan_id = NEW.loan_id
      ) < total_amount THEN 'overdue'
      ELSE 'active'
    END,
    updated_at = now()
  WHERE id = NEW.loan_id;

  RETURN NEW;
END;
$$;

-- Create function to update loan status on payment deletion
CREATE OR REPLACE FUNCTION public.update_loan_on_payment_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the loan's amount_paid by summing remaining payments
  UPDATE public.loans 
  SET 
    amount_paid = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM public.payments 
      WHERE loan_id = OLD.loan_id
    ),
    status = CASE 
      WHEN (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.payments 
        WHERE loan_id = OLD.loan_id
      ) >= total_amount THEN 'completed'
      WHEN next_payment_date < CURRENT_DATE AND (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.payments 
        WHERE loan_id = OLD.loan_id
      ) < total_amount THEN 'overdue'
      ELSE 'active'
    END,
    updated_at = now()
  WHERE id = OLD.loan_id;

  RETURN OLD;
END;
$$;

-- Create triggers
CREATE TRIGGER update_loans_on_payment_insert
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loan_amount_paid();

CREATE TRIGGER update_loans_on_payment_delete
  AFTER DELETE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loan_on_payment_delete();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_borrowers_updated_at
  BEFORE UPDATE ON public.borrowers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - you can restrict later)
CREATE POLICY "Allow all operations on borrowers" ON public.borrowers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on loans" ON public.loans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);