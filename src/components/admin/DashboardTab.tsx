import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, TrendingUp, FileText } from "lucide-react";
import MetricsCard from "./MetricsCard";

interface Issue {
  id: string;
  title: string;
  description: string;
  issue_type: string;
  status: string;
  priority: string | null;
  location_address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  assigned_zone: string | null;
  assigned_department: string | null;
}

interface DashboardTabProps {
  issues: Issue[];
}

const DashboardTab = ({ issues }: DashboardTabProps) => {
  const activeReports = issues.filter(i => i.status !== "resolved").length;
  const resolvedToday = issues.filter(i => {
    const today = new Date().toDateString();
    return i.status === "resolved" && new Date(i.created_at).toDateString() === today;
  }).length;
  const totalResolved = issues.filter(i => i.status === "resolved").length;
  const resolutionRate = issues.length > 0 ? Math.round((totalResolved / issues.length) * 100) : 0;

  const recentReports = issues.slice(0, 3);

  const departments = [
    { name: "Public Works", avgTime: "2.2d", active: 12, resolved: 45 },
    { name: "Parks & Recreation", avgTime: "2.8d", active: 8, resolved: 32 },
    { name: "Sanitation", avgTime: "1.9d", active: 15, resolved: 67 },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "destructive", label: "Pending" },
      "in-progress": { variant: "default", label: "In Progress" },
      resolved: { variant: "secondary", label: "Resolved" },
      rejected: { variant: "outline", label: "Rejected" },
    };
    const c = config[status] || { variant: "outline", label: status };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const getPriorityBadge = (priority: string | null) => {
    // Use actual priority from database, fallback to Medium if not set
    const priorityValue = priority || "Medium Priority";
    
    // Map priority levels to badge colors and labels
    const priorityConfig: Record<string, { color: string; label: string }> = {
      "Urgent": { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "Urgent" },
      "High Priority": { color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", label: "High" },
      "Medium Priority": { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Medium" },
      "Low Priority": { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", label: "Low" },
    };
    
    const config = priorityConfig[priorityValue] || { color: "bg-gray-100 text-gray-700", label: "Medium" };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-4 divide-x divide-border">
            <MetricsCard
              title="Active Reports"
              value={activeReports}
              icon={AlertTriangle}
              iconColor="text-orange-500"
              trend="+12% from last week"
            />
            <MetricsCard
              title="Resolved Today"
              value={resolvedToday}
              icon={CheckCircle}
              iconColor="text-green-500"
              trend="+5 from yesterday"
            />
            <MetricsCard
              title="Avg Response"
              value="2.3d"
              icon={Clock}
              iconColor="text-blue-500"
              trend="-0.5d improvement"
            />
            <MetricsCard
              title="Satisfaction"
              value={`${resolutionRate}%`}
              icon={TrendingUp}
              iconColor="text-primary"
              trend="+2% this month"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports & Department Performance */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentReports.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No reports yet</p>
            ) : (
              recentReports.map((report) => (
                <div key={report.id} className="flex items-start justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{report.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.location_address || report.issue_type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getPriorityBadge(report.priority)}
                    {getStatusBadge(report.status)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {departments.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-medium text-sm">{dept.name}</p>
                  <p className="text-xs text-muted-foreground">Avg: {dept.avgTime}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">{dept.active} active</p>
                  <p className="text-xs text-muted-foreground">{dept.resolved} resolved</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardTab;
