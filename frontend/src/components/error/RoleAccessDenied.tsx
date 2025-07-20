"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserX, Home } from 'lucide-react';

interface RoleAccessDeniedProps {
  requiredRole: string;
  currentRole: string;
  actionText?: string;
  onAction?: () => void;
  showIcon?: boolean;
}

export function RoleAccessDenied({ 
  requiredRole,
  currentRole,
  actionText = "Go to Your Dashboard",
  onAction,
  showIcon = true
}: RoleAccessDeniedProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0 dark:border-0">
        <CardHeader className="text-center">
          {showIcon && (
            <div className="mx-auto mb-4">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <UserX className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          )}
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            This page is only accessible to <span className="font-semibold text-blue-600 dark:text-blue-400">{requiredRole}s</span>.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You are currently logged in as a <span className="font-semibold text-gray-700 dark:text-gray-300">{currentRole}</span>.
          </p>
          {onAction && (
            <Button 
              onClick={onAction}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              {actionText}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 