import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

interface AssessmentStatusBadgeProps {
  isSubmitted: boolean;
  isOverdue: boolean;
  className?: string;
}

export function AssessmentStatusBadge({ isSubmitted, isOverdue, className }: AssessmentStatusBadgeProps) {
  if (isSubmitted) {
    return (
      <Badge variant="default" className={className} aria-label="Assessment submitted">
        <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" /> Submitted
      </Badge>
    );
  }
  
  if (isOverdue) {
    return (
      <Badge variant="destructive" className={className} aria-label="Assessment overdue">
        <AlertCircle className="h-3 w-3 mr-1" aria-hidden="true" /> Overdue
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className={className} aria-label="Assessment pending">
      <Clock className="h-3 w-3 mr-1" aria-hidden="true" /> Pending
    </Badge>
  );
}