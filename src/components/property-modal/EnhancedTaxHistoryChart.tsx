
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Receipt } from "lucide-react";

interface TaxHistoryChartProps {
  data: any[];
}

const EnhancedTaxHistoryChart: React.FC<TaxHistoryChartProps> = ({ data }) => {
  console.log('🧾 EnhancedTaxHistoryChart received data:', data);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Tax History</h3>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground font-medium">No tax history data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform data for the chart - properly extract year and values
  const chartData = data.map((item: any, index: number) => {
    let year = null;
    let assessedValue = 0;
    let taxPaid = 0;

    console.log('🧾 Processing tax history item:', item, 'Index:', index);

    if (typeof item === 'string') {
      // Handle string format like "Tax Paid: 5000, Assessed Value: 200000, Year: 2023"
      console.log('🧾 Processing string item:', item);
      
      const yearMatch = item.match(/year[:\s]*(\d{4})/i);
      const taxMatch = item.match(/tax[^:]*paid[:\s]*[\$]?([0-9,]+)/i);
      const assessedMatch = item.match(/assessed[^:]*value[:\s]*[\$]?([0-9,]+)/i);
      
      if (yearMatch) {
        year = parseInt(yearMatch[1]);
      }
      if (taxMatch) {
        taxPaid = parseFloat(taxMatch[1].replace(/,/g, ''));
      }
      if (assessedMatch) {
        assessedValue = parseFloat(assessedMatch[1].replace(/,/g, ''));
      }
      
      console.log('🧾 Extracted from string - Year:', year, 'Tax:', taxPaid, 'Assessed:', assessedValue);
    } else if (typeof item === 'object' && item !== null) {
      // Extract year from various possible fields
      if (item.year) {
        year = parseInt(String(item.year));
      } else if (item.taxYear) {
        year = parseInt(String(item.taxYear));
      } else if (item.date) {
        const parsedYear = new Date(item.date).getFullYear();
        if (!isNaN(parsedYear) && parsedYear > 1900) {
          year = parsedYear;
        }
      } else if (item.time) {
        const parsedYear = new Date(item.time).getFullYear();
        if (!isNaN(parsedYear) && parsedYear > 1900) {
          year = parsedYear;
        }
      }

      // Extract assessed value
      if (item.assessedValue !== undefined) {
        assessedValue = typeof item.assessedValue === 'string' ? 
          parseFloat(item.assessedValue.replace(/[^0-9.]/g, '')) || 0 : (Number(item.assessedValue) || 0);
      } else if (item['Assessed Value'] !== undefined) {
        assessedValue = typeof item['Assessed Value'] === 'string' ? 
          parseFloat(item['Assessed Value'].replace(/[^0-9.]/g, '')) || 0 : (Number(item['Assessed Value']) || 0);
      } else if (item.assessedval !== undefined) {
        assessedValue = typeof item.assessedval === 'string' ? 
          parseFloat(item.assessedval.replace(/[^0-9.]/g, '')) || 0 : (Number(item.assessedval) || 0);
      } else if (item.value !== undefined) {
        assessedValue = typeof item.value === 'string' ? 
          parseFloat(item.value.replace(/[^0-9.]/g, '')) || 0 : (Number(item.value) || 0);
      }

      // Extract tax paid
      if (item.taxPaid !== undefined) {
        taxPaid = typeof item.taxPaid === 'string' ? 
          parseFloat(item.taxPaid.replace(/[^0-9.]/g, '')) || 0 : (Number(item.taxPaid) || 0);
      } else if (item.taxpaid !== undefined) {
        taxPaid = typeof item.taxpaid === 'string' ? 
          parseFloat(item.taxpaid.replace(/[^0-9.]/g, '')) || 0 : (Number(item.taxpaid) || 0);
      } else if (item['Tax Paid'] !== undefined) {
        taxPaid = typeof item['Tax Paid'] === 'string' ? 
          parseFloat(item['Tax Paid'].replace(/[^0-9.]/g, '')) || 0 : (Number(item['Tax Paid']) || 0);
      } else if (item.annualTaxes !== undefined) {
        taxPaid = typeof item.annualTaxes === 'string' ? 
          parseFloat(item.annualTaxes.replace(/[^0-9.]/g, '')) || 0 : (Number(item.annualTaxes) || 0);
      } else if (item.tax !== undefined) {
        taxPaid = typeof item.tax === 'string' ? 
          parseFloat(item.tax.replace(/[^0-9.]/g, '')) || 0 : (Number(item.tax) || 0);
      }

      console.log('🧾 Extracted from object - Year:', year, 'Tax:', taxPaid, 'Assessed:', assessedValue);
    }

    // If no year found, estimate based on current year minus index (assuming newest to oldest)
    if (!year || isNaN(year) || year < 1900) {
      year = new Date().getFullYear() - index;
      console.log('🧾 No valid year found, using estimated year:', year);
    }

    return {
      year: year.toString(),
      assessedValue: Math.round(assessedValue),
      taxPaid: Math.round(taxPaid),
      formattedAssessedValue: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(assessedValue),
      formattedTaxPaid: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(taxPaid)
    };
  }).filter(item => item.assessedValue > 0 || item.taxPaid > 0);

  // Sort data chronologically (oldest to newest) for proper left-to-right display
  chartData.sort((a, b) => parseInt(a.year) - parseInt(b.year));

  console.log('🧾 Final processed chart data:', chartData);

  if (chartData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Tax History</h3>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground font-medium">No valid tax history data to display</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate trends
  const latestData = chartData[chartData.length - 1];
  const previousData = chartData.length > 1 ? chartData[chartData.length - 2] : null;
  
  const assessedValueChange = previousData ? latestData.assessedValue - previousData.assessedValue : 0;
  const taxPaidChange = previousData ? latestData.taxPaid - previousData.taxPaid : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Tax History</h3>
        <Badge variant="secondary" className="text-xs">
          {chartData.length} year{chartData.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Latest Assessed Value</p>
                <p className="text-lg font-bold text-foreground">{latestData.formattedAssessedValue}</p>
                <p className="text-xs text-muted-foreground">{latestData.year}</p>
              </div>
              <div className={`p-2 rounded-full ${assessedValueChange >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {assessedValueChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Latest Tax Paid</p>
              <p className="text-lg font-bold text-foreground">{latestData.formattedTaxPaid}</p>
              <p className="text-xs text-muted-foreground">{latestData.year}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Tax Rate</p>
              <p className="text-lg font-bold text-foreground">
                {latestData.assessedValue > 0 ? 
                  ((latestData.taxPaid / latestData.assessedValue) * 100).toFixed(2) + '%' : 
                  'N/A'
                }
              </p>
              <p className="text-xs text-muted-foreground">Effective rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Tax Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="year" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0
                    }).format(value), 
                    name === 'assessedValue' ? 'Assessed Value' : 'Tax Paid'
                  ]}
                  labelFormatter={(label) => `Year: ${label}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                
                <Bar 
                  yAxisId="left"
                  dataKey="assessedValue" 
                  name="assessedValue"
                  fill="hsl(var(--primary))"
                  opacity={0.8}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={60}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="taxPaid" 
                  name="taxPaid"
                  fill="hsl(214 70% 60%)"
                  opacity={0.7}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTaxHistoryChart;
