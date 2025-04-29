"use client"

import { useState, useEffect, useRef } from "react"
import { useInView, motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchRoadwayData } from "@/lib/api"
import type { RoadwayData } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

export default function RoadTypeAnalysis() {
  const [roadways, setRoadways] = useState<RoadwayData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRoadType, setSelectedRoadType] = useState<string | null>(null)
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

  // Analyze road types based on name patterns
  const getRoadType = (name: string): string => {
    const lowerName = name.toLowerCase()
    if (
      lowerName.includes("ih") ||
      lowerName.includes("interstate") ||
      lowerName.startsWith("i-") ||
      lowerName.match(/^i\s\d/)
    ) {
      return "Interstate"
    } else if (lowerName.includes("sh") || lowerName.includes("state highway")) {
      return "State Highway"
    } else if (lowerName.includes("us") || lowerName.includes("u.s.")) {
      return "US Highway"
    } else if (lowerName.includes("fm") || lowerName.includes("farm to market")) {
      return "Farm to Market"
    } else if (lowerName.includes("lp") || lowerName.includes("loop")) {
      return "Loop"
    } else if (lowerName.includes("spur")) {
      return "Spur"
    } else if (lowerName.includes("blvd") || lowerName.includes("boulevard")) {
      return "Boulevard"
    } else if (lowerName.includes("pkwy") || lowerName.includes("parkway")) {
      return "Parkway"
    } else if (lowerName.includes("dr") || lowerName.includes("drive")) {
      return "Drive"
    } else if (lowerName.includes("rd") || lowerName.includes("road")) {
      return "Road"
    } else if (lowerName.includes("ave") || lowerName.includes("avenue")) {
      return "Avenue"
    } else if (lowerName.includes("st") || lowerName.includes("street")) {
      return "Street"
    } else {
      return "Other"
    }
  }

  // Group roadways by type
  const roadTypeData = roadways.reduce(
    (acc, road) => {
      const type = getRoadType(road.name)
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          totalCongestion: 0,
          totalDelay: 0,
          totalCost: 0,
          roads: [],
        }
      }
      acc[type].count += 1
      acc[type].totalCongestion += road.congestionIndex
      acc[type].totalDelay += road.delayPerMile
      acc[type].totalCost += road.costOfDelay
      acc[type].roads.push(road)
      return acc
    },
    {} as Record<
      string,
      { count: number; totalCongestion: number; totalDelay: number; totalCost: number; roads: RoadwayData[] }
    >,
  )

  // Convert to array for charts
  const roadTypeChartData = Object.entries(roadTypeData)
    .map(([type, data]) => ({
      type,
      count: data.count,
      avgCongestion: data.totalCongestion / data.count,
      avgDelay: data.totalDelay / data.count,
      totalCost: data.totalCost,
      costPercentage: (data.totalCost / roadways.reduce((sum, road) => sum + road.costOfDelay, 0)) * 100,
      roads: data.roads,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8) // Limit to top 8 for better visualization

  // Pudding-style color palette - vibrant, distinctive colors
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

  // Handle bar click for detailed view
  const handleBarClick = (data: any) => {
    if (selectedRoadType === data.type) {
      setSelectedRoadType(null)
      setHighlightedData(null)
    } else {
      setSelectedRoadType(data.type)
      setHighlightedData(data)
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

  return (
    <section id="road-types" ref={sectionRef} className="section bg-muted/20">
      <div className="section-title">Road Type Analysis</div>
      <div className="section-subtitle">How congestion varies across different types of roadways</div>

      <div className="narrative-text">
        <p className="mb-4">
          Not all roads are created equal when it comes to congestion. Different road types serve different purposes and
          experience varying levels of traffic pressure based on their design, location, and connectivity.
        </p>
        <p>
          By analyzing congestion patterns across <span className="highlight">different road classifications</span>, we
          can identify which types of roadways are most vulnerable to congestion and prioritize improvements
          accordingly.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div variants={itemVariants} className="col-span-1 lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
            <h3 className="text-2xl font-bold mb-6 font-mono">Distribution by Road Type</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Click on any bar to see detailed information about that road type. The height of each bar represents the
              number of congested segments in our dataset.
            </p>
            <div className="h-[400px]">
              {!isLoading && roadTypeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={roadTypeChartData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                    barCategoryGap={8}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                    <XAxis
                      type="number"
                      tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "monospace" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="type"
                      width={90}
                      tick={{ fill: "#6b7280", fontSize: 13, fontFamily: "monospace" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={() => null} />
                    <Bar
                      dataKey="count"
                      name="Number of Roads"
                      radius={[0, 4, 4, 0]}
                      animationDuration={1500}
                      onClick={handleBarClick}
                      cursor="pointer"
                    >
                      {roadTypeChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            selectedRoadType === entry.type
                              ? COLORS[index % COLORS.length]
                              : COLORS[index % COLORS.length] + "99"
                          }
                          style={{
                            filter:
                              selectedRoadType === entry.type ? "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))" : "none",
                            transition: "all 0.3s ease",
                          }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                    <p className="mt-2 text-muted-foreground">Loading road type data...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="text-center mt-2 text-sm text-muted-foreground font-mono">
              Number of congested road segments
            </div>
          </div>
        </motion.div>

        {selectedRoadType && highlightedData && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-1 lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold font-mono">{selectedRoadType} Details</h3>
                  <p className="text-muted-foreground mt-1">
                    {highlightedData.count} congested segments | Average congestion index:{" "}
                    {highlightedData.avgCongestion.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedRoadType(null)
                    setHighlightedData(null)
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3 font-mono">Top Congested {selectedRoadType}s</h4>
                  <div className="space-y-3">
                    {highlightedData.roads
                      .sort((a: RoadwayData, b: RoadwayData) => b.congestionIndex - a.congestionIndex)
                      .slice(0, 5)
                      .map((road: RoadwayData, i: number) => (
                        <div key={i} className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{
                              backgroundColor:
                                COLORS[roadTypeChartData.findIndex((d) => d.type === selectedRoadType) % COLORS.length],
                            }}
                          ></div>
                          <div>
                            <div className="font-medium">{road.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Congestion Index: {road.congestionIndex.toFixed(2)} | District: {road.district}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 font-mono">Key Characteristics</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                      <span>
                        <strong>Average Delay:</strong> {highlightedData.avgDelay.toFixed(1)} hours per mile annually
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                      <span>
                        <strong>Economic Impact:</strong> ${(highlightedData.totalCost / 1000000).toFixed(1)} million
                        annually
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                      <span>
                        <strong>Percentage of Total Cost:</strong> {highlightedData.costPercentage.toFixed(1)}% of all
                        congestion costs
                      </span>
                    </li>
                  </ul>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-3 font-mono">Why This Matters</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedRoadType === "Interstate" &&
                        "Interstate highways form the backbone of Texas's transportation network, carrying both local and interstate traffic. Their congestion has widespread economic impacts."}
                      {selectedRoadType === "State Highway" &&
                        "State highways connect major cities and regions within Texas. Their congestion affects both urban commuters and regional travelers."}
                      {selectedRoadType === "US Highway" &&
                        "US highways serve as important connectors between states and regions. Their congestion impacts interstate commerce and regional mobility."}
                      {selectedRoadType === "Loop" &&
                        "Loop roads circle urban areas and are designed to distribute traffic around cities. Their congestion indicates pressure points in urban mobility."}
                      {selectedRoadType === "Boulevard" &&
                        "Boulevards are major urban arterials that distribute traffic within cities. Their congestion directly impacts daily urban commutes."}
                      {selectedRoadType === "Farm to Market" &&
                        "Farm to Market roads connect rural areas to urban centers. Their congestion indicates growing suburban development pressures."}
                      {selectedRoadType.includes("Parkway") &&
                        "Parkways are designed for smoother traffic flow with limited access. Their congestion suggests capacity issues in key corridors."}
                      {selectedRoadType === "Other" &&
                        "This category includes various road types that don't fit standard classifications but still experience significant congestion."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center font-mono">
              <span className="inline-block w-2 h-8 bg-[#ff4e50] mr-3 rounded-sm"></span>
              Interstate Highways
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Interstate highways show the highest congestion levels among all road types, particularly in urban areas.
              Despite being designed for high capacity, these roads often serve as critical arteries and become
              bottlenecks during peak hours.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center font-mono">
              <span className="inline-block w-2 h-8 bg-[#fc913a] mr-3 rounded-sm"></span>
              Urban Arterials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Major boulevards and parkways in urban centers experience significant congestion due to their role in
              connecting residential areas with commercial districts. These roads often have multiple intersections that
              contribute to traffic buildup.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center font-mono">
              <span className="inline-block w-2 h-8 bg-[#f9d62e] mr-3 rounded-sm"></span>
              Loop Roads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Loop roads and beltways around major cities show varying congestion patterns. While designed to divert
              traffic from city centers, they often become congested themselves as development follows these
              transportation corridors.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
