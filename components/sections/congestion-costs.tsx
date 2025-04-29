"use client"

import { useState, useEffect, useRef } from "react"
import { useInView, motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchRoadwayData, formatCurrency } from "@/lib/api"
import type { RoadwayData } from "@/lib/types"
import { SlopeChart } from "@/components/ui/slope-chart"
import { CursorTooltip } from "@/components/ui/cursor-tooltip"

export default function CongestionCosts() {
  const [roadways, setRoadways] = useState<RoadwayData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [districtDetails, setDistrictDetails] = useState<any>(null)
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)

  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 })

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const data = await fetchRoadwayData()
      setRoadways(data)
      setIsLoading(false)
    }

    loadData()
  }, [])

  // Calculate total costs
  const totalCost = roadways.reduce((sum, road) => sum + road.costOfDelay, 0)
  const totalTruckCost = roadways.reduce((sum, road) => sum + road.costOfTruckDelay, 0)

  // Calculate costs by district
  const districtCosts = roadways.reduce(
    (acc, road) => {
      const district = road.district
      if (!acc[district]) {
        acc[district] = {
          totalCost: 0,
          truckCost: 0,
          commuterCost: 0,
          roadCount: 0,
          roads: [],
        }
      }
      acc[district].totalCost += road.costOfDelay
      acc[district].truckCost += road.costOfTruckDelay
      acc[district].commuterCost += road.costOfDelay - road.costOfTruckDelay
      acc[district].roadCount += 1
      acc[district].roads.push(road)
      return acc
    },
    {} as Record<
      string,
      { totalCost: number; truckCost: number; commuterCost: number; roadCount: number; roads: RoadwayData[] }
    >,
  )

  // Convert to array for chart
  const districtCostsData = Object.entries(districtCosts)
    .map(([name, data], index) => ({
      name,
      value: data.totalCost,
      truckCost: data.truckCost,
      commuterCost: data.commuterCost,
      roadCount: data.roadCount,
      roads: data.roads,
      index,
      color: [
        "#ff4e50", // coral red
        "#fc913a", // tangerine
        "#f9d62e", // sunshine yellow
        "#eae374", // pale yellow
        "#8cc63f", // lime green
        "#4bb5c1", // teal
        "#6a60a9", // purple
        "#c86b85", // raspberry
      ][index % 8],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // Top 8 districts for better visualization

  // Calculate per capita costs (using estimated population)
  const estimatedPopulation = 29_000_000 // Texas population estimate
  const costPerCapita = totalCost / estimatedPopulation

  // Calculate average commuter costs (assuming 30% of population commutes)
  const estimatedCommuters = estimatedPopulation * 0.3
  const costPerCommuter = totalCost / estimatedCommuters

  // Handle district selection
  const handleDistrictClick = (item: any) => {
    if (selectedDistrict === item.name) {
      setSelectedDistrict(null)
      setDistrictDetails(null)
    } else {
      setSelectedDistrict(item.name)
      setDistrictDetails(item)
    }
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

  // Cost breakdown data
  const costBreakdownData = [
    {
      name: "Total Cost",
      value: totalCost,
      color: "#ff4e50",
    },
    {
      name: "Truck-Related",
      value: totalTruckCost,
      color: "#4bb5c1",
    },
    {
      name: "Commuter-Related",
      value: totalCost - totalTruckCost,
      color: "#fc913a",
    },
  ]

  // Cost breakdown for slope chart
  const costComparisonData = [
    {
      id: 1,
      name: "Commuter",
      start: { value: totalCost - totalTruckCost, label: "Total" },
      end: { value: (totalCost - totalTruckCost) / estimatedCommuters, label: "Per Commuter" },
      color: "#ff4e50",
    },
    {
      id: 2,
      name: "Truck",
      start: { value: totalTruckCost, label: "Total" },
      end: { value: totalTruckCost / 100000, label: "Per Truck" }, // Assuming 100,000 commercial trucks
      color: "#4bb5c1",
    },
  ]

  return (
    <section id="costs" ref={sectionRef} className="section">
      <div className="section-title">The Economic Burden</div>
      <div className="section-subtitle">Quantifying the financial impact of traffic congestion across Texas</div>

      <div className="narrative-text">
        <p className="mb-4">
          Traffic congestion isn't just a frustration—it's a significant economic burden. The costs include wasted fuel,
          vehicle wear and tear, lost productivity, and environmental impact.
        </p>
        <p>
          For businesses, especially those relying on just-in-time delivery, congestion creates{" "}
          <span className="highlight">unpredictable delays</span> that ripple through supply chains and increase
          operational costs.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div variants={itemVariants} className="md:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm h-full">
            <h3 className="text-2xl font-bold mb-6 font-mono">Total Annual Cost</h3>
            <div className="flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-[#ff4e50] font-mono mt-6 mb-4">
                {isLoading ? (
                  <div className="h-12 w-48 bg-muted animate-pulse rounded"></div>
                ) : (
                  formatCurrency(totalCost)
                )}
              </div>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Total economic impact of congestion for the top 100 most congested roadways in Texas
              </p>

              {!isLoading && (
                <div className="w-full max-w-md h-[200px]">
                  <SlopeChart
                    data={costComparisonData}
                    height={200}
                    valueFormatter={(value) => formatCurrency(value)}
                    tooltipFormatter={(item, position) => (
                      <div>
                        <div className="font-medium">{item.name} Costs</div>
                        <div>
                          {position === "start" ? "Total" : "Per User"}: {formatCurrency(item[position].value)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {position === "start"
                            ? "Total economic impact across Texas"
                            : "Average cost per individual user"}
                        </div>
                      </div>
                    )}
                    interactionHint="Hover over points to see cost details"
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm h-full">
            <h3 className="text-2xl font-bold mb-4 font-mono">Cost Breakdown</h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm font-mono">Per Commuter</h4>
                  <span className="text-xl font-bold text-[#fc913a] font-mono">
                    {isLoading ? "..." : formatCurrency(costPerCommuter)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Average annual cost per commuter based on estimated number of regular commuters
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm font-mono">Truck-Related</h4>
                  <span className="text-xl font-bold text-[#4bb5c1] font-mono">
                    {isLoading ? "..." : formatCurrency(totalTruckCost)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Annual cost of delays specifically affecting commercial trucks and freight transportation
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm font-mono">Per Capita</h4>
                  <span className="text-xl font-bold text-[#8cc63f] font-mono">
                    {isLoading ? "..." : formatCurrency(costPerCapita)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Annual cost divided by the total population of Texas</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="mb-12">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold font-mono">Cost Distribution by District</h3>
              <p className="text-muted-foreground mt-1 max-w-2xl">
                Click on any district to see detailed information. The chart shows the annual cost of congestion in
                millions of dollars.
              </p>
            </div>
          </div>

          <div className="h-[50vh] relative">
            {!isLoading && districtCostsData.length > 0 ? (
              <div className="h-full flex flex-col justify-between py-4">
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-[150px] right-0 flex justify-between text-xs text-gray-500 font-mono">
                  {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                    <div key={`x-${tick}`} className="text-center">
                      ${((districtCostsData[0].value * tick) / 1000000).toFixed(0)}M
                    </div>
                  ))}
                </div>

                {/* Grid lines */}
                <div className="absolute inset-0 flex">
                  {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                    <div
                      key={`grid-${tick}`}
                      className="h-full border-r border-gray-100 dark:border-gray-800"
                      style={{ left: `${tick * 100 + 150}px` }}
                    ></div>
                  ))}
                </div>

                {/* Horizontal bar chart with lollipop style */}
                <div className="h-full flex flex-col justify-between relative pt-4 pb-8">
                  {districtCostsData.map((district, index) => {
                    const percentage = (district.value / districtCostsData[0].value) * 100
                    const isHovered = hoveredDistrict === district.name

                    return (
                      <CursorTooltip
                        key={district.name}
                        content={
                          <div className="p-2">
                            <div className="font-medium">{district.name} District</div>
                            <div>Total Cost: {formatCurrency(district.value)}</div>
                            <div>Congested Roads: {district.roadCount}</div>
                            <div>Truck Cost: {formatCurrency(district.truckCost)}</div>
                            <div className="text-xs text-blue-500 mt-1">Click for district details</div>
                          </div>
                        }
                      >
                        <div
                          className="flex items-center h-[40px] relative group cursor-pointer"
                          onMouseEnter={() => setHoveredDistrict(district.name)}
                          onMouseLeave={() => setHoveredDistrict(null)}
                          onClick={() => handleDistrictClick(district)}
                        >
                          {/* District name (left side as y-axis label) */}
                          <div className="w-[150px] text-right pr-4 font-medium text-sm">{district.name}</div>

                          {/* Line */}
                          <div className="relative flex-1 h-full flex items-center">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="h-[2px] origin-left"
                              style={{
                                backgroundColor: district.color,
                                opacity: isHovered ? 1 : 0.7,
                              }}
                            />

                            {/* Circle */}
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{
                                scale: 1,
                                width: isHovered ? 16 : 12,
                                height: isHovered ? 16 : 12,
                              }}
                              transition={{
                                duration: 0.5,
                                delay: index * 0.1 + 0.8,
                              }}
                              className="rounded-full absolute"
                              style={{
                                backgroundColor: district.color,
                                left: `${percentage}%`,
                                transform: "translate(-50%, -50%)",
                                boxShadow: isHovered
                                  ? `0 0 0 4px ${district.color}33, 0 0 0 8px ${district.color}11`
                                  : "none",
                                transition: "all 0.3s ease",
                              }}
                            />

                            {/* Value label (above the circle) */}
                            <div
                              className={`absolute text-sm font-mono transition-opacity duration-300 ${
                                isHovered ? "opacity-100" : "opacity-70"
                              }`}
                              style={{
                                left: `${percentage}%`,
                                top: "-20px",
                                transform: "translateX(-50%)",
                                color: district.color,
                              }}
                            >
                              ${(district.value / 1000000).toFixed(0)}M
                            </div>
                          </div>
                        </div>
                      </CursorTooltip>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                  <p className="mt-2 text-muted-foreground">Loading cost data...</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-8 text-sm text-muted-foreground font-mono">
            Annual Cost of Congestion (Millions of Dollars)
          </div>

          <div className="text-center mt-2 text-xs text-muted-foreground">
            Hover over points for details. Click to see district breakdown.
          </div>
        </div>
      </div>

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
                {districtDetails.roadCount} congested road segments | Total cost:{" "}
                {formatCurrency(districtDetails.value)}
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
              <h4 className="text-lg font-semibold mb-3 font-mono">Cost Breakdown</h4>
              <div className="space-y-4">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-red-200 text-red-800">
                        Total Cost
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-red-800">
                        {formatCurrency(districtDetails.value)}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
                    <div
                      style={{ width: `100%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                    ></div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-teal-200 text-teal-800">
                        Truck-Related Cost
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-teal-800">
                        {formatCurrency(districtDetails.truckCost)}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-teal-200">
                    <div
                      style={{ width: `${(districtDetails.truckCost / districtDetails.value) * 100}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-500"
                    ></div>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-800">
                        Commuter Cost
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-800">
                        {formatCurrency(districtDetails.commuterCost)}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: `${(districtDetails.commuterCost / districtDetails.value) * 100}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3 font-mono">Most Costly Roads</h4>
                <div className="space-y-3">
                  {districtDetails.roads
                    .sort((a: RoadwayData, b: RoadwayData) => b.costOfDelay - a.costOfDelay)
                    .slice(0, 5)
                    .map((road: RoadwayData, i: number) => (
                      <div key={i} className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{
                            backgroundColor: districtDetails.color,
                          }}
                        ></div>
                        <div>
                          <div className="font-medium">{road.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Cost: {formatCurrency(road.costOfDelay)} | Rank: #{road.rank}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 font-mono">District Impact Analysis</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                  <span>
                    <strong>Percentage of Total Cost:</strong> {((districtDetails.value / totalCost) * 100).toFixed(1)}%
                    of statewide congestion costs
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                  <span>
                    <strong>Average Cost per Road:</strong>{" "}
                    {formatCurrency(districtDetails.value / districtDetails.roadCount)} per congested segment
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                  <span>
                    <strong>Truck Impact Ratio:</strong>{" "}
                    {((districtDetails.truckCost / districtDetails.value) * 100).toFixed(1)}% of costs are truck-related
                  </span>
                </li>
              </ul>

              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3 font-mono">Regional Context</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedDistrict === "Houston" &&
                    "The Houston district faces the highest congestion costs in Texas, reflecting its status as the state's largest metropolitan area and a major freight hub. Its extensive network of highways serves both local commuters and interstate commerce."}
                  {selectedDistrict === "Dallas" &&
                    "The Dallas district experiences significant congestion costs due to its rapid growth, sprawling development patterns, and role as a major logistics center. Its highway network serves both regional commuters and cross-country freight."}
                  {selectedDistrict === "Austin" &&
                    "The Austin district's high congestion costs reflect its rapid population growth outpacing infrastructure development. Limited highway capacity and geographic constraints contribute to severe bottlenecks during peak hours."}
                  {selectedDistrict === "San Antonio" &&
                    "The San Antonio district's congestion costs stem from its growing population and position as a crossroads for interstate commerce. Its highway network serves both local commuters and freight traffic between Mexico and the US interior."}
                  {selectedDistrict === "Fort Worth" &&
                    "The Fort Worth district's congestion costs reflect its dual role serving commuter traffic and freight movement. Its strategic location makes it a critical node in Texas's transportation network."}
                  {selectedDistrict !== "Houston" &&
                    selectedDistrict !== "Dallas" &&
                    selectedDistrict !== "Austin" &&
                    selectedDistrict !== "San Antonio" &&
                    selectedDistrict !== "Fort Worth" &&
                    `The ${selectedDistrict} district represents an important component of Texas's transportation network, with congestion costs reflecting both local commuter patterns and regional economic activity.`}
                </p>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3 font-mono">Economic Implications</h4>
                <p className="text-sm text-muted-foreground">
                  The economic burden of congestion in this district affects businesses through increased transportation
                  costs, delayed deliveries, and reduced market access. For commuters, it represents lost time,
                  increased vehicle operating costs, and diminished quality of life. Addressing these congestion issues
                  would yield significant economic benefits through improved mobility and productivity.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center font-mono">
              <span className="inline-block w-2 h-8 bg-[#ff4e50] mr-3 rounded-sm"></span>
              Time Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The largest component of congestion cost is the value of lost time. For commuters, this represents time
              that could be spent with family, on leisure activities, or even working additional hours. For businesses,
              this translates to reduced productivity and increased labor costs.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center font-mono">
              <span className="inline-block w-2 h-8 bg-[#fc913a] mr-3 rounded-sm"></span>
              Fuel Consumption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Vehicles stuck in traffic burn more fuel due to idling and frequent acceleration/deceleration cycles. This
              not only increases costs for drivers but also contributes to air pollution and greenhouse gas emissions.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center font-mono">
              <span className="inline-block w-2 h-8 bg-[#f9d62e] mr-3 rounded-sm"></span>
              Business Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              For businesses, especially those in logistics and delivery services, congestion creates unpredictable
              delays that disrupt schedules and increase operational costs. This can lead to higher prices for consumers
              and reduced economic competitiveness.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
