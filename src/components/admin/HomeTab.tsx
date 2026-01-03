import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import MetricsCard from "./MetricsCard";
import IssueMap from "./IssueMap";
import ErrorBoundary from "./ErrorBoundary";

interface Issue {
  id: string;
  title: string;
  description?: string;
  status: string;
  issue_type: string;
  priority: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_address?: string | null;
  assigned_zone?: string | null;
  assigned_department?: string | null;
  created_at?: string;
  file_url?: string | null;
}

interface HomeTabProps {
  issues: Issue[];
}

const HomeTab = ({ issues }: HomeTabProps) => {
  const totalReports = issues.length;
  const resolvedCount = issues.filter(i => i.status === "resolved").length;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;
  const urgentIssues = issues.filter(i => 
    i.priority === "Urgent"
  ).length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Community Performance Metrics
        </h1>
        <p className="text-muted-foreground">
          Real-time insights into civic issue resolution and community engagement.
        </p>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 divide-x divide-border">
            <MetricsCard
              title="Reports This Month"
              value={totalReports}
              icon={FileText}
              iconColor="text-primary"
            />
            <MetricsCard
              title="Resolution Rate"
              value={`${resolutionRate}%`}
              icon={CheckCircle}
              iconColor="text-green-500"
            />
            <MetricsCard
              title="Avg Response Time"
              value="2.1d"
              icon={Clock}
              iconColor="text-blue-500"
            />
            <MetricsCard
              title="Urgent Issues"
              value={urgentIssues}
              icon={AlertTriangle}
              iconColor="text-red-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Map Section Placeholder */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Live Issue Map</h2>
        <p className="text-muted-foreground mb-4">
          Explore reported civic issues in your area. Click on any marker to view detailed information about the issue.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <CardTitle className="text-sm font-medium">Interactive Issue Tracker</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ErrorBoundary
            fallback={
              <div className="h-[500px] bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Map failed to load. Please refresh the page.</p>
              </div>
            }
          >
            <IssueMap issues={issues} height="500px" />
          </ErrorBoundary>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex justify-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-sm text-muted-foreground">Urgent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full" />
          <span className="text-sm text-muted-foreground">High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span className="text-sm text-muted-foreground">Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-sm text-muted-foreground">Low Priority</span>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
