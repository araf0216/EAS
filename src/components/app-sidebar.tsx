"use client"

import { Table, Building2, FileChartPie, FilePlus } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  activeView: string
  setActiveView: (view: string) => void
}

const menuItems = [
  {
    id: "new-invoice",
    title: "New Invoice",
    icon: FilePlus,
    description: "Create new invoices",
  },
  {
    id: "allocations",
    title: "Invoice Warehouse",
    icon: Table,
    description: "View invoice warehouse",
  },
  {
    id: "fund-allocations",
    title: "Fund Allocations",
    icon: Building2,
    description: "Manage fund AUM values",
  },
  {
    id: "deal-allocations",
    title: "Deal Allocations",
    icon: FileChartPie,
    description: "Deal-specific fund AUMs",
  }
]

export function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
  return (
    <Sidebar className="dark">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold text-primary">Mountain EAS</span>
            <span className="text-s text-foreground/70">Allocation Tracker</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    size="lg"
                    onClick={() => setActiveView(item.id)}
                    isActive={activeView === item.id}
                    className="w-full justify-start"
                  >
                    <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-sidebar-foreground text-sidebar-accent">
                      <item.icon className="size-5" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-s font-semibold text-primary">{item.title}</span>
                      <span className="text-s text-foreground/70">{item.description}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
