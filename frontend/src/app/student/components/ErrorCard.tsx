"use client";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorCardProps {
  message: string;
  className?: string;
}

export function ErrorCard({ message, className }: ErrorCardProps) {
  return (
    <div className={`p-2 sm:p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full ${className || ''}`}>
      <Card className="rounded-2xl shadow">
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}