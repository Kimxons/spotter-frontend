"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download, Printer, FileText, Calendar, Clock, MapPin } from "lucide-react"
import type { RouteResult } from "@/lib/types"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface LogSheetProps {
  routeResult: RouteResult
}

export default function LogSheet({ routeResult }: LogSheetProps) {
  const [currentLogIndex, setCurrentLogIndex] = useState(0)
  const currentLog = routeResult.logs[currentLogIndex]

  const handlePrevious = () => {
    setCurrentLogIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentLogIndex((prev) => Math.min(routeResult.logs.length - 1, prev + 1))
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-500" />
            Driver's Daily Logs
          </h2>
          <p className="text-muted-foreground">Electronic logging device (ELD) records for your trip</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1">
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4 mr-1" />
            Download PDF
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center justify-between mb-4 bg-muted/50 p-2 rounded-lg"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={currentLogIndex === 0}
          className="h-9 px-2"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Previous Day
        </Button>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50"
          >
            <Calendar className="h-3 w-3 mr-1" />
            {currentLog.date}
          </Badge>
          <span className="text-sm font-medium">
            Log {currentLogIndex + 1} of {routeResult.logs.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={currentLogIndex === routeResult.logs.length - 1}
          className="h-9 px-2"
        >
          Next Day
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border shadow-md overflow-hidden">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Driver's Daily Log
                </CardTitle>
                <CardDescription>
                  {currentLog.date} • {currentLog.totalMiles} miles driven
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">24-Hour Period</p>
                <p className="text-sm text-muted-foreground">Midnight to Midnight</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">From:</p>
                    <p className="font-medium">{currentLog.startLocation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">To:</p>
                    <p className="font-medium">{currentLog.endLocation}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Miles Driving Today:</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{currentLog.totalMiles}</p>
                </div>
                <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Mileage Today:</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{currentLog.totalMiles}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name of Carrier or Carriers:</p>
                  <p>Sample Trucking Company</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Main Office Address:</p>
                  <p>123 Trucking Lane, Transport City, TC 12345</p>
                </div>
              </div>
            </div>

            {/* Log Grid */}
            <div className="p-4">
              <div className="mb-4 border rounded-lg overflow-hidden">
                <div className="grid grid-cols-24 border-b text-xs bg-muted/30">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="px-1 py-2 text-center border-r last:border-r-0 font-medium">
                      {i === 0 ? "M" : i === 12 ? "N" : i % 12}
                    </div>
                  ))}
                </div>

                {/* Off Duty Row */}
                <div className="grid grid-cols-24 border-b">
                  <div className="col-span-2 px-2 py-1 text-xs font-medium border-r bg-green-50 dark:bg-green-900/20">
                    Off Duty
                  </div>
                  <div className="col-span-22 h-6 relative">
                    {currentLog.activities
                      .filter((a) => a.type === "offDuty")
                      .map((activity, idx) => {
                        const startHour = Number.parseInt(activity.startTime.split(":")[0])
                        const startMin = Number.parseInt(activity.startTime.split(":")[1]) / 60
                        const start = startHour + startMin

                        const endHour = Number.parseInt(activity.endTime.split(":")[0])
                        const endMin = Number.parseInt(activity.endTime.split(":")[1]) / 60
                        const end = endHour + endMin

                        const startPercent = (start / 24) * 100
                        const widthPercent = ((end - start) / 24) * 100

                        return (
                          <div
                            key={idx}
                            className="absolute h-full bg-green-200 border border-green-400 dark:bg-green-700/50 dark:border-green-600"
                            style={{
                              left: `${startPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                          />
                        )
                      })}
                  </div>
                </div>

                {/* Sleeper Berth Row */}
                <div className="grid grid-cols-24 border-b">
                  <div className="col-span-2 px-2 py-1 text-xs font-medium border-r bg-blue-50 dark:bg-blue-900/20">
                    Sleeper Berth
                  </div>
                  <div className="col-span-22 h-6 relative">
                    {currentLog.activities
                      .filter((a) => a.type === "sleeperBerth")
                      .map((activity, idx) => {
                        const startHour = Number.parseInt(activity.startTime.split(":")[0])
                        const startMin = Number.parseInt(activity.startTime.split(":")[1]) / 60
                        const start = startHour + startMin

                        const endHour = Number.parseInt(activity.endTime.split(":")[0])
                        const endMin = Number.parseInt(activity.endTime.split(":")[1]) / 60
                        const end = endHour + endMin

                        const startPercent = (start / 24) * 100
                        const widthPercent = ((end - start) / 24) * 100

                        return (
                          <div
                            key={idx}
                            className="absolute h-full bg-blue-200 border border-blue-400 dark:bg-blue-700/50 dark:border-blue-600"
                            style={{
                              left: `${startPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                          />
                        )
                      })}
                  </div>
                </div>

                {/* Driving Row */}
                <div className="grid grid-cols-24 border-b">
                  <div className="col-span-2 px-2 py-1 text-xs font-medium border-r bg-amber-50 dark:bg-amber-900/20">
                    Driving
                  </div>
                  <div className="col-span-22 h-6 relative">
                    {currentLog.activities
                      .filter((a) => a.type === "driving")
                      .map((activity, idx) => {
                        const startHour = Number.parseInt(activity.startTime.split(":")[0])
                        const startMin = Number.parseInt(activity.startTime.split(":")[1]) / 60
                        const start = startHour + startMin

                        const endHour = Number.parseInt(activity.endTime.split(":")[0])
                        const endMin = Number.parseInt(activity.endTime.split(":")[1]) / 60
                        const end = endHour + endMin

                        const startPercent = (start / 24) * 100
                        const widthPercent = ((end - start) / 24) * 100

                        return (
                          <div
                            key={idx}
                            className="absolute h-full bg-amber-200 border border-amber-400 dark:bg-amber-700/50 dark:border-amber-600"
                            style={{
                              left: `${startPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                          />
                        )
                      })}
                  </div>
                </div>

                {/* On Duty (Not Driving) Row */}
                <div className="grid grid-cols-24 border-b">
                  <div className="col-span-2 px-2 py-1 text-xs font-medium border-r bg-red-50 dark:bg-red-900/20">
                    On Duty (Not Driving)
                  </div>
                  <div className="col-span-22 h-6 relative">
                    {currentLog.activities
                      .filter((a) => a.type === "onDutyNotDriving")
                      .map((activity, idx) => {
                        const startHour = Number.parseInt(activity.startTime.split(":")[0])
                        const startMin = Number.parseInt(activity.startTime.split(":")[1]) / 60
                        const start = startHour + startMin

                        const endHour = Number.parseInt(activity.endTime.split(":")[0])
                        const endMin = Number.parseInt(activity.endTime.split(":")[1]) / 60
                        const end = endHour + endMin

                        const startPercent = (start / 24) * 100
                        const widthPercent = ((end - start) / 24) * 100

                        return (
                          <div
                            key={idx}
                            className="absolute h-full bg-red-200 border border-red-400 dark:bg-red-700/50 dark:border-red-600"
                            style={{
                              left: `${startPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                          />
                        )
                      })}
                  </div>
                </div>
              </div>

              {/* Remarks Section */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-blue-500" />
                  Remarks
                </h3>
                <div className="border rounded-lg p-3 min-h-[100px] bg-muted/10">
                  {currentLog.remarks.map((remark, index) => (
                    <p key={index} className="text-sm mb-1">
                      {remark}
                    </p>
                  ))}
                </div>
              </div>

              {/* Shipping Documents */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-1 text-blue-500" />
                  Shipping Documents
                </h3>
                <div className="border rounded-lg p-3 bg-muted/10">
                  <p className="text-sm">Shipping Document #: {currentLog.shippingDocuments}</p>
                </div>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-4 gap-4">
                <div className="border rounded-lg p-3 text-center bg-green-50 dark:bg-green-900/20">
                  <p className="text-xs font-medium text-green-800 dark:text-green-300">Off Duty</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-200">
                    {currentLog.totalHours.offDuty}
                  </p>
                </div>
                <div className="border rounded-lg p-3 text-center bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-300">Sleeper Berth</p>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-200">
                    {currentLog.totalHours.sleeperBerth}
                  </p>
                </div>
                <div className="border rounded-lg p-3 text-center bg-amber-50 dark:bg-amber-900/20">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Driving</p>
                  <p className="text-xl font-bold text-amber-700 dark:text-amber-200">
                    {currentLog.totalHours.driving}
                  </p>
                </div>
                <div className="border rounded-lg p-3 text-center bg-red-50 dark:bg-red-900/20">
                  <p className="text-xs font-medium text-red-800 dark:text-red-300">On Duty (Not Driving)</p>
                  <p className="text-xl font-bold text-red-700 dark:text-red-200">
                    {currentLog.totalHours.onDutyNotDriving}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

