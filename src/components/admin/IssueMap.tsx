/**
 * OpenStreetMap Component for Displaying Civic Issues
 * 
 * Displays issues as markers on an interactive map with priority-based coloring
 */

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import IssueDetailCard from "./IssueDetailCard";

interface Issue {
  id: string;
  title: string;
  description?: string;
  issue_type: string;
  status: string;
  priority: string | null;
  latitude: number | null;
  longitude: number | null;
  location_address?: string | null;
  created_at?: string;
  assigned_department?: string | null;
  assigned_zone?: string | null;
  file_url?: string | null;
}

interface IssueMapProps {
  issues: Issue[];
  height?: string;
}

// Fix for default marker icons in Leaflet with Vite
// This is done lazily to avoid issues during module load
let iconFixApplied = false;
function applyLeafletIconFix() {
  if (iconFixApplied || typeof window === "undefined") return;
  try {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
    iconFixApplied = true;
  } catch (err) {
    console.error("Error applying Leaflet icon fix:", err);
  }
}

/**
 * Get marker color based on priority
 */
function getPriorityColor(priority: string | null): string {
  const priorityValue = priority || "Medium Priority";
  
  switch (priorityValue) {
    case "Urgent":
      return "#ef4444"; // red
    case "High Priority":
      return "#f97316"; // orange
    case "Medium Priority":
      return "#eab308"; // yellow
    case "Low Priority":
      return "#22c55e"; // green
    default:
      return "#6b7280"; // gray
  }
}

/**
 * Create custom colored marker icon
 */
