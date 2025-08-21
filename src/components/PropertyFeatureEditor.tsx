
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from 'lucide-react';

interface PropertyFeatureEditorProps {
  formData: Record<string, any>;
  onSave: (data: Record<string, any>) => void;
  onCancel: () => void;
}

export interface PropertyFeatureEditorRef {
  triggerSave: () => void;
}

const PropertyFeatureEditor = forwardRef<PropertyFeatureEditorRef, PropertyFeatureEditorProps>(({
  formData,
  onSave,
  onCancel
}, ref) => {
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  useEffect(() => {
    console.log('🔧 PropertyFeatureEditor mounted with formData:', formData);
    
    // Filter out system fields that shouldn't be editable
    const filteredData = Object.entries(formData).reduce((acc, [key, value]) => {
      const systemFields = ['userType', 'imageUrls', 'userData'];
      if (!systemFields.includes(key)) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
    
    setEditedData(filteredData);
  }, [formData]);

  useImperativeHandle(ref, () => ({
    triggerSave: () => {
      handleSave();
    }
  }));

  const handleFieldChange = (key: string, value: string) => {
    console.log('🔧 Field changed:', key, '=', value);
    setEditedData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddField = () => {
    if (newFieldName.trim() && newFieldValue.trim()) {
      console.log('➕ Adding new field:', newFieldName, '=', newFieldValue);
      setEditedData(prev => ({
        ...prev,
        [newFieldName.trim()]: newFieldValue.trim()
      }));
      setNewFieldName('');
      setNewFieldValue('');
    }
  };

  const handleRemoveField = (key: string) => {
    console.log('➖ Removing field:', key);
    setEditedData(prev => {
      const newData = { ...prev };
      delete newData[key];
      return newData;
    });
  };

  const handleSave = () => {
    // Merge the edited data with the original system fields that shouldn't be editable
    const systemFields = {
      userType: formData.userType,
      imageUrls: formData.imageUrls,
      userData: formData.userData
    };
    
    const finalData = {
      ...editedData,
      ...systemFields
    };
    
    console.log('💾 PropertyFeatureEditor - Saving data:', finalData);
    onSave(finalData);
  };

  const renderFieldValue = (key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value || '');
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary mb-4">Edit Property Features</h3>
          
          {/* Existing fields */}
          <div className="space-y-3">
            {Object.entries(editedData).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <div className="flex-1">
                  <Label htmlFor={key} className="text-sm font-medium">
                    {key}
                  </Label>
                  <Input
                    id={key}
                    value={renderFieldValue(key, value)}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveField(key)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add new field section */}
          <div className="border-t pt-4 mt-6">
            <h4 className="text-sm font-medium mb-3">Add New Feature</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Feature name"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Feature value"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleAddField}
                variant="outline"
                size="sm"
                disabled={!newFieldName.trim() || !newFieldValue.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action buttons at bottom for cancel only */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PropertyFeatureEditor.displayName = 'PropertyFeatureEditor';

export default PropertyFeatureEditor;
