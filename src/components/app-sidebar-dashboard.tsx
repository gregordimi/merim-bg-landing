/**
 * Dashboard Sidebar Component
 * 
 * Custom sidebar for the dashboard with chart navigation
 */

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChartRoute } from "@/pages/DashboardSidebarPage"
import * as Icons from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

interface AppSidebarDashboardProps {
  charts: ChartRoute[]
  currentChartId: string
}

// Helper to get Lucide icon component by name
function getLucideIcon(iconName: string) {
  const IconComponent = (Icons as any)[iconName] as React.ComponentType<any>;
  return IconComponent || Icons.FileQuestion;
}

export function AppSidebar({ charts, currentChartId }: AppSidebarDashboardProps) {
  const navigate = useNavigate()

  // Group charts by category
  const groupedCharts = React.useMemo(() => {
    const groups: Record<string, ChartRoute[]> = {}
    charts.forEach(chart => {
      if (!groups[chart.category]) {
        groups[chart.category] = []
      }
      groups[chart.category].push(chart)
    })
    return groups
  }, [charts])

  const handleChartClick = (chartId: string) => {
    navigate(`/dashboard/${chartId}`)
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard/stats">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-sm font-bold">AD</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Analytics Dashboard
                  </span>
                  <span className="truncate text-xs">Price Intelligence</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {Object.entries(groupedCharts).map(([category, categoryCharts]) => (
          <SidebarGroup key={category}>
            <SidebarGroupLabel>{category}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {categoryCharts.map((chart) => {
                  const IconComponent = getLucideIcon(chart.icon);
                  return (
                    <SidebarMenuItem key={chart.id}>
                      <SidebarMenuButton
                        onClick={() => handleChartClick(chart.id)}
                        isActive={currentChartId === chart.id}
                        tooltip={chart.description}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{chart.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              {/* <a href="/charts/dashboard">
                <Icons.LayoutGrid className="h-4 w-4" />
                <span>Old Dashboard</span>
              </a> */}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              {/* <a href="/charts/list">
                <Icons.List className="h-4 w-4" />
                <span>Chart List</span>
              </a> */}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
