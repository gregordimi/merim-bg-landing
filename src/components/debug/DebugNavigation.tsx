/**
 * Debug Navigation Component
 * 
 * Quick navigation between dashboard and debug pages
 */

import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DebugNavigation() {
  const location = useLocation();
  
  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <Link to="/charts/dashboard">
        <Button 
          variant={location.pathname === "/charts/dashboard" ? "default" : "outline"}
          size="sm"
        >
          📊 Dashboard
        </Button>
      </Link>
      <Link to="/charts/list">
        <Button 
          variant={location.pathname === "/charts/list" ? "default" : "outline"}
          size="sm"
        >
          📋 Chart List
        </Button>
      </Link>
      <Link to="/charts/debug">
        <Button 
          variant={location.pathname === "/charts/debug" ? "default" : "outline"}
          size="sm"
        >
          🔧 Debug
          <Badge variant="secondary" className="ml-2">DEV</Badge>
        </Button>
      </Link>
    </div>
  );
}