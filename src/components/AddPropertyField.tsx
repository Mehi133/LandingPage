
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddPropertyFieldProps {
  newField: {
    key: string;
    value: string;
  };
  setNewField: (field: { key: string; value: string }) => void;
  onAddNewField: () => void;
}

const AddPropertyField: React.FC<AddPropertyFieldProps> = ({ newField, setNewField, onAddNewField }) => {
  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="font-medium mb-2">Add New Field</h4>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label htmlFor="newFieldKey">Field Name</Label>
          <Input
            id="newFieldKey"
            value={newField.key}
            onChange={(e) => setNewField({ ...newField, key: e.target.value })}
            placeholder="e.g., garageSize"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="newFieldValue">Value</Label>
          <Input
            id="newFieldValue"
            value={newField.value}
            onChange={(e) => setNewField({ ...newField, value: e.target.value })}
            placeholder="e.g., 2 cars"
            className="mt-1"
          />
        </div>
        <div className="flex items-end">
          <Button
            onClick={onAddNewField}
            className="w-full mt-1 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Field
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyField;
