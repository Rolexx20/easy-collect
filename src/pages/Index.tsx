
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import BorrowerManager from '@/components/BorrowerManager';
import LoanManager from '@/components/LoanManager';
import Reports from '@/components/Reports';

const Index = () => {
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [borrowers, setBorrowers] = useState([
    {
      id: '1',
      name: 'Rajesh Kumar',
      phone: '+91 9876543210',
      address: '123 Main Street, Chennai',
      totalLoans: 2,
      activeLoans: 1,
      totalAmount: 75000
    },
    {
      id: '2', 
      name: 'Priya Sharma',
      phone: '+91 8765432109',
      address: '456 Oak Avenue, Mumbai',
      totalLoans: 1,
      activeLoans: 1,
      totalAmount: 50000
    }
  ]);

  const [loans, setLoans] = useState([
    {
      id: '1',
      borrowerId: '1',
      borrowerName: 'Rajesh Kumar',
      amount: 50000,
      interestRate: 12,
      duration: 12,
      startDate: '2024-01-15',
      status: 'active' as const,
      amountPaid: 15000,
      nextPaymentDate: '2024-07-15'
    },
    {
      id: '2',
      borrowerId: '1', 
      borrowerName: 'Rajesh Kumar',
      amount: 25000,
      interestRate: 10,
      duration: 6,
      startDate: '2023-12-01',
      status: 'completed' as const,
      amountPaid: 25000,
      nextPaymentDate: ''
    },
    {
      id: '3',
      borrowerId: '2',
      borrowerName: 'Priya Sharma', 
      amount: 50000,
      interestRate: 15,
      duration: 18,
      startDate: '2024-02-01',
      status: 'overdue' as const,
      amountPaid: 10000,
      nextPaymentDate: '2024-06-01'
    }
  ]);

  // Update borrower stats when loans change
  useEffect(() => {
    const updatedBorrowers = borrowers.map(borrower => {
      const borrowerLoans = loans.filter(loan => loan.borrowerId === borrower.id);
      const activeLoans = borrowerLoans.filter(loan => loan.status === 'active').length;
      const totalAmount = borrowerLoans.reduce((sum, loan) => sum + loan.amount, 0);
      
      return {
        ...borrower,
        totalLoans: borrowerLoans.length,
        activeLoans,
        totalAmount
      };
    });
    
    setBorrowers(updatedBorrowers);
  }, [loans]);

  // Theme effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard language={language} borrowers={borrowers} loans={loans} />;
      case 'borrowers':
        return <BorrowerManager language={language} borrowers={borrowers} setBorrowers={setBorrowers} />;
      case 'loans':
        return <LoanManager language={language} loans={loans} setLoans={setLoans} borrowers={borrowers} />;
      case 'reports':
        return <Reports language={language} borrowers={borrowers} loans={loans} />;
      default:
        return <Dashboard language={language} borrowers={borrowers} loans={loans} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full">
      <Header 
        isDark={isDark} 
        setIsDark={setIsDark} 
        language={language} 
        setLanguage={setLanguage} 
      />
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        language={language} 
      />
      <main className="transition-colors duration-200">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
