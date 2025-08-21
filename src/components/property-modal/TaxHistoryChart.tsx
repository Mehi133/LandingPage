
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";

interface TaxHistoryChartProps {
  data: any[];
}

const TaxHistoryChart: React.FC<TaxHistoryChartProps> = ({ data }) => {
  console.log('📊 TaxHistoryChart received data:', data);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className="shadow-sm border border-border">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-muted-foreground font-medium">No tax history data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for the chart
  const chartData = data.map((item: any, index: number) => {
    let taxPaid: any = 0;
    let date = `Year ${index + 1}`;

    // Handle different data formats
    if (typeof item === 'object' && item !== null) {
      taxPaid = item.taxPaid || item.tax || item.amount || 0;
      date = item.date || item.year || item.time || date;
    } else if (typeof item === 'string' || typeof item === 'number') {
      // Handle string format like "Tax Paid: 5000, Assessed Value: 200000, Year: 2023"
      const itemStr = String(item);
      const taxMatch = itemStr.match(/tax[^:]*[:\s]*(\d+)/i);
      const dateMatch = itemStr.match(/(?:year|date|time)[:\s]*([^,]+)/i);
      
      if (taxMatch) {
        taxPaid = parseFloat(taxMatch[1]);
      }
      if (dateMatch) {
        date = dateMatch[1].trim();
      }
    }

    // Format tax paid value with proper type checking
    let formattedTaxPaid = 0;
    if (typeof taxPaid === 'string' && taxPaid.includes('$')) {
      formattedTaxPaid = parseFloat(taxPaid.replace(/[^0-9.]/g, ''));
    } else {
      formattedTaxPaid = Number(taxPaid) || 0;
    }

    // Format date properly
    let formattedDate = date;
    if (typeof date === 'number' && date > 1000000000000) {
      // Unix timestamp in milliseconds
      formattedDate = new Date(date).getFullYear().toString();
    } else if (typeof date === 'string' && date.includes('-')) {
      // Date string format
      formattedDate = new Date(date).getFullYear().toString();
    }

    return {
      date: formattedDate,
      taxPaid: formattedTaxPaid,
      formattedTaxPaid: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(formattedTaxPaid)
    };
  }).filter(item => item.taxPaid > 0);

  // Sort data chronologically (oldest to newest)
  chartData.sort((a, b) => {
    const yearA = parseInt(String(a.date));
    const yearB = parseInt(String(b.date));
    return yearA - yearB;
  });

  if (chartData.length === 0) {
    return (
      <Card className="shadow-sm border border-border">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-muted-foreground font-medium">No valid tax history data to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate Y-axis domain with specific increments: $5k, $10k, $15k, $20k, $30k, $50k, $75k, $90k, $100k
  const allTaxValues = chartData.map(item => item.taxPaid).filter(val => val > 0);
  const maxTaxValue = Math.max(...allTaxValues);
  
  // Define specific Y-axis tick values
  const yAxisTicks = [5000, 10000, 15000, 20000, 30000, 50000, 75000, 90000, 100000];
  
  // Find the appropriate max value from our predefined ticks
  const maxYAxisValue = yAxisTicks.find(tick => tick >= maxTaxValue) || 100000;

  return (
    <Card className="shadow-sm border border-border">
      <CardContent className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-sm text-muted-foreground"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                className="text-sm text-muted-foreground"
                domain={[0, maxYAxisValue]}
                ticks={yAxisTicks.filter(tick => tick <= maxYAxisValue)}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Tax Paid']}
                labelClassName="text-foreground font-medium"
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="taxPaid" 
                fill="hsl(var(--primary))"
                name="Tax Paid"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Tax History Details */}
        <div className="mt-6 border-t border-border pt-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Tax History Details</h4>
          <div className="space-y-2">
            {chartData.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 text-sm">
                <span className="text-muted-foreground font-medium">{item.date}</span>
                <div className="text-right">
                  <span className="text-foreground font-medium">Tax Paid: </span>
                  <span className="text-primary font-semibold">{item.formattedTaxPaid}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxHistoryChart;
