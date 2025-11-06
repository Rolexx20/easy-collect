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
  CloudDownload,
  Trash2,
  Cloud,
  CloudUpload,
  RefreshCcw,
  DatabaseBackup,
  LucideImport,
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
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  type UserProfile,
  getBorrowers,
  getLoans,
  getPayments,
  createBorrower,
  createLoan,
  createPayment,
} from "@/lib/database";
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
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [totalUsers, setTotalUsers] = useState(0);
  const [editProfile, setEditProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: "",
    email: "",
  });

  // Last backup info
  const [lastBackup, setLastBackup] = useState<{
    name: string;
    updated_at: string;
  } | null>(null);

  // New states to track last export/import times
  const [lastExport, setLastExport] = useState<string | null>(null);
  const [lastImport, setLastImport] = useState<string | null>(null);

  // New states: cloud backups, UI flags and statuses for each action
  const [cloudBackups, setCloudBackups] = useState<
    Array<{ name: string; updated_at?: string }>
  >([]);
  const [showCloudBackups, setShowCloudBackups] = useState(false);
  const [cloudListLoading, setCloudListLoading] = useState(false);

  const [backupNowStatus, setBackupNowStatus] = useState<string | null>(null);
  const [localImportStatus, setLocalImportStatus] = useState<string | null>(
    null
  );
  const [cloudImportStatus, setCloudImportStatus] = useState<string | null>(
    null
  );

  // NEW: maximum items to fetch / show, "load more" increments this
  const [cloudLimit, setCloudLimit] = useState<number>(20);

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
      exportDesc: "Upload cloud and Download all your data as backup",
      importDesc: "Restore local data from your device backup file",
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
      backupNow: "Backup Now",
      backupStored: "Backup saved to bucket",
      backupFailed: "Backup failed",
      localImport: "Local Import",
      cloudBackupsLabel: "Cloud Backups",
      importFromCloud: "Import from cloud",
      refreshList: "Refresh",
      statusIdle: "Idle",
      statusLoading: "Processing...",
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
      backupNow: "இப்போது காப்பு சேமி",
      backupStored: "காப்பு வட்டு(bucket)யில் சேமிக்கப்பட்டது",
      backupFailed: "காப்பு தோல்வி",
      localImport: "உள்ளூர் இறக்குமதி",
      cloudBackupsLabel: "மேக காப்புகள்",
      importFromCloud: "மேகத்திலிருந்து இறக்குமதி",
      refreshList: "புதுப்பிக்க",
      statusIdle: "அமைவு",
      statusLoading: "செயலாக்கம்...",
    },
  };

  const t = translations[language as keyof typeof translations];

  // Load user profile and auth data on component mount
  const backupTimersRef = useRef<{
    timeoutId?: number | null;
    intervalId?: number | null;
  }>({
    timeoutId: null,
    intervalId: null,
  });
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadUserProfile();
    loadAuthData();
    loadUserStats();
    loadLastBackup();
    loadExportImport(); // load persisted export/import timestamps
    scheduleEndOfDayBackup(); // schedule automatic daily backup
    // cleanup on unmount
    return () => {
      try {
        if (backupTimersRef.current.timeoutId)
          window.clearTimeout(backupTimersRef.current.timeoutId);
        if (backupTimersRef.current.intervalId)
          window.clearInterval(backupTimersRef.current.intervalId);
      } catch {}
    };
  }, []);

  // Load persisted last export/import from localStorage
  const loadExportImport = () => {
    try {
      const le = localStorage.getItem("ec_lastExport");
      const li = localStorage.getItem("ec_lastImport");
      const cis = localStorage.getItem("ec_cloudImportStatus"); // Add this
      setLastExport(le || null);
      setLastImport(li || null);
      setCloudImportStatus(cis || null); // Add this
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
        .from("user_profiles")
        .select("*", { count: "exact", head: true });
      setTotalUsers(count || 0);
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const loadAuthData = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (user && session) {
        setAuthData({
          user,
          session,
          loginTime: user.created_at
            ? new Date(user.created_at).toLocaleString()
            : "Current session",
          lastActive: new Date().toLocaleString(),
          provider: user.app_metadata?.provider || "email",
          role: user.role || "authenticated",
        });
      }
    } catch (error) {
      console.error("Error loading auth data:", error);
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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const defaultProfile = {
            id: user.id,
            email: user.email || "",
            name:
              user.user_metadata?.name || user.email?.split("@")[0] || "User",
            password_hash: "$2a$10$" + btoa("Keliz~7227").slice(0, 53),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Try to create the profile
          try {
            await supabase.from("user_profiles").insert([defaultProfile]);

            setUserProfile(defaultProfile);
            setProfile({
              name: defaultProfile.name,
              email: defaultProfile.email,
            });
          } catch (error) {
            console.error("Error creating default profile:", error);
            // Still set the profile data for display
            setProfile({
              name: defaultProfile.name,
              email: defaultProfile.email,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const loadLastBackup = async () => {
    try {
      const bucket = "Database Backup";
      // list newest file in website-backups folder
      const { data, error } = await supabase.storage
        .from(bucket)
        .list("website-backups", {
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

  // Helper to produce the same safe segment used in filenames and filtering:
  const deriveSafeUserSegment = async () => {
    try {
      // Try to get freshest auth user (scheduler may run when authData not set)
      const supRes = await supabase.auth.getUser();
      const runtimeUser = supRes?.data?.user ?? authData?.user ?? null;

      const rawName =
        userProfile?.name ??
        runtimeUser?.user_metadata?.name ??
        runtimeUser?.email ??
        "user";

      const firstName =
        String(rawName)
          .split(" ")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]+/gi, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") || "user";

      const uidFrag = (runtimeUser?.id || userProfile?.id || "")
        .toString()
        .slice(0, 8);

      return uidFrag ? `${firstName}-${uidFrag}` : firstName;
    } catch (e) {
      const fallback = (userProfile?.name ?? "user").toString().split(" ")[0];
      return fallback.toLowerCase().replace(/[^a-z0-9]+/gi, "-");
    }
  };

  // Update the performBackupAndUpload function
  const performBackupAndUpload = async (isManual = false) => {
    try {
      // get data
      const [borrowersData, loansData, paymentsData] = await Promise.all([
        getBorrowers(),
        getLoans(),
        getPayments(),
      ]);

      const data = {
        borrowers: borrowersData,
        loans: loansData,
        payments: paymentsData,
        exportDate: new Date().toISOString(),
        version: "1.0",
      };

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });

      // Derive safe user segment at runtime (important for scheduled backups)
      const usernameSegment = await deriveSafeUserSegment();

      // New filename format: YYYYMMDD-HHMMSS-[auto/manual]-firstname-uid8.json
      const filename = `${
        isManual ? "Manual" : "Auto"
      }-${usernameSegment}.json`;

      // Upload to bucket
      const bucket = "Database Backup";
      const path = `website-backups/${filename}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, blob, { contentType: "application/json" } as any);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Update UI last backup info
      const uploadedAt = new Date().toISOString();
      setLastBackup({ name: filename, updated_at: uploadedAt });

      // Handle manual download if requested
      if (isManual) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        try {
          localStorage.setItem("ec_lastExport", uploadedAt);
        } catch {}
        setLastExport(uploadedAt);
      }

      toast({
        title: t.backupStored,
        description: filename,
        duration: 4000,
      });

      return { success: true, path, name: filename, uploadedAt };
    } catch (err: any) {
      console.error("Backup/upload failed:", err);
      toast({
        title: t.backupFailed,
        description: String(err?.message ?? err),
        variant: "destructive",
        duration: 5000,
      });
      return { success: false, error: err };
    }
  };

  // Handler wired to visible "Backup Now" button - uploads and also downloads a copy
  const handleBackupNow = async () => {
    await performBackupAndUpload(true);
  };

  // Schedule a backup at end of day (next midnight) and then daily thereafter
  const scheduleEndOfDayBackup = () => {
    try {
      // clear any existing timers
      if (backupTimersRef.current.timeoutId)
        window.clearTimeout(backupTimersRef.current.timeoutId);
      if (backupTimersRef.current.intervalId)
        window.clearInterval(backupTimersRef.current.intervalId);

      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0); // next midnight
      const msUntilMidnight = nextMidnight.getTime() - now.getTime();

      // set timeout to run once at midnight, then setInterval every 24h
      const timeoutId = window.setTimeout(async () => {
        await performBackupAndUpload(false); // automatic backup, no download
        // schedule daily interval
        const intervalId = window.setInterval(() => {
          performBackupAndUpload(false);
        }, 24 * 60 * 60 * 1000);
        backupTimersRef.current.intervalId = intervalId;
      }, msUntilMidnight);

      backupTimersRef.current.timeoutId = timeoutId;
    } catch (err) {
      console.error("Failed to schedule end-of-day backup:", err);
    }
  };

  // Extracted import application logic reused by local and cloud imports.
  const applyParsedData = async (parsed: any) => {
    // This is the same upsert logic used previously in handleImportData.
    // Normalize common backup shapes
    let borrowers: any[] = parsed.borrowers ?? parsed.data?.borrowers ?? [];
    let loans: any[] = parsed.loans ?? parsed.data?.loans ?? [];
    let payments: any[] = parsed.payments ?? parsed.data?.payments ?? [];

    // Convert map-like objects to arrays
    if (borrowers && !Array.isArray(borrowers) && typeof borrowers === "object")
      borrowers = Object.values(borrowers);
    if (loans && !Array.isArray(loans) && typeof loans === "object")
      loans = Object.values(loans);
    if (payments && !Array.isArray(payments) && typeof payments === "object")
      payments = Object.values(payments);

    const results = { borrowers: 0, loans: 0, payments: 0 };
    const errors: string[] = [];

    try {
      // Borrowers upsert
      const borrowerCols = new Set([
        "id",
        "name",
        "phone",
        "address",
        "nic_number",
        "first_name",
        "last_name",
        "title",
        "email",
      ]);
      const borrowersUpsert = (borrowers || [])
        .map((b: any) => {
          const out: any = {};
          for (const k of Object.keys(b || {})) {
            if (borrowerCols.has(k)) out[k] = b[k];
          }
          if (!out.id && b.id) out.id = b.id;
          return out;
        })
        .filter((r: any) => r && Object.keys(r).length > 0);

      if (borrowersUpsert.length > 0) {
        const { error: bErr } = await supabase
          .from("borrowers")
          .upsert(borrowersUpsert, { returning: "minimal" } as any);
        if (bErr) errors.push(`borrowers: ${bErr.message}`);
        else results.borrowers = borrowersUpsert.length;
      }

      // Loans upsert
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
        "user_id",
      ]);
      const loansUpsert = (loans || [])
        .map((l: any) => {
          const out: any = {};
          for (const k of Object.keys(l || {})) {
            if (loanCols.has(k)) out[k] = l[k];
          }
          if (!out.id && l.id) out.id = l.id;
          out.borrower_id =
            out.borrower_id ?? l.borrowerId ?? l.borrower_id ?? null;
          return out;
        })
        .filter((r: any) => r && Object.keys(r).length > 0);

      if (loansUpsert.length > 0) {
        const { error: lErr } = await supabase
          .from("loans")
          .upsert(loansUpsert, { returning: "minimal" } as any);
        if (lErr) errors.push(`loans: ${lErr.message}`);
        else results.loans = loansUpsert.length;
      }

      // Payments upsert
      const paymentCols = new Set([
        "id",
        "loan_id",
        "amount",
        "payment_date",
        "payment_method",
        "notes",
        "created_at",
        "payment_time",
        "user_id",
      ]);
      const paymentsUpsert = (payments || [])
        .map((p: any) => {
          const out: any = {};
          for (const k of Object.keys(p || {})) {
            if (paymentCols.has(k)) out[k] = p[k];
          }
          if (!out.id && p.id) out.id = p.id;
          out.loan_id = out.loan_id ?? p.loanId ?? p.loan_id ?? null;
          return out;
        })
        .filter((r: any) => r && Object.keys(r).length > 0);

      if (paymentsUpsert.length > 0) {
        const { error: pErr } = await supabase
          .from("payments")
          .upsert(paymentsUpsert, { returning: "minimal" } as any);
        if (pErr) errors.push(`payments: ${pErr.message}`);
        else results.payments = paymentsUpsert.length;
      }

      return { results, errors };
    } catch (err: any) {
      return {
        results: { borrowers: 0, loans: 0, payments: 0 },
        errors: [String(err?.message ?? err)],
      };
    }
  };

  // Local file import now delegates to applyParsedData
  const handleImportData = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? importInputRef.current?.files?.[0];
    if (!file) return;

    const clearInputs = () => {
      try {
        if (importInputRef.current) importInputRef.current.value = "";
      } catch {}
      try {
        event.target.value = "";
      } catch {}
    };

    setLocalImportStatus(t.statusLoading);
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
      setLocalImportStatus("Failed to read file");
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
        description: "File is not valid JSON.",
        variant: "destructive",
        duration: 4000,
      });
      setLocalImportStatus("Invalid JSON");
      clearInputs();
      return;
    }

    const { results, errors } = await applyParsedData(parsed);
    const totalImported = results.borrowers + results.loans + results.payments;

    if (totalImported > 0) {
      const now = new Date().toISOString();
      try {
        localStorage.setItem("ec_lastImport", now);
      } catch {}
      setLastImport(now);
      setLocalImportStatus(
        `Local Import: ${results.borrowers} borrowers, ${results.loans} loans, ${results.payments} payments`
      );
      toast({
        title: t.dataImported,
        description: `Local Import: ${results.borrowers} borrowers, ${results.loans} loans, ${results.payments} payments`,
        duration: 4000,
      });
    } else {
      setLocalImportStatus(
        errors.length ? `Local Import Error: ${errors[0]}` : "No data imported"
      );
      toast({
        title: "Import Failed",
        description: errors.length
          ? `Errors: ${errors[0]}`
          : "Failed to import data.",
        variant: "destructive",
        duration: 6000,
      });
    }

    clearInputs();
  };

  // Cloud listing & import (updated to use cloudLimit)
  // Handle importing from cloud storage
  const handleCloudImport = async (filename: string) => {
    setCloudImportStatus(t.statusLoading);
    try {
      const bucket = "Database Backup";
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(`website-backups/${filename}`);
      if (error || !data) throw error || new Error("Download failed");

      const text = await data.text();
      const parsed = JSON.parse(text);
      const { results, errors } = await applyParsedData(parsed);

      if (errors.length) throw new Error(errors[0]);

      const now = new Date().toISOString();
      try {
        localStorage.setItem("ec_lastImport", now);
      } catch {}
      setLastImport(now);

      const formattedTime = formatDateTime(now);
      const status = `Cloud Import: (${formattedTime}) -> Borrower: ${results.borrowers}, Loans: ${results.loans}, Payments: ${results.payments}`;

      setCloudImportStatus(status);
      // Persist cloud import status
      try {
        localStorage.setItem("ec_cloudImportStatus", status);
      } catch {}

      toast({
        title: t.dataImported,
        description: `Imported: (${formattedTime}) -> Borrowers: ${results.borrowers}, Loans: ${results.loans}, Payments: ${results.payments}`,
      });
    } catch (err) {
      console.error("Cloud import failed:", err);
      const failStatus = "Cloud Import failed";
      setCloudImportStatus(failStatus);
      // Persist failed status
      try {
        localStorage.setItem("ec_cloudImportStatus", failStatus);
      } catch {}
      toast({
        title: "Cloud Import Failed",
        description: String(err?.message ?? err),
        variant: "destructive",
      });
    }
  };

  // loadCloudBackups: by default only show backups matching the current user's sanitized name.
  // Pass showAll = true to bypass this client-side filter and show all backups.
  const loadCloudBackups = async (limit = cloudLimit, showAll = false) => {
    setCloudListLoading(true);
    try {
      const bucket = "Database Backup";
      const { data, error } = await supabase.storage
        .from(bucket)
        .list("website-backups", {
          limit,
          sortBy: { column: "created_at", order: "desc" },
        } as any);

      if (error) {
        console.error("Error listing backups:", error);
        setCloudBackups([]);
        return;
      }

      // derive sanitized name for current user (same logic as filename creation)
      const usernameSegment = await deriveSafeUserSegment();
      const firstNameOnly = usernameSegment.split("-")[0];

      let items = (data || []).map((it: any) => ({
        name: it.name,
        updated_at: it.updated_at || it.created_at,
      }));

      // If not showing all, filter out files that do not include the user's safe name segment
      if (!showAll && usernameSegment) {
        items = items.filter((it) => {
          const n = it.name.toLowerCase();
          return (
            n.includes(`-${usernameSegment}`) ||
            n.includes(`${usernameSegment}.json`) ||
            n.includes(`-${firstNameOnly}`)
          );
        });
      }

      setCloudBackups(items);
    } catch (err) {
      console.error("Error loading cloud backups:", err);
      setCloudBackups([]);
    } finally {
      setCloudListLoading(false);
    }
  };

  // NEW: delete a backup from cloud storage
  const handleCloudDelete = async (filename: string) => {
    if (
      !confirm(
        `Remove backup "${filename}" from list? (File will remain in storage)`
      )
    )
      return;
    try {
      // Remove from UI list but don't delete from storage
      setCloudBackups((prev) => prev.filter((b) => b.name !== filename));
      toast({
        title: "Removed from list",
        description: filename,
        duration: 3000,
      });
    } catch (err) {
      console.error("Remove from list failed:", err);
      toast({
        title: "Failed to remove from list",
        variant: "destructive",
      });
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
        password: passwordData.newPassword,
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
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error("Error changing password:", error);
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
      {/* Header section */}
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

      <div className="space-y-8">
        {/* Grid for User Profile + System Access and Session Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* User Profile Card */}
            <Card className="shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t.userProfile}
                </CardTitle>
                <CardDescription>{t.profileDesc}</CardDescription>
              </CardHeader>
              <CardContent>
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
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                            placeholder={t.newPassword}
                            className="mt-1 bg-gray-100 dark:bg-[#23272f] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">
                            {t.confirmPassword}
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
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
                          disabled={
                            !passwordData.newPassword ||
                            !passwordData.confirmPassword
                          }
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
                          onChange={(e) =>
                            setEditProfileData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter full name"
                          className="mt-1 bg-gray-100 dark:bg-[#23272f] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-email">{t.email}</Label>
                        <Input
                          id="edit-email"
                          value={editProfileData.email}
                          onChange={(e) =>
                            setEditProfileData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
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

            {/* System Access Card */}
            <Card className="shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  {t.systemAccess}
                </CardTitle>
                <CardDescription>{t.systemAccessDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#262b34] rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{t.totalUsers}</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {totalUsers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#262b34] rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{t.activeUsers}</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">1</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Current session: {authData?.user?.email || "Unknown"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Session Management */}
          <Card className="shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
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
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.userId}:
                        </span>
                        <span className="font-mono text-xs">
                          {authData.user.id.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.email}:
                        </span>
                        <span>{authData.user.email}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.userRole}:
                        </span>
                        <span className="capitalize">{authData.role}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Provider:
                        </span>
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
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.loginTime}:
                        </span>
                        <span>{authData.loginTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.lastActive}:
                        </span>
                        <span>{authData.lastActive}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Status:
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          Active
                        </span>
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
                  {showSessionDetails
                    ? t.hideSessionDetails
                    : t.showSessionDetails}
                </Button>
                {/* Detailed Session Information */}
                {showSessionDetails && authData && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-[#262b34] rounded-lg">
                    <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                      {t.sessionDetails}
                    </h4>
                    <div className="space-y-2 text-xs font-mono">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Session ID:
                        </span>
                        <br />
                        <span className="break-all">
                          {authData.session.access_token.slice(0, 50)}...
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          User Metadata:
                        </span>
                        <br />
                        <pre className="text-xs bg-gray-100 dark:bg-[#23272f] p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(authData.user.user_metadata, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          App Metadata:
                        </span>
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
        </div>

        {/* Data Management Card - Full Width */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              {t.dataManagement}
            </CardTitle>
            <CardDescription>{t.dataDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Export / Backup Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium mb-1">{t.backupNow}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t.exportDesc}
                  </p>
                  <div>
                    <div>
                      <Button
                        onClick={async () => {
                          setBackupNowStatus(t.statusLoading);
                          const res = await performBackupAndUpload(true);
                          if (res?.success) {
                            setBackupNowStatus(null);
                          } else {
                            setBackupNowStatus("Failed");
                          }
                        }}
                        variant="outline"
                        className="w-full flex items-center gap-2 bg-gray-100 dark:bg-[#23272f] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 transition-transform transform hover:scale-105 hover:bg-blue-600 hover:text-white"
                      >
                        <DatabaseBackup className="w-4 h-4" />
                        {t.backupNow}
                      </Button>
                      <div className="text-xs text-gray-500 mt-2">
                        {backupNowStatus ??
                          (lastBackup
                            ? `Last backup: ${formatDateTime(
                                lastBackup.updated_at ?? null
                              )}`
                            : t.statusIdle)}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">{t.importData}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t.importDesc}
                  </p>
                  <div>
                    <input
                      ref={importInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                      id="import-file"
                    />
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2 bg-gray-100 dark:bg-[#23272f] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 transition-transform transform hover:scale-105 hover:bg-green-600 hover:text-white"
                      type="button"
                      onClick={() => importInputRef.current?.click()}
                    >
                      <LucideImport className="w-4 h-4" />
                      {t.localImport}
                    </Button>
                    <div className="text-xs text-gray-500 mt-2">
                      {localImportStatus ??
                        (lastImport
                          ? `Last Local import: ${formatDateTime(lastImport)}`
                          : t.statusIdle)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cloud Backups Section */}
              <div>
                <h3 className="font-medium mb-1">{t.cloudBackupsLabel}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Access backups stored in the cloud and import selected
                  backups.
                </p>
                <div className="flex gap-8">
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2 bg-gray-100 dark:bg-[#23272f] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 transition-transform transform hover:scale-105 hover:bg-blue-600 hover:text-white"
                    onClick={async () => {
                      const next = !showCloudBackups;
                      setShowCloudBackups(next);
                      if (next) await loadCloudBackups();
                    }}
                  >
                    <CloudUpload className="w-4 h-4" />
                    {t.cloudBackupsLabel}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => loadCloudBackups()}
                    className="w-24 flex items-center gap-2 bg-gray-100 dark:bg-[#23272f] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 transition-transform transform hover:scale-105 hover:bg-gray-600 hover:text-white"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    {t.refreshList}
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {cloudImportStatus ?? t.statusIdle}
                </div>

                {/* Dropdown/list of backups */}
                {showCloudBackups && (
                  <div className="mt-3">
                    {cloudListLoading ? (
                      <div className="text-sm">{t.statusLoading}</div>
                    ) : cloudBackups.length === 0 ? (
                      <div className="text-sm">No backups found</div>
                    ) : (
                      <>
                        {/* Recent backups (first 5) with numbers */}
                        <div className="mb-4 bg-gray-50 dark:bg-[#262b34] p-3 rounded">
                          <h4 className="font-medium text-sm mb-2 text-blue-800 dark:text-blue-400">
                            Recent Backups
                          </h4>
                          <ol className="list-decimal list-inside space-y-2">
                            {cloudBackups.slice(0, 5).map((b, index) => (
                              <li
                                key={b.name}
                                className="flex justify-between items-center py-1"
                              >
                                <div className="text-sm break-words">
                                  <span className="font-medium text-xs">
                                    {index + 1}. {b.name}
                                  </span>
                                  <div className="text-xs text-gray-500 ml-3">
                                    {formatDateTime(b.updated_at ?? null)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCloudImport(b.name)}
                                    className="p-2 rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-800 transition-colors"
                                    title="Import from cloud"
                                  >
                                    <CloudDownload className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        const bucket = "Database Backup";
                                        const { data, error } =
                                          await supabase.storage
                                            .from(bucket)
                                            .download(
                                              `website-backups/${b.name}`
                                            );
                                        if (error || !data)
                                          throw (
                                            error ||
                                            new Error("Download failed")
                                          );
                                        const url = URL.createObjectURL(
                                          await data
                                            .arrayBuffer()
                                            .then((buf) => new Blob([buf]))
                                        );
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = b.name;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                      } catch (err) {
                                        console.error(
                                          "Download cloud file failed:",
                                          err
                                        );
                                        toast({
                                          title: "Download failed",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                    className="p-2 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-800 transition-colors"
                                    title="Download backup"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCloudDelete(b.name)}
                                    className="p-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-800 transition-colors"
                                    title="Delete backup"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Older backups in collapsible section (open by default, no internal scroller) */}
                        {cloudBackups.length > 5 && (
                          <details className="bg-gray-50 dark:bg-[#262b34] p-3 rounded">
                            <summary className="cursor-pointer list-none font-medium text-sm mb-2 text-red-800 dark:text-red-400 [&::-webkit-details-marker]:hidden flex justify-between items-center">
                              <span>
                                Older Backups ({cloudBackups.length - 5})
                              </span>
                              <span className="text-xs text-gray-500">
                                Expand / Collapse
                              </span>
                            </summary>

                            <ol
                              className="list-decimal list-inside space-y-2 mt-2"
                              start={6}
                            >
                              {cloudBackups.slice(5).map((b, index) => (
                                <li
                                  key={b.name}
                                  className="flex justify-between items-center py-1"
                                >
                                  <div className="text-sm break-words">
                                    <span className="font-medium text-xs">
                                      {index + 6}. {b.name}
                                    </span>
                                    <div className="text-xs text-gray-500 ml-3">
                                      {formatDateTime(b.updated_at ?? null)}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCloudImport(b.name)}
                                      className="p-2 rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-800 transition-colors"
                                      title="Import from cloud"
                                    >
                                      <CloudDownload className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={async () => {
                                        try {
                                          const bucket = "Database Backup";
                                          const { data, error } =
                                            await supabase.storage
                                              .from(bucket)
                                              .download(
                                                `website-backups/${b.name}`
                                              );
                                          if (error || !data)
                                            throw (
                                              error ||
                                              new Error("Download failed")
                                            );
                                          const url = URL.createObjectURL(
                                            await data
                                              .arrayBuffer()
                                              .then((buf) => new Blob([buf]))
                                          );
                                          const a = document.createElement("a");
                                          a.href = url;
                                          a.download = b.name;
                                          document.body.appendChild(a);
                                          a.click();
                                          document.body.removeChild(a);
                                          URL.revokeObjectURL(url);
                                        } catch (err) {
                                          console.error(
                                            "Download cloud file failed:",
                                            err
                                          );
                                          toast({
                                            title: "Download failed",
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                      className="p-2 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-800 transition-colors"
                                      title="Download backup"
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCloudDelete(b.name)}
                                      className="p-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-800 transition-colors"
                                      title="Delete backup"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </li>
                              ))}
                            </ol>
                          </details>
                        )}
                      </>
                    )}

                    {/* Load more button - keep existing code */}
                    {cloudBackups.length >= cloudLimit && (
                      <div className="mt-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const next = cloudLimit + 20;
                            setCloudLimit(next);
                            await loadCloudBackups(next);
                          }}
                          className="px-3 py-1"
                        >
                          Load more
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
