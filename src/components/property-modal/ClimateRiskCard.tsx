import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Shield, Wind, CloudRain, Flame, Sun, ChevronDown } from "lucide-react";

interface ClimateRiskCardProps {
  additionalFeatures: any;
  isOpen: boolean;
  onToggle: () => void;
}

const ClimateRiskCard: React.FC<ClimateRiskCardProps> = ({
  additionalFeatures,
  isOpen,
  onToggle
}) => {
  const climate = additionalFeatures?.climate;
  
  if (!climate) {
    return null;
  }

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 2) return 'text-green-600';
    if (riskScore <= 5) return 'text-yellow-600';
    if (riskScore <= 7) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card className="shadow-lg border-border">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger className="w-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2 tracking-tight">
                <Shield className="h-6 w-6 text-primary" />
                Climate & Risk Assessment
              </h3>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="px-6 pb-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {climate.windSources?.primary && (
                <div className="flex items-center gap-3">
                  <Wind className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Wind Risk</div>
                    <div className="text-sm text-muted-foreground">
                      <span className={getRiskColor(climate.windSources.primary.riskScore?.value || 0)}>
                        {climate.windSources.primary.riskScore?.label || 'Unknown'}
                      </span>
                      {climate.windSources.primary.riskScore?.value && 
                        <span> (Score {climate.windSources.primary.riskScore.value}/10)</span>
                      }
                    </div>
                  </div>
                </div>
              )}
              
              {climate.floodSources?.primary && (
                <div className="flex items-center gap-3">
                  <CloudRain className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Flood Risk</div>
                    <div className="text-sm text-muted-foreground">
                      <span className={getRiskColor(climate.floodSources.primary.riskScore?.value || 0)}>
                        {climate.floodSources.primary.riskScore?.label || 'Unknown'}
                      </span>
                      {climate.floodSources.primary.femaZone && 
                        <div className="text-xs">FEMA Zone: {climate.floodSources.primary.femaZone.replace('_', ' ')}</div>
                      }
                    </div>
                  </div>
                </div>
              )}
              
              {climate.fireSources?.primary && (
                <div className="flex items-center gap-3">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="font-medium">Fire Risk</div>
                    <div className="text-sm text-muted-foreground">
                      <span className={getRiskColor(climate.fireSources.primary.riskScore?.value || 0)}>
                        {climate.fireSources.primary.riskScore?.label || 'Unknown'}
                      </span>
                      {climate.fireSources.primary.riskScore?.value && 
                        <span> (Score {climate.fireSources.primary.riskScore.value}/10)</span>
                      }
                    </div>
                  </div>
                </div>
              )}
              
              {climate.heatSources?.primary && (
                <div className="flex items-center gap-3">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="font-medium">Heat Risk</div>
                    <div className="text-sm text-muted-foreground">
                      <span className={getRiskColor(climate.heatSources.primary.riskScore?.value || 0)}>
                        {climate.heatSources.primary.riskScore?.label || 'Unknown'}
                      </span>
                      {climate.heatSources.primary.hotDays?.length > 0 && (
                        <div className="text-xs">
                          Hot Days: {climate.heatSources.primary.hotDays[0]?.dayCount || 0} to {' '}
                          {climate.heatSources.primary.hotDays[climate.heatSources.primary.hotDays.length - 1]?.dayCount || 0} over 30 years
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {climate.airSources?.primary && (
                <div className="flex items-center gap-3">
                  <Wind className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium">Air Quality Risk</div>
                    <div className="text-sm text-muted-foreground">
                      <span className={getRiskColor(climate.airSources.primary.riskScore?.value || 0)}>
                        {climate.airSources.primary.riskScore?.label || 'Unknown'}
                      </span>
                      {climate.airSources.primary.badAirDays?.length > 0 && (
                        <div className="text-xs">
                          Bad Air Days: {climate.airSources.primary.badAirDays[0]?.dayCount || 0} annually
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {climate.fireSources?.primary?.source?.url && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Climate risk data provided by First Street Foundation
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ClimateRiskCard;