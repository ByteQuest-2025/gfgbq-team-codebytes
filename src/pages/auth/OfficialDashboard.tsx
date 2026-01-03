import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";
import HomeTab from "@/components/admin/HomeTab";
import DashboardTab from "@/components/admin/DashboardTab";
import ReportsList from "@/components/admin/ReportsList";
import DepartmentsTab from "@/components/admin/DepartmentsTab";

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
  assigned_to: string | null;
  assigned_department: string | null;
  assigned_zone: string | null;
  assigned_at: string | null;
}

const OfficialDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userZone, setUserZone] = useState<string | null>(null);
  const [userDepartment, setUserDepartment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeView, setActiveView] = useState("home");
  const [adminTab, setAdminTab] = useState("dashboard");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth/official");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        // Fetch role, zone, and department
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role, zone, department")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (roleData) {
          setUserRole(roleData.role);
          setUserZone(roleData.zone);
          setUserDepartment(roleData.department);
        }

        // Fetch issues - filter based on role
        let query = supabase
          .from("issues")
          .select("*")
          .order("created_at", { ascending: false });

        // If zone officer or field officer, filter by their assigned zone and department
        if (roleData && (roleData.role === "zone_officer" || roleData.role === "field_officer")) {
          if (roleData.zone) {
            query = query.eq("assigned_zone", roleData.zone);
          }
          if (roleData.department) {
            query = query.eq("assigned_department", roleData.department);
          }
        }
        
        const { data: issuesData, error } = await query;
        
        if (error) {
          console.error("Error fetching issues:", error);
          toast.error("Failed to load issues");
        } else {
          setIssues(issuesData || []);
        }
        
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("issues")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to update status");
    } else {
      setIssues(prev => prev.map(issue => 
        issue.id === id ? { ...issue, status: newStatus } : issue
      ));
      toast.success("Status updated successfully");
    }
  };

  const handleAssign = async (issueId: string, department: string, zone: string, notes: string) => {
    const now = new Date().toISOString();
    
    // Update issue with assignment including zone
    const { error: updateError } = await supabase
      .from("issues")
      .update({ 
        assigned_department: department,
        assigned_zone: zone,
        assigned_at: now,
        status: "in-progress"
      })
      .eq("id", issueId);
    
    if (updateError) {
      console.error("Assignment error:", updateError);
      toast.error("Failed to assign issue");
      return;
    }

    // Log assignment history
    await supabase.from("issue_assignments").insert({
      issue_id: issueId,
      assigned_by: user!.id,
      department,
      notes: notes || null,
    });

    // Update local state
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { ...issue, assigned_department: department, assigned_zone: zone, assigned_at: now, status: "in-progress" } 
        : issue
    ));
    
    toast.success(`Issue assigned to ${zone} → ${department}`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <AdminHeader
        userRole={userRole}
        activeTab={activeView}
        onTabChange={setActiveView}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-6">
        {activeView === "home" && <HomeTab issues={issues} />}
        
        {activeView === "dashboard" && <DashboardTab issues={issues} />}
        
        {activeView === "admin" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Municipal Admin Portal</h1>
              <p className="text-muted-foreground">
                Manage civic issue reports, assign tasks, and track departmental performance.
              </p>
            </div>

            <Tabs value={adminTab} onValueChange={setAdminTab}>
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-6">
                <DashboardTab issues={issues} />
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <ReportsList issues={issues} onUpdateStatus={handleUpdateStatus} onAssign={handleAssign} />
              </TabsContent>

              <TabsContent value="departments" className="mt-6">
                <DepartmentsTab />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-foreground mb-3">CivicFix</h3>
            <p className="text-sm text-muted-foreground">
              Empowering communities to report, track, and resolve civic issues efficiently.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>How It Works</li>
              <li>Report Issue</li>
              <li>Dashboard</li>
              <li>Admin Portal</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>API Documentation</li>
              <li>Status Page</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
              <li>Accessibility</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground">
          © 2024 CivicFix. All rights reserved. Built for better communities.
        </div>
      </footer>
    </div>
  );
};

export default OfficialDashboard;
