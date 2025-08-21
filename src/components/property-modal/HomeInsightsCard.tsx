import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Lightbulb, ChevronDown } from "lucide-react";

interface HomeInsightsCardProps {
  additionalFeatures: any;
  isOpen: boolean;
  onToggle: () => void;
}

const HomeInsightsCard: React.FC<HomeInsightsCardProps> = ({
  additionalFeatures,
  isOpen,
  onToggle
}) => {
  const homeInsights = additionalFeatures?.homeInsights;
  
  if (!homeInsights || !Array.isArray(homeInsights) || homeInsights.length === 0) {
    return null;
  }

  // Extract all unique phrases from all insights
  const allPhrases = homeInsights.reduce((acc, insight) => {
    if (insight.insights && Array.isArray(insight.insights)) {
      insight.insights.forEach((item: any) => {
        if (item.phrases && Array.isArray(item.phrases)) {
          acc.push(...item.phrases);
        }
      });
    }
    return acc;
  }, []);

  // Remove duplicates
  const uniquePhrases = [...new Set(allPhrases)];

  if (uniquePhrases.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg border-border">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger className="w-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2 tracking-tight">
                <Lightbulb className="h-6 w-6 text-primary" />
                Home Insights
              </h3>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                Key features and highlights identified by property intelligence
              </p>
              <div className="flex flex-wrap gap-2">
                {uniquePhrases.map((phrase: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default HomeInsightsCard;