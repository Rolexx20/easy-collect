import { useState, useEffect } from "react";
import {
  User,
  Download,
  Upload,
  Database,
  Languages,
  Globe2,
  Lock,
  Key,
  Shield,
  Monitor,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getUserProfile, updateUserProfile, changePassword, type UserProfile, getBorrowers, getLoans, getPayments, createBorrower, createLoan, createPayment } from "@/lib/database";
import { supabase } from "@/integrations/supabase/client";

interface SettingsProps {
  language: string;
  setLanguage: (lang: string) => void;
}

const Settings = ({ language, setLanguage }: SettingsProps) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [authData, setAuthData] = useState<any>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [totalUsers, setTotalUsers] = useState(0);

  const translations = {
    en: {
      settings: "Settings",
      userProfile: "User Profile",
      profileDesc: "Manage your profile information",
      name: "Full Name",
      email: "Email Address",
      saveProfile: "Save Profile",
      dataManagement: "Data Management",
      dataDesc: "Backup and restore your data",
      exportData: "Export Data",
      importData: "Import Data",
      exportDesc: "Download all your data as backup",
      importDesc: "Restore data from backup file",
      profileUpdated: "Profile updated successfully",
      dataExported: "Data exported successfully",
      dataImported: "Data imported successfully",
      connectPrinter: "Connect Printer",
      printerConnected: "Printer Connected",
      changePassword: "Change Password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm New Password",
      passwordChanged: "Password changed successfully",
      passwordMismatch: "Passwords do not match",
      invalidCurrentPassword: "Invalid current password",
      showPasswordForm: "Show Password Change",
      hidePasswordForm: "Hide Password Change",
      sessionManagement: "Session Management",
      sessionDesc: "View and manage your authentication sessions",
      currentSession: "Current Session",
      userId: "User ID",
      userRole: "User Role",
      loginTime: "Login Time",
      lastActive: "Last Active",
      sessionDetails: "Session Details",
      showSessionDetails: "Show Session Details",
      hideSessionDetails: "Hide Session Details",
      systemAccess: "System Access",
      systemAccessDesc: "View system access statistics",
      totalUsers: "Total Users",
      activeUsers: "Active Users",
    },
    ta: {
      settings: "அமைப்புகள்",
      userProfile: "பயனர் சுயவிவரம்",
      profileDesc: "உங்கள் சுயவிவர தகவலை நிர்வகிக்கவும்",
      name: "முழு பெயர்",
      email: "மின்னஞ்சல் முகவரி",
      saveProfile: "சுயவிவரத்தை சேமிக்கவும்",
      dataManagement: "தரவு மேலாண்மை",
      dataDesc: "உங்கள் தரவை காப்புப்படுத்தி மீட்டமைக்கவும்",
      exportData: "தரவை ஏற்றுமதி செய்யவும்",
      importData: "தரவை இறக்குமதி செய்யவும்",
      exportDesc:
        "உங்கள் எல்லா தரவையும் காப்புப்படுத்தல் என பதிவிறக்கம் செய்யவும்",
      importDesc: "காப்புப்படுத்தல் கோப்பிலிருந்து தரவை மீட்டமைக்கவும்",
      profileUpdated: "சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது",
      dataExported: "தரவு வெற்றிகரமாக ஏற்றுமதி செய்யப்பட்டது",
      dataImported: "தரவு வெற்றிகரமாக இறக்குமதி செய்யப்பட்டது",
      connectPrinter: "அச்சுப்பொறியை இணைக்கவும்",
      printerConnected: "அச்சுப்பொறி இணைக்கப்பட்டது",
      changePassword: "கடவுச்சொல் மாற்று",
      currentPassword: "தற்போதைய கடவுச்சொல்",
      newPassword: "புதிய கடவுச்சொல்",
      confirmPassword: "புதிய கடவுச்சொல் உறுதிப்படுத்தவும்",
      passwordChanged: "கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது",
      passwordMismatch: "கடவுச்சொற்கள் பொருந்தவில்லை",
      invalidCurrentPassword: "தவறான தற்போதைய கடவுச்சொல்",
      showPasswordForm: "கடவுச்சொல் மாற்றத்தைக் காட்டு",
      hidePasswordForm: "கடவுச்சொல் மாற்றத்தை மறைக்க",
      sessionManagement: "அமர்வு மேலாண்மை",
      sessionDesc: "உங்கள் அங்கீகார அமர்வுகளைப் பார்த்து நிர்வகிக்கவும்",
      currentSession: "தற்போதைய அமர்வு",
      userId: "பயனர் ஐடி",
      userRole: "பயனர் பாத்திரம்",
      loginTime: "உள்நுழைவு நேரம்",
      lastActive: "கடைசியாக செயலில்",
      sessionDetails: "அமர்வு விவரங்கள்",
      showSessionDetails: "அமர்வு விவரங்களைக் காட்டு",
      hideSessionDetails: "அமர்வு விவரங்களை மறைக்க",
      systemAccess: "கணினி அணுகல்",
      systemAccessDesc: "கணினி அணுகல் புள்ளிவிவரங்களைப் பார்க்கவும்",
      totalUsers: "மொத்த பயனர்கள்",
      activeUsers: "செயலில் உள்ள பயனர்கள்",
    },
  };

  const t = translations[language as keyof typeof translations];

  // Load user profile and auth data on component mount
  useEffect(() => {
    loadUserProfile();
    loadAuthData();
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      setTotalUsers(count || 0);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadAuthData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (user && session) {
        setAuthData({
          user,
          session,
          loginTime: user.created_at ? new Date(user.created_at).toLocaleString() : 'Current session',
          lastActive: new Date().toLocaleString(),
          provider: user.app_metadata?.provider || 'email',
          role: user.role || 'authenticated',
        });
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const userData = await getUserProfile();
      if (userData) {
        setUserProfile(userData);
        setProfile({
          name: userData.name || "",
          email: userData.email || "",
        });
      } else {
        // Create a default profile from auth user if none exists
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const defaultProfile = {
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            password_hash: '$2a$10$' + btoa('Keliz~7227').slice(0, 53),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Try to create the profile
          try {
            await supabase
              .from('user_profiles')
              .insert([defaultProfile]);
            
            setUserProfile(defaultProfile);
            setProfile({
              name: defaultProfile.name,
              email: defaultProfile.email,
            });
          } catch (error) {
            console.error('Error creating default profile:', error);
            // Still set the profile data for display
            setProfile({
              name: defaultProfile.name,
              email: defaultProfile.email,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleExportData = async () => {
    try {
      // Fetch real data from database
      const [borrowersData, loansData, paymentsData] = await Promise.all([
        getBorrowers(),
        getLoans(),
        getPayments()
      ]);
      
      const data = {
        borrowers: borrowersData,
        loans: loansData,
        payments: paymentsData,
        exportDate: new Date().toISOString(),
        version: "1.0"
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `easycollect-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: t.dataExported,
        description: "Your data has been exported successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate data structure
      if (!data.borrowers || !data.loans || !data.payments) {
        throw new Error('Invalid backup file format');
      }

      // Import borrowers
      if (data.borrowers.length > 0) {
        for (const borrower of data.borrowers) {
          const { id, created_at, updated_at, total_loans, active_loans, total_amount, total_paid, remaining_amount, pending_payment, ...borrowerData } = borrower;
          await createBorrower(borrowerData);
        }
      }

      // Import loans  
      if (data.loans.length > 0) {
        for (const loan of data.loans) {
          const { id, borrowerName, amount_paid, created_at, updated_at, ...loanData } = loan;
          await createLoan(loanData);
        }
      }

      // Import payments
      if (data.payments.length > 0) {
        for (const payment of data.payments) {
          const { id, created_at, ...paymentData } = payment;
          await createPayment(paymentData);
        }
      }

      toast({
        title: t.dataImported,
        description: "Your data has been imported successfully.",
        duration: 3000,
      });

      // Reset the file input
      event.target.value = '';
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please check the file format.",
        variant: "destructive",
        duration: 3000,
      });
      // Reset the file input
      event.target.value = '';
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          title: t.passwordMismatch,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        toast({
          title: "Password change failed",
          description: error.message,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      toast({
        title: t.passwordChanged,
        duration: 3000,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Password change failed",
        description: "An unexpected error occurred",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="p-6 pt-5 pb-20 md:pb-6 space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.settings}
        </h1>

        {/* Language Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === "en" ? "ta" : "en")}
          className={cn(
            "flex items-center gap-2 border-2 rounded-full transition-all duration-300 hover:scale-105 h-7 px-3",
            language === "en"
              ? "bg-gray-100 border-gray-300 text-black hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              : ""
          )}
        >
          {language === "en" ? (
            <>
              {/* English Icon */}
              <Languages className="w-4 h-4" />
              <span className="text-xs font-medium">English</span>
            </>
          ) : (
            <>
              {/* Tamil Icon */}
              <Globe2 className="w-4 h-4" />
              <span className="text-xs font-medium">தமிழ்</span>
            </>
          )}
        </Button>
      </div>

      {/* User Profile & Data Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Profile Section */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t.userProfile}
            </CardTitle>
            <CardDescription>{t.profileDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <div
                  className="bg-gray-100 dark:bg-gray-800 rounded px-4 py-2 text-base font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                  id="name"
                >
                  {profile.name}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <div
                  className="bg-gray-100 dark:bg-gray-800 rounded px-4 py-2 text-base font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                  id="email"
                >
                  {profile.email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              {t.dataManagement}
            </CardTitle>
            <CardDescription>{t.dataDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <h3 className="font-medium">{t.exportData}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.exportDesc}
                </p>
                <Button
                  onClick={handleExportData}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.exportData}
                </Button>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">{t.importData}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.importDesc}
                </p>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                    id="import-file"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      document.getElementById("import-file")?.click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t.importData}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Management Section */}
      <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t.sessionManagement}
          </CardTitle>
          <CardDescription>{t.sessionDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {authData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Current Session Info */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  {t.currentSession}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t.userId}:</span>
                    <span className="font-mono text-xs">{authData.user.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t.email}:</span>
                    <span>{authData.user.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t.userRole}:</span>
                    <span className="capitalize">{authData.role}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Provider:</span>
                    <span className="capitalize">{authData.provider}</span>
                  </div>
                </div>
              </div>

              {/* Session Activity */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t.loginTime}:</span>
                    <span>{authData.loginTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t.lastActive}:</span>
                    <span>{authData.lastActive}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="text-green-600 dark:text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Session Details Toggle */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <Button
              onClick={() => setShowSessionDetails(!showSessionDetails)}
              variant="outline"
              className="w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              {showSessionDetails ? t.hideSessionDetails : t.showSessionDetails}
            </Button>

            {/* Detailed Session Information */}
            {showSessionDetails && authData && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                  {t.sessionDetails}
                </h4>
                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Session ID:</span>
                    <br />
                    <span className="break-all">{authData.session.access_token.slice(0, 50)}...</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">User Metadata:</span>
                    <br />
                    <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(authData.user.user_metadata, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">App Metadata:</span>
                    <br />
                    <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(authData.user.app_metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Password Change & System Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Password Change Section */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              {t.changePassword}
            </CardTitle>
            <CardDescription>Change your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              variant="outline"
              className="w-full"
            >
              <Lock className="w-4 h-4 mr-2" />
              {showPasswordForm ? t.hidePasswordForm : t.showPasswordForm}
            </Button>

            {showPasswordForm && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t.newPassword}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button 
                  onClick={handlePasswordChange}
                  className="w-full"
                  disabled={!passwordData.newPassword || !passwordData.confirmPassword}
                >
                  {t.changePassword}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Access Section */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              {t.systemAccess}
            </CardTitle>
            <CardDescription>{t.systemAccessDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{t.totalUsers}</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{totalUsers}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{t.activeUsers}</span>
                </div>
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Current session: {authData?.user?.email || 'Unknown'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;