import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Edit, CheckCircle, Loader2 } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onEdit: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  isSubmitting,
  onOpenChange,
  onConfirm,
  onEdit
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Property Details</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure the property details are correct? Clicking continue will generate your full property report based on this information.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </AlertDialogCancel>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onEdit();
            }}
            disabled={isSubmitting}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" /> Edit Data
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" /> Continue
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
