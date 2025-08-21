
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  count?: number;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  count
}) => {
  return (
    <Card className="shadow-lg border border-border bg-card">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger className="w-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-primary flex items-center gap-3 tracking-tight">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {icon}
                </div>
                {title}
              </h3>
              <ChevronDown className={`h-5 w-5 text-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="px-6 pb-6 pt-0">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CollapsibleSection;
