-- Create missing functions and triggers

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

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_loans_on_payment_insert ON public.payments;
DROP TRIGGER IF EXISTS update_loans_on_payment_delete ON public.payments;
DROP TRIGGER IF EXISTS update_borrowers_updated_at ON public.borrowers;
DROP TRIGGER IF EXISTS update_loans_updated_at ON public.loans;

-- Create triggers
CREATE TRIGGER update_loans_on_payment_insert
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loan_amount_paid();

CREATE TRIGGER update_loans_on_payment_delete
  AFTER DELETE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loan_on_payment_delete();

CREATE TRIGGER update_borrowers_updated_at
  BEFORE UPDATE ON public.borrowers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();