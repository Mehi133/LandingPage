import React from 'react';
import { ShieldCheck, Zap, BarChart3 } from 'lucide-react';

const AppSidebar = () => {
  return (
    <aside className="w-72 bg-sidebar text-sidebar-foreground p-6 border-r border-sidebar-border flex-col flex-shrink-0 flex font-poppins">
      <div className="mb-10">
        <h1
          className="font-bold text-2xl tracking-tight"
          style={{
            color: 'hsl(var(--primary))'
          }}
        >
          Valora
        </h1>
        <p className="text-sm text-secondary-foreground mt-1">AI-Powered Real Estate Valuations</p>
      </div>
      <div className="space-y-8 flex-grow">
        <div>
          <h2 className="text-xs font-semibold text-secondary-foreground/60 uppercase tracking-wider mb-4">Features</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="p-1.5 bg-accent/20 rounded-full mr-3">
                <svg className="h-4 w-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="m13 10-9 7 10-3 7 5-8-11Z"/> </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Instant Valuation</h3>
                <p className="text-sm text-secondary-foreground">AI-driven property value estimates in seconds.</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="p-1.5 bg-accent/20 rounded-full mr-3">
                <svg className="h-4 w-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Zm9-4v4l3 3"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Market Analysis</h3>
                <p className="text-sm text-secondary-foreground">In-depth market and comparable sales data.</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="p-1.5 bg-success/20 rounded-full mr-3">
                <svg className="h-4 w-4 text-success flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Data-driven Reports</h3>
                <p className="text-sm text-secondary-foreground">Comprehensive reports for professionals.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-xs text-secondary-foreground/60 mt-8 text-center">
        © {new Date().getFullYear()} Valora
      </div>
    </aside>
  );
};
export default AppSidebar;
