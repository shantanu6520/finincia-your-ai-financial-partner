import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { BarChart3 } from "lucide-react";
import type { TrendData } from "@/hooks/usePredictiveAnalytics";

interface TrendProjectionsProps {
  data: TrendData[];
  currencySymbol: string;
  formatAmount: (amount: number) => string;
}

const TrendProjections = ({ data, currencySymbol, formatAmount }: TrendProjectionsProps) => {
  const [showActual, setShowActual] = useState(true);
  const [showForecast, setShowForecast] = useState(true);

  // Find the transition point between actual and forecast
  const forecastStartIndex = data.findIndex((d) => d.forecast !== undefined);
  const lastActualIndex = forecastStartIndex > 0 ? forecastStartIndex - 1 : data.findIndex((d) => d.actual === undefined) - 1;

  const seriesData = data.map((d, idx) => {
    // Bridge point: last actual data point should also have forecast value to connect lines
    const isBridgePoint = idx === lastActualIndex && lastActualIndex >= 0;

    return {
      ...d,
      actualSeries: d.actual,
      // For the bridge point, use the actual value to create seamless connection
      forecastSeries: d.forecast !== undefined ? d.forecast : (isBridgePoint ? d.actual : undefined),
    };
  });

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Spending Trend Projections</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            30-Day View
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Historical spending vs AI-projected future spending
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle Controls */}
        <div className="flex items-center gap-6 p-3 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2">
            <Switch
              id="show-actual"
              checked={showActual}
              onCheckedChange={setShowActual}
            />
            <Label htmlFor="show-actual" className="text-sm cursor-pointer flex items-center gap-2">
              <div className="w-3 h-0.5 bg-foreground" />
              Actual (Solid)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="show-forecast"
              checked={showForecast}
              onCheckedChange={setShowForecast}
            />
            <Label htmlFor="show-forecast" className="text-sm cursor-pointer flex items-center gap-2">
              <div className="w-3 h-0.5 border-t-2 border-dashed border-primary" />
              Forecast (Dashed)
            </Label>
          </div>
        </div>

        {/* Chart */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={seriesData}>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${currencySymbol}${value >= 1000 ? `${(value/1000).toFixed(0)}k` : Math.round(value)}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number, name: string) => [
                  `${currencySymbol}${formatAmount(value)}`,
                  name === "actual" ? "Actual Spending" : "Projected Spending"
                ]}
              />
              {forecastStartIndex > 0 && (
                <ReferenceLine 
                  x={data[forecastStartIndex - 1]?.date} 
                  stroke="hsl(var(--border))" 
                  strokeDasharray="3 3"
                  label={{ 
                    value: "Today", 
                    position: "top", 
                    fontSize: 10, 
                    fill: 'hsl(var(--muted-foreground))' 
                  }}
                />
              )}
              {showActual && (
                <Line
                  type="monotone"
                  dataKey="actualSeries"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  name="actual"
                />
              )}
              {showForecast && (
                <Line
                  type="monotone"
                  dataKey="forecastSeries"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={false}
                  connectNulls={true}
                  name="forecast"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <p className="text-xs text-muted-foreground">30-Day Avg (Past)</p>
            <p className="text-lg font-bold">
              {currencySymbol}
              {formatAmount(
                data
                  .filter((d) => d.actual !== undefined)
                  .reduce((sum, d) => sum + (d.actual || 0), 0) / 30
              )}
            </p>
            <p className="text-xs text-muted-foreground">/day</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <p className="text-xs text-muted-foreground">30-Day Avg (Forecast)</p>
            <p className="text-lg font-bold text-primary">
              {currencySymbol}
              {formatAmount(
                data
                  .filter((d) => d.forecast !== undefined)
                  .reduce((sum, d) => sum + (d.forecast || 0), 0) / 30
              )}
            </p>
            <p className="text-xs text-muted-foreground">/day</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <p className="text-xs text-muted-foreground">Peak Day (Past)</p>
            <p className="text-lg font-bold">
              {currencySymbol}
              {formatAmount(
                Math.max(...data.filter((d) => d.actual !== undefined).map((d) => d.actual || 0))
              )}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <p className="text-xs text-muted-foreground">Total Projected</p>
            <p className="text-lg font-bold text-primary">
              {currencySymbol}
              {formatAmount(
                data
                  .filter((d) => d.forecast !== undefined)
                  .reduce((sum, d) => sum + (d.forecast || 0), 0)
              )}
            </p>
            <p className="text-xs text-muted-foreground">next 30 days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendProjections;
