-- Add payment_time column to payments table
ALTER TABLE public.payments ADD COLUMN payment_time time DEFAULT CURRENT_TIME;

-- Update borrower_stats view to include NIC Number, Title, First Name, Last Name
DROP VIEW IF EXISTS public.borrower_stats;

CREATE VIEW public.borrower_stats AS
SELECT 
    b.id,
    b.name,
    b.phone,
    b.address,
    b.title,
    b.first_name,
    b.last_name,
    b.nic_number,
    COUNT(l.id) as total_loans,
    COUNT(CASE WHEN l.status = 'active' THEN 1 END) as active_loans,
    COALESCE(SUM(l.total_amount), 0) as total_amount,
    COALESCE(SUM(l.amount_paid), 0) as total_paid,
    COALESCE(SUM(l.total_amount - l.amount_paid), 0) as remaining_amount
FROM public.borrowers b
LEFT JOIN public.loans l ON b.id = l.borrower_id
GROUP BY b.id, b.name, b.phone, b.address, b.title, b.first_name, b.last_name, b.nic_number;