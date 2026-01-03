import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, Filter, UserPlus, RefreshCw, Building2 } from "lucide-react";
import { useState } from "react";
import AssignmentDialog from "./AssignmentDialog";

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
  assigned_department: string | null;
  assigned_zone: string | null;
  assigned_at: string | null;
}

interface ReportsListProps {
  issues: Issue[];
  onUpdateStatus: (id: string, status: string) => void;
  onAssign: (issueId: string, department: string, zone: string, notes: string) => Promise<void>;
}

const DEPARTMENT_LABELS: Record<string, string> = {
  roads: "Roads & Infrastructure",
  water: "Water & Sewerage",
  electricity: "Electricity",
  sanitation: "Sanitation & Waste",
  parks: "Parks & Recreation",
  drainage: "Storm Drainage",
  traffic: "Traffic Management",
  general: "General Services",
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

const ReportsList = ({ issues, onUpdateStatus, onAssign }: ReportsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || issue.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleOpenAssign = (issue: Issue) => {
    setSelectedIssue(issue);
    setAssignDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Reports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No reports found
            </CardContent>
          </Card>
        ) : (
          filteredIssues.map((issue) => (
            <Card key={issue.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary hover:underline cursor-pointer">
                      {issue.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Report ID: #{issue.id.slice(0, 8)} • {issue.issue_type.replace("_", " ")}
                    </p>
                    {issue.location_address && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {issue.location_address}
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Reported</p>
                        <p className="font-medium">
                          {new Date(issue.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Department</p>
                        <p className="font-medium flex items-center gap-1">
                          {issue.assigned_department ? (
                            <>
                              <Building2 className="w-3 h-3 text-primary" />
                              {DEPARTMENT_LABELS[issue.assigned_department] || issue.assigned_department}
                            </>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Assigned On</p>
                        <p className="font-medium">
                          {issue.assigned_at 
                            ? new Date(issue.assigned_at).toLocaleDateString()
                            : "—"
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Issue Type</p>
                        <p className="font-medium capitalize">{issue.issue_type.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {getStatusBadge(issue.status)}
                      {getPriorityBadge(issue.priority)}
                      {issue.assigned_department && (
                        <Badge variant="outline" className="bg-primary/5">
                          Assigned
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" className="gap-1" onClick={() => handleOpenAssign(issue)}>
                      <UserPlus className="w-3 h-3" />
                      {issue.assigned_department ? "Reassign" : "Assign"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => onUpdateStatus(issue.id, issue.status === "pending" ? "in-progress" : "resolved")}
                    >
                      <RefreshCw className="w-3 h-3" />
                      Update Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedIssue && (
        <AssignmentDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          issueId={selectedIssue.id}
          issueTitle={selectedIssue.title}
          latitude={selectedIssue.latitude}
          longitude={selectedIssue.longitude}
          currentDepartment={selectedIssue.assigned_department}
          currentZone={selectedIssue.assigned_zone}
          onAssign={onAssign}
        />
      )}
    </div>
  );
};

export default ReportsList;
