import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, RefreshCw, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AIInsight {
  status: 'normal' | 'attention' | 'critical';
  summary: string;
  insights: string[];
  recommendation: string;
}

interface AIInsightsPanelProps {
  vitals?: {
    heart_rate?: number | null;
    blood_pressure_systolic?: number | null;
    blood_pressure_diastolic?: number | null;
    oxygen_saturation?: number | null;
    temperature?: number | null;
    respiratory_rate?: number | null;
  };
  className?: string;
}

export default function AIInsightsPanel({ vitals, className }: AIInsightsPanelProps) {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeVitals = async () => {
    if (!vitals) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('health-ai', {
        body: { vitals, type: 'vitals_analysis' }
      });

      if (fnError) throw fnError;
      setInsight(data);
    } catch (err) {
      console.error('AI analysis error:', err);
      setError('Unable to analyze vitals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vitals && (vitals.heart_rate || vitals.oxygen_saturation)) {
      analyzeVitals();
    }
  }, [vitals?.heart_rate, vitals?.oxygen_saturation]);

  const statusConfig = {
    normal: {
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      label: 'All Clear'
    },
    attention: {
      icon: Info,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      label: 'Attention Needed'
    },
    critical: {
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30',
      label: 'Critical'
    }
  };

  const currentStatus = insight?.status ? statusConfig[insight.status] : statusConfig.normal;
  const StatusIcon = currentStatus.icon;

  return (
    <Card className={cn(
      "relative overflow-hidden border-primary/20 bg-card/80 backdrop-blur-xl",
      insight?.status === 'critical' && "animate-glow-pulse",
      className
    )}>
      {/* Holographic effect background */}
      <div className="absolute inset-0 holographic opacity-30 pointer-events-none" />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-primary/10 text-primary animate-float">
              <Brain className="h-5 w-5" />
            </div>
            <span className="font-display">ARIA</span>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              AI Health Assistant
            </Badge>
          </CardTitle>
          <Button
            size="icon"
            variant="ghost"
            onClick={analyzeVitals}
            disabled={loading || !vitals}
            className="h-8 w-8"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        {loading ? (
          <div className="flex items-center gap-3 py-6">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <div className="absolute inset-0 blur-md bg-primary/30 animate-ping" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Analyzing vital signs...</p>
              <div className="h-1 w-32 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-accent animate-data-stream" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 py-4 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        ) : insight ? (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg",
              currentStatus.bgColor,
              currentStatus.borderColor,
              "border"
            )}>
              <StatusIcon className={cn("h-5 w-5", currentStatus.color)} />
              <span className={cn("font-medium", currentStatus.color)}>
                {currentStatus.label}
              </span>
            </div>

            {/* Summary */}
            <p className="text-sm text-foreground leading-relaxed">
              {insight.summary}
            </p>

            {/* Insights */}
            {insight.insights && insight.insights.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Key Insights
                </p>
                <ul className="space-y-1.5">
                  {insight.insights.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-3 w-3 mt-1 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendation */}
            {insight.recommendation && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Recommendation
                </p>
                <p className="text-sm text-foreground">
                  {insight.recommendation}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 py-4 text-muted-foreground">
            <Brain className="h-5 w-5" />
            <p className="text-sm">Waiting for vital signs data...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
