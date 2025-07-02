import React from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { KeyIcon } from 'lucide-react';

export const ScanCodeView = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-effect rounded-2xl shadow-soft border-0">
        <CardHeader className="text-center">
          <KeyIcon className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 mx-auto mb-2" />
          <h2 className="text-xl sm:text-2xl font-bold font-display gradient-text mb-2">
            QR Code Scanning Disabled
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-center text-neutral-700 text-base sm:text-lg mb-4">
            Guards can now only verify visitors using OTP codes. Please use the OTP verification section to continue.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};