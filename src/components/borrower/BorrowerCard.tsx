import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Edit,
  Trash2,
  Phone,
  MapPin,
  User,
  CircleAlert,
  CreditCard,
  History,
  Undo2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Borrower {
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
  remaining_amount?: number;
  created_at?: string;
}

interface BorrowerCardProps {
  borrower: Borrower;
  onEdit: (borrower: Borrower) => void;
  onDelete: (borrower: Borrower) => void;
  onViewPaymentHistory?: (borrower: Borrower) => void;
  onReversePayment?: (borrower: Borrower) => void;
  isLoading: boolean;
  language: string;
}

const BorrowerCard = ({
  borrower,
  onEdit,
  onDelete,
  onViewPaymentHistory,
  onReversePayment,
  isLoading,
  language,
}: BorrowerCardProps) => {
  const translations = {
    en: {
      edit: "Edit",
      delete: "Delete",
      totalLoans: "Loans Amount",
      pendingPayment: "Pending Payment",
      deleteWarning: "Cannot undo. Settle loans to delete.",
      paymentHistory: "Payment History",
      reversePayment: "Reverse Payment",
      paymentProgress: "Payment Progress",
    },
    ta: {
      edit: "திருத்து",
      delete: "நீக்கு",
      totalLoans: "மொத்த கடன்கள்",
      pendingPayment: "நிலுவையில் உள்ள பணம்",
      deleteWarning:
        "செயல்தவிர்க்க முடியாது. நீக்க வேண்டிய கடன்களைத் தீர்க்கவும்.",
      paymentHistory: "பணம் செலுத்தல் வரலாறு",
      reversePayment: "பணம் செலுத்தல் திரும்பப் பெறுதல்",
      paymentProgress: "பணம் செலுத்தல் முன்னேற்றம்",
    },
  };

  const t = translations[language as keyof typeof translations];

  const formatDisplayName = (borrower: Borrower) => {
    if (borrower.title && borrower.first_name && borrower.last_name) {
      return `${borrower.title} ${borrower.first_name.charAt(0)}. ${
        borrower.last_name
      }`;
    }
    return borrower.name;
  };

  const hasPendingLoans = (borrower: Borrower) => {
    return (borrower.active_loans ?? 0) > 0;
  };

  return (
    <Card className="transition-all border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-xl bg-gradient-to-br from-blue-100 via-gray-50 to-red-100 dark:from-blue-950 dark:via-gray-800 dark:to-red-200/20 group">
      <CardHeader className="pb-2 pt-2 border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/60 to-transparent dark:from-blue-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 group-hover:scale-105 transition-transform">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </span>
            <span
              className="truncate text-lg font-bold text-gray-800 dark:text-gray-100 cursor-pointer"
              title={formatDisplayName(borrower)}
            >
              {formatDisplayName(borrower).length > 15
                ? `${formatDisplayName(borrower).slice(0, 15)}...`
                : formatDisplayName(borrower)}
            </span>
          </div>
            <div className="flex gap-2 ml-2">
            <span className="border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 flex items-center h-8 w-8 justify-center transition-colors duration-150 hover:border-blue-400 dark:hover:border-blue-400">
              <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(borrower)}
              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded h-8 w-8"
              disabled={isLoading}
              aria-label={t.edit}
              >
              <Edit className="w-4 h-4 text-blue-600 dark:text-blue-300" />
              </Button>
            </span>
            <TooltipProvider>
              <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                  if (hasPendingLoans(borrower)) {
                    toast({
                    title:
                      language === "ta"
                      ? t.deleteWarning
                      : t.deleteWarning,
                    variant: "destructive",
                    });
                  } else {
                    onDelete(borrower);
                  }
                  }}
                  className={`p-0.5 hover:bg-red-100 dark:hover:bg-red-900 rounded h-8 w-8 ${
                  hasPendingLoans(borrower)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                  }`}
                  disabled={isLoading}
                  style={{ minWidth: 0 }}
                  aria-label={t.delete}
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </Button>
                </span>
              </TooltipTrigger>
              {hasPendingLoans(borrower) && (
                <TooltipContent className="bg-red-700 text-white flex items-center gap-1">
                <CircleAlert className="w-4 h-4" />
                <span className="text-xs">{t.deleteWarning}</span>
                </TooltipContent>
              )}
              </Tooltip>
            </TooltipProvider>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-3">
        <div className="flex flex-col gap-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-500" />
            <span className="truncate">{borrower.nic_number}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-500" />
            <span className="truncate">{borrower.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="truncate">{borrower.address}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-0">
          <div className="flex flex-col items-center flex-1 bg-purple-50 dark:bg-purple-950/30 rounded-lg py-2">
            <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
              ₹{(borrower.total_amount || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">{t.totalLoans}</div>
          </div>
          <div className="flex flex-col items-center flex-1 bg-red-50 dark:bg-red-950/30 rounded-lg py-2">
            <div className="text-lg font-bold text-red-700 dark:text-red-300">
              ₹{(borrower.remaining_amount || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">{t.pendingPayment}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BorrowerCard;
