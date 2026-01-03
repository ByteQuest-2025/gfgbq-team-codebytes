import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Building2, Tag, X, AlertCircle, Download, Image as ImageIcon, FileText } from "lucide-react";
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
    <div className="relative">
      {/* Pointer/Arrow pointing to marker */}
      <div 
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderTop: "12px solid hsl(var(--border))",
        }}
      />
      <div 
        className="absolute -bottom-[1px] left-1/2 transform -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: "11px solid transparent",
          borderRight: "11px solid transparent",
          borderTop: "11px solid hsl(var(--background))",
        }}
      />
      <Card className="w-full shadow-2xl border-2 bg-background rounded-lg overflow-hidden">
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
            <p className="text-sm font-medium text-muted-foreground mb-2">Attachment</p>
            {(() => {
              const fileUrl = issue.file_url;
              const fileExtension = fileUrl.split('.').pop()?.toLowerCase();
              const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension || '');
              
              if (isImage) {
                return (
                  <div className="space-y-2">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={fileUrl}
                        alt="Issue attachment"
                        className="w-full rounded-lg border border-border max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onError={(e) => {
                          // Fallback if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                </svg>
                                <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">Download Attachment</a>
                              </div>
                            `;
                          }
                        }}
                      />
                    </a>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>View Full Image</span>
                    </a>
                  </div>
                );
              } else {
                return (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    {fileExtension === 'pdf' ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>Download {fileExtension?.toUpperCase() || 'Attachment'}</span>
                  </a>
                );
              }
            })()}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default IssueDetailCard;

