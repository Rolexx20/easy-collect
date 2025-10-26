import { useState, useEffect, useRef } from "react";
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
  const [editProfile, setEditProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ name: "", email: "" });

  // Last backup info
  const [lastBackup, setLastBackup] = useState<{ name: string; updated_at: string } | null>(null);

  // New states to track last export/import times
  const [lastExport, setLastExport] = useState<string | null>(null);
  const [lastImport, setLastImport] = useState<string | null>(null);

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
    loadLastBackup();
    loadExportImport(); // load persisted export/import timestamps
  }, []);

  // Load persisted last export/import from localStorage
  const loadExportImport = () => {
    try {
      const le = localStorage.getItem("ec_lastExport");
      const li = localStorage.getItem("ec_lastImport");
      setLastExport(le || null);
      setLastImport(li || null);
    } catch (err) {
      console.error("Error loading last export/import:", err);
    }
  };

  // New: format ISO string to "dd/MM/yyyy, HH:mm:ss"
  const formatDateTime = (iso?: string | null) => {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      const pad = (n: number) => n.toString().padStart(2, "0");
      const day = pad(d.getDate());
      const month = pad(d.getMonth() + 1);
      const year = d.getFullYear();
      const hours = pad(d.getHours());
      const mins = pad(d.getMinutes());
      const secs = pad(d.getSeconds());
      return `${day}/${month}/${year}, ${hours}:${mins}:${secs}`;
    } catch (e) {
      return new Date(iso).toLocaleString();
    }
  };

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

  const loadLastBackup = async () => {
    try {
      const bucket = "Database Backup";
      // list newest file in website-backups folder
      const { data, error } = await supabase.storage.from(bucket).list("website-backups", {
        limit: 1,
        sortBy: { column: "created_at", order: "desc" },
      } as any);

      if (error) {
        console.error("Error listing backups:", error);
        setLastBackup(null);
        return;
      }

      if (data && data.length > 0) {
        const item = data[0] as any;
        setLastBackup({
          name: item.name,
          updated_at: item.updated_at || item.created_at || "",
        });
      } else {
        setLastBackup(null);
      }
    } catch (err) {
      console.error("Error loading last backup:", err);
      setLastBackup(null);
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

      // persist last export timestamp
      const now = new Date().toISOString();
      try {
        localStorage.setItem("ec_lastExport", now);
      } catch {}
      setLastExport(now);

      // Optionally refresh last backup if you also upload to Supabase from client or inform server to update storage
      // loadLastBackup();
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

  const importInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? importInputRef.current?.files?.[0];
    if (!file) return;

    const clearInputs = () => {
      try { if (importInputRef.current) importInputRef.current.value = ""; } catch {}
      try { event.target.value = ""; } catch {}
    };

    let text = "";
    try {
      text = await file.text();
    } catch (err) {
      console.error("Error reading file:", err);
      toast({
        title: "Import Failed",
        description: "Unable to read the selected file.",
        variant: "destructive",
        duration: 4000,
      });
      clearInputs();
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("Invalid JSON:", err);
      toast({
        title: "Import Failed",
        description: "File is not valid JSON. Please check the file format.",
        variant: "destructive",
        duration: 4000,
      });
      clearInputs();
      return;
    }

    // Normalize common backup shapes
    let borrowers: any[] = parsed.borrowers ?? parsed.data?.borrowers ?? [];
    let loans: any[] = parsed.loans ?? parsed.data?.loans ?? [];
    let payments: any[] = parsed.payments ?? parsed.data?.payments ?? [];

    // Convert map-like objects to arrays
    if (borrowers && !Array.isArray(borrowers) && typeof borrowers === "object") borrowers = Object.values(borrowers);
    if (loans && !Array.isArray(loans) && typeof loans === "object") loans = Object.values(loans);
    if (payments && !Array.isArray(payments) && typeof payments === "object") payments = Object.values(payments);

    if (
      (!borrowers || borrowers.length === 0) &&
      (!loans || loans.length === 0) &&
      (!payments || payments.length === 0)
    ) {
      toast({
        title: "Import Failed",
        description: "No recognizable borrowers, loans or payments found in the file.",
        variant: "destructive",
        duration: 4000,
      });
      clearInputs();
      return;
    }

    const results = { borrowers: 0, loans: 0, payments: 0 };
    const errors: string[] = [];

    try {
      // Whitelist of borrower columns that exist in DB - avoid aggregated/computed fields
      const borrowerCols = new Set([
        "id",
        "name",
        "phone",
        "address",
        "nic_number",
        "first_name",
        "last_name",
        "title",
        "email"
      ]);

      const borrowersUpsert = (borrowers || []).map((b: any) => {
        const out: any = {};
        for (const k of Object.keys(b || {})) {
          if (borrowerCols.has(k)) out[k] = b[k];
        }
        // ensure id exists for upsert to preserve relationships
        if (!out.id && b.id) out.id = b.id;
        return out;
      }).filter((r: any) => r && Object.keys(r).length > 0);

      if (borrowersUpsert.length > 0) {
        const { error: bErr } = await supabase.from("borrowers").upsert(borrowersUpsert, { returning: "minimal" } as any);
        if (bErr) {
          console.error("Borrowers upsert error:", bErr);
          errors.push(`borrowers: ${bErr.message}`);
        } else {
          results.borrowers = borrowersUpsert.length;
        }
      }

      // Loans - map only expected columns (preserve ids and borrower_id)
      const loanCols = new Set([
        "id",
        "borrower_id",
        "principal_amount",
        "interest_rate",
        "duration_months",
        "total_amount",
        "amount_paid",
        "start_date",
        "next_payment_date",
        "status",
        "created_at",
        "updated_at",
        "arrears",
        "user_id"
      ]);

      const loansUpsert = (loans || []).map((l: any) => {
        const out: any = {};
        for (const k of Object.keys(l || {})) {
          if (loanCols.has(k)) out[k] = l[k];
        }
        if (!out.id && l.id) out.id = l.id;
        // ensure borrower_id is present if available under alternative keys
        out.borrower_id = out.borrower_id ?? l.borrowerId ?? l.borrower_id ?? null;
        return out;
      }).filter((r: any) => r && Object.keys(r).length > 0);

      if (loansUpsert.length > 0) {
        const { error: lErr } = await supabase.from("loans").upsert(loansUpsert, { returning: "minimal" } as any);
        if (lErr) {
          console.error("Loans upsert error:", lErr);
          errors.push(`loans: ${lErr.message}`);
        } else {
          results.loans = loansUpsert.length;
        }
      }

      // Payments - map only expected columns
      const paymentCols = new Set([
        "id",
        "loan_id",
        "amount",
        "payment_date",
        "payment_method",
        "notes",
        "created_at",
        "payment_time",
        "user_id"
      ]);

      const paymentsUpsert = (payments || []).map((p: any) => {
        const out: any = {};
        for (const k of Object.keys(p || {})) {
          if (paymentCols.has(k)) out[k] = p[k];
        }
        if (!out.id && p.id) out.id = p.id;
        out.loan_id = out.loan_id ?? p.loanId ?? p.loan_id ?? null;
        return out;
      }).filter((r: any) => r && Object.keys(r).length > 0);

      if (paymentsUpsert.length > 0) {
        const { error: pErr } = await supabase.from("payments").upsert(paymentsUpsert, { returning: "minimal" } as any);
        if (pErr) {
          console.error("Payments upsert error:", pErr);
          errors.push(`payments: ${pErr.message}`);
        } else {
          results.payments = paymentsUpsert.length;
        }
      }

    } catch (err: any) {
      console.error("Import exception:", err);
      errors.push(String(err?.message ?? err));
    }

    const totalImported = results.borrowers + results.loans + results.payments;

    if (totalImported > 0) {
      const now = new Date().toISOString();
      try { localStorage.setItem("ec_lastImport", now); } catch {}
      setLastImport(now);

      toast({
        title: t.dataImported,
        description: `Imported ${results.borrowers} borrowers, ${results.loans} loans, ${results.payments} payments.`,
        duration: 4000,
      });
    } else {
      toast({
        title: "Import Failed",
        description: errors.length > 0 ? `Errors: ${errors[0]}` : "Failed to import data. Please check the file format.",
        variant: "destructive",
        duration: 6000,
      });
    }

    clearInputs();
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

  const handleEditProfile = () => {
    setEditProfileData(profile);
    setEditProfile(true);
  };

  const handleCancelEditProfile = () => {
    setEditProfile(false);
    setEditProfileData(profile);
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoadingProfile(true);
      // updateUserProfile now expects two arguments: id and profile
      await updateUserProfile(userProfile?.id, {
        name: editProfileData.name,
        email: editProfileData.email,
      });
      setProfile(editProfileData);
      setEditProfile(false);
      toast({
        title: t.profileUpdated,
        duration: 3000,
      });
      // Optionally reload profile from DB
      loadUserProfile();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update profile.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  return (
    <div className="p-6 pt-5 pb-20 md:pb-6 max-w-5xl mx-auto">
      {/* Header and Language Toggle */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.settings}
        </h1>
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
              <Languages className="w-4 h-4" />
              <span className="text-xs font-medium">English</span>
            </>
          ) : (
            <>
              <Globe2 className="w-4 h-4" />
              <span className="text-xs font-medium">தமிழ்</span>
            </>
          )}
        </Button>
      </div>

      {/* 2x2 Grid for Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Profile */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors flex flex-col justify-between min-h-[320px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t.userProfile}
            </CardTitle>
            <CardDescription>{t.profileDesc}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {!editProfile ? (
              <form className="space-y-4 flex flex-col h-full">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t.name}</Label>
                    <div
                      className="bg-gray-100 dark:bg-[#2d323c] rounded-md px-4 py-2 mt-1 text-base font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 w-full truncate"
                      id="name"
                      style={{ minWidth: 0 }}
                    >
                      {profile.name}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">{t.email}</Label>
                    <div
                      className="bg-gray-100 dark:bg-[#2d323c] rounded-md px-4 py-2 mt-1 text-base font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 w-full break-all"
                      id="email"
                      style={{ minWidth: 0 }}
                    >
                      {profile.email}
                    </div>
                  </div>
                </div>
                {/* Password Section */}
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword">{t.newPassword}</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))
                        }
                        placeholder={t.newPassword}
                        className="mt-1 bg-gray-100 dark:bg-[#23272f] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        placeholder={t.confirmPassword}
                        className="mt-1 bg-gray-100 dark:bg-[#23272f] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 mt-5">
                    <Button
                      onClick={handlePasswordChange}
                      className="flex items-center gap-2 md:flex-1 bg-gray-100 dark:bg-[#23272f] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                      variant="outline"
                      type="button"
                      style={{ backgroundColor: "#2563eb", color: "#fff" }}
                      disabled={!passwordData.newPassword || !passwordData.confirmPassword}
                    >
                      <Lock className="w-4 h-4" />
                      {t.changePassword}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 md:flex-1 bg-gray-100 dark:bg-[#23272f] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                      type="button"
                      onClick={handleEditProfile}
                    >
                      <User className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <form className="space-y-4 flex flex-col h-full">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">{t.name}</Label>
                    <Input
                      id="edit-name"
                      value={editProfileData.name}
                      onChange={e => setEditProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                      className="mt-1 bg-gray-100 dark:bg-[#23272f] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">{t.email}</Label>
                    <Input
                      id="edit-email"
                      value={editProfileData.email}
                      onChange={e => setEditProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                      className="mt-1 bg-gray-100 dark:bg-[#23272f] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2 mt-5">
                  <Button
                    onClick={async () => {
                      await handleSaveProfile();
                    }}
                    className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-[#1d4ed8] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                    disabled={
                      isLoadingProfile ||
                      !editProfileData.name ||
                      !editProfileData.email
                    }
                    type="button"
                  >
                    <User className="w-4 h-4" />
                    {isLoadingProfile ? "Saving..." : t.saveProfile}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-gray-100 dark:bg-[#23272f] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                    onClick={handleCancelEditProfile}
                    disabled={isLoadingProfile}
                    type="button"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              {t.dataManagement}
            </CardTitle>
            <CardDescription>{t.dataDesc}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Export Section */}
              <div>
                <h3 className="font-medium mb-1">{t.exportData}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {t.exportDesc}
                </p>
                <Button
                  onClick={handleExportData}
                  variant="outline"
                  className="w-full flex items-center gap-2 bg-gray-100 dark:bg-[#23272f] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                >
                  <Download className="w-4 h-4" />
                  {t.exportData}
                </Button>
              </div>
              {/* Import Section */}
              <div>
                <h3 className="font-medium mb-1">{t.importData}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {t.importDesc}
                </p>

                {/* Hidden native file input (ref) */}
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-file"
                />

                {/* Visible button opens file picker */}
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 bg-gray-100 dark:bg-[#23272f] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  {t.importData}
                </Button>
              </div>

              {/* Last backup display */}
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <div>
                  <strong>Last export:</strong>{" "}
                  {lastExport ? (
                    <span className="ml-1">{formatDateTime(lastExport)}</span>
                  ) : (
                    <span className="ml-1">Never</span>
                  )}
                </div>

                <div>
                  <strong>Last import:</strong>{" "}
                  {lastImport ? (
                    <span className="ml-1">{formatDateTime(lastImport)}</span>
                  ) : (
                    <span className="ml-1">Never</span>
                  )}
                </div>

                <div>
                  <strong>Last backup:</strong>{" "}
                  {lastBackup ? (
                    <span className="ml-1">
                      {formatDateTime(lastBackup.updated_at) ?? new Date(lastBackup.updated_at).toLocaleString()}
                      <span className="text-xs text-muted-foreground truncate ml-2">{lastBackup.name}</span>
                    </span>
                  ) : (
                    <span className="ml-1">No backups found</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Session Management */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t.sessionManagement}
            </CardTitle>
            <CardDescription>{t.sessionDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {authData && (
              <div className="grid grid-cols-1 gap-8">
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
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <Button
                onClick={() => setShowSessionDetails(!showSessionDetails)}
                variant="outline"
                className="w-full dark:bg-[#1d4ed8]"
              >
                <Shield className="w-4 h-4 mr-2" />
                {showSessionDetails ? t.hideSessionDetails : t.showSessionDetails}
              </Button>
              {/* Detailed Session Information */}
              {showSessionDetails && authData && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-[#262b34] rounded-lg">
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
                      <pre className="text-xs bg-gray-100 dark:bg-[#23272f] p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(authData.user.user_metadata, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">App Metadata:</span>
                      <br />
                      <pre className="text-xs bg-gray-100 dark:bg-[#23272f] p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(authData.user.app_metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Access */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              {t.systemAccess}
            </CardTitle>
            <CardDescription>{t.systemAccessDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#262b34] rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{t.totalUsers}</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{totalUsers}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#262b34] rounded-lg">
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
