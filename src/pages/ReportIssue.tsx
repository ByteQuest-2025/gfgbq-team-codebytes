import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, X, FileText, Image, File, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { assignPriority } from "@/lib/priorityMapper";
import { checkForDuplicates } from "@/lib/duplicateDetector";

const issueTypes = [
  "Road & Infrastructure",
  "Utilities",
  "Sanitation",
  "Public Safety",
  "Parks & Recreation",
  "Noise Complaint",
  "Environmental",
  "Other",
];

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
}

const ReportIssue = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    issueType: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    address: null,
  });

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsFetchingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation((prev) => ({ ...prev, latitude, longitude }));

        // Try to get address using reverse geocoding (optional)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data.display_name) {
            setLocation((prev) => ({ ...prev, address: data.display_name }));
          }
        } catch (error) {
          console.log("Could not fetch address:", error);
        }

        setIsFetchingLocation(false);
        toast.success("Location fetched successfully");
      },
      (error) => {
        setIsFetchingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location permission denied. Please enable location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out.");
            break;
          default:
            toast.error("An error occurred while fetching location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    // Auto-fetch location on component mount
    fetchCurrentLocation();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const validFiles = newFiles.filter((file) => {
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!validTypes.includes(file.type)) {
          toast.error(`${file.name} is not a supported file type`);
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          return false;
        }
        return true;
      });

      setUploadedFiles((prev) => [...prev, ...validFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="w-4 h-4 text-primary" />;
    }
    if (file.type === "application/pdf") {
      return <FileText className="w-4 h-4 text-red-500" />;
    }
    return <File className="w-4 h-4 text-muted-foreground" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to submit an issue");
      navigate("/auth/public");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a title for your issue");
      return;
    }
    if (!formData.issueType) {
      toast.error("Please select an issue type");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please provide a description of the issue");
      return;
    }

    setIsSubmitting(true);

    try {
      let fileUrl: string | null = null;

      // Upload file if present
      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('issue-attachments')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('Failed to upload attachment');
        } else {
          const { data: urlData } = supabase.storage
            .from('issue-attachments')
            .getPublicUrl(fileName);
          fileUrl = urlData.publicUrl;
        }
      }

      // Prepare issue data
      const issueData: any = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        issue_type: formData.issueType,
        file_url: fileUrl,
        latitude: location.latitude,
        longitude: location.longitude,
        location_address: location.address,
      };

      // Duplicate Detection: Check for similar issues at the same location
      if (location.latitude && location.longitude && formData.issueType) {
        const duplicateCheck = await checkForDuplicates(
          formData.issueType,
          location.latitude,
          location.longitude
        );

        if (duplicateCheck.isDuplicate && duplicateCheck.duplicateIssues.length > 0) {
          const closestDuplicate = duplicateCheck.duplicateIssues[0];
          const duplicateMessage = `Duplicate detected: A similar "${formData.issueType}" issue was reported ${closestDuplicate.distance}m away. Status: ${closestDuplicate.status}. Do you want to proceed anyway?`;
          
          // Show warning but allow user to proceed
          toast.warning("Possible Duplicate Issue", {
            description: duplicateMessage,
            duration: 5000,
          });
          
          console.warn("Duplicate detected:", duplicateCheck);
        }
      }

      // Assign priority based on issue type (deterministic mapping)
      // Priority is assigned strictly based on the selected issue type
      if (formData.issueType) {
        const priority = assignPriority(formData.issueType);
        issueData.priority = priority;
        console.log(`Priority assigned: ${formData.issueType} → ${priority}`);
      } else {
        // If no issue type selected, default to Low Priority
        issueData.priority = "Low Priority";
      }

      // Insert issue into database
      let { error } = await supabase.from('issues').insert(issueData);

      // If insert failed and it might be due to missing priority column, retry without it
      if (error && (error.message?.includes('column') || error.message?.includes('does not exist'))) {
        console.warn('Retrying insert without priority field (migration may not be applied)');
        const { priority, ...issueDataWithoutPriority } = issueData;
        const retryResult = await supabase.from('issues').insert(issueDataWithoutPriority);
        error = retryResult.error;
      }

      if (error) {
        console.error('Insert error:', error);
        // Show more detailed error message
        const errorMessage = error.message || 'Failed to submit issue. Please try again.';
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }

      toast.success("Issue reported successfully!", {
        description: "We'll review your report and get back to you soon.",
      });

      navigate("/auth/public/dashboard");
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/auth/public/dashboard")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Report an Issue</h1>
            <p className="text-xs text-muted-foreground">
              Submit a new issue to the civic authority
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Issue Details</CardTitle>
            <CardDescription>
              Provide as much detail as possible to help us address your concern
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Brief title describing the issue"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="bg-background border-border"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Issue Type */}
              <div className="space-y-2">
                <Label htmlFor="issueType" className="text-foreground">
                  Issue Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.issueType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, issueType: value }))
                  }
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {issueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide a detailed description of the issue, including location and any relevant details..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="bg-background border-border min-h-[150px] resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-foreground">Location</Label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 rounded-lg bg-accent/50 border border-border">
                    {location.latitude && location.longitude ? (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                          </p>
                          {location.address && (
                            <p className="text-xs text-muted-foreground truncate">
                              {location.address}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No location data</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={fetchCurrentLocation}
                    disabled={isFetchingLocation}
                    className="flex-shrink-0"
                  >
                    {isFetchingLocation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click the button to refresh your current location
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label className="text-foreground">Attachments (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Click to upload files
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Images, PDF, DOC up to 10MB (max 5 files)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border"
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(file)}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/auth/public/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReportIssue;
