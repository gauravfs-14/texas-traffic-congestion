"use client"

import { useState, useEffect, useRef } from "react"
import { useInView, motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchRoadwayData, getCongestionColor, formatCurrency, formatNumber } from "@/lib/api"
import type { RoadwayData } from "@/lib/types"
import {
  BarChart,
  Bar,
  ChartXAxis as XAxis,
  ChartYAxis as YAxis,
  ChartGrid as CartesianGrid,
  ChartTooltip,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
  ResponsiveContainer,
} from "@/components/ui/chart"

export default function PuddingStyleCharts() {
  const [roadways, setRoadways] = useState<RoadwayData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [hoveredPie, setHoveredPie] = useState<number | null>(null)

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

  // Calculate congestion categories
  const congestionCategories = [
    { name: "Low", range: [0, 1], color: "#4ade80" },
    { name: "Medium", range: [1, 1.5], color: "#facc15" },
    { name: "High", range: [1.5, 2], color: "#f87171" },
    { name: "Severe", range: [2, 2.5], color: "#ef4444" },
    { name: "Extreme", range: [2.5, 10], color: "#b91c1c" },
  ].map((category) => {
    const count = roadways.filter(
      (road) => road.congestionIndex >= category.range[0] && road.congestionIndex < category.range[1],
    ).length
    return {
      ...category,
      count,
      value: count, // For pie chart
    }
  })

  // Top 10 most congested roads
  const top10Roads = [...roadways]
    .sort((a, b) => b.congestionIndex - a.congestionIndex)
    .slice(0, 10)
    .map((road, index) => ({
      name: road.name.length > 25 ? road.name.substring(0, 22) + "..." : road.name,
      fullName: road.name,
      value: road.congestionIndex,
      district: road.district,
      delayPerMile: road.delayPerMile,
      costOfDelay: road.costOfDelay,
      color: getCongestionColor(road.congestionIndex),
      index,
    }))

  // District data
  const districtData = roadways.reduce(
    (acc, road) => {
      const district = road.district
      if (!acc[district]) {
        acc[district] = {
          count: 0,
          totalCongestion: 0,
          totalCost: 0,
        }
      }
      acc[district].count += 1
      acc[district].totalCongestion += road.congestionIndex
      acc[district].totalCost += road.costOfDelay
      return acc
    },
    {} as Record<string, { count: number; totalCongestion: number; totalCost: number }>,
  )

  const topDistricts = Object.entries(districtData)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgCongestion: data.totalCongestion / data.count,
      totalCost: data.totalCost,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

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

  // Custom tooltip formatter
  const congestionFormatter = (value: number) => value.toFixed(2)
  const costFormatter = (value: number) => formatCurrency(value)
  const countFormatter = (value: number) => formatNumber(value)

  return (
    <section id="pudding-charts" ref={sectionRef} className="section">
      <div className="section-title">Visualizing Texas Traffic</div>
      <div className="section-subtitle">Interactive data visualizations inspired by pudding.cool</div>

      <div className="narrative-text">
        <p className="mb-4">
          Data visualization helps us understand complex traffic patterns and their impacts. These charts provide
          different perspectives on Texas's congestion challenges.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-2xl">Congestion Severity Distribution</CardTitle>
              <CardDescription>Breakdown of roadways by congestion level</CardDescription>
            </CardHeader>
            <CardContent>
              {!isLoading ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={congestionCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        animationDuration={1500}
                        onMouseEnter={(_, index) => setHoveredPie(index)}
                        onMouseLeave={() => setHoveredPie(null)}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {congestionCategories.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={hoveredPie === index ? entry.color : `${entry.color}99`}
                            stroke={entry.color}
                            strokeWidth={hoveredPie === index ? 2 : 1}
                            style={{
                              filter: hoveredPie === index ? "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))" : "none",
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                            }}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip
                        formatter={(value, name, props) => [
                          `${value} roads (${((value / roadways.length) * 100).toFixed(1)}%)`,
                          `${props.payload.name} Congestion`,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[350px]">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                    <p className="mt-2 text-muted-foreground">Loading chart data...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-2xl">Top 10 Most Congested Roads</CardTitle>
              <CardDescription>Ranked by congestion index</CardDescription>
            </CardHeader>
            <CardContent>
              {!isLoading ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={top10Roads}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, "dataMax + 0.5"]} />
                      <YAxis type="category" dataKey="name" width={110} />
                      <ChartTooltip
                        labelFormatter={(label) => top10Roads.find((r) => r.name === label)?.fullName || label}
                        formatter={(value, name, props) => [congestionFormatter(value), "Congestion Index"]}
                        cursor={{ fill: "transparent" }}
                      />
                      <Bar
                        dataKey="value"
                        radius={[0, 4, 4, 0]}
                        animationDuration={1500}
                        onMouseEnter={(data) => setHoveredBar(data.index)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        {top10Roads.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={hoveredBar === index ? entry.color : `${entry.color}99`}
                            style={{
                              filter: hoveredBar === index ? "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))" : "none",
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                            }}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[350px]">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                    <p className="mt-2 text-muted-foreground">Loading chart data...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-2xl">District Comparison</CardTitle>
              <CardDescription>Number of congested roads by district</CardDescription>
            </CardHeader>
            <CardContent>
              {!isLoading ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topDistricts} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <ChartTooltip
                        formatter={(value, name, props) => {
                          if (name === "count") return [countFormatter(value), "Congested Roads"]
                          if (name === "avgCongestion") return [congestionFormatter(value), "Avg. Congestion Index"]
                          if (name === "totalCost") return [costFormatter(value), "Total Cost"]
                          return [value, name]
                        }}
                      />
                      <Bar
                        dataKey="count"
                        name="Congested Roads"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[350px]">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                    <p className="mt-2 text-muted-foreground">Loading chart data...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-2xl">Congestion vs. Cost</CardTitle>
              <CardDescription>Relationship between congestion index and economic cost</CardDescription>
            </CardHeader>
            <CardContent>
              {!isLoading ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={roadways.slice(0, 50).map((road, index) => ({
                        name: road.name,
                        congestionIndex: road.congestionIndex,
                        cost: road.costOfDelay / 1000000, // Convert to millions
                        index,
                      }))}
                      margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="congestionIndex"
                        label={{ value: "Congestion Index", position: "bottom", offset: 0 }}
                      />
                      <YAxis label={{ value: "Cost (Millions $)", angle: -90, position: "left" }} />
                      <ChartTooltip
                        labelFormatter={(label) => `Congestion Index: ${label}`}
                        formatter={(value, name, props) => {
                          if (name === "cost") return [`$${value.toFixed(1)}M`, "Annual Cost"]
                          return [value, name]
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cost"
                        stroke="#8884d8"
                        dot={{ r: 4, fill: "#8884d8" }}
                        activeDot={{ r: 6, fill: "#8884d8", stroke: "#fff" }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[350px]">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
                    <p className="mt-2 text-muted-foreground">Loading chart data...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="text-center text-sm text-muted-foreground mt-4">
        <p>
          These visualizations are inspired by the clean, interactive style of pudding.cool, focusing on clarity and
          user engagement.
        </p>
      </div>
    </section>
  )
}
