
import { useState } from 'react';
import { User, Download, Upload, Save, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface SettingsProps {
  language: string;
}

const Settings = ({ language }: SettingsProps) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@easycollect.com',
    phone: '+91 9876543210',
    company: 'EasyCollect Finance'
  });

  const translations = {
    en: {
      settings: 'Settings',
      userProfile: 'User Profile',
      profileDesc: 'Manage your profile information',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      company: 'Company Name',
      saveProfile: 'Save Profile',
      dataManagement: 'Data Management',
      dataDesc: 'Backup and restore your data',
      exportData: 'Export Data',
      importData: 'Import Data',
      exportDesc: 'Download all your data as backup',
      importDesc: 'Restore data from backup file',
      profileUpdated: 'Profile updated successfully',
      dataExported: 'Data exported successfully',
      dataImported: 'Data imported successfully'
    },
    ta: {
      settings: 'அமைப்புகள்',
      userProfile: 'பயனர் சுயவிவரம்',
      profileDesc: 'உங்கள் சுயவிவர தகவலை நிர்வகிக்கவும்',
      name: 'முழு பெயர்',
      email: 'மின்னஞ்சல் முகவரி',
      phone: 'தொலைபேசி எண்',
      company: 'நிறுவன பெயர்',
      saveProfile: 'சுயவிவரத்தை சேமிக்கவும்',
      dataManagement: 'தரவு மேலாண்மை',
      dataDesc: 'உங்கள் தரவை காப்புப்படுத்தி மீட்டமைக்கவும்',
      exportData: 'தரவை ஏற்றுமதி செய்யவும்',
      importData: 'தரவை இறக்குமதி செய்யவும்',
      exportDesc: 'உங்கள் எல்லா தரவையும் காப்புப்படுத்தல் என பதிவிறக்கம் செய்யவும்',
      importDesc: 'காப்புப்படுத்தல் கோப்பிலிருந்து தரவை மீட்டமைக்கவும்',
      profileUpdated: 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
      dataExported: 'தரவு வெற்றிகரமாக ஏற்றுமதி செய்யப்பட்டது',
      dataImported: 'தரவு வெற்றிகரமாக இறக்குமதி செய்யப்பட்டது'
    }
  };

  const t = translations[language as keyof typeof translations];

  const handleSaveProfile = () => {
    toast({
      title: t.profileUpdated,
      description: "Your profile has been updated successfully.",
    });
  };

  const handleExportData = () => {
    // Create a sample JSON file for demo
    const data = {
      borrowers: [],
      loans: [],
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `easycollect-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: t.dataExported,
      description: "Your data has been exported successfully.",
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: t.dataImported,
        description: "Your data has been imported successfully.",
      });
    }
  };

  return (
    <div className="p-6 pt-5 pb-20 md:pb-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.settings}</h1>
      </div>

      {/* User Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t.userProfile}
          </CardTitle>
          <CardDescription>
            {t.profileDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">{t.company}</Label>
              <Input
                id="company"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {t.saveProfile}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Data Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            {t.dataManagement}
          </CardTitle>
          <CardDescription>
            {t.dataDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">{t.exportData}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.exportDesc}
              </p>
              <Button onClick={handleExportData} variant="outline" className="w-full">
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
                  onClick={() => document.getElementById('import-file')?.click()}
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
  );
};

export default Settings;
