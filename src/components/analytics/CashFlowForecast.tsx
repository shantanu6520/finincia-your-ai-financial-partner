import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import type { CashFlowForecast as CashFlowData } from "@/hooks/usePredictiveAnalytics";

interface CashFlowForecastProps {
  data: CashFlowData[];
  currentBalance: number;
  forecast30Day: number;
  forecast60Day: number;
  forecast90Day: number;
  currencySymbol: string;
  formatAmount: (amount: number) => string;
}

const CashFlowForecast = ({
  data,
  currentBalance,
  forecast30Day,
  forecast60Day,
  forecast90Day,
  currencySymbol,
  formatAmount,
}: CashFlowForecastProps) => {
  const get30DayData = () => data.slice(0, 14 + 30);
  const get60DayData = () => data.slice(0, 14 + 60);
  const get90DayData = () => data;

  const getChangePercent = (forecast: number) => {
    if (currentBalance === 0) return 0;
    return ((forecast - currentBalance) / currentBalance) * 100;
  };

  const ForecastCard = ({ days, forecast }: { days: number; forecast: number }) => {
    const change = getChangePercent(forecast);
    const isPositive = change >= 0;

    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isPositive ? "bg-primary/10" : "bg-destructive/10"
          }`}>
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-primary" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{days}-Day Forecast</p>
            <p className="text-lg font-bold">{currencySymbol}{formatAmount(forecast)}</p>
          </div>
        </div>
        <Badge variant={isPositive ? "default" : "destructive"}>
          {isPositive ? "+" : ""}{change.toFixed(1)}%
        </Badge>
      </div>
    );
  };

  const ChartComponent = ({ chartData }: { chartData: CashFlowData[] }) => (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
            </linearGradient>
          </defs>
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
            tickFormatter={(value) => `${currencySymbol}${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
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
              name === "actual" ? "Actual" : name === "predicted" ? "Forecast" : name
            ]}
          />
          {/* Confidence band */}
          <Area
            type="monotone"
            dataKey="confidenceHigh"
            stroke="transparent"
            fill="url(#confidenceGradient)"
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="confidenceLow"
            stroke="transparent"
            fill="hsl(var(--background))"
            fillOpacity={1}
          />
          {/* Actual line */}
          <Area
            type="monotone"
            dataKey="actual"
            stroke="hsl(var(--foreground))"
            strokeWidth={2}
            fill="url(#actualGradient)"
            fillOpacity={1}
            connectNulls={false}
          />
          {/* Forecast line */}
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#forecastGradient)"
            fillOpacity={1}
          />
          <ReferenceLine 
            x={chartData.find(d => d.isForecasted)?.date} 
            stroke="hsl(var(--border))" 
            strokeDasharray="3 3"
            label={{ value: "Today", position: "top", fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Cash Flow Forecast</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            AI Powered
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Predicted balance based on your spending patterns
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Forecast Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ForecastCard days={30} forecast={forecast30Day} />
          <ForecastCard days={60} forecast={forecast60Day} />
          <ForecastCard days={90} forecast={forecast90Day} />
        </div>

        {/* Chart Tabs */}
        <Tabs defaultValue="30" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="30">30 Days</TabsTrigger>
            <TabsTrigger value="60">60 Days</TabsTrigger>
            <TabsTrigger value="90">90 Days</TabsTrigger>
          </TabsList>
          <TabsContent value="30" className="mt-4">
            <ChartComponent chartData={get30DayData()} />
          </TabsContent>
          <TabsContent value="60" className="mt-4">
            <ChartComponent chartData={get60DayData()} />
          </TabsContent>
          <TabsContent value="90" className="mt-4">
            <ChartComponent chartData={get90DayData()} />
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-foreground" />
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-primary border-dashed border-t-2 border-primary" />
            <span>Forecast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-muted-foreground/10 rounded" />
            <span>Confidence Range</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowForecast;
