import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GlassPanel } from "@/components/ui/glass-panel"
import type { FireTableProps } from "./types/FireTable.types"
import { bucketLabelsForCategory } from "./utils/tableHelpers"
import { CategoryTabContent } from "./sections/CategoryTabContent"
import { EducationTab } from "./sections/EducationTab"
import { MarriageTab } from "./sections/MarriageTab"
import { HealthcareTab } from "./sections/HealthcareTab"
import { WhitegoodsTab } from "./sections/WhitegoodsTab"
import { TravelTab } from "./sections/TravelTab"
import { LivingTab } from "./sections/LivingTab"
import { CombinedTab } from "./sections/CombinedTab"
import { PortfolioTab } from "./sections/PortfolioTab"

export function FireTable({ yearByYear, goalCategories }: FireTableProps) {
  const eduBuckets = bucketLabelsForCategory(goalCategories, "education")
  const marriageBuckets = bucketLabelsForCategory(goalCategories, "marriage")
  const healthcareBuckets = bucketLabelsForCategory(goalCategories, "healthcare")
  const whitegoodsBuckets = bucketLabelsForCategory(goalCategories, "whitegoods")
  const travelBuckets = bucketLabelsForCategory(goalCategories, "travel")

  return (
    <GlassPanel title="Year-by-Year Projections">
      <Tabs defaultValue="education">
        <TabsList className="bg-white/60 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="marriage">Marriage</TabsTrigger>
          <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
          <TabsTrigger value="whitegoods">Whitegoods</TabsTrigger>
          <TabsTrigger value="travel">Travel</TabsTrigger>
          <TabsTrigger value="living">Living</TabsTrigger>
          <TabsTrigger value="combined">Combined</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>
        <TabsContent value="education" className="mt-4">
          <CategoryTabContent yearByYear={yearByYear} bucketLabels={eduBuckets}>
            <EducationTab yearByYear={yearByYear} />
          </CategoryTabContent>
        </TabsContent>
        <TabsContent value="marriage" className="mt-4">
          <CategoryTabContent yearByYear={yearByYear} bucketLabels={marriageBuckets}>
            <MarriageTab yearByYear={yearByYear} />
          </CategoryTabContent>
        </TabsContent>
        <TabsContent value="healthcare" className="mt-4">
          <CategoryTabContent yearByYear={yearByYear} bucketLabels={healthcareBuckets}>
            <HealthcareTab yearByYear={yearByYear} />
          </CategoryTabContent>
        </TabsContent>
        <TabsContent value="whitegoods" className="mt-4">
          <CategoryTabContent yearByYear={yearByYear} bucketLabels={whitegoodsBuckets}>
            <WhitegoodsTab yearByYear={yearByYear} />
          </CategoryTabContent>
        </TabsContent>
        <TabsContent value="travel" className="mt-4">
          <CategoryTabContent yearByYear={yearByYear} bucketLabels={travelBuckets}>
            <TravelTab yearByYear={yearByYear} />
          </CategoryTabContent>
        </TabsContent>
        <TabsContent value="living" className="mt-4">
          <CategoryTabContent yearByYear={yearByYear} bucketLabels={["Living Expenses"]}>
            <LivingTab yearByYear={yearByYear} />
          </CategoryTabContent>
        </TabsContent>
        <TabsContent value="combined" className="mt-4">
          <CombinedTab yearByYear={yearByYear} />
        </TabsContent>
        <TabsContent value="portfolio" className="mt-4">
          <PortfolioTab yearByYear={yearByYear} />
        </TabsContent>
      </Tabs>
    </GlassPanel>
  )
}
