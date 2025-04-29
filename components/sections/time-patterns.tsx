"use client"

import { useRef } from "react"
import { useInView } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, BarChart2, CalendarDays, AlertTriangle } from "lucide-react"

export default function TimePatterns() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 })

  return (
    <section id="patterns" ref={sectionRef} className="section">
      <div className="section-title">Temporal Patterns</div>
      <div className="section-subtitle">How traffic congestion varies by time of day, day of week, and season</div>

      <div className="narrative-text">
        <p className="mb-4">
          Traffic congestion isn't static—it ebbs and flows throughout the day, week, and year. Understanding these
          temporal patterns is crucial for both commuters planning their trips and transportation agencies designing
          mitigation strategies.
        </p>
        <p>
          By analyzing how congestion varies over time, we can identify <span className="highlight">peak periods</span>{" "}
          and understand the factors that contribute to traffic buildup during specific timeframes.
        </p>
      </div>

      <div className="flex items-center justify-center p-8 mb-8 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex flex-col items-center text-center max-w-2xl">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Temporal Data Not Currently Available</h3>
          <p className="text-muted-foreground">
            This section would display how congestion patterns vary throughout the day, week, and year. However, the
            current dataset does not include this temporal information.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <Clock className="h-8 w-8 text-primary" />
            <CardTitle>Daily Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Temporal data would reveal how congestion builds during morning rush hours (typically 7-9 AM), decreases
              during midday, and peaks again during evening commutes (4-6 PM). This information helps commuters plan
              optimal travel times and assists transportation agencies in managing traffic flow during peak periods.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <BarChart2 className="h-8 w-8 text-primary" />
            <CardTitle>Weekly Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Weekly pattern data would show how congestion differs between weekdays and weekends, and identify which
              days experience the highest traffic volumes. This information helps in planning infrastructure maintenance
              and special event management to minimize disruption.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <CalendarDays className="h-8 w-8 text-primary" />
            <CardTitle>Seasonal Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Seasonal data would highlight how traffic patterns change throughout the year due to factors like school
              schedules, holidays, tourism, and weather conditions. Understanding these patterns helps in long-term
              transportation planning and resource allocation.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h3 className="text-xl font-bold mb-4">Future Data Collection Opportunities</h3>
        <p className="mb-4">
          To better understand temporal traffic patterns across Texas's most congested roadways, future data collection
          efforts could include:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Hourly traffic volume counts throughout the day</li>
          <li>Day-of-week comparisons for each roadway segment</li>
          <li>Monthly and seasonal trend analysis</li>
          <li>Special event impact assessment</li>
          <li>Weather-related congestion pattern analysis</li>
        </ul>
      </div>
    </section>
  )
}
