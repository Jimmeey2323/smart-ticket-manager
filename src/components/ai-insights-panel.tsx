import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  BarChart3,
  Clock,
  Users,
  Zap,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: "trend" | "alert" | "suggestion" | "prediction";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  metric?: string;
  change?: number;
  action?: string;
}

interface AIInsightsPanelProps {
  className?: string;
}

// Simulated AI insights - in production, these would come from an AI service
const generateInsights = (): Insight[] => [
  {
    id: "1",
    type: "trend",
    title: "Booking Issues Trending Up",
    description: "25% increase in booking-related tickets this week, primarily from mobile app users.",
    impact: "high",
    metric: "Booking Issues",
    change: 25,
    action: "Review app booking flow",
  },
  {
    id: "2",
    type: "alert",
    title: "SLA Breach Risk Detected",
    description: "3 high-priority tickets approaching SLA deadline within the next 2 hours.",
    impact: "high",
    metric: "SLA Compliance",
    change: -5,
    action: "Assign additional resources",
  },
  {
    id: "3",
    type: "suggestion",
    title: "Optimize Response Times",
    description: "Customer Service team showing 15% slower response times on Mondays. Consider staffing adjustment.",
    impact: "medium",
    metric: "Response Time",
    change: 15,
    action: "Review Monday schedules",
  },
  {
    id: "4",
    type: "prediction",
    title: "Weekend Traffic Forecast",
    description: "AI predicts 40% higher ticket volume this weekend based on historical patterns and upcoming events.",
    impact: "medium",
    metric: "Predicted Volume",
    change: 40,
    action: "Prepare additional staff",
  },
  {
    id: "5",
    type: "trend",
    title: "Positive Sentiment Increasing",
    description: "Customer sentiment scores improved 12% over the past 30 days. Keep up the great work!",
    impact: "low",
    metric: "Sentiment Score",
    change: 12,
    action: "Share with team",
  },
];

const typeConfig = {
  trend: { icon: TrendingUp, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/10" },
  alert: { icon: AlertTriangle, color: "from-red-500 to-orange-500", bgColor: "bg-red-500/10" },
  suggestion: { icon: Lightbulb, color: "from-amber-500 to-yellow-500", bgColor: "bg-amber-500/10" },
  prediction: { icon: Target, color: "from-purple-500 to-pink-500", bgColor: "bg-purple-500/10" },
};

const impactColors = {
  high: "text-red-500 bg-red-500/10",
  medium: "text-amber-500 bg-amber-500/10",
  low: "text-emerald-500 bg-emerald-500/10",
};

export function AIInsightsPanel({ className }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      setInsights(generateInsights());
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const refreshInsights = () => {
    setIsLoading(true);
    setTimeout(() => {
      setInsights(generateInsights());
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className={cn("glass-card overflow-hidden", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="gradient-text-accent">AI Insights</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshInsights}
            disabled={isLoading}
            className="rounded-lg"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 rounded-xl bg-muted/50" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {insights.map((insight, index) => {
              const config = typeConfig[insight.type];
              const Icon = config.icon;
              const isExpanded = selectedInsight === insight.id;

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedInsight(isExpanded ? null : insight.id)}
                  className={cn(
                    "group relative p-4 rounded-xl cursor-pointer transition-all duration-300",
                    "border border-border/50 hover:border-primary/30",
                    "bg-card/30 hover:bg-card/60",
                    isExpanded && "ring-1 ring-primary/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      "bg-gradient-to-br",
                      config.color
                    )}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">{insight.title}</h4>
                        <Badge className={cn("text-xs flex-shrink-0", impactColors[insight.impact])}>
                          {insight.impact}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {insight.description}
                      </p>

                      {insight.change !== undefined && (
                        <div className="flex items-center gap-2 mt-2">
                          {insight.change > 0 ? (
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className={cn(
                            "text-xs font-medium",
                            insight.change > 0 ? "text-emerald-500" : "text-red-500"
                          )}>
                            {insight.change > 0 ? "+" : ""}{insight.change}%
                          </span>
                          <span className="text-xs text-muted-foreground">{insight.metric}</span>
                        </div>
                      )}

                      <AnimatePresence>
                        {isExpanded && insight.action && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-border/50"
                          >
                            <Button size="sm" className="w-full rounded-lg text-xs">
                              {insight.action}
                              <ArrowRight className="h-3 w-3 ml-2" />
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for dashboard
export function AIInsightsCompact({ className }: { className?: string }) {
  const [keyMetrics] = useState([
    { label: "Avg Response", value: "2.4h", change: -12, icon: Clock },
    { label: "Resolution Rate", value: "94%", change: 5, icon: Target },
    { label: "Team Capacity", value: "78%", change: 0, icon: Users },
    { label: "AI Confidence", value: "96%", change: 2, icon: Zap },
  ]);

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {keyMetrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative p-4 rounded-xl bg-card/50 border border-border/50 overflow-hidden group hover:border-primary/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold">{metric.value}</span>
                {metric.change !== 0 && (
                  <span className={cn(
                    "text-xs font-medium flex items-center gap-1",
                    metric.change > 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {metric.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(metric.change)}%
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
