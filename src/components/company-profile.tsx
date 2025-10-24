"use client"

import { useEffect, useState } from "react"
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { SelectScrollable } from "@/components/company-select"
import { SharePriceChart } from "@/components/company-shareprice"
import { ProductionChart } from "@/components/company-production"
import { ExtractionChart } from "@/components/company-extraction"
import { PlantationChart } from "@/components/company-area"
import { CompanyEarnings } from "@/components/company-earnings"
import { CompanyFinancials } from "@/components/company-financials"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Globe } from "lucide-react"

interface CompanyData {
    company_long_name: string
    company_stock_code: string
    company_board: string
    company_description: string
    company_website: string
}

export function CompanyProfile() {
    const [selectedCompany, setSelectedCompany] = useState("IOICORP")
    const [companyData, setCompanyData] = useState<CompanyData | null>(null)
    const [activeView, setActiveView] = useState<"earnings" | "sankey">("earnings")

    useEffect(() => {
        if (!selectedCompany) return
        fetch(`http://127.0.0.1:8000/api/company/${selectedCompany}`)
            .then((res) => res.json())
            .then((data) => setCompanyData(data))
            .catch((err) => console.error("Error fetching company data:", err))


    }, [selectedCompany])

    return (<div className="grid auto-rows-min gap-4 md:grid-cols-1 w-full"> <Card> <CardHeader className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-700">
        {/* Left: company logo & info */} <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4"> <Avatar className="h-28 w-28 border border-zinc-600">
            <AvatarImage
                src={`src/assets/images/${selectedCompany.toLowerCase()}_logo.png`}
                alt={`${selectedCompany} Logo`}
            /> <AvatarFallback>{selectedCompany}</AvatarFallback> </Avatar>

            <div>
                <CardTitle className="text-4xl font-bold text-primary">
                    {companyData ? (
                        companyData.company_long_name
                    ) : (
                        <Skeleton className="h-6 w-48 rounded-md" />
                    )}
                </CardTitle>

                <CardDescription className="text-muted-foreground text-base">
                    {companyData ? (
                        companyData.company_board
                    ) : (
                        <Skeleton className="h-4 w-32 rounded-md" />
                    )}
                    <div className="font-small">
                        {companyData?.company_stock_code ? (
                            `${selectedCompany} (KLSE: ${companyData.company_stock_code})`
                        ) : (
                            <Skeleton className="h-4 w-24 rounded-md inline-block" />
                        )}
                    </div>
                </CardDescription>

                {companyData?.company_website ? (
                    <a
                        href={companyData.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 mt-1 text-sm text-blue-400 hover:underline"
                    >
                        <Globe className="h-4 w-4" /> {companyData.company_website}
                    </a>
                ) : (
                    <Skeleton className="h-4 w-40 rounded-md mt-1" />
                )}
            </div>
        </div>

        {/* Right: company selector */}
        <div className="w-full sm:w-[280px] mt-2 sm:mt-0">
            <SelectScrollable onChange={(value) => setSelectedCompany(value)} />
        </div>
    </CardHeader>

        <CardContent className="pt-6 space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
                Company Overview
            </h2>
            <p className="text-muted-foreground leading-relaxed">
                {companyData?.company_description || "Loading company details..."}
            </p>

            <h2 className="text-2xl font-semibold text-foreground">
                Company Figures
            </h2>
            {/* Row 1: Share Price | Production */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {companyData ? (
                    <SharePriceChart companyShortName={selectedCompany} />
                ) : (
                    <Skeleton className="h-64 w-full rounded-md" />
                )}
                {companyData ? (
                    <ProductionChart companyShortName={selectedCompany} />
                ) : (
                    <Skeleton className="h-64 w-full rounded-md" />
                )}
            </div>

            {/* Row 2: Extraction | Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {companyData ? (
                    <ExtractionChart companyShortName={selectedCompany} />
                ) : (
                    <Skeleton className="h-64 w-full rounded-md" />
                )}
                {companyData ? (
                    <PlantationChart companyShortName={selectedCompany} />
                ) : (
                    <Skeleton className="h-64 w-full rounded-md" />
                )}
            </div>

            {/* Row 3: Earnings | Sankey toggle */}
            <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-semibold">Company Financials</h3>

                    <ToggleGroup
                        type="single"
                        value={activeView}
                        onValueChange={(val) => setActiveView(val as any)}
                    >
                        <ToggleGroupItem value="earnings" aria-label="Earnings">
                            Earnings
                        </ToggleGroupItem>
                        <ToggleGroupItem value="sankey" aria-label="Sankey">
                            Sankey
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                <div className="w-full h-[360px]">
                    {companyData ? (
                        activeView === "earnings" ? (
                            <CompanyEarnings companyShortName={selectedCompany} />
                        ) : (
                            <CompanyFinancials companyShortName={selectedCompany} />
                        )
                    ) : (
                        <Skeleton className="h-full w-full rounded-md" />
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
    </div>
    )
}
