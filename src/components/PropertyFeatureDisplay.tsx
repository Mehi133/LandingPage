
import React from 'react';

interface PropertyFeatureDisplayProps {
  displayData?: Record<string, any>;
  features?: { [key: string]: any };
  title?: string;
}

const PropertyFeatureDisplay: React.FC<PropertyFeatureDisplayProps> = ({ 
  displayData, 
  features, 
  title = "Property Features" 
}) => {
  console.log('🔄 [DISPLAY] PropertyFeatureDisplay received data:', { displayData, features, title });
  
  // Use displayData if provided, otherwise fall back to features
  const dataToDisplay = displayData || features || {};
  
  if (!dataToDisplay || Object.keys(dataToDisplay).length === 0) {
    console.log('⚠️ [DISPLAY] No data to display');
    return (
      <div className="text-center py-4 text-muted-foreground">
        No {title.toLowerCase()} available
      </div>
    );
  }

  // List of specific fields that should be split when they contain comma-separated non-numeric text
  const SPLITTABLE_FIELDS = [
    'heating',
    'listing terms',
    'parking features', 
    'property sub type',
    'construction materials'
  ];

  // Parse "At A Glance Facts" section to extract individual Fact Label/Fact Value pairs as separate fields
  const parseAtAGlanceFacts = (value: string): Record<string, string> => {
    console.log('🔍 [PARSE] parseAtAGlanceFacts input:', value);
    
    if (!value || typeof value !== 'string') {
      console.log('❌ [PARSE] Invalid input for At A Glance Facts');
      return {};
    }
    
    const extractedFields: Record<string, string> = {};
    
    // Split by "Fact Label:" to get individual facts
    const factSections = value.split('Fact Label:').filter(section => section.trim());
    console.log('🔍 [PARSE] Fact sections found:', factSections);
    
    factSections.forEach((section, index) => {
      console.log(`🔍 [PARSE] Processing section ${index}:`, section);
      
      // Find "Fact Value:" in this section
      const factValueIndex = section.indexOf('Fact Value:');
      
      if (factValueIndex >= 0) {
        // Extract label (everything before "Fact Value:")
        const label = section.substring(0, factValueIndex).trim().replace(/,\s*$/, '');
        
        // Extract value (everything after "Fact Value:")
        let factValue = section.substring(factValueIndex + 'Fact Value:'.length).trim();
        
        // Remove trailing comma and any text after the next "Fact Label:" if it exists
        const nextFactIndex = factValue.indexOf(', Fact Label:');
        if (nextFactIndex >= 0) {
          factValue = factValue.substring(0, nextFactIndex);
        }
        
        factValue = factValue.replace(/,\s*$/, '').trim();
        
        console.log(`✅ [PARSE] Extracted: "${label}" = "${factValue}"`);
        
        if (label) {
          extractedFields[label] = factValue || '';
        }
      } else {
        console.log(`⚠️ [PARSE] No "Fact Value:" found in section: ${section}`);
      }
    });
    
    console.log('✅ [PARSE] Final extracted fields:', extractedFields);
    return extractedFields;
  };

  // Parse rooms section to extract individual Room Label/Level pairs as separate fields
  const parseRooms = (value: string): Record<string, string> => {
    console.log('🔍 [PARSE] parseRooms input:', value);
    
    if (!value || typeof value !== 'string') {
      console.log('❌ [PARSE] Invalid input for Rooms');
      return {};
    }
    
    const extractedFields: Record<string, string> = {};
    
    // Split by "Room Label:" to get individual rooms
    const roomSections = value.split('Room Label:').filter(section => section.trim());
    console.log('🔍 [PARSE] Room sections found:', roomSections);
    
    roomSections.forEach((section, index) => {
      console.log(`🔍 [PARSE] Processing room section ${index}:`, section);
      
      const levelIndex = section.indexOf('Level:');
      
      if (levelIndex >= 0) {
        // Extract room label (everything before "Level:")
        const roomLabel = section.substring(0, levelIndex).trim().replace(/,\s*$/, '');
        
        // Extract level (everything after "Level:")
        let level = section.substring(levelIndex + 'Level:'.length).trim();
        
        // Remove trailing comma and any text after the next "Room Label:" if it exists
        const nextRoomIndex = level.indexOf(', Room Label:');
        if (nextRoomIndex >= 0) {
          level = level.substring(0, nextRoomIndex);
        }
        
        level = level.replace(/,\s*$/, '').trim();
        
        console.log(`✅ [PARSE] Extracted room: "${roomLabel}" = "${level}"`);
        
        if (roomLabel) {
          extractedFields[roomLabel] = level || '';
        }
      } else {
        console.log(`⚠️ [PARSE] No "Level:" found in room section: ${section}`);
      }
    });
    
    console.log('✅ [PARSE] Final extracted room fields:', extractedFields);
    return extractedFields;
  };

  // Check if a value should be split (only for specific fields and non-numeric text)
  const shouldSplitValue = (key: string, value: any): boolean => {
    if (typeof value !== 'string') return false;
    
    // Only apply to specific fields
    const normalizedKey = key.toLowerCase().replace(/_/g, ' ');
    if (!SPLITTABLE_FIELDS.includes(normalizedKey)) return false;
    
    // Don't split if it looks like a number, price, or date
    if (value.match(/^\$/) || // Starts with $
        value.match(/^\d+$/) || // Just numbers
        value.match(/^\d{1,3}(,\d{3})*$/) || // Numbers with commas
        value.match(/\d+\s+(sqft|acres|sq ft)/i) || // Numbers with units
        value.match(/\d{1,2}\/\d{1,2}\/\d{4}/) || // Dates
        value.match(/^\d+\s+(monthly|yearly|daily)/i)) { // Numbers with time units
      return false;
    }
    
    // Must have commas to split
    return value.includes(',');
  };

  // Split comma-separated values
  const splitCommaSeparatedValues = (value: string): string[] => {
    return value.split(',').map(v => v.trim()).filter(Boolean);
  };

  const renderFeatureValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      return value.join(', ');
    }
    // Prevent [Object object] display
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const formatFeatureKey = (key: string): string => {
    // Handle the underscore-separated keys from the transformer
    const cleaned = key
      .replace(/_\d+$/, '') // Remove trailing numbers like _1, _2
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim();
    
    console.log('🔄 [DISPLAY] Formatted key:', key, '->', cleaned);
    return cleaned;
  };

  // Check if a key is a section header
  const isSectionHeader = (key: string): boolean => {
    const isHeader = key.startsWith('===') && key.endsWith('===');
    console.log('🔍 [DISPLAY] Checking if section header:', key, '->', isHeader);
    return isHeader;
  };

  // Extract section name from header
  const extractSectionName = (headerKey: string): string => {
    const sectionName = headerKey.replace(/^===\s*/, '').replace(/\s*===$/, '').trim();
    console.log('🔄 [DISPLAY] Extracted section name:', headerKey, '->', sectionName);
    return sectionName;
  };

  const allEntries = Object.entries(dataToDisplay);
  console.log('🔍 [DISPLAY] All entries:', allEntries);

  // Process entries and expand At A Glance Facts and Rooms into individual fields
  const processedEntries: Array<[string, any]> = [];
  
  allEntries.forEach(([key, value]) => {
    console.log(`🔍 [DISPLAY] Processing entry: "${key}" = "${value}"`);
    
    // Skip backend-only fields
    const backendFields = ['userType', 'imageUrls', 'userData'];
    if (backendFields.includes(key)) {
      console.log(`⏭️ [DISPLAY] Skipping backend field: ${key}`);
      return;
    }
    
    // Skip empty arrays
    if (Array.isArray(value) && value.length === 0) {
      console.log(`⏭️ [DISPLAY] Skipping empty array: ${key}`);
      return;
    }
    
    // Skip null/undefined values
    if (value === null || value === undefined || value === '') {
      console.log(`⏭️ [DISPLAY] Skipping empty value: ${key}`);
      return;
    }
    
    // Handle At A Glance Facts - extract individual fields and skip the container
    if (key.toLowerCase().includes('at a glance facts') || key.toLowerCase().includes('at a glance')) {
      console.log('🔍 [DISPLAY] Processing At A Glance Facts:', value);
      const extractedFields = parseAtAGlanceFacts(value);
      console.log('🔍 [DISPLAY] Extracted At A Glance fields:', extractedFields);
      Object.entries(extractedFields).forEach(([factLabel, factValue]) => {
        console.log(`✅ [DISPLAY] Adding fact field: "${factLabel}" = "${factValue}"`);
        processedEntries.push([factLabel, factValue]);
      });
      return; // Skip the original "At A Glance Facts" entry
    }
    
    // Handle Rooms - extract individual fields and skip the container
    if (key.toLowerCase().includes('rooms') && typeof value === 'string' && value.includes('Room Label:')) {
      console.log('🔍 [DISPLAY] Processing Rooms:', value);
      const extractedFields = parseRooms(value);
      console.log('🔍 [DISPLAY] Extracted Room fields:', extractedFields);
      Object.entries(extractedFields).forEach(([roomLabel, level]) => {
        console.log(`✅ [DISPLAY] Adding room field: "${roomLabel}" = "${level}"`);
        processedEntries.push([roomLabel, level]);
      });
      return; // Skip the original "Rooms" entry
    }
    
    // Add regular entries
    console.log(`✅ [DISPLAY] Adding regular field: "${key}" = "${value}"`);
    processedEntries.push([key, value]);
  });

  console.log('🔍 [DISPLAY] Final processed entries:', processedEntries);

  // Group features under their section headers
  const organizedSections: Array<{
    sectionName?: string;
    items: Array<{ key: string; value: any; isMultiValue: boolean; }>
  }> = [];

  let currentSection: { sectionName?: string; items: Array<{ key: string; value: any; isMultiValue: boolean; }> } = { items: [] };

  processedEntries.forEach(([key, value]) => {
    if (isSectionHeader(key)) {
      // If we have items in current section, push it
      if (currentSection.items.length > 0) {
        organizedSections.push(currentSection);
      }
      // Start a new section
      currentSection = {
        sectionName: extractSectionName(key),
        items: []
      };
      console.log('✅ [DISPLAY] Started new section:', extractSectionName(key));
    } else {
      const isMultiValue = shouldSplitValue(key, value);
      currentSection.items.push({ key, value, isMultiValue });
      console.log('✅ [DISPLAY] Added item to current section:', key, '=', value, 'isMultiValue:', isMultiValue);
    }
  });

  // Don't forget the last section
  if (currentSection.items.length > 0) {
    organizedSections.push(currentSection);
  }

  console.log('✅ [DISPLAY] Final organized sections:', organizedSections);

  if (organizedSections.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No {title.toLowerCase()} available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {organizedSections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {section.sectionName && (
            <div className="mb-4">
              <h4 className="font-bold text-lg text-foreground border-b border-border pb-2">
                {section.sectionName}
              </h4>
            </div>
          )}
          <div className="space-y-3">
            {section.items.map((item, itemIndex) => {
              if (item.isMultiValue) {
                // Handle multi-value fields - show label once, then each value on separate lines
                const values = splitCommaSeparatedValues(item.value);
                return (
                  <div key={`${item.key}-${itemIndex}`} className="space-y-2">
                    {values.map((val, valIndex) => (
                      <div 
                        key={`${item.key}-val-${valIndex}`}
                        className="flex justify-between items-start py-3 border-b border-border/20 last:border-b-0 hover:bg-muted/30 rounded-md px-2 transition-colors"
                      >
                        <span className="text-sm text-muted-foreground font-medium flex-1">
                          {valIndex === 0 ? formatFeatureKey(item.key) : ''}
                        </span>
                        <span className="text-sm text-foreground font-semibold text-right max-w-[60%] break-words">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }
              
              return (
                <div 
                  key={`${item.key}-${itemIndex}`}
                  className="flex justify-between items-start py-3 border-b border-border/20 last:border-b-0 hover:bg-muted/30 rounded-md px-2 transition-colors"
                >
                  <span className="text-sm text-muted-foreground font-medium flex-1">
                    {formatFeatureKey(item.key)}
                  </span>
                  <span className="text-sm text-foreground font-semibold text-right max-w-[60%] break-words">
                    {renderFeatureValue(item.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropertyFeatureDisplay;
