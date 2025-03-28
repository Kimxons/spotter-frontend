"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, Clock, Truck, MapPin, ArrowRight, Download } from "lucide-react"
import type { LogDay, RouteResult } from "@/lib/types"
import { motion } from "framer-motion"

interface LogSheetProps {
  routeResult: RouteResult
}

export default function LogSheet({ routeResult }: LogSheetProps) {
  const [activeTab, setActiveTab] = useState<string>(routeResult.logs[0]?.date || "")

  // Function to get color based on activity type
  const getActivityColor = (type: string) => {
    switch (type) {
      case "driving":
        return "bg-blue-500 dark:bg-blue-600"
      case "onDutyNotDriving":
        return "bg-amber-500 dark:bg-amber-600"
      case "offDuty":
        return "bg-green-500 dark:bg-green-600"
      case "sleeperBerth":
        return "bg-purple-500 dark:bg-purple-600"
      default:
        return "bg-gray-500 dark:bg-gray-600"
    }
  }

  // Function to get badge variant based on activity type
  const getActivityBadge = (type: string) => {
    switch (type) {
      case "driving":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50">
            Driving
          </Badge>
        )
      case "onDutyNotDriving":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50">
            On Duty (Not Driving)
          </Badge>
        )
      case "offDuty":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50">
            Off Duty
          </Badge>
        )
      case "sleeperBerth":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50">
            Sleeper Berth
          </Badge>
        )
      default:
        return <Badge>Unknown</Badge>
    }
  }

  // Function to get icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "driving":
        return <Truck className="h-4 w-4 text-blue-500" />
      case "onDutyNotDriving":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "offDuty":
        return <Clock className="h-4 w-4 text-green-500" />
      case "sleeperBerth":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-purple-500"
          >
            <path d="M2 4v16" />
            <path d="M22 4v16" />
            <path d="M2 8h20" />
            <path d="M2 16h20" />
            <path d="M12 4v16" />
          </svg>
        )
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Function to render the timeline for a log day
  const renderTimeline = (log: LogDay) => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const sortedActivities = [...log.activities].sort(
      (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime),
    )

    return (
      <div className="mt-6">
        <div className="relative">
          {/* Hour markers */}
          <div className="flex justify-between mb-2">
            {hours.map((hour) => (
              <div key={hour} className="text-xs text-muted-foreground w-4 text-center">
                {hour}
              </div>
            ))}
          </div>

          {/* Timeline bar */}
          <div className="h-8 bg-muted rounded-md relative">
            {sortedActivities.map((activity, index) => {
              const startMinutes = parseTimeToMinutes(activity.startTime)
              const endMinutes = parseTimeToMinutes(activity.endTime)

              // Handle activities that span midnight
              let startPercent, widthPercent

              if (endMinutes < startMinutes) {
                // Activity spans midnight - render two segments
                // First segment: from start to midnight
                startPercent = (startMinutes / (24 * 60)) * 100
                widthPercent = ((24 * 60 - startMinutes) / (24 * 60)) * 100

                return (
                  <>
                    <div
                      key={`${index}-1`}
                      className={`absolute h-full ${getActivityColor(activity.type)} rounded-md`}
                      style={{
                        left: `${startPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                      title={`${activity.startTime} - 24:00: ${activity.type}${activity.remarks ? ` - ${activity.remarks}` : ""}`}
                    ></div>
                    <div
                      key={`${index}-2`}
                      className={`absolute h-full ${getActivityColor(activity.type)} rounded-md`}
                      style={{
                        left: "0%",
                        width: `${(endMinutes / (24 * 60)) * 100}%`,
                      }}
                      title={`00:00 - ${activity.endTime}: ${activity.type}${activity.remarks ? ` - ${activity.remarks}` : ""}`}
                    ></div>
                  </>
                )
              } else {
                // Normal activity within the same day
                startPercent = (startMinutes / (24 * 60)) * 100
                widthPercent = ((endMinutes - startMinutes) / (24 * 60)) * 100

                return (
                  <div
                    key={index}
                    className={`absolute h-full ${getActivityColor(activity.type)} rounded-md`}
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                    title={`${activity.startTime} - ${activity.endTime}: ${activity.type}${activity.remarks ? ` - ${activity.remarks}` : ""}`}
                  ></div>
                )
              }
            })}
          </div>

          {/* Hour grid lines */}
          <div className="absolute top-0 left-0 w-full h-8 flex pointer-events-none">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-full border-l border-muted-foreground/20"
                style={{ width: `${100 / 24}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Activity legend */}
        <div className="mt-4 flex flex-wrap gap-3">
          {Array.from(new Set(log.activities.map((a) => a.type))).map((type) => (
            <div key={type} className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${getActivityColor(type)} mr-1`}></div>
              <span className="text-xs">
                {type === "onDutyNotDriving"
                  ? "On Duty (Not Driving)"
                  : type === "offDuty"
                    ? "Off Duty"
                    : type === "sleeperBerth"
                      ? "Sleeper Berth"
                      : "Driving"}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Function to render the detailed activity list for a log day
  const renderActivityList = (log: LogDay) => {
    const sortedActivities = [...log.activities].sort(
      (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime),
    )

    return (
      <div className="mt-6 space-y-4">
        {sortedActivities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="p-3 rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-full ${getActivityColor(activity.type).replace("bg-", "bg-opacity-20 bg-")}`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      {getActivityBadge(activity.type)}
                      {activity.location && (
                        <span className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {activity.location}
                        </span>
                      )}
                    </div>
                    {activity.remarks && <p className="text-sm mt-1">{activity.remarks}</p>}
                  </div>
                  <div className="flex items-center text-sm font-medium">
                    <span>{activity.startTime}</span>
                    <ArrowRight className="h-3 w-3 mx-1" />
                    <span>{activity.endTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  // Function to parse time string (HH:MM) to minutes since midnight
  function parseTimeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours * 60 + minutes
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <FileText className="h-6 w-6 mr-2 text-blue-500" />
          Driver's Daily Logs
        </h2>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 p-1 bg-muted/30 rounded-lg">
          {routeResult.logs.map((log, index) => (
            <TabsTrigger
              key={log.date}
              value={log.date}
              className="rounded-md data-[state=active]:bg-gradient-to-r from-blue-600 to-blue-700 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Day {index + 1} - {new Date(log.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </TabsTrigger>
          ))}
        </TabsList>

        {routeResult.logs.map((log) => (
          <TabsContent key={log.date} value={log.date} className="mt-6">
            <Card className="border shadow-md">
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    {new Date(log.date).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50"
                    >
                      Driving: {log.totalHours.driving} hrs
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50"
                    >
                      On Duty: {log.totalHours.onDutyNotDriving} hrs
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50"
                    >
                      Off Duty: {log.totalHours.offDuty} hrs
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50"
                    >
                      Sleeper: {log.totalHours.sleeperBerth} hrs
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Tabs defaultValue="timeline" className="w-full">
                  <TabsList className="w-full max-w-xs mx-auto grid grid-cols-2 p-1 bg-muted/30 rounded-lg">
                    <TabsTrigger
                      value="timeline"
                      className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Timeline View
                    </TabsTrigger>
                    <TabsTrigger
                      value="list"
                      className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Activity List
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="timeline" className="mt-4">
                    {renderTimeline(log)}
                  </TabsContent>
                  <TabsContent value="list" className="mt-4">
                    {renderActivityList(log)}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

