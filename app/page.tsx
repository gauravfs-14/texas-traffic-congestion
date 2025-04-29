import { Suspense } from "react"
import Intro from "@/components/sections/intro"
import CongestionMap from "@/components/sections/congestion-map"
import CongestionRankings from "@/components/sections/congestion-rankings"
import CongestionCosts from "@/components/sections/congestion-costs"
import RegionalComparison from "@/components/sections/regional-comparison"
import RoadTypeAnalysis from "@/components/sections/road-type-analysis"
import CommuterImpact from "@/components/sections/commuter-impact"
import Conclusion from "@/components/sections/conclusion"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ScrollProgress from "@/components/ui/scroll-progress"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <ScrollProgress />
      <Intro />
      <Suspense fallback={<LoadingSpinner />}>
        <CongestionMap />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <RoadTypeAnalysis />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <CongestionRankings />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <CongestionCosts />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <CommuterImpact />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <RegionalComparison />
      </Suspense>
      <Conclusion />
    </main>
  )
}
