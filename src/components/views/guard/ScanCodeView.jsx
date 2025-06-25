import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { QrCodeIcon, ScanIcon, CheckCircleIcon, XCircleIcon, SearchIcon } from 'lucide-react';

export const ScanCodeView = () => {
  const [scannedCode, setScannedCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [recentScans, setRecentScans] = useState([
    { code: 'VIS001', name: 'Mike Johnson', time: '10:30 AM', status: 'success' },
    { code: 'VIS002', name: 'Sarah Wilson', time: '09:45 AM', status: 'failed' },
    { code: 'VIS003', name: 'David Chen', time: '09:15 AM', status: 'success' },
  ]);

  const handleScanCode = () => {
    // Simulate QR code scanning
    const mockCodes = ['VIS001', 'VIS002', 'VIS003'];
    const randomCode = mockCodes[Math.floor(Math.random() * mockCodes.length)];
    setScannedCode(randomCode);
    
    // Simulate verification
    setTimeout(() => {
      if (randomCode === 'VIS001') {
        const result = {
          success: true,
          message: 'Visitor verified successfully!',
          visitorInfo: {
            name: 'Mike Johnson',
            resident: 'John Resident (A-101)',
            purpose: 'Business Meeting',
            validUntil: '2024-01-15 18:30'
          }
        };
        setVerificationResult(result);
        
        // Add to recent scans
        setRecentScans(prev => [{
          code: randomCode,
          name: result.visitorInfo.name,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'success'
        }, ...prev.slice(0, 4)]);
      } else {
        const result = {
          success: false,
          message: 'Invalid or expired visitor code'
        };
        setVerificationResult(result);
        
        // Add to recent scans
        setRecentScans(prev => [{
          code: randomCode,
          name: 'Unknown',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'failed'
        }, ...prev.slice(0, 4)]);
      }
    }, 1500);
  };

  const handleManualEntry = (e) => {
    e.preventDefault();
    if (scannedCode.trim()) {
      // Simulate manual verification
      setTimeout(() => {
        if (scannedCode === 'VIS001') {
          const result = {
            success: true,
            message: 'Visitor verified successfully!',
            visitorInfo: {
              name: 'Mike Johnson',
              resident: 'John Resident (A-101)',
              purpose: 'Business Meeting',
              validUntil: '2024-01-15 18:30'
            }
          };
          setVerificationResult(result);
          
          // Add to recent scans
          setRecentScans(prev => [{
            code: scannedCode,
            name: result.visitorInfo.name,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'success'
          }, ...prev.slice(0, 4)]);
        } else {
          const result = {
            success: false,
            message: 'Invalid or expired visitor code'
          };
          setVerificationResult(result);
          
          // Add to recent scans
          setRecentScans(prev => [{
            code: scannedCode,
            name: 'Unknown',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'failed'
          }, ...prev.slice(0, 4)]);
        }
      }, 1000);
    }
  };

  const resetScan = () => {
    setScannedCode('');
    setVerificationResult(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl sm:text-2xl font-bold font-display gradient-text">
        Visitor Code Verification
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Scanner */}
        <Card className="glass-effect rounded-2xl shadow-soft border-0">
          <CardHeader>
            <h3 className="text-lg font-semibold text-neutral-800 font-display flex items-center gap-2">
              <QrCodeIcon className="w-5 h-5" />
              QR Code Scanner
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-neutral-100 p-6 sm:p-8 rounded-lg border-2 border-dashed border-neutral-300 text-center">
              <QrCodeIcon className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 mb-4 text-sm sm:text-base">Position QR code within the frame</p>
              <Button
                onClick={handleScanCode}
                className="button-primary mobile-full"
              >
                <ScanIcon className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card className="glass-effect rounded-2xl shadow-soft border-0">
          <CardHeader>
            <h3 className="text-lg font-semibold text-neutral-800 font-display">
              Manual Code Entry
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Visitor Code
                </label>
                <input
                  type="text"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value.toUpperCase())}
                  placeholder="Enter visitor code (e.g., VIS001)"
                  className="input-modern w-full font-mono text-center text-base sm:text-lg"
                />
              </div>
              <Button
                type="submit"
                className="button-primary mobile-full"
                disabled={!scannedCode.trim()}
              >
                Verify Code
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <Card className={`border-2 ${verificationResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'} animate-slide-down`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              {verificationResult.success ? (
                <CheckCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              ) : (
                <XCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              )}
              <h3 className={`text-base sm:text-lg font-semibold ${verificationResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {verificationResult.message}
              </h3>
            </div>

            {verificationResult.success && verificationResult.visitorInfo && (
              <div className="bg-white p-3 sm:p-4 rounded-lg border mb-4">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Visitor Information:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <p className="text-gray-800">{verificationResult.visitorInfo.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Visiting:</span>
                    <p className="text-gray-800">{verificationResult.visitorInfo.resident}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Purpose:</span>
                    <p className="text-gray-800">{verificationResult.visitorInfo.purpose}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Valid Until:</span>
                    <p className="text-gray-800">{verificationResult.visitorInfo.validUntil}</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={resetScan}
              className="button-primary mobile-full"
            >
              Scan Another Code
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Scans */}
      <Card className="glass-effect rounded-2xl shadow-soft border-0">
        <CardHeader>
          <h3 className="text-lg font-semibold text-neutral-800 font-display">
            Recent Scans
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentScans.map((scan, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    scan.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <div>
                    <p className="text-neutral-800 font-medium text-sm">{scan.code}</p>
                    <p className="text-neutral-600 text-xs">{scan.name}</p>
                  </div>
                </div>
                <div className="text-neutral-600 text-xs sm:text-sm">{scan.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="glass-effect rounded-2xl shadow-soft border-0">
        <CardHeader>
          <h3 className="text-lg font-semibold text-neutral-800 font-display">
            Instructions
          </h3>
        </CardHeader>
        <CardContent>
          <ul className="text-neutral-600 space-y-2 text-xs sm:text-sm">
            <li>• Use the QR scanner to scan visitor codes from mobile devices</li>
            <li>• Alternatively, manually enter the visitor code if scanning is not possible</li>
            <li>• Valid codes will show visitor information and visiting details</li>
            <li>• Invalid or expired codes will be rejected</li>
            <li>• Contact the resident if there are any verification issues</li>
            <li>• For demo purposes, use code: <strong className="text-primary-600">VIS001</strong></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};