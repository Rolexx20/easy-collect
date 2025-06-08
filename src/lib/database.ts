import { supabase } from '@/integrations/supabase/client';

export interface Borrower {
  id: string;
  title?: string;
  first_name?: string;
  last_name?: string;
  name: string;
  nic_number?: string;
  phone: string;
  address: string;
  total_loans?: number;
  active_loans?: number;
  total_amount?: number;
  total_paid?: number;
  remaining_amount?: number;
  pending_payment?: number;
  created_at?: string;
}

export interface Loan {
  id: string;
  borrower_id: string;
  borrowerName?: string;
  principal_amount: number;
  interest_rate: number;
  duration_months: number;
  total_amount: number;
  amount_paid: number;
  start_date: string;
  status: 'active' | 'completed' | 'overdue';
  next_payment_date?: string;
}

export interface Payment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
}

// Borrower operations
export const getBorrowers = async (): Promise<Borrower[]> => {
  const { data, error } = await supabase
    .from('borrower_stats')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching borrowers:', error);
    throw error;
  }
  return data || [];
};

export const createBorrower = async (borrower: Omit<Borrower, 'id'>): Promise<Borrower> => {
  const { data, error } = await supabase
    .from('borrowers')
    .insert([borrower])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating borrower:', error);
    throw error;
  }
  return data;
};

export const updateBorrower = async (id: string, borrower: Partial<Borrower>): Promise<Borrower> => {
  const { data, error } = await supabase
    .from('borrowers')
    .update(borrower)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating borrower:', error);
    throw error;
  }
  return data;
};

export const deleteBorrower = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('borrowers')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting borrower:', error);
    throw error;
  }
};

// Loan operations
export const getLoans = async (): Promise<Loan[]> => {
  const { data, error } = await supabase
    .from('loans')
    .select(`
      *,
      borrowers!inner(name)
    `)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching loans:', error);
    throw error;
  }
  
  return data?.map(loan => ({
    ...loan,
    borrowerName: loan.borrowers?.name,
    status: loan.status as 'active' | 'completed' | 'overdue'
  })) || [];
};

export const createLoan = async (loan: Omit<Loan, 'id' | 'amount_paid' | 'borrowerName'>): Promise<Loan> => {
  console.log('Creating loan with data:', loan);
  
  // Calculate total amount with interest
  const totalAmount = loan.principal_amount + (loan.principal_amount * loan.interest_rate / 100);
  
  // Calculate next payment date (30 days from start)
  const startDate = new Date(loan.start_date);
  const nextPaymentDate = new Date(startDate);
  nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
  
  const loanData = {
    borrower_id: loan.borrower_id,
    principal_amount: loan.principal_amount,
    interest_rate: loan.interest_rate,
    duration_months: loan.duration_months,
    total_amount: totalAmount,
    start_date: loan.start_date,
    status: 'active',
    next_payment_date: nextPaymentDate.toISOString().split('T')[0]
  };
  
  console.log('Inserting loan data:', loanData);
  
  const { data, error } = await supabase
    .from('loans')
    .insert([loanData])
    .select(`
      *,
      borrowers!inner(name)
    `)
    .single();
    
  if (error) {
    console.error('Error creating loan:', error);
    throw error;
  }
  
  return {
    ...data,
    borrowerName: data.borrowers?.name,
    status: data.status as 'active' | 'completed' | 'overdue'
  };
};

export const updateLoan = async (id: string, loan: Partial<Loan>): Promise<Loan> => {
  const { data, error } = await supabase
    .from('loans')
    .update(loan)
    .eq('id', id)
    .select(`
      *,
      borrowers!inner(name)
    `)
    .single();
    
  if (error) {
    console.error('Error updating loan:', error);
    throw error;
  }
  
  return {
    ...data,
    borrowerName: data.borrowers?.name,
    status: data.status as 'active' | 'completed' | 'overdue'
  };
};

export const deleteLoan = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('loans')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting loan:', error);
    throw error;
  }
};

// Payment operations
export const createPayment = async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
  return data;
};

export const getPayments = async (loanId?: string): Promise<Payment[]> => {
  let query = supabase
    .from('payments')
    .select('*')
    .order('payment_date', { ascending: false });
    
  if (loanId) {
    query = query.eq('loan_id', loanId);
  }
    
  const { data, error } = await query;
    
  if (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
  return data || [];
};

// Dashboard statistics
export const getDashboardStats = async () => {
  const borrowers = await getBorrowers();
  const loans = await getLoans();
  
  const totalBorrowers = borrowers.length;
  const activeLoans = loans.filter(loan => loan.status === 'active').length;
  const completedLoans = loans.filter(loan => loan.status === 'completed').length;
  const overdueLoans = loans.filter(loan => loan.status === 'overdue').length;
  const totalCollected = loans.reduce((sum, loan) => sum + (loan.amount_paid || 0), 0);
  const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.total_amount, 0);
  const pendingAmount = totalLoanAmount - totalCollected;
  
  return {
    totalBorrowers,
    activeLoans,
    completedLoans,
    overdueLoans,
    totalCollected,
    totalLoanAmount,
    pendingAmount,
    loans,
    borrowers
  };
};
