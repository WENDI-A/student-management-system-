"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  showIcon?: boolean;
}

export function AccessDenied({ 
  title = "Access Denied",
  message = "You don't have permission to access this page.",
  actionText = "Go Back",
  onAction,
  showIcon = true
}: AccessDeniedProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0 dark:border-0">
        <CardHeader className="text-center">
          {showIcon && (
            <div className="mx-auto mb-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          )}
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>
          {onAction && (
            <Button 
              onClick={onAction}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {actionText}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 