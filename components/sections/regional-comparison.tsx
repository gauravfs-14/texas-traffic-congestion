"use client"

import { useState, useEffect, useRef } from "react"
import { useInView, motion } from "framer-motion"
import { fetchRoadwayData, getDistrictSummaries, formatCurrency } from "@/lib/api"
import type { DistrictSummary } from "@/lib/types"
import { GroupedBarChart } from "@/components/ui/grouped-bar-chart"
import { SimpleBarChart } from "@/components/ui/simple-bar-chart"

export default function RegionalComparison() {
  const [districtSummaries, setDistrictSummaries] = useState<DistrictSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [districtDetails, setDistrictDetails] = useState<DistrictSummary | null>(null)
  const [viewMode, setViewMode] = useState<"grouped" | "single">("grouped")

  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 })

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const roadways = await fetchRoadwayData()
      const summaries = getDistrictSummaries(roadways)
      setDistrictSummaries(summaries)
      setIsLoading(false)
    }

    loadData()
  }, [])

  // Pudding-style color palette
  const COLORS = [
    "#ff4e50", // coral red
    "#fc913a", // tangerine
    "#f9d62e", // sunshine yellow
    "#eae374", // pale yellow
    "#8cc63f", // lime green
    "#4bb5c1", // teal
    "#6a60a9", // purple
    "#c86b85", // raspberry
  ]

  // Prepare data for grouped bar chart with normalization
  const prepareNormalizedData = () => {
    // First, find the maximum value for each metric across all districts
    const maxRoadCount = Math.max(...districtSummaries.map((d) => d.roadCount))
    const maxCongestionIndex = Math.max(...districtSummaries.map((d) => d.avgCongestionIndex))
    const maxCost = Math.max(...districtSummaries.map((d) => d.totalCostOfDelay))

    // Get top districts by road count
    return [...districtSummaries]
      .sort((a, b) => b.roadCount - a.roadCount)
      .slice(0, 6)
      .map((district) => ({
        category: district.name,
        values: [
          {
            name: "Road Count",
            value: 100 * (district.roadCount / maxRoadCount), // Normalize to 0-100 scale
            actualValue: district.roadCount,
            color: COLORS[0],
          },
          {
            name: "Avg Congestion",
            value: 100 * (district.avgCongestionIndex / maxCongestionIndex), // Normalize to 0-100 scale
            actualValue: district.avgCongestionIndex,
            color: COLORS[1],
          },
          {
            name: "Cost (Millions)",
            value: 100 * (district.totalCostOfDelay / maxCost), // Normalize to 0-100 scale
            actualValue: district.totalCostOfDelay / 1000000, // Convert to millions for display
            color: COLORS[2],
          },
        ],
        ...district,
      }))
  }

  // Get the normalized data
  const topDistricts = prepareNormalizedData()

  // Prepare data for single metric view
  const prepareMetricData = (metric: "roadCount" | "avgCongestionIndex" | "totalCostOfDelay") => {
    return [...districtSummaries]
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, 8)
      .map((district, index) => {
        let value = district[metric]
        const formattedName =
          metric === "totalCostOfDelay"
            ? "Cost (Millions)"
            : metric === "avgCongestionIndex"
              ? "Congestion Index"
              : "Road Count"

        // Scale values for better visualization
        if (metric === "totalCostOfDelay") {
          value = value / 1000000
        } else if (metric === "avgCongestionIndex") {
          value = value * 10
        }

        return {
          name: district.name,
          value,
          metricName: formattedName,
          color: COLORS[index % COLORS.length],
          ...district,
        }
      })
  }

  // Handle district selection
  const handleDistrictSelect = (category: string) => {
    const district = districtSummaries.find((d) => d.name === category)
    if (selectedDistrict === category) {
      setSelectedDistrict(null)
      setDistrictDetails(null)
    } else if (district) {
      setSelectedDistrict(category)
      setDistrictDetails(district)
    }
  }

  // Handle bar click for simple bar chart
  const handleBarClick = (item: any) => {
    handleDistrictSelect(item.name)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="regions" ref={sectionRef} className="section bg-muted/20">
      <div className="section-title">Regional Disparities</div>
      <div className="section-subtitle">How congestion patterns vary across different regions of Texas</div>

      <div className="narrative-text">
        <p className="mb-4">
          Texas is a vast state with diverse urban and rural landscapes. Congestion isn't distributed evenly—it's
          concentrated in specific regions, particularly around major metropolitan areas.
        </p>
        <p>
          By comparing congestion patterns across different TxDOT districts, we can identify{" "}
          <span className="highlight">regional disparities</span> and understand how local factors influence traffic
          conditions.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 gap-6 mb-12"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div variants={itemVariants}>
          <div
            className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm"
            style={{ position: "relative", zIndex: 10 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold font-mono">District Comparison</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grouped")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    viewMode === "grouped"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  All Metrics
                </button>
                <button
                  onClick={() => setViewMode("single")}
                  className={`px-3 py-1 text-sm rounded-md ${
                    viewMode === "single"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  Cost Focus
                </button>
              </div>
            </div>

            <p className="text-muted-foreground mb-6 max-w-2xl">
              {viewMode === "grouped"
                ? "Click on any district to see detailed information. This chart compares key metrics across the top districts."
                : "Click on any bar to see detailed information about that district. The length of each bar represents the annual cost of congestion in millions of dollars."}
            </p>

            <div className="h-[520px]">
              {!isLoading ? (
                viewMode === "grouped" ? (
                  <GroupedBarChart
                    data={topDistricts}
                    height={520}
                    valueFormatter={(value) => {
                      // Format as percentage since we're showing normalized values
                      return `${value.toFixed(0)}%`
                    }}
                    tooltipFormatter={(category, value) => (
                      <div>
                        <div className="font-medium">{category.category} District</div>
                        <div>
                          {value.name}:{" "}
                          {value.name === "Cost (Millions)"
                            ? `$${value.actualValue.toFixed(1)}M (${value.value.toFixed(0)}%)`
                            : value.name === "Avg Congestion"
                              ? `${value.actualValue.toFixed(2)} (${value.value.toFixed(0)}%)`
                              : `${value.actualValue} (${value.value.toFixed(0)}%)`}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Values shown as percentage of maximum across districts
                        </div>
                        <div className="text-xs text-blue-500 mt-1">Click for district details</div>
                      </div>
                    )}
                    onBarClick={handleDistrictSelect}
                    categoryWidth={150}
                    interactionHint="Hover over bars to see metrics. Click on a district to view detailed information."
                    maxValue={100} // Set max value to 100 since we normalized to percentage
                  />
                ) : (
                  <SimpleBarChart
                    data={prepareMetricData("totalCostOfDelay")}
                    height={520}
                    layout="horizontal"
                    valueFormatter={(value) => `$${value.toFixed(1)}M`}
                    tooltipFormatter={(item) => (
                      <div>
                        <div className="font-medium">{item.name} District</div>
                        <div>Total Cost: ${(item.totalCostOfDelay / 1000000).toFixed(1)}M</div>
                        <div>Congested Roads: {item.roadCount}</div>
                        <div>Avg. Congestion Index: {item.avgCongestionIndex.toFixed(2)}</div>
                        <div className="text-xs text-blue-500 mt-1">Click for district details</div>
                      </div>
                    )}
                    onBarClick={handleBarClick}
                    labelWidth={150}
                    interactionHint="Hover over bars to see cost details. Click to view district information."
                  />
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                    <p className="mt-2 text-muted-foreground">Loading district data...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mt-4 text-sm text-muted-foreground font-mono">
              {viewMode === "grouped" ? (
                <>
                  <div className="mb-2">Values shown as percentage of maximum across all districts</div>
                  <span className="inline-block px-2 py-1 bg-[#ff4e50]/20 rounded mr-2">Road Count</span>
                  <span className="inline-block px-2 py-1 bg-[#fc913a]/20 rounded mr-2">Avg Congestion Index</span>
                  <span className="inline-block px-2 py-1 bg-[#f9d62e]/20 rounded">Cost (Millions $)</span>
                </>
              ) : (
                <span className="inline-block px-2 py-1 bg-[#ff4e50]/20 rounded">
                  Annual Cost of Congestion (Millions $)
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {selectedDistrict && districtDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold font-mono">{selectedDistrict} District</h3>
              <p className="text-muted-foreground mt-1">
                {districtDetails.roadCount} congested road segments | Avg. Congestion Index:{" "}
                {districtDetails.avgCongestionIndex.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedDistrict(null)
                setDistrictDetails(null)
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Close ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-3 font-mono">District Metrics</h4>
              <div className="space-y-4">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-red-200 text-red-800">
                        Congested Roads
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-red-800">
                        {districtDetails.roadCount}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
                    <div
                      style={{ width: `${Math.min((districtDetails.roadCount / 30) * 100, 100)}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                    ></div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-800">
                        Avg. Congestion Index
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-800">
                        {districtDetails.avgCongestionIndex.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: `${Math.min((districtDetails.avgCongestionIndex / 3) * 100, 100)}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-yellow-200 text-yellow-800">
                        Total Cost of Delay
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-yellow-800">
                        {formatCurrency(districtDetails.totalCostOfDelay)}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-yellow-200">
                    <div
                      style={{ width: `${Math.min((districtDetails.totalCostOfDelay / 500000000) * 100, 100)}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 font-mono">Regional Context</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedDistrict === "Houston" &&
                  "The Houston district faces the highest congestion levels in Texas, reflecting its status as the state's largest metropolitan area and a major freight hub. Its extensive network of highways serves both local commuters and interstate commerce."}
                {selectedDistrict === "Dallas" &&
                  "The Dallas district experiences significant congestion due to its rapid growth, sprawling development patterns, and role as a major logistics center. Its highway network serves both regional commuters and cross-country freight."}
                {selectedDistrict === "Austin" &&
                  "The Austin district's high congestion reflects its rapid population growth outpacing infrastructure development. Limited highway capacity and geographic constraints contribute to severe bottlenecks during peak hours."}
                {selectedDistrict === "San Antonio" &&
                  "The San Antonio district's congestion stems from its growing population and position as a crossroads for interstate commerce. Its highway network serves both local commuters and freight traffic between Mexico and the US interior."}
                {selectedDistrict === "Fort Worth" &&
                  "The Fort Worth district's congestion reflects its dual role serving commuter traffic and freight movement. Its strategic location makes it a critical node in Texas's transportation network."}
                {selectedDistrict !== "Houston" &&
                  selectedDistrict !== "Dallas" &&
                  selectedDistrict !== "Austin" &&
                  selectedDistrict !== "San Antonio" &&
                  selectedDistrict !== "Fort Worth" &&
                  `The ${selectedDistrict} district represents an important component of Texas's transportation network, with congestion patterns reflecting both local commuter patterns and regional economic activity.`}
              </p>

              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3 font-mono">Comparative Analysis</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                    <span>
                      <strong>State Ranking:</strong> #
                      {districtSummaries.findIndex((d) => d.name === selectedDistrict) + 1}
                      in number of congested roads
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                    <span>
                      <strong>Cost Percentage:</strong>{" "}
                      {(
                        (districtDetails.totalCostOfDelay /
                          districtSummaries.reduce((sum, d) => sum + d.totalCostOfDelay, 0)) *
                        100
                      ).toFixed(1)}
                      % of statewide congestion costs
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                    <span>
                      <strong>Congestion Severity:</strong>{" "}
                      {districtDetails.avgCongestionIndex > 2
                        ? "Severe"
                        : districtDetails.avgCongestionIndex > 1.5
                          ? "High"
                          : districtDetails.avgCongestionIndex > 1
                            ? "Moderate"
                            : "Low"}{" "}
                      average congestion level
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4 font-mono flex items-center">
            <span className="inline-block w-2 h-8 bg-[#ff4e50] mr-3 rounded-sm"></span>
            Urban Concentration
          </h3>
          <p className="text-muted-foreground">
            Major metropolitan areas like Houston, Dallas, and Austin account for the majority of congested roadways.
            These urban centers face unique challenges due to high population density, complex commuting patterns, and
            limited space for infrastructure expansion.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4 font-mono flex items-center">
            <span className="inline-block w-2 h-8 bg-[#fc913a] mr-3 rounded-sm"></span>
            Growth Patterns
          </h3>
          <p className="text-muted-foreground">
            Rapidly growing regions like Austin are experiencing increasing congestion as infrastructure development
            struggles to keep pace with population growth. These areas often see congestion spreading to previously
            uncongested corridors as development expands outward.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4 font-mono flex items-center">
            <span className="inline-block w-2 h-8 bg-[#f9d62e] mr-3 rounded-sm"></span>
            Economic Impact
          </h3>
          <p className="text-muted-foreground">
            Districts with higher congestion levels bear a disproportionate share of the economic burden. The economic
            impact varies significantly across regions, with major urban centers experiencing costs in the hundreds of
            millions of dollars annually.
          </p>
        </div>
      </div>
    </section>
  )
}
