
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

interface PriceHistoryChartProps {
  data: any[];
}

const EnhancedPriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ data }) => {
  console.log('📊 EnhancedPriceHistoryChart received data:', data);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Price History</h3>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground font-medium">No price history data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = data.map((item: any, index: number) => {
    let price: any = 0;
    let date = `Entry ${index + 1}`;
    let event = '';

    if (typeof item === 'object' && item !== null) {
      price = item.price || item.value || 0;
      date = item.date || item.time || date;
      event = item.event || item.eventType || item.description || '';
    } else if (typeof item === 'string' || typeof item === 'number') {
      const itemStr = String(item);
      const priceMatch = itemStr.match(/price[:\s]*(\d+)/i);
      const dateMatch = itemStr.match(/date[:\s]*([^,]+)/i);
      const eventMatch = itemStr.match(/event[:\s]*([^,]+)/i);
      
      if (priceMatch) price = parseInt(priceMatch[1], 10);
      if (dateMatch) date = dateMatch[1].trim();
      if (eventMatch) event = eventMatch[1].trim();
    }

    let formattedPrice = 0;
    if (typeof price === 'string' && price.includes('$')) {
      formattedPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    } else {
      formattedPrice = Number(price) || 0;
    }

    return {
      date: new Date(date).toLocaleDateString() || date,
      originalDate: date,
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

  // Sort data chronologically
  chartData.sort((a, b) => {
    const dateA = new Date(a.originalDate);
    const dateB = new Date(b.originalDate);
    return dateA.getTime() - dateB.getTime();
  });

  if (chartData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Price History</h3>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground font-medium">No valid price history data to display</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get the last event for display
  const lastEvent = chartData[chartData.length - 1];
  const firstPrice = chartData[0].price;
  const lastPrice = lastEvent.price;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = ((priceChange / firstPrice) * 100);
  const isPositive = priceChange >= 0;

  // Format the last event label
  const getLastEventLabel = () => {
    const event = lastEvent.event.toLowerCase();
    const eventDate = new Date(lastEvent.originalDate).toLocaleDateString();
    
    if (event.includes('sold')) {
      return `Last sold for ${lastEvent.formattedPrice}`;
    } else if (event.includes('list') || event.includes('active')) {
      return `Listed for ${lastEvent.formattedPrice}`;
    } else if (event.includes('price')) {
      return `Price changed to ${lastEvent.formattedPrice}`;
    } else {
      return `Last event: ${lastEvent.formattedPrice}`;
    }
  };

  // Find notable events
  const notableEvents = chartData.filter(item => 
    item.event && ['sold', 'listed', 'price change', 'delisted'].some(keyword => 
      item.event.toLowerCase().includes(keyword)
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Price History</h3>
        <Badge variant="secondary" className="text-xs">
          {chartData.length} event{chartData.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Latest Event</p>
                <p className="text-lg font-bold text-foreground">{lastEvent.formattedPrice}</p>
                <p className="text-xs text-muted-foreground">{lastEvent.event} - {lastEvent.date}</p>
              </div>
              <div className={`p-2 rounded-full ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                {isPositive ? (
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
              <p className="text-xs text-muted-foreground font-medium">Price Change</p>
              <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(priceChange)}
              </p>
              <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{priceChangePercent.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Time Period</p>
              <p className="text-lg font-bold text-foreground">
                {chartData.length > 1 ? `${chartData[0].date} - ${chartData[chartData.length - 1].date}` : chartData[0].date}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Price Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
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
                    'Price'
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                
                {/* Reference line for average price */}
                <ReferenceLine 
                  y={chartData.reduce((sum, item) => sum + item.price, 0) / chartData.length} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5" 
                  label={{ value: "Average", position: "insideTopRight", fontSize: 12 }}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Events Timeline */}
      {notableEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Notable Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notableEvents.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-md border">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-primary">{item.formattedPrice}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedPriceHistoryChart;
