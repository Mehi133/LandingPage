import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface WelcomeFormProps {
  onComplete: (userData: { fullName: string; email: string }) => void;
}

const WelcomeForm: React.FC<WelcomeFormProps> = ({ onComplete }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      toast({
        title: "Welcome!",
        description: "Your information has been saved. You can now proceed with your property analysis.",
      });

      // Pass user data to parent component without making any API calls
      onComplete({
        fullName: fullName.trim(),
        email: email.trim()
      });

    } catch (error) {
      console.error('Error processing user data:', error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome to Valora
          </CardTitle>
          <p className="text-muted-foreground">
            Please provide your information to get started with your property analysis.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !fullName.trim() || !email.trim()}
            >
              {isSubmitting ? "Saving..." : "Continue to Property Analysis"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeForm;
