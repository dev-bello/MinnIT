import React from 'react';
import { Card, CardContent, CardHeader } from './card';
import { Button } from './button';
import { XIcon } from 'lucide-react';

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  zIndex,
  align = 'center'
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  const alignmentClasses = align === 'start'
    ? 'items-start sm:items-center pt-20 sm:pt-0'
    : 'items-center';

  return (
    <div
      className={`fixed inset-0 flex ${alignmentClasses} justify-center bg-black/40 backdrop-blur-sm transition-all duration-200 z-[999999]`}
      style={{ zIndex: zIndex || 999999 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in z-[999999]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full ${sizeClasses[size]} animate-slide-up z-[999999]`}>
        <Card className="glass-effect rounded-2xl shadow-soft border-0 max-h-[90vh] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <h3 className="text-xl font-bold font-display text-neutral-800">
              {title}
            </h3>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-neutral-100"
              >
                <XIcon className="w-4 h-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="overflow-y-auto">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 