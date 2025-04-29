import type { GeoJSONResponse, RoadwayData, DistrictSummary, CongestionCategory } from "./types"

const API_URL =
  "https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Top_100_Congested_Roadways/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson"

export async function fetchRoadwayData(): Promise<RoadwayData[]> {
  try {
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`)
    }

    const data: GeoJSONResponse = await response.json()

    return data.features.map((feature) => ({
      id: feature.id,
      name: feature.properties.RD_NM,
      rank: feature.properties.RANK,
      truckRank: feature.properties.TRK_RANK,
      district: feature.properties.DIST_NM,
      delayPerMile: feature.properties.DLAY_MILE,
      congestionIndex: feature.properties.TCI,
      costOfDelay: feature.properties.COST_DLAY,
      truckDelay: feature.properties.TRK_DLY,
      costOfTruckDelay: feature.properties.COST_TRK,
      year: feature.properties.YR,
      geometry: feature.geometry,
    }))
  } catch (error) {
    console.error("Error fetching roadway data:", error)
    return []
  }
}

export function getDistrictSummaries(roadways: RoadwayData[]): DistrictSummary[] {
  const districtMap = new Map<
    string,
    {
      roadCount: number
      totalDelayPerMile: number
      totalCostOfDelay: number
      totalCongestionIndex: number
    }
  >()

  roadways.forEach((road) => {
    const district = road.district
    const current = districtMap.get(district) || {
      roadCount: 0,
      totalDelayPerMile: 0,
      totalCostOfDelay: 0,
      totalCongestionIndex: 0,
    }

    districtMap.set(district, {
      roadCount: current.roadCount + 1,
      totalDelayPerMile: current.totalDelayPerMile + road.delayPerMile,
      totalCostOfDelay: current.totalCostOfDelay + road.costOfDelay,
      totalCongestionIndex: current.totalCongestionIndex + road.congestionIndex,
    })
  })

  return Array.from(districtMap.entries())
    .map(([name, stats]) => ({
      name,
      roadCount: stats.roadCount,
      avgDelayPerMile: stats.totalDelayPerMile / stats.roadCount,
      totalCostOfDelay: stats.totalCostOfDelay,
      avgCongestionIndex: stats.totalCongestionIndex / stats.roadCount,
    }))
    .sort((a, b) => b.roadCount - a.roadCount)
}

export function getCongestionCategories(roadways: RoadwayData[]): CongestionCategory[] {
  const categories: CongestionCategory[] = [
    { label: "Low", color: "#4ade80", range: [0, 1], count: 0 },
    { label: "Medium", color: "#facc15", range: [1, 1.5], count: 0 },
    { label: "High", color: "#f87171", range: [1.5, 2], count: 0 },
    { label: "Severe", color: "#ef4444", range: [2, 2.5], count: 0 },
    { label: "Extreme", color: "#b91c1c", range: [2.5, Number.POSITIVE_INFINITY], count: 0 },
  ]

  roadways.forEach((road) => {
    const tci = road.congestionIndex
    const category = categories.find((cat) => tci >= cat.range[0] && tci < cat.range[1])
    if (category) {
      category.count++
    }
  })

  return categories
}

export function getCongestionColor(tci: number): string {
  if (tci < 1) return "#4ade80"
  if (tci < 1.5) return "#facc15"
  if (tci < 2) return "#f87171"
  if (tci < 2.5) return "#ef4444"
  return "#b91c1c"
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}
