import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { AuroraText } from "@/components/ui/aurora-text"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { StockCarousel } from "@/components/stock-carousel"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { SectionCards } from "@/components/section-cards"
import { CompanyTreemapCard } from "@/components/market-cap"
import { IndexChart } from "@/components/index-chart"
import { NewsCards } from "@/components/news-card"
import { CompanyProfile } from "@/components/company-profile"
import { GeographyMap } from "@/components/geography-map";
import { CommodityTrend } from "@/components/commodity-trend";
import "leaflet/dist/leaflet.css";
import { useState } from "react"

export default function Page() {
  const navMain = [
    { title: "Market Overview", isActive: true },
    { title: "Company Profiles", isActive: false },
    { title: "Commodity Trends", isActive: false },
    { title: "Geography Insights", isActive: false },
    { title: "Global Trades", isActive: false },
  ];
  // Find the default active tab (first with isActive: true)
  const defaultTab = navMain.find(item => item.isActive) || navMain[0];
  const [activeTab, setActiveTab] = useState(defaultTab.title);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider>
        {/* Pass the setter to AppSidebar */}
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Bursa PalmAI</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{activeTab}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-4">
              <ModeToggle />
            </div>
          </header>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {activeTab === "Market Overview" && (
              <>
                {/* Header section: image + title + tagline */}
                <div className="flex flex-col items-center justify-center text-center gap-2 mb-6">
                  {/* Row: Logo + Title */}
                  <div className="flex items-center justify-center gap-3">
                    <img
                      src="src/assets/images/favicon.png"
                      alt="Bursa PalmAI Logo"
                      className="w-14 h-14 md:w-16 md:h-16 rounded-lg object-contain"
                    />
                    <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight">
                      Bursa PalmAI
                    </h1>
                  </div>

                  {/* Tagline */}
                  <AuroraText className="text-base md:text-2xl mt-2 font-bold">
                    The AI and Data Science Powered Palm Oil Intelligence Hub
                  </AuroraText>
                </div>

                <SectionCards />

                <div className="space-y-8">
                  {/* Macros */}
                  <section>
                    <h1 className="text-2xl font-semibold mt-2 mb-1">Macros</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[300px]">
                      <CompanyTreemapCard />
                      <IndexChart />
                    </div>
                  </section>

                  {/* Stock Prices */}
                  <section>
                    <h1 className="text-2xl font-semibold mt-4 mb-1">Stock Prices</h1>
                    <StockCarousel />
                  </section>

                  {/* News Headlines */}
                  <section>
                    <h1 className="text-2xl font-semibold mt-4 mb-1">News Headlines</h1>
                    <NewsCards />
                  </section>
                </div>
              </>
            )}

            {activeTab === "Company Profiles" && (
              <CompanyProfile />
            )}

            {activeTab === "Commodity Trends" && (
                <CommodityTrend />
            )}

            {activeTab === "Geography Insights" && (
              <div className="p-4 border rounded-md">
                <h1 className="text-2xl font-semibold mt-2 mb-0.5">Palm Oil Geography</h1>
                <p className="text-stone-800 dark:text-stone-400 text-sm mb-2">
                  Navigate MSPO-certified entities in Malaysia with weather forecasts, geological and aqueduct risks.
                </p>
                <div>
                  <GeographyMap />
                </div>
              </div>
            )}

            {activeTab === "Global Trades" && (
              <div className="p-4 border rounded-md">
                <h1 className="text-lg font-semibold mb-2">Global Trades</h1>
                <p>Trade network visualization and import/export analysis here.</p>
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