function createCustomIcon(color: string): L.Icon {
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
        <path fill="${color}" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.5 12.5 28.5 12.5 28.5S25 21 25 12.5C25 5.6 19.4 0 12.5 0z"/>
        <circle cx="12.5" cy="12.5" r="5" fill="#fff"/>
      </svg>
    `)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
}

const IssueMap = ({ issues, height = "500px" }: IssueMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [cardPosition, setCardPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Wait for DOM to be ready
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    try {
      // Apply Leaflet icon fix
      applyLeafletIconFix();

      // Filter issues with valid coordinates
      const issuesWithLocation = issues.filter(
        (issue) => issue.latitude !== null && issue.longitude !== null && 
                   !isNaN(issue.latitude) && !isNaN(issue.longitude) &&
                   issue.latitude >= -90 && issue.latitude <= 90 &&
                   issue.longitude >= -180 && issue.longitude <= 180
      );

      if (issuesWithLocation.length === 0) {
        // If no issues with location, center on a default location (Chennai)
        if (!mapRef.current && mapContainerRef.current) {
          try {
            mapRef.current = L.map(mapContainerRef.current).setView([13.0827, 80.2707], 12);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19,
            }).addTo(mapRef.current);
            setMapError(null);
          } catch (err) {
            console.error("Error initializing map:", err);
            setMapError("Failed to initialize map");
          }
        }
        return;
      }

      // Initialize map if not already created
      if (!mapRef.current && mapContainerRef.current) {
        try {
          // Calculate center from issues
          const avgLat =
            issuesWithLocation.reduce((sum, issue) => sum + (issue.latitude || 0), 0) /
            issuesWithLocation.length;
          const avgLon =
            issuesWithLocation.reduce((sum, issue) => sum + (issue.longitude || 0), 0) /
            issuesWithLocation.length;

          mapRef.current = L.map(mapContainerRef.current).setView([avgLat, avgLon], 13);

          // Add OpenStreetMap tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(mapRef.current);
          setMapError(null);
        } catch (err) {
          console.error("Error initializing map:", err);
          setMapError("Failed to initialize map");
          return;
        }
      }

      // Clear existing markers
      markersRef.current.forEach((marker) => {
        try {
          mapRef.current?.removeLayer(marker);
        } catch (err) {
          console.error("Error removing marker:", err);
        }
      });
      markersRef.current = [];

      // Add markers for each issue
      issuesWithLocation.forEach((issue) => {
        if (issue.latitude && issue.longitude && mapRef.current) {
          try {
            const priorityColor = getPriorityColor(issue.priority);
            const customIcon = createCustomIcon(priorityColor);

            const marker = L.marker([issue.latitude, issue.longitude], {
              icon: customIcon,
            }).addTo(mapRef.current);

            // Create popup content
            const descriptionText = issue.description || "No description available";
            const truncatedDescription = descriptionText.length > 100 
              ? descriptionText.substring(0, 100) + "..." 
              : descriptionText;
            
            const popupContent = `
              <div style="min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">${L.Util.escapeHtml(issue.title)}</h3>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${L.Util.escapeHtml(issue.issue_type)}</p>
                <p style="margin: 0 0 4px 0; font-size: 11px; color: #888;">${L.Util.escapeHtml(truncatedDescription)}</p>
                <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
                  <span style="padding: 2px 8px; background: ${priorityColor}; color: white; border-radius: 4px; font-size: 10px; font-weight: 500;">
                    ${issue.priority || "Medium Priority"}
                  </span>
                  <span style="padding: 2px 8px; background: #e5e7eb; color: #374151; border-radius: 4px; font-size: 10px;">
                    ${issue.status}
                  </span>
                </div>
                ${issue.location_address ? `<p style="margin: 8px 0 0 0; font-size: 11px; color: #666;">📍 ${L.Util.escapeHtml(issue.location_address)}</p>` : ""}
              </div>
            `;

            // Store issue data with marker for click handling
            (marker as any).issueData = issue;
            
            // Bind popup for quick preview on hover
            marker.bindPopup(popupContent, { 
              autoClose: true, 
              closeOnClick: true,
              closeButton: true
            });
            
            // Add click event to show detailed card on map (Google Maps style)
            marker.on("click", (e) => {
              if (e.originalEvent && mapRef.current) {
                e.originalEvent.stopPropagation();
                e.originalEvent.preventDefault();
                
                // Close popup if open
                marker.closePopup();
                
                // Get marker's screen position
                const markerPoint = mapRef.current.latLngToContainerPoint([issue.latitude!, issue.longitude!]);
                
                // Calculate card position (above the marker, centered)
                const cardWidth = 400; // Approximate card width
                const cardHeight = 300; // Approximate card height
                const x = markerPoint.x - cardWidth / 2;
                const y = markerPoint.y - cardHeight - 50; // Position above marker
                
                // Ensure card stays within map bounds
                const mapBounds = mapContainerRef.current?.getBoundingClientRect();
                if (mapBounds) {
                  const adjustedX = Math.max(10, Math.min(x, mapBounds.width - cardWidth - 10));
                  const adjustedY = Math.max(10, Math.min(y, mapBounds.height - cardHeight - 10));
                  
                  setCardPosition({ x: adjustedX, y: adjustedY });
                  setSelectedIssue(issue);
                }
              }
            });
            
            markersRef.current.push(marker);
          } catch (err) {
            console.error("Error adding marker:", err);
          }
        }
      });

      // Fit map to show all markers
      if (markersRef.current.length > 0 && mapRef.current) {
        try {
          const group = new L.FeatureGroup(markersRef.current);
          mapRef.current.fitBounds(group.getBounds().pad(0.1));
        } catch (err) {
          console.error("Error fitting bounds:", err);
        }
      }

      // Close card when clicking on map (not on marker) or when map moves
      if (mapRef.current) {
        mapRef.current.off("click"); // Remove any existing handlers
        mapRef.current.off("move"); // Remove any existing move handlers
        
        mapRef.current.on("click", (e) => {
          // Only close if clicking directly on the map, not on a marker or card
          const target = e.originalEvent?.target as HTMLElement;
          if (target && 
              !target.closest(".leaflet-marker-icon") && 
              !target.closest(".issue-detail-card")) {
            setSelectedIssue(null);
            setCardPosition(null);
          }
        });
        
        // Update card position when map moves/zooms
        mapRef.current.on("move", () => {
          if (selectedIssue && selectedIssue.latitude && selectedIssue.longitude && mapRef.current) {
            const markerPoint = mapRef.current.latLngToContainerPoint([
              selectedIssue.latitude,
              selectedIssue.longitude
            ]);
            const cardWidth = 400;
            const cardHeight = 300;
            const x = markerPoint.x - cardWidth / 2;
            const y = markerPoint.y - cardHeight - 50;
            
            const mapBounds = mapContainerRef.current?.getBoundingClientRect();
            if (mapBounds) {
              const adjustedX = Math.max(10, Math.min(x, mapBounds.width - cardWidth - 10));
              const adjustedY = Math.max(10, Math.min(y, mapBounds.height - cardHeight - 10));
              setCardPosition({ x: adjustedX, y: adjustedY });
            }
          }
        });
      }
    } catch (err) {
      console.error("Error in map effect:", err);
      setMapError("Failed to load map");
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.off("click");
          mapRef.current.off("move");
          mapRef.current.remove();
        } catch (err) {
          console.error("Error cleaning up map:", err);
        }
        mapRef.current = null;
      }
      setSelectedIssue(null);
      setCardPosition(null);
    };
  }, [issues, selectedIssue]);

  if (mapError) {
    return (
      <div
        style={{
          height,
          width: "100%",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid hsl(var(--border))",
          backgroundColor: "hsl(var(--muted))",
        }}
      >
        <p className="text-muted-foreground">{mapError}</p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height, width: "100%" }}>
      <div
        ref={mapContainerRef}
        style={{
          height,
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid hsl(var(--border))",
        }}
      />
      {/* Detailed Issue Card Overlay - Google Maps Style */}
      {selectedIssue && cardPosition && (
        <div 
          className="absolute z-[1000] issue-detail-card"
          style={{
            left: `${cardPosition.x}px`,
            top: `${cardPosition.y}px`,
            maxWidth: "400px",
            width: "90vw",
            maxHeight: "70vh",
            pointerEvents: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <IssueDetailCard
            issue={selectedIssue}
            onClose={() => {
              setSelectedIssue(null);
              setCardPosition(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default IssueMap;

