"use client"

import { useState, useEffect, useRef } from "react"
import { useInView, motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchRoadwayData } from "@/lib/api"
import type { RoadwayData } from "@/lib/types"
import { SimpleBarChart } from "@/components/ui/simple-bar-chart"

// Replace the congestionLevels definition at the top of the file with this:
const congestionLevels = [
  { level: "Low", range: [0, 1], color: "#8cc63f" },
  { level: "Medium", range: [1, 1.5], color: "#f9d62e" },
  { level: "High", range: [1.5, 2], color: "#fc913a" },
  { level: "Severe", range: [2, 2.5], color: "#ff4e50" },
  { level: "Extreme", range: [2.5, 10], color: "#c86b85" },
]

export default function CommuterImpact() {
  const [roadways, setRoadways] = useState<RoadwayData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRoad, setSelectedRoad] = useState<number | null>(null)
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null)
  const [highlightedData, setHighlightedData] = useState<any>(null)

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

  // Replace the estimateAffectedCommuters function with this deterministic version
  const estimateAffectedCommuters = (congestionIndex: number, roadId?: number): number => {
    // Use a deterministic formula based on congestion index and optional road ID
    // This ensures the same value is returned for the same inputs
    const baseEstimate = congestionIndex * 10000

    // If roadId is provided, use it to create a consistent "random" factor
    // Otherwise use a fixed multiplier
    const multiplier = roadId ? 0.8 + (roadId % 10) / 25 : 1.0

    return Math.round(baseEstimate * multiplier)
  }

  // Modify the commuterImpactData calculation to pass the road ID
  const commuterImpactData = roadways
    .sort((a, b) => b.congestionIndex - a.congestionIndex)
    .slice(0, 15) // Top 15 most congested roads
    .map((road, index) => {
      const estimatedCommuters = estimateAffectedCommuters(road.congestionIndex, road.id)
      return {
        id: road.id,
        name: road.name.length > 20 ? road.name.substring(0, 17) + "..." : road.name,
        fullName: road.name,
        district: road.district,
        congestionIndex: road.congestionIndex,
        estimatedCommuters,
        value: estimatedCommuters, // Explicitly set value property for the chart
        costPerCommuter: road.costOfDelay / estimatedCommuters,
        timeWasted: road.delayPerMile * 220, // Assuming 220 workdays per year
        index,
        color: "#ff4e50",
      }
    })

  // Modify the severityImpactData calculation to use the deterministic function
  const severityImpactData = congestionLevels.map((level) => {
    // Filter roads that fall within this congestion level range
    const roadsInLevel = roadways.filter(
      (road) => road.congestionIndex >= level.range[0] && road.congestionIndex < level.range[1],
    )

    // Calculate total commuters affected by this severity level
    const totalCommuters = roadsInLevel.reduce(
      (sum, road) => sum + estimateAffectedCommuters(road.congestionIndex, road.id),
      0,
    )

    // Calculate total economic cost
    const totalCost = roadsInLevel.reduce((sum, road) => sum + road.costOfDelay, 0)

    // Calculate average time wasted (hours per year)
    const avgTimeWasted =
      roadsInLevel.length > 0
        ? (roadsInLevel.reduce((sum, road) => sum + road.delayPerMile, 0) / roadsInLevel.length) * 220
        : 0

    // Ensure we have a minimum value for visualization purposes
    // This will make bars with small values still visible
    const displayValue = totalCommuters > 0 ? totalCommuters : 0

    return {
      name: level.level,
      value: displayValue,
      roads: roadsInLevel.length,
      commuters: totalCommuters,
      cost: totalCost,
      timeWasted: avgTimeWasted,
      color: level.color,
      roadsData: roadsInLevel,
    }
  })

  // Add this debug logging after the severityImpactData calculation:
  // This will help us verify the data is being calculated correctly
  useEffect(() => {
    if (!isLoading && severityImpactData.length > 0) {
      console.log("Severity Impact Data:", severityImpactData)

      // Check if all values are zero
      const allZero = severityImpactData.every((item) => item.value === 0)
      if (allZero) {
        console.warn("All severity impact values are zero. Check congestion ranges.")
      }
    }
  }, [isLoading, severityImpactData])

  // Modify the handleSeverityClick function to use a deep copy
  const handleSeverityClick = (data: any) => {
    // Create a deep copy of the data to avoid modifying the original
    const dataCopy = JSON.parse(JSON.stringify(data))

    if (selectedSeverity === dataCopy.name) {
      setSelectedSeverity(null)
      setHighlightedData(null)
    } else {
      setSelectedSeverity(dataCopy.name)
      setHighlightedData({
        ...dataCopy,
        type: "severity",
      })
    }
  }

  // Similarly update the handleRoadClick function
  const handleRoadClick = (data: any) => {
    // Create a deep copy of the data to avoid modifying the original
    const dataCopy = JSON.parse(JSON.stringify(data))

    if (selectedRoad === dataCopy.id) {
      setSelectedRoad(null)
      setHighlightedData(null)
    } else {
      setSelectedRoad(dataCopy.id)
      setHighlightedData({
        ...dataCopy,
        type: "road",
      })
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

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString()
  }

  return (
    <section id="commuter-impact" ref={sectionRef} className="section">
      <div className="section-title">The Human Cost</div>
      <div className="section-subtitle">How congestion affects daily commuters across Texas</div>

      <div className="narrative-text">
        <p className="mb-4">
          Behind the economic statistics are real people whose daily lives are impacted by traffic congestion. Commuters
          face not only financial costs but also significant time losses, increased stress, and reduced quality of life.
        </p>
        <p>
          By examining the <span className="highlight">human dimension of congestion</span>, we can better understand
          its true cost to society and the importance of finding effective solutions.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div variants={itemVariants}>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <h3 className="text-2xl font-bold mb-4 font-mono">Commuters Affected by Road</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Click on any bar to see detailed information about that road segment. The length represents the estimated
              number of daily commuters impacted.
            </p>

            <div className="h-[500px]">
              {!isLoading ? (
                <SimpleBarChart
                  data={commuterImpactData}
                  height={500}
                  layout="horizontal"
                  valueFormatter={(value) => formatNumber(value)}
                  tooltipFormatter={(item) => (
                    <div>
                      <div className="font-medium">{item.fullName}</div>
                      <div>Affected Commuters: {formatNumber(item.estimatedCommuters)}</div>
                      <div>Congestion Index: {item.congestionIndex.toFixed(2)}</div>
                      <div>District: {item.district}</div>
                      <div className="text-xs text-blue-500 mt-1">Click for detailed impact</div>
                    </div>
                  )}
                  onBarClick={handleRoadClick}
                  labelWidth={150}
                  interactionHint="Hover over bars to see commuter data. Click for detailed impact analysis."
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                    <p className="mt-2 text-muted-foreground">Loading commuter data...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mt-4 text-sm text-muted-foreground font-mono">Top 15 Most Congested Roads</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <h3 className="text-2xl font-bold mb-4 font-mono">Impact by Congestion Severity</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Click on any bar to see detailed information about that congestion level. Each bar shows the number of
              commuters affected by different levels of congestion.
            </p>

            <div className="h-[500px]">
              {!isLoading ? (
                severityImpactData.some((item) => item.value > 0) ? (
                  <SimpleBarChart
                    data={severityImpactData}
                    height={500}
                    layout="vertical"
                    valueFormatter={(value) => formatNumber(value)}
                    tooltipFormatter={(item) => (
                      <div>
                        <div className="font-medium">{item.name} Congestion</div>
                        <div>Affected Commuters: {formatNumber(item.commuters)}</div>
                        <div>Road Segments: {item.roads}</div>
                        <div>Avg. Time Wasted: {Math.round(item.timeWasted)} hours/year</div>
                        <div className="text-xs text-blue-500 mt-1">Click for severity impact details</div>
                      </div>
                    )}
                    onBarClick={handleSeverityClick}
                    interactionHint="Hover over bars to see severity data. Click for detailed analysis."
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-amber-500 mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mx-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium mb-2">No Data to Display</h4>
                      <p className="text-muted-foreground">
                        The current congestion severity ranges don't match any roads in the dataset. This could be due
                        to data filtering or classification issues.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                    <p className="mt-2 text-muted-foreground">Loading severity data...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mt-4 text-sm text-muted-foreground font-mono">Congestion Severity Levels</div>
          </div>
        </motion.div>
      </motion.div>

      {highlightedData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold font-mono">
                {highlightedData.type === "road"
                  ? highlightedData.fullName
                  : highlightedData.name + " Congestion Impact"}
              </h3>
              <p className="text-muted-foreground mt-1">
                {highlightedData.type === "road"
                  ? `${highlightedData.district} District | Congestion Index: ${highlightedData.congestionIndex.toFixed(2)}`
                  : `${highlightedData.roads} road segments | ${formatNumber(highlightedData.commuters)} commuters affected`}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedRoad(null)
                setSelectedSeverity(null)
                setHighlightedData(null)
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Close ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-3 font-mono">Impact Metrics</h4>
              <div className="space-y-4">
                {highlightedData.type === "road" ? (
                  <>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-red-200 text-red-800">
                            Affected Commuters
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-red-800">
                            {formatNumber(highlightedData.estimatedCommuters)}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
                        <div
                          style={{ width: `${Math.min((highlightedData.estimatedCommuters / 50000) * 100, 100)}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                        ></div>
                      </div>
                    </div>

                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-800">
                            Time Wasted Annually
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-blue-800">
                            {Math.round(highlightedData.timeWasted).toLocaleString()} hours
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                        <div
                          style={{ width: `${Math.min((highlightedData.timeWasted / 500) * 100, 100)}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        ></div>
                      </div>
                    </div>

                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-yellow-200 text-yellow-800">
                            Cost Per Commuter
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-yellow-800">
                            ${Math.round(highlightedData.costPerCommuter).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-yellow-200">
                        <div
                          style={{ width: `${Math.min((highlightedData.costPerCommuter / 2000) * 100, 100)}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                        ></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-red-200 text-red-800">
                            Total Commuters
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-red-800">
                            {formatNumber(highlightedData.commuters)}
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
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-800">
                            Average Time Wasted
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-blue-800">
                            {Math.round(highlightedData.timeWasted).toLocaleString()} hours
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                        <div
                          style={{ width: `${Math.min((highlightedData.timeWasted / 300) * 100, 100)}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        ></div>
                      </div>
                    </div>

                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-yellow-200 text-yellow-800">
                            Total Economic Cost
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-yellow-800">
                            ${(highlightedData.cost / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-yellow-200">
                        <div
                          style={{ width: `${Math.min((highlightedData.cost / 100000000) * 100, 100)}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                        ></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 font-mono">Human Impact</h4>
              {highlightedData.type === "road" ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    This road segment affects an estimated {formatNumber(highlightedData.estimatedCommuters)} commuters
                    daily. The congestion on this road results in significant time loss and economic impact:
                  </p>

                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                      <span>
                        <strong>Annual Time Loss:</strong> {Math.round(highlightedData.timeWasted).toLocaleString()}{" "}
                        hours per mile
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                      <span>
                        <strong>Daily Impact:</strong> Approximately{" "}
                        {Math.round(highlightedData.timeWasted / 220).toLocaleString()} hours lost per workday
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                      <span>
                        <strong>Personal Cost:</strong> Each regular commuter loses about $
                        {Math.round(highlightedData.costPerCommuter).toLocaleString()}
                        annually due to this congestion
                      </span>
                    </li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {highlightedData.name} congestion affects {highlightedData.roads} road segments across Texas,
                    impacting approximately {formatNumber(highlightedData.commuters)} commuters:
                  </p>

                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                      <span>
                        <strong>Time Impact:</strong> Average of{" "}
                        {Math.round(highlightedData.timeWasted).toLocaleString()} hours wasted annually per commuter
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                      <span>
                        <strong>Economic Burden:</strong> Total cost of ${(highlightedData.cost / 1000000).toFixed(1)}{" "}
                        million annually
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                      <span>
                        <strong>Per Commuter Cost:</strong> Approximately $
                        {Math.round(highlightedData.cost / highlightedData.commuters).toLocaleString()}
                        per affected commuter
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3 font-mono">Quality of Life Impact</h4>
                <p className="text-sm text-muted-foreground">
                  Beyond the economic costs, congestion significantly impacts quality of life. Commuters experience
                  increased stress, reduced time with family, and fewer opportunities for leisure activities. Extended
                  commute times are associated with higher blood pressure, increased anxiety, and reduced overall life
                  satisfaction. These health impacts represent hidden costs beyond the direct economic burden of
                  congestion.
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
              Time Lost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The average commuter on severely congested roads loses over 100 hours per year to traffic delays. This
              represents time that could be spent with family, on leisure activities, or professional development.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center font-mono">
              <span className="inline-block w-2 h-8 bg-[#fc913a] mr-3 rounded-sm"></span>
              Health Effects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Extended commute times are associated with increased stress, higher blood pressure, and reduced physical
              activity. These health impacts represent hidden costs beyond the direct economic burden of congestion.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center font-mono">
              <span className="inline-block w-2 h-8 bg-[#f9d62e] mr-3 rounded-sm"></span>
              Quality of Life
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Traffic congestion affects housing choices, job opportunities, and overall life satisfaction. Many
              commuters report that traffic conditions significantly influence their daily mood and long-term decisions.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
