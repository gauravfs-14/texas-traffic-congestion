"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useInView } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap } from "react-leaflet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { fetchRoadwayData, getCongestionColor, formatCurrency } from "@/lib/api"
import type { RoadwayData } from "@/lib/types"
import "leaflet/dist/leaflet.css"
import type { Layer } from "leaflet"

// Component to handle map interactions
function MapInteractions({
  roadways,
  setHighlightedRoad,
  highlightedRoad,
  geoJSONLayersRef,
}: {
  roadways: RoadwayData[]
  setHighlightedRoad: (id: number | null) => void
  highlightedRoad: number | null
  geoJSONLayersRef: React.MutableRefObject<Record<number, Layer>>
}) {
  const map = useMap()

  // Apply styling based on highlighted road
  useEffect(() => {
    const layers = geoJSONLayersRef.current

    if (highlightedRoad === null) {
      // Reset all layers to normal
      Object.values(layers).forEach((layer) => {
        ;(layer as any).setStyle({
          opacity: 0.8,
          weight: 5,
        })
      })
    } else {
      // Dim all layers except the highlighted one
      Object.entries(layers).forEach(([id, layer]) => {
        if (Number.parseInt(id) === highlightedRoad) {
          ;(layer as any).setStyle({
            opacity: 1,
            weight: 8,
          })
          ;(layer as any).bringToFront()
        } else {
          ;(layer as any).setStyle({
            opacity: 0.3,
            weight: 3,
          })
        }
      })
    }
  }, [highlightedRoad, geoJSONLayersRef])

  // Reset map view when component unmounts
  useEffect(() => {
    return () => {
      map.eachLayer((layer: any) => {
        if (layer._path) {
          layer.setStyle({
            opacity: 0.8,
            weight: 5,
          })
        }
      })
    }
  }, [map])

  return null
}

