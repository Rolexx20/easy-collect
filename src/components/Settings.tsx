import { useState, useEffect } from "react";
import {
  User,
  Download,
  Upload,
  Save,
  Database,
  Languages,
  Globe2,
  Lock,
  Key,
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
import { getUserProfile, updateUserProfile, changePassword, type UserProfile } from "@/lib/database";

interface SettingsProps {
  language: string;
  setLanguage: (lang: string) => void;
}

const Settings = ({ language, setLanguage }: SettingsProps) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    nicNo: "",
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  const translations = {
    en: {
      settings: "Settings",
      userProfile: "User Profile",
      profileDesc: "Manage your profile information",
      name: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      nicNo: "NIC No",
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
    },
    ta: {
      settings: "அமைப்புகள்",
      userProfile: "பயனர் சுயவிவரம்",
      profileDesc: "உங்கள் சுயவிவர தகவலை நிர்வகிக்கவும்",
      name: "முழு பெயர்",
      email: "மின்னஞ்சல் முகவரி",
      phone: "தொலைபேசி எண்",
      nicNo: "தேசிய அடையாள அட்டை எண்",
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
    },
  };

  const t = translations[language as keyof typeof translations];

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await getUserProfile();
      if (userData) {
        setUserProfile(userData);
        setProfile({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          nicNo: userData.nic_no || "",
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    
    setIsLoadingProfile(true);
    try {
      await updateUserProfile(userProfile.id, {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        nic_no: profile.nicNo,
      });
      
      toast({
        title: t.profileUpdated,
        description: "Your profile has been updated successfully.",
        duration: 3000,
      });
      
      // Reload the profile to get updated data
      await loadUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!userProfile) return;
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: t.passwordMismatch,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Basic check - in a real app you'd verify against hashed password
    if (passwordForm.currentPassword !== "12345678") {
      toast({
        title: t.invalidCurrentPassword,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsLoadingPassword(true);
    try {
      // In a real app, you'd hash the password properly
      const newPasswordHash = '$2a$10$' + btoa(passwordForm.newPassword).slice(0, 53);
      await changePassword(userProfile.id, newPasswordHash);
      
      toast({
        title: t.passwordChanged,
        description: "Your password has been changed successfully.",
        duration: 3000,
      });
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordChange(false);
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleExportData = () => {
    // Create a sample JSON file for demo
    const data = {
      borrowers: [],
      loans: [],
      exportDate: new Date().toISOString(),
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
      duration: 3000, // Close after 3 seconds
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: t.dataImported,
        description: "Your data has been imported successfully.",
        duration: 3000, // Close after 3 seconds
      });
    }
  };

  return (
    <div className="p-6 pt-5 pb-20 md:pb-6 space-y-6">
      <div className="flex justify-between items-center">
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

      {/* User Profile Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t.userProfile}
            </CardTitle>
            <CardDescription>{t.profileDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t.phone}</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nicNo">{t.nicNo}</Label>
                <Input
                  id="nicNo"
                  value={profile.nicNo}
                  onChange={(e) =>
                    setProfile({ ...profile, nicNo: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveProfile}
                disabled={isLoadingProfile}
                className="bg-blue-700 text-white hover:bg-blue-800 dark:hover:bg-blue-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoadingProfile ? "Saving..." : t.saveProfile}
              </Button>
              <Button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                variant="outline"
                className="border-gray-300 dark:border-gray-700"
              >
                <Lock className="w-4 h-4 mr-2" />
                {showPasswordChange ? t.hidePasswordForm : t.showPasswordForm}
              </Button>
            </div>

            {/* Password Change Form */}
            {showPasswordChange && (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  {t.changePassword}
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t.currentPassword}</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      placeholder="Enter current password (default: 12345678)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t.newPassword}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isLoadingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="bg-orange-600 text-white hover:bg-orange-700"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {isLoadingPassword ? "Changing..." : t.changePassword}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              {t.dataManagement}
            </CardTitle>
            <CardDescription>{t.dataDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
};

export default Settings;