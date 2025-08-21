
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Save, CheckCircle } from 'lucide-react';

interface ActionButtonsProps {
  isEditing: boolean;
  isSubmitting: boolean;
  onEdit: () => void;
  onConfirm: () => void;
  onSave?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isEditing,
  isSubmitting,
  onEdit,
  onConfirm,
  onSave
}) => {
  return (
    <div className="flex justify-end gap-2 mb-4">
      {isEditing ? (
        <Button
          onClick={onSave}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <Save className="h-3 w-3" /> Save Changes
        </Button>
      ) : (
        <>
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Edit className="h-3 w-3" /> Edit Data
          </Button>
          
          <Button
            onClick={onConfirm}
            variant="default"
            size="sm"
            className="flex items-center gap-1"
            disabled={isSubmitting}
          >
            <CheckCircle className="h-3 w-3" /> Continue to Full Report
          </Button>
        </>
      )}
    </div>
  );
};

export default ActionButtons;
