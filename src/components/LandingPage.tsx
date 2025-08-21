
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, MapPin, FileText, BarChart3, TrendingUp, CheckCircle2, Home, Search, Edit3, Download } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ReportPreviewGallery from './ReportPreviewGallery';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  Get Professional Property Valuations in Minutes
                </h1>
                <p className="text-xl text-secondary-foreground leading-relaxed">
                  Instant property analysis with comprehensive market data, comparable sales, and pricing strategies. Perfect for buyers, sellers, and real estate professionals.
                </p>
              </div>
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="text-lg px-8 py-6 h-auto rounded-lg"
              >
                Start Your Valuation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="lg:pl-8">
              <Card className="shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                        <Home className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-semibold">Professional Reports</h3>
                      <p className="text-secondary-foreground">
                        Get detailed property valuations with market analysis, comparable sales, and strategic pricing recommendations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Report Preview Gallery */}
      <ReportPreviewGallery />

      {/* Features Preview Section */}
      <section className="py-16 px-4 bg-background-secondary">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Comprehensive Property Analysis
            </h2>
            <p className="text-lg text-secondary-foreground max-w-2xl mx-auto">
              Our reports include everything you need to make informed real estate decisions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Market Overview</h3>
                <p className="text-sm text-secondary-foreground">
                  Local market trends and neighborhood insights
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                  <BarChart3 className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold">Comparable Sales</h3>
                <p className="text-sm text-secondary-foreground">
                  Recent sales of similar properties in the area
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold">Pricing Strategy</h3>
                <p className="text-sm text-secondary-foreground">
                  Strategic recommendations for buyers and sellers
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Detailed Reports</h3>
                <p className="text-sm text-secondary-foreground">
                  Professional PDFs ready for sharing
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-secondary-foreground max-w-2xl mx-auto">
              Get your professional property valuation in four simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Enter Name & Email</h3>
                </div>
                <p className="text-secondary-foreground text-sm leading-relaxed">
                  Provide your contact information to receive the completed report via email. You don't need to wait on the page.
                </p>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Enter Property Address</h3>
                </div>
                <p className="text-secondary-foreground text-sm leading-relaxed">
                  Follow the format shown on screen. Optionally upload property images, or we'll look them up automatically.
                </p>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Edit3 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Review & Adjust Data</h3>
                </div>
                <p className="text-secondary-foreground text-sm leading-relaxed">
                  We'll return available property data. You can correct or add features - every change can affect the valuation.
                </p>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">4</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Get Your Report</h3>
                </div>
                <p className="text-secondary-foreground text-sm leading-relaxed">
                  Click continue when ready. You can wait for the loading screen or check your email for the finished report.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-background-secondary">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="shadow-lg">
            <CardContent className="p-12 space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-foreground">
                  Ready to Get Your Property Valuation?
                </h2>
                <p className="text-lg text-secondary-foreground max-w-2xl mx-auto">
                  Join thousands of buyers, sellers, and real estate professionals who trust Valora for accurate property analysis.
                </p>
              </div>
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="text-lg px-12 py-6 h-auto rounded-lg"
              >
                Start Your Free Valuation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground">
                No credit card required • Professional reports in minutes
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