export default function CongestionMap() {
  const [roadways, setRoadways] = useState<RoadwayData[]>([])
  const [filteredRoadways, setFilteredRoadways] = useState<RoadwayData[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [congestionRange, setCongestionRange] = useState<[number, number]>([0, 3])
  const [isLoading, setIsLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([31.9686, -99.9018]) // Center of Texas
  const [mapZoom, setMapZoom] = useState(6)
  const [highlightedRoad, setHighlightedRoad] = useState<number | null>(null)

  // Use ref instead of state for GeoJSON layers to avoid state updates during render
  const geoJSONLayersRef = useRef<Record<number, Layer>>({})

  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 })

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const data = await fetchRoadwayData()
      setRoadways(data)
      setFilteredRoadways(data)
      setIsLoading(false)
    }

    loadData()
  }, [])

  useEffect(() => {
    if (roadways.length === 0) return

    let filtered = [...roadways]

    if (selectedDistrict !== "all") {
      filtered = filtered.filter((road) => road.district === selectedDistrict)
    }

    filtered = filtered.filter(
      (road) => road.congestionIndex >= congestionRange[0] && road.congestionIndex <= congestionRange[1],
    )

    setFilteredRoadways(filtered)

    // Adjust map center if filtering to a specific district
    if (selectedDistrict !== "all" && filtered.length > 0) {
      // Find the average coordinates of the filtered roadways
      const coords = filtered.flatMap((road) => road.geometry.coordinates)
      if (coords.length > 0) {
        const avgLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length
        const avgLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length
        setMapCenter([avgLat, avgLng])
        setMapZoom(9)
      }
    } else {
      setMapCenter([31.9686, -99.9018])
      setMapZoom(6)
    }
  }, [roadways, selectedDistrict, congestionRange])

  const districts = [...new Set(roadways.map((road) => road.district))].sort()

  const onEachRoadway = (feature: any, layer: any) => {
    const roadway = roadways.find((r) => r.id === feature.id)
    if (!roadway) return

    // Store reference to the layer in the ref instead of state
    geoJSONLayersRef.current[feature.id] = layer

    layer.setStyle({
      color: getCongestionColor(roadway.congestionIndex),
      weight: 5,
      opacity: 0.8,
    })

    layer.on({
      mouseover: () => {
        setHighlightedRoad(feature.id)
      },
      mouseout: () => {
        setHighlightedRoad(null)
      },
      click: () => {
        // Keep the road highlighted when clicked
        if (highlightedRoad === feature.id) {
          setHighlightedRoad(null)
        } else {
          setHighlightedRoad(feature.id)
        }
      },
    })

    layer.bindPopup(() => {
      const popupContent = document.createElement("div")
      popupContent.innerHTML = `
        <div class="text-sm">
          <h3 class="font-bold">${roadway.name}</h3>
          <p>Rank: #${roadway.rank}</p>
          <p>District: ${roadway.district}</p>
          <p>Congestion Index: ${roadway.congestionIndex.toFixed(2)}</p>
          <p>Annual Delay Cost: ${formatCurrency(roadway.costOfDelay)}</p>
        </div>
      `
      return popupContent
    })
  }

  return (
    <section id="map" ref={sectionRef} className="section">
      <div className="section-title">Mapping Texas's Traffic Hotspots</div>
      <div className="section-subtitle">
        Explore the state's most congested roadways and their impact on daily commutes
      </div>

      <div className="narrative-text">
        <p className="mb-4">
          Every day, millions of Texans navigate a complex network of highways, interstates, and local roads. For many,
          traffic congestion has become an unavoidable part of daily life, particularly in major urban centers.
        </p>
        <p>
          The Texas Department of Transportation (TxDOT) tracks the{" "}
          <span className="highlight">top 100 most congested roadway segments</span> across the state, measuring factors
          like delay time, congestion costs, and impact on freight transportation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Filter by District</CardTitle>
            <CardDescription>Select a TxDOT district to focus on</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger>
                <SelectValue placeholder="Select a district" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Congestion Level</CardTitle>
            <CardDescription>Filter by congestion index (TCI)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="pt-4">
              <Slider
                defaultValue={[0, 3]}
                max={3}
                step={0.1}
                value={congestionRange}
                onValueChange={(value) => setCongestionRange(value as [number, number])}
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Low (0)</span>
                <span>Medium (1)</span>
                <span>High (2)</span>
                <span>Severe (3+)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Results</CardTitle>
            <CardDescription>Matching roadway segments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-4xl font-bold">{filteredRoadways.length}</div>
              <div className="text-muted-foreground">roadway segments</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full h-[80vh] rounded-lg overflow-hidden border border-border relative" style={{ zIndex: 10 }}>
        {!isLoading && (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
            className="z-10"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <ZoomControl position="bottomright" />

            <MapInteractions
              roadways={roadways}
              setHighlightedRoad={setHighlightedRoad}
              highlightedRoad={highlightedRoad}
              geoJSONLayersRef={geoJSONLayersRef}
            />

            {filteredRoadways.map((roadway) => (
              <GeoJSON
                key={roadway.id}
                data={{
                  type: "Feature",
                  id: roadway.id,
                  geometry: roadway.geometry,
                  properties: {},
                }}
                onEachFeature={onEachRoadway}
              />
            ))}
          </MapContainer>
        )}

        {isLoading && (
          <div className="flex items-center justify-center h-full bg-muted/20">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
              <p className="mt-2 text-muted-foreground">Loading map data...</p>
            </div>
          </div>
        )}

        {highlightedRoad !== null && (
          <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-20 max-w-xs">
            <button
              onClick={() => setHighlightedRoad(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ×
            </button>
            <h4 className="font-bold mb-1">{roadways.find((r) => r.id === highlightedRoad)?.name}</h4>
            <p className="text-sm text-muted-foreground mb-2">
              {roadways.find((r) => r.id === highlightedRoad)?.district} District
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Rank</div>
                <div className="font-medium">#{roadways.find((r) => r.id === highlightedRoad)?.rank}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Congestion Index</div>
                <div className="font-medium">
                  {roadways.find((r) => r.id === highlightedRoad)?.congestionIndex.toFixed(2)}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-muted-foreground">Annual Cost</div>
                <div className="font-medium">
                  {formatCurrency(roadways.find((r) => r.id === highlightedRoad)?.costOfDelay || 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">Legend</div>
          <div className="space-y-2 mt-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-congestion-low mr-2"></div>
              <span>Low Congestion (TCI &lt; 1)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-congestion-medium mr-2"></div>
              <span>Medium Congestion (TCI 1-1.5)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-congestion-high mr-2"></div>
              <span>High Congestion (TCI 1.5-2)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-congestion-severe mr-2"></div>
              <span>Severe Congestion (TCI 2-2.5)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-congestion-extreme mr-2"></div>
              <span>Extreme Congestion (TCI &gt; 2.5)</span>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">What is TCI?</div>
          <p className="mt-2 text-sm">
            The <strong>Travel Congestion Index (TCI)</strong> measures the ratio of peak period travel time to
            free-flow travel time. A TCI of 1.5 means it takes 50% longer to travel during peak hours compared to
            free-flow conditions.
          </p>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg md:col-span-2">
          <div className="text-sm text-muted-foreground">Key Insights</div>
          <ul className="mt-2 text-sm space-y-1 list-disc pl-4">
            <li>Most congested roadways are concentrated in major urban areas</li>
            <li>Houston, Dallas-Fort Worth, and Austin contain the majority of congested segments</li>
            <li>Interstate highways and major arterials experience the highest congestion levels</li>
            <li>Rush hour congestion can increase travel times by over 100% on the worst segments</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
