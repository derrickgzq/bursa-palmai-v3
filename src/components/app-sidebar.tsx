"use client"

import * as React from "react"
import {
  BarChart3,
  Building2,
  TrendingUp,
  Globe,
  ArrowLeftRight,
  Palmtree,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "@/components/sidebar-header-brand"

const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Bursa PalmAI",
      logo: "src/assets/images/favicon.png",
      tagline: "The AI and data science powered Palm Oil Intelligence Hub",
    },
  ],
  navMain: [
    {
      title: "Market Overview",
      url: "#",
      icon: BarChart3,
      isActive: true,
      items: [
        { title: "Market Cap", url: "#" },
        { title: "Index Chart", url: "#" },
        { title: "Stock Prices", url: "#" },
        { title: "News Section", url: "#" },
      ],
    },
    {
      title: "Company Profiles",
      url: "#",
      icon: Building2,
      items: [
        { title: "Company Summary", url: "#" },
        { title: "Quarterly Earnings", url: "#" },
        { title: "Company Figures", url: "#" },
        { title: "In-depth Analysis", url: "#" },
      ],
    },
    {
      title: "Commodity Trends",
      url: "#",
      icon: TrendingUp,
      items: [{ title: "Introduction", url: "#" }],
    },
    {
      title: "Geography Insights",
      url: "#",
      icon: Globe,
      items: [
        { title: "Map View", url: "#" },
        { title: "Weather Summary", url: "#" },
        { title: "Aqueduct Risk", url: "#" },
      ],
    },
    {
      title: "Global Trades",
      url: "#",
      icon: ArrowLeftRight,
      items: [
        { title: "Network Graph", url: "#" },
        { title: "Export & Imports", url: "#" },
      ],
    },
  ],
}

export function AppSidebar({ setActiveTab, activeTab, ...props }: React.ComponentProps<typeof Sidebar> & {
  setActiveTab: (tab: string) => void
  activeTab: string
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* pass both props */}
        <NavMain items={data.navMain} setActiveTab={setActiveTab} activeTab={activeTab} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

