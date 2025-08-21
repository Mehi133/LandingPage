
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, User } from "lucide-react";

interface UserTypeSelectorProps {
  onSelectUserType: (userType: 'buyer' | 'seller') => void;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ onSelectUserType }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Valora</h1>
        <p className="text-lg text-secondary-foreground">How are you planning to use our valuation tool?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelectUserType('buyer')}>
          <CardContent className="p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <User className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">I'm a Buyer</h3>
            <p className="text-secondary-foreground mb-4">
              Get instant property valuations and market analysis to make informed buying decisions.
            </p>
            <Button className="w-full" onClick={() => onSelectUserType('buyer')}>
              Continue as Buyer
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelectUserType('seller')}>
          <CardContent className="p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Home className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">I'm a Seller</h3>
            <p className="text-secondary-foreground mb-4">
              Upload property photos and get detailed pricing strategies to maximize your sale.
            </p>
            <Button className="w-full" onClick={() => onSelectUserType('seller')}>
              Continue as Seller
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserTypeSelector;
