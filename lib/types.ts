export interface RoadwayFeature {
  type: string
  id: number
  geometry: {
    type: string
    coordinates: number[][]
  }
  properties: {
    SEG_ID: number
    RANK: number
    TRK_RANK: number
    RD_NM: string
    DLAY_MILE: number
    TCI: number
    COST_DLAY: number
    DIST_NM: string
    YR: number
    TRK_DLY: number
    COST_TRK: number
    FID: number
    Shape_Leng: number
    Shape__Length: number
  }
}

export interface GeoJSONResponse {
  type: string
  features: RoadwayFeature[]
}

export interface RoadwayData {
  id: number
  name: string
  rank: number
  truckRank: number
  district: string
  delayPerMile: number
  congestionIndex: number
  costOfDelay: number
  truckDelay: number
  costOfTruckDelay: number
  year: number
  geometry: {
    type: string
    coordinates: number[][]
  }
}

export interface DistrictSummary {
  name: string
  roadCount: number
  avgDelayPerMile: number
  totalCostOfDelay: number
  avgCongestionIndex: number
}

export interface CongestionCategory {
  label: string
  color: string
  range: [number, number]
  count: number
}
