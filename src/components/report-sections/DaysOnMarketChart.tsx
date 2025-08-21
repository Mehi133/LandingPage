
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketDataUnion } from '@/utils/webhook/types';
import { getDaysOnMarketHistory, sortMonthsChronologically } from '@/utils/marketDataUtils';

interface DaysOnMarketChartProps {
  marketData?: MarketDataUnion;
}

const DaysOnMarketChart: React.FC<DaysOnMarketChartProps> = ({ marketData }) => {
  const daysHistory = getDaysOnMarketHistory(marketData);
  
  const chartData = React.useMemo(() => {
    if (!daysHistory || Object.keys(daysHistory).length === 0) {
      return [
        { month: 'Jan', days: 45 },
        { month: 'Feb', days: 42 },
        { month: 'Mar', days: 38 },
        { month: 'Apr', days: 35 },
        { month: 'May', days: 32 },
        { month: 'Jun', days: 30 }
      ];
    }

    const sortedData = sortMonthsChronologically(daysHistory);
    return sortedData.map(([monthYear, days]) => {
      const numericDays = typeof days === 'string' 
        ? parseFloat(days) 
        : days;
      
      return {
        month: monthYear.split(' ')[0].slice(0, 3),
        days: numericDays
      };
    });
  }, [daysHistory]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-foreground">
          Days on Market Trends (6 months)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
              <XAxis 
                dataKey="month" 
                className="text-xs fill-muted-foreground"
                axisLine={{ strokeWidth: 1 }}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                axisLine={{ strokeWidth: 1 }}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `${value}d`}
              />
              <Tooltip 
                formatter={(value: number) => [`${value} days`, 'Days on Market']}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '11px'
                }}
              />
              <Line
                type="monotone"
                dataKey="days"
                className="stroke-primary"
                strokeWidth={2}
                dot={{ className: "fill-primary stroke-primary", strokeWidth: 1, r: 2 }}
                activeDot={{ r: 3, className: "fill-primary stroke-primary" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DaysOnMarketChart;
