
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";

interface PriceHistoryChartProps {
  data: any[];
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ data }) => {
  console.log('📊 PriceHistoryChart received data:', data);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className="shadow-sm border border-border">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-muted-foreground font-medium">No price history data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for the chart
  const chartData = data.map((item: any, index: number) => {
    let price: any = 0;
    let date = `Entry ${index + 1}`;
    let event = '';

    // Handle different data formats
    if (typeof item === 'object' && item !== null) {
      price = item.price || item.value || 0;
      date = item.date || item.time || date;
      event = item.event || item.eventType || item.description || '';
    } else if (typeof item === 'string' || typeof item === 'number') {
      // Handle string format like "Price: 500000, Date: 2023-01-01, Event: Listed"
      const itemStr = String(item);
      const priceMatch = itemStr.match(/price[:\s]*(\d+)/i);
      const dateMatch = itemStr.match(/date[:\s]*([^,]+)/i);
      const eventMatch = itemStr.match(/event[:\s]*([^,]+)/i);
      
      if (priceMatch) {
        price = parseInt(priceMatch[1], 10);
      }
      if (dateMatch) {
        date = dateMatch[1].trim();
      }
      if (eventMatch) {
        event = eventMatch[1].trim();
      }
    }

    // Format price with proper type checking
    let formattedPrice = 0;
    if (typeof price === 'string' && price.includes('$')) {
      formattedPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    } else {
      formattedPrice = Number(price) || 0;
    }

    return {
      date,
      price: formattedPrice,
      event,
      formattedPrice: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(formattedPrice)
    };
  }).filter(item => item.price > 0);

  // Sort data chronologically (oldest to newest)
  chartData.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  if (chartData.length === 0) {
    return (
      <Card className="shadow-sm border border-border">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-muted-foreground font-medium">No valid price history data to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-border">
      <CardContent className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
                labelClassName="text-foreground font-medium"
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Price History Events */}
        {chartData.some(item => item.event) && (
          <div className="mt-6 border-t border-border pt-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">Price History Events</h4>
            <div className="space-y-2">
              {chartData.filter(item => item.event).map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{item.date}</span>
                  <span className="font-medium text-foreground">{item.event}</span>
                  <span className="text-primary font-semibold">{item.formattedPrice}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceHistoryChart;
