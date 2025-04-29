"use client"

import { useState, useEffect, useRef } from "react"
import { useInView, motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchRoadwayData, formatCurrency, formatNumber } from "@/lib/api"
import type { RoadwayData } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

export default function CongestionRankings() {
  const [roadways, setRoadways] = useState<RoadwayData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overall")
  const [selectedRoad, setSelectedRoad] = useState<number | null>(null)
  const [roadDetails, setRoadDetails] = useState<RoadwayData | null>(null)

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

  // Pudding-style color palette
  const COLORS = {
    overall: "#ff4e50", // coral red
    truck: "#4bb5c1", // teal
    cost: "#f9d62e", // yellow
  }

  const top10Overall = [...roadways]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 10)
    .map((road) => ({
      id: road.id,
      name: road.name.length > 25 ? road.name.substring(0, 22) + "..." : road.name,
      fullName: road.name,
      value: road.delayPerMile,
      district: road.district,
      congestionIndex: road.congestionIndex,
      costOfDelay: road.costOfDelay,
      rank: road.rank,
      truckRank: road.truckRank,
      truckDelay: road.truckDelay,
      costOfTruckDelay: road.costOfTruckDelay,
    }))

  const top10Truck = [...roadways]
    .sort((a, b) => a.truckRank - b.truckRank)
    .slice(0, 10)
    .map((road) => ({
      id: road.id,
      name: road.name.length > 25 ? road.name.substring(0, 22) + "..." : road.name,
      fullName: road.name,
      value: road.truckDelay,
      district: road.district,
      congestionIndex: road.congestionIndex,
      costOfDelay: road.costOfTruckDelay,
      rank: road.rank,
      truckRank: road.truckRank,
      truckDelay: road.truckDelay,
      costOfTruckDelay: road.costOfTruckDelay,
    }))

  const top10Cost = [...roadways]
    .sort((a, b) => b.costOfDelay - a.costOfDelay)
    .slice(0, 10)
    .map((road) => ({
      id: road.id,
      name: road.name.length > 25 ? road.name.substring(0, 22) + "..." : road.name,
      fullName: road.name,
      value: road.costOfDelay,
      district: road.district,
      congestionIndex: road.congestionIndex,
      costOfDelay: road.costOfDelay,
      rank: road.rank,
      truckRank: road.truckRank,
      truckDelay: road.truckDelay,
      costOfTruckDelay: road.costOfTruckDelay,
    }))

  const handleBarClick = (data: any) => {
    if (selectedRoad === data.id) {
      setSelectedRoad(null)
      setRoadDetails(null)
    } else {
      setSelectedRoad(data.id)
      const roadData = roadways.find((r) => r.id === data.id) || null
      setRoadDetails(roadData)
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

  const getActiveData = () => {
    switch (activeTab) {
      case "overall":
        return top10Overall
      case "truck":
        return top10Truck
      case "cost":
        return top10Cost
      default:
        return top10Overall
    }
  }

  const getAxisLabel = () => {
    switch (activeTab) {
      case "overall":
        return "Annual Hours of Delay per Mile"
      case "truck":
        return "Annual Truck Delay Hours"
      case "cost":
        return "Annual Cost of Delay (Millions)"
      default:
        return ""
    }
  }

  const formatXAxis = (value: number) => {
    if (activeTab === "cost") {
      return `$${(value / 1000000).toFixed(0)}M`
    }
    return value.toLocaleString()
  }

  return (
    <section id="rankings" ref={sectionRef} className="section bg-muted/20">
      <div className="section-title">The Worst Offenders</div>
      <div className="section-subtitle">Ranking Texas's most problematic roadways by different metrics</div>

      <div className="narrative-text">
        <p className="mb-4">
          Not all congested roadways are created equal. Some create bottlenecks that affect thousands of commuters
          daily, while others significantly impact freight transportation and the economy.
        </p>
        <p>
          By examining different ranking metrics, we can better understand the{" "}
          <span className="highlight">various dimensions of traffic congestion</span> and its impact on different
          stakeholders.
        </p>
      </div>

      <Tabs
        defaultValue="overall"
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value)
          setSelectedRoad(null)
          setRoadDetails(null)
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-transparent border-b border-muted">
          <TabsTrigger
            value="overall"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#ff4e50] data-[state=active]:shadow-none rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground font-mono"
          >
            Overall Congestion
          </TabsTrigger>
          <TabsTrigger
            value="truck"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#4bb5c1] data-[state=active]:shadow-none rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground font-mono"
          >
            Truck Congestion
          </TabsTrigger>
          <TabsTrigger
            value="cost"
            className="data-[state=active]:border-b-2 data-[state=active]:border-[#f9d62e] data-[state=active]:shadow-none rounded-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground font-mono"
          >
            Economic Impact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="mt-0">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="w-full"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm mb-6">
              <h3 className="text-2xl font-bold mb-6 font-mono">Top 10 Most Congested Roads</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                Click on any bar to see detailed information about that road segment. The length of each bar represents
                the annual hours of delay per mile.
              </p>

              <div className="h-[50vh] md:h-[60vh]">
                {!isLoading ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={top10Overall}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 150, bottom: 40 }}
                      barCategoryGap={8}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                      <XAxis
                        type="number"
                        tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "monospace" }}
                        tickFormatter={formatXAxis}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={140}
                        tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "monospace" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={() => null} />
                      <Bar
                        dataKey="value"
                        radius={[0, 4, 4, 0]}
                        animationDuration={1500}
                        onClick={handleBarClick}
                        cursor="pointer"
                      >
                        {top10Overall.map((entry) => (
                          <Cell
                            key={`cell-${entry.id}`}
                            fill={selectedRoad === entry.id ? COLORS.overall : `${COLORS.overall}99`}
                            style={{
                              filter:
                                selectedRoad === entry.id ? "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))" : "none",
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
                      <p className="mt-2 text-muted-foreground">Loading ranking data...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pudding-style annotation labels */}
              <div className="text-center mt-4 text-sm text-muted-foreground font-mono">
                Annual Hours of Delay per Mile
              </div>
            </div>

            {selectedRoad && roadDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold font-mono">{roadDetails.name}</h3>
                    <p className="text-muted-foreground mt-1">
                      {roadDetails.district} District | Rank: #{roadDetails.rank}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRoad(null)
                      setRoadDetails(null)
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3 font-mono">Congestion Metrics</h4>
                    <div className="space-y-4">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-red-200 text-red-800">
                              Congestion Index
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-red-800">
                              {roadDetails.congestionIndex.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
                          <div
                            style={{ width: `${Math.min((roadDetails.congestionIndex / 3) * 100, 100)}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                          ></div>
                        </div>
                      </div>

                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-800">
                              Delay per Mile
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-blue-800">
                              {formatNumber(roadDetails.delayPerMile)} hours
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                          <div
                            style={{ width: `${Math.min((roadDetails.delayPerMile / 300) * 100, 100)}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                          ></div>
                        </div>
                      </div>

                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-yellow-200 text-yellow-800">
                              Annual Cost
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-yellow-800">
                              {formatCurrency(roadDetails.costOfDelay)}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-yellow-200">
                          <div
                            style={{ width: `${Math.min((roadDetails.costOfDelay / 50000000) * 100, 100)}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-3 font-mono">Impact Analysis</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                        <span>
                          <strong>Commuter Impact:</strong> An estimated{" "}
                          {formatNumber(Math.round(roadDetails.delayPerMile * 5000))} hours lost annually by commuters
                          on this segment
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                        <span>
                          <strong>Truck Ranking:</strong> #{roadDetails.truckRank} for truck congestion with{" "}
                          {formatNumber(roadDetails.truckDelay)} hours of truck delay
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                        <span>
                          <strong>Truck-Related Costs:</strong> {formatCurrency(roadDetails.costOfTruckDelay)} in annual
                          economic impact from truck delays
                        </span>
                      </li>
                    </ul>

                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-3 font-mono">Why This Matters</h4>
                      <p className="text-sm text-muted-foreground">
                        This road segment represents one of the most significant bottlenecks in Texas's transportation
                        network. Its high congestion levels affect thousands of daily commuters and have substantial
                        economic impacts through increased transportation costs, wasted fuel, and lost productivity.
                        Addressing congestion on this segment would yield significant benefits for both commuters and
                        businesses.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <div className="mt-6 text-sm text-muted-foreground">
            <p>
              <strong>Overall Congestion Ranking</strong> is based on the annual hours of delay per mile experienced by
              all vehicles. This metric captures the intensity of congestion on each roadway segment.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="truck" className="mt-0">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="w-full"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm mb-6">
              <h3 className="text-2xl font-bold mb-6 font-mono">Top 10 Roads for Truck Congestion</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                Click on any bar to see detailed information about that road segment. The length of each bar represents
                the annual truck delay hours.
              </p>

              <div className="h-[50vh] md:h-[60vh]">
                {!isLoading ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={top10Truck}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 150, bottom: 40 }}
                      barCategoryGap={8}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                      <XAxis
                        type="number"
                        tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "monospace" }}
                        tickFormatter={formatXAxis}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={140}
                        tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "monospace" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={() => null} />
                      <Bar
                        dataKey="value"
                        radius={[0, 4, 4, 0]}
                        animationDuration={1500}
                        onClick={handleBarClick}
                        cursor="pointer"
                      >
                        {top10Truck.map((entry) => (
                          <Cell
                            key={`cell-${entry.id}`}
                            fill={selectedRoad === entry.id ? COLORS.truck : `${COLORS.truck}99`}
                            style={{
                              filter:
                                selectedRoad === entry.id ? "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))" : "none",
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
                      <p className="mt-2 text-muted-foreground">Loading ranking data...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pudding-style annotation labels */}
              <div className="text-center mt-4 text-sm text-muted-foreground font-mono">Annual Truck Delay Hours</div>
            </div>

            {selectedRoad && roadDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold font-mono">{roadDetails.name}</h3>
                    <p className="text-muted-foreground mt-1">
                      {roadDetails.district} District | Truck Rank: #{roadDetails.truckRank}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRoad(null)
                      setRoadDetails(null)
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3 font-mono">Truck Congestion Metrics</h4>
                    <div className="space-y-4">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-teal-200 text-teal-800">
                              Truck Delay
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-teal-800">
                              {formatNumber(roadDetails.truckDelay)} hours
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-teal-200">
                          <div
                            style={{ width: `${Math.min((roadDetails.truckDelay / 100000) * 100, 100)}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-500"
                          ></div>
                        </div>
                      </div>

                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-800">
                              Congestion Index
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-blue-800">
                              {roadDetails.congestionIndex.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                          <div
                            style={{ width: `${Math.min((roadDetails.congestionIndex / 3) * 100, 100)}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                          ></div>
                        </div>
                      </div>

                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-yellow-200 text-yellow-800">
                              Truck Cost
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-yellow-800">
                              {formatCurrency(roadDetails.costOfTruckDelay)}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-yellow-200">
                          <div
                            style={{ width: `${Math.min((roadDetails.costOfTruckDelay / 10000000) * 100, 100)}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-3 font-mono">Freight Impact Analysis</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                        <span>
                          <strong>Overall Rank:</strong> #{roadDetails.rank} in general congestion
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                        <span>
                          <strong>Supply Chain Impact:</strong> Estimated {Math.round(roadDetails.truckDelay / 24)}{" "}
                          truck-days lost annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                        <span>
                          <strong>Economic Significance:</strong> Critical freight corridor with substantial impact on
                          regional supply chains
                        </span>
                      </li>
                    </ul>

                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-3 font-mono">Why This Matters</h4>
                      <p className="text-sm text-muted-foreground">
                        Truck congestion on this segment has far-reaching economic consequences beyond the immediate
                        delay costs. As a critical freight corridor, delays here ripple through supply chains, affecting
                        inventory management, delivery schedules, and ultimately consumer prices. Improving freight
                        mobility on this segment would enhance regional economic competitiveness and reduce
                        transportation costs for businesses.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <div className="mt-6 text-sm text-muted-foreground">
            <p>
              <strong>Truck Congestion Ranking</strong> focuses specifically on delays experienced by commercial trucks.
              This metric is particularly important for understanding the impact on supply chains and freight
              transportation.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="cost" className="mt-0">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="w-full"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm mb-6">
              <h3 className="text-2xl font-bold mb-6 font-mono">Top 10 Roads by Economic Impact</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                Click on any bar to see detailed information about that road segment. The length of each bar represents
                the annual cost of delay in millions of dollars.
              </p>

              <div className="h-[50vh] md:h-[60vh]">
                {!isLoading ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={top10Cost}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 150, bottom: 40 }}
                      barCategoryGap={8}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                      <XAxis
                        type="number"
                        tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "monospace" }}
                        tickFormatter={formatXAxis}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={140}
                        tick={{ fill: "#6b7280", fontSize: 12, fontFamily: "monospace" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={() => null} />
                      <Bar
                        dataKey="value"
                        radius={[0, 4, 4, 0]}
                        animationDuration={1500}
                        onClick={handleBarClick}
                        cursor="pointer"
                      >
                        {top10Cost.map((entry) => (
                          <Cell
                            key={`cell-${entry.id}`}
                            fill={selectedRoad === entry.id ? COLORS.cost : `${COLORS.cost}99`}
                            style={{
                              filter:
                                selectedRoad === entry.id ? "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))" : "none",
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
                      <p className="mt-2 text-muted-foreground">Loading ranking data...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pudding-style annotation labels */}
              <div className="text-center mt-4 text-sm text-muted-foreground font-mono">
                Annual Cost of Delay (Millions of Dollars)
              </div>
            </div>

            {selectedRoad && roadDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold font-mono">{roadDetails.name}</h3>
                    <p className="text-muted-foreground mt-1">
                      {roadDetails.district} District | Economic Impact: {formatCurrency(roadDetails.costOfDelay)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRoad(null)
                      setRoadDetails(null)
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3 font-mono">Economic Impact Breakdown</h4>
                    <div className="space-y-4">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-yellow-200 text-yellow-800">
                              Total Cost
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-yellow-800">
                              {formatCurrency(roadDetails.costOfDelay)}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-yellow-200">
                          <div
                            style={{ width: `100%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
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
                              {formatCurrency(roadDetails.costOfTruckDelay)}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-teal-200">
                          <div
                            style={{ width: `${(roadDetails.costOfTruckDelay / roadDetails.costOfDelay) * 100}%` }}
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
                              {formatCurrency(roadDetails.costOfDelay - roadDetails.costOfTruckDelay)}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                          <div
                            style={{
                              width: `${((roadDetails.costOfDelay - roadDetails.costOfTruckDelay) / roadDetails.costOfDelay) * 100}%`,
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-3 font-mono">Economic Context</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                        <span>
                          <strong>Per Commuter Cost:</strong> Approximately{" "}
                          {formatCurrency(roadDetails.costOfDelay / 10000)} per regular user annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                        <span>
                          <strong>Fuel Waste:</strong> Estimated {Math.round(roadDetails.costOfDelay / 4 / 3.5)} gallons
                          of fuel wasted annually
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                        <span>
                          <strong>Productivity Loss:</strong> Equivalent to approximately{" "}
                          {Math.round(roadDetails.costOfDelay / 50000)} full-time jobs
                        </span>
                      </li>
                    </ul>

                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-3 font-mono">Economic Significance</h4>
                      <p className="text-sm text-muted-foreground">
                        The economic impact of congestion on this segment represents a significant drain on the regional
                        economy. These costs are distributed across businesses, commuters, and ultimately consumers
                        through higher prices, reduced productivity, and diminished quality of life. Investments in
                        reducing congestion here would likely yield substantial economic returns through improved
                        mobility and reduced transportation costs.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <div className="mt-6 text-sm text-muted-foreground">
            <p>
              <strong>Economic Impact Ranking</strong> measures the total annual cost of congestion-related delays. This
              includes factors like wasted fuel, lost productivity, and increased transportation costs.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
