import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Building2, Tag, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface Issue {
  id: string;
  title: string;
  description?: string;
  issue_type: string;
  status: string;
  priority: string | null;
  location_address?: string | null;
  created_at?: string;
  assigned_department?: string | null;
  assigned_zone?: string | null;
  file_url?: string | null;
}

interface IssueDetailCardProps {
  issue: Issue | null;
  onClose: () => void;
}

const getPriorityBadge = (priority: string | null) => {
  const priorityValue = priority || "Medium Priority";
  const priorityConfig: Record<string, { color: string; label: string; bgColor: string }> = {
    "Urgent": {
      color: "text-red-700 dark:text-red-400",
      label: "Urgent",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    "High Priority": {
      color: "text-orange-700 dark:text-orange-400",
      label: "High Priority",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    "Medium Priority": {
      color: "text-yellow-700 dark:text-yellow-400",
      label: "Medium Priority",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    "Low Priority": {
      color: "text-green-700 dark:text-green-400",
      label: "Low Priority",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
  };
  const config = priorityConfig[priorityValue] || {
    color: "text-gray-700 dark:text-gray-400",
    label: priorityValue,
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
  };
  return (
    <Badge className={`${config.bgColor} ${config.color} border-0 font-semibold`}>
      {config.label}
    </Badge>
  );
};

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    pending: { variant: "destructive", label: "Pending" },
    "in-progress": { variant: "default", label: "In Progress" },
    resolved: { variant: "secondary", label: "Resolved" },
    rejected: { variant: "outline", label: "Rejected" },
  };
  const config = statusConfig[status] || { variant: "outline", label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const IssueDetailCard = ({ issue, onClose }: IssueDetailCardProps) => {
  if (!issue) return null;

  const formattedDate = issue.created_at
    ? format(new Date(issue.created_at), "PPp")
    : "Date not available";

  return (
    <Card className="w-full max-w-md shadow-2xl border-2 bg-background">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl font-bold text-foreground pr-4">
            {issue.title}
          </CardTitle>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-md hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {getPriorityBadge(issue.priority)}
          {getStatusBadge(issue.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Issue Type */}
        <div className="flex items-start gap-3">
          <Tag className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Issue Type</p>
            <p className="text-sm text-foreground font-semibold">{issue.issue_type}</p>
          </div>
        </div>

        {/* Description */}
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {issue.description || "No description provided"}
            </p>
          </div>
        </div>

        {/* Location */}
        {issue.location_address && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="text-sm text-foreground">{issue.location_address}</p>
            </div>
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Reported On</p>
            <p className="text-sm text-foreground">{formattedDate}</p>
          </div>
        </div>

        {/* Assignment Info */}
        {(issue.assigned_department || issue.assigned_zone) && (
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
              <div className="space-y-1">
                {issue.assigned_zone && (
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Zone:</span> {issue.assigned_zone}
                  </p>
                )}
                {issue.assigned_department && (
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Department:</span> {issue.assigned_department}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* File Attachment */}
        {issue.file_url && (
          <div className="pt-2 border-t">
            <a
              href={issue.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-2"
            >
              <span>View Attachment</span>
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueDetailCard;

