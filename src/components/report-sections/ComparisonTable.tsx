import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { 
  COMPARISON_ATTRIBUTES, 
  extractComparisonValue, 
  formatComparisonValue, 
  getComparisonResult, 
  getHighlightClasses,
  formatBooleanDisplay 
} from '@/utils/comparisonUtils';

interface ComparisonTableProps {
  subjectProperty: any;
  comparableProperties: any[];
  title: string;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  subjectProperty,
  comparableProperties,
  title
}) => {
  console.log('📊 ComparisonTable rendering:', { title, subjectProperty, comparableProperties });

  // FIXED: Format beds/baths to show exact decimal values (never round)
  const safeFormatBedsOrBaths = (value: any): string => {
    try {
      if (value === null || value === undefined || value === '') return 'N/A';
      
      // Convert to number and preserve decimals
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return 'N/A';
      
      // Show exact decimal value, no rounding
      return numValue.toString();
    } catch {
      return 'N/A';
    }
  };

  if (!subjectProperty || !comparableProperties || comparableProperties.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title} Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No comparable properties available for comparison.</p>
        </CardContent>
      </Card>
    );
  }

  // Limit to first 4 comparables for table width
  const limitedComparables = comparableProperties.slice(0, 4);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title} Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] font-semibold">Attribute</TableHead>
                <TableHead className="text-center font-semibold bg-primary/5">
                  Subject Property
                </TableHead>
                {limitedComparables.map((property, index) => (
                  <TableHead key={property.id || index} className="text-center font-semibold min-w-[120px]">
                    Comparable {index + 1}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMPARISON_ATTRIBUTES.map((attribute) => {
                const subjectValue = extractComparisonValue(subjectProperty, attribute);
                
                return (
                  <TableRow key={attribute.key} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{attribute.label}</TableCell>
                    
                    {/* Subject Property Cell - Hide price, no highlighting */}
                    <TableCell className="text-center bg-primary/5 font-medium">
                      {attribute.excludeFromSubject ? (
                        <span className="text-muted-foreground text-sm">See Pricing Strategy</span>
                      ) : (
                        attribute.type === 'boolean' 
                          ? formatBooleanDisplay(subjectValue)
                          : attribute.key === 'bedrooms' || attribute.key === 'bathrooms'
                            ? safeFormatBedsOrBaths(subjectValue)
                            : formatComparisonValue(subjectValue, attribute)
                      )}
                    </TableCell>
                    
                    {/* Comparable Properties Cells - With highlighting but neutral for price */}
                    {limitedComparables.map((property, index) => {
                      const comparableValue = extractComparisonValue(property, attribute);
                      const comparisonResult = getComparisonResult(subjectValue, comparableValue, attribute);
                      const highlightClasses = getHighlightClasses(comparisonResult);
                      
                      return (
                        <TableCell 
                          key={property.id || index} 
                          className={`text-center font-medium ${highlightClasses} border`}
                        >
                          {attribute.type === 'boolean' 
                            ? formatBooleanDisplay(comparableValue)
                            : attribute.key === 'bedrooms' || attribute.key === 'bathrooms'
                              ? safeFormatBedsOrBaths(comparableValue)
                              : formatComparisonValue(comparableValue, attribute)
                          }
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span>Better than subject</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span>Worse than subject</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
            <span>Equal to subject / Neutral</span>
          </div>
        </div>
        
        {comparableProperties.length > 4 && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Showing first 4 of {comparableProperties.length} comparable properties
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ComparisonTable;
