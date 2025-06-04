
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  language: string;
}

const DeleteConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  itemName,
  language 
}: DeleteConfirmationDialogProps) => {
  const translations = {
    en: {
      confirmDelete: 'Confirm Delete',
      cancel: 'Cancel',
      delete: 'Delete',
      warning: 'This action cannot be undone.'
    },
    ta: {
      confirmDelete: 'நீக்குதலை உறுதிப்படுத்தவும்',
      cancel: 'ரத்து செய்யவும்',
      delete: 'நீக்கவும்',
      warning: 'இந்த செயல் மீண்டும் செய்ய முடியாது.'
    }
  };

  const t = translations[language as keyof typeof translations];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            {t.confirmDelete}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            {message}
          </p>
          {itemName && (
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              "{itemName}"
            </p>
          )}
          <p className="text-sm text-red-600 mt-3">
            {t.warning}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {t.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
