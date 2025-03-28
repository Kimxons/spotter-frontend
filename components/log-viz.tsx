"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Download, Printer, ChevronLeft, ChevronRight } from "lucide-react"
import type { LogDay, RouteResult } from "@/lib/types"

interface LogSheetProps {
  routeResult: RouteResult
}

export default function LogSheet({ routeResult }: LogSheetProps) {
  const [activeTab, setActiveTab] = useState<string>(routeResult.logs[0]?.date || "")
  const [carrier, setCarrier] = useState("Your Company Name")
  const [mainOffice, setMainOffice] = useState("123 Main Street, City, State ZIP")
  const [homeTerminal, setHomeTerminal] = useState("Main Terminal")

  // Function to parse time string (HH:MM) to minutes since midnight
  function parseTimeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours * 60 + minutes
  }

  // Function to render the grid for a log day
  const renderLogGrid = (log: LogDay) => {
    // Create a 24-hour array (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => i)

    // Sort activities by start time
    const sortedActivities = [...log.activities].sort(
      (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime),
    )

    // Create a status map for each minute of the day
    const statusMap = new Array(24 * 60).fill(null)

    // Fill the status map based on activities
    sortedActivities.forEach((activity) => {
      const startMinutes = parseTimeToMinutes(activity.startTime)
      const endMinutes = parseTimeToMinutes(activity.endTime)

      if (endMinutes > startMinutes) {
        // Normal case: activity within the same day
        for (let i = startMinutes; i < endMinutes; i++) {
          statusMap[i] = activity.type
        }
      } else {
        // Activity spans midnight
        for (let i = startMinutes; i < 24 * 60; i++) {
          statusMap[i] = activity.type
        }
        for (let i = 0; i < endMinutes; i++) {
          statusMap[i] = activity.type
        }
      }
    })

    // Calculate total hours for each status
    const totalHours = {
      offDuty: Number.parseFloat(log.totalHours.offDuty),
      sleeperBerth: Number.parseFloat(log.totalHours.sleeperBerth),
      driving: Number.parseFloat(log.totalHours.driving),
      onDutyNotDriving: Number.parseFloat(log.totalHours.onDutyNotDriving),
    }

    // Format date for display
    const logDate = new Date(log.date)
    const formattedDate = `${logDate.getMonth() + 1}/${logDate.getDate()}/${logDate.getFullYear()}`

    return (
      <div className="traditional-log-sheet bg-white text-black p-6 rounded-lg border border-gray-300 shadow-md print:shadow-none">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="col-span-1">
            <h2 className="text-xl font-bold border-b-2 border-black pb-1 mb-2">Driver's Daily Log</h2>
            <div className="flex justify-between mb-2">
              <span>Date:</span>
              <span className="font-bold">{formattedDate}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <Label className="col-span-1">Carrier:</Label>
              <Input
                className="col-span-2 h-8 border-black"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <Label className="col-span-1">Main Office:</Label>
              <Input
                className="col-span-2 h-8 border-black"
                value={mainOffice}
                onChange={(e) => setMainOffice(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Label className="col-span-1">Home Terminal:</Label>
              <Input
                className="col-span-2 h-8 border-black"
                value={homeTerminal}
                onChange={(e) => setHomeTerminal(e.target.value)}
              />
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label>From:</Label>
                <Input className="h-8 border-black" value={routeResult.startLocation} readOnly />
              </div>
              <div>
                <Label>To:</Label>
                <Input className="h-8 border-black" value={routeResult.endLocation} readOnly />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-black p-2">
                <Label className="text-center block">Total Miles Driving Today</Label>
                <Input className="h-8 border-black text-center font-bold" value={routeResult.totalDistance} readOnly />
              </div>
              <div className="border border-black p-2">
                <Label className="text-center block">Total Mileage Today</Label>
                <Input className="h-8 border-black text-center font-bold" value={routeResult.totalDistance} readOnly />
              </div>
            </div>
          </div>
        </div>

        {/* Log Grid */}
        <div className="log-grid mt-6 border-2 border-black">
          {/* Hour markers */}
          <div className="grid grid-cols-24 border-b-2 border-black bg-gray-100">
            <div className="col-span-1 border-r border-black p-1 text-center font-bold">M/N</div>
            {hours.map((hour) => (
              <div key={hour} className="col-span-1 border-r border-black p-1 text-center font-bold">
                {hour === 0 ? "M/N" : hour < 12 ? `${hour}A` : hour === 12 ? "12N" : `${hour - 12}P`}
              </div>
            ))}
          </div>

          {/* Status rows */}
          <div className="status-rows">
            {/* 1. Off Duty */}
            <div className="grid grid-cols-24 border-b border-black">
              <div className="col-span-1 border-r border-black p-1 text-xs font-bold flex items-center">
                1. Off Duty
              </div>
              {hours.map((hour) => {
                const hourStart = hour * 60
                const segments = []

                for (let i = 0; i < 60; i += 15) {
                  const minute = hourStart + i
                  const isActive = statusMap[minute] === "offDuty"
                  segments.push(
                    <div
                      key={`off-${hour}-${i}`}
                      className={`h-4 border-r border-gray-300 ${isActive ? "bg-black" : ""}`}
                    ></div>,
                  )
                }

                return (
                  <div key={`off-${hour}`} className="col-span-1 border-r border-black grid grid-cols-4">
                    {segments}
                  </div>
                )
              })}
              <div className="col-span-1 border-l border-black p-1 text-center font-bold">
                {totalHours.offDuty.toFixed(1)}
              </div>
            </div>

            {/* 2. Sleeper Berth */}
            <div className="grid grid-cols-24 border-b border-black">
              <div className="col-span-1 border-r border-black p-1 text-xs font-bold flex items-center">
                2. Sleeper Berth
              </div>
              {hours.map((hour) => {
                const hourStart = hour * 60
                const segments = []

                for (let i = 0; i < 60; i += 15) {
                  const minute = hourStart + i
                  const isActive = statusMap[minute] === "sleeperBerth"
                  segments.push(
                    <div
                      key={`sb-${hour}-${i}`}
                      className={`h-4 border-r border-gray-300 ${isActive ? "bg-black" : ""}`}
                    ></div>,
                  )
                }

                return (
                  <div key={`sb-${hour}`} className="col-span-1 border-r border-black grid grid-cols-4">
                    {segments}
                  </div>
                )
              })}
              <div className="col-span-1 border-l border-black p-1 text-center font-bold">
                {totalHours.sleeperBerth.toFixed(1)}
              </div>
            </div>

            {/* 3. Driving */}
            <div className="grid grid-cols-24 border-b border-black">
              <div className="col-span-1 border-r border-black p-1 text-xs font-bold flex items-center">3. Driving</div>
              {hours.map((hour) => {
                const hourStart = hour * 60
                const segments = []

                for (let i = 0; i < 60; i += 15) {
                  const minute = hourStart + i
                  const isActive = statusMap[minute] === "driving"
                  segments.push(
                    <div
                      key={`dr-${hour}-${i}`}
                      className={`h-4 border-r border-gray-300 ${isActive ? "bg-black" : ""}`}
                    ></div>,
                  )
                }

                return (
                  <div key={`dr-${hour}`} className="col-span-1 border-r border-black grid grid-cols-4">
                    {segments}
                  </div>
                )
              })}
              <div className="col-span-1 border-l border-black p-1 text-center font-bold">
                {totalHours.driving.toFixed(1)}
              </div>
            </div>

            {/* 4. On Duty (Not Driving) */}
            <div className="grid grid-cols-24 border-b border-black">
              <div className="col-span-1 border-r border-black p-1 text-xs font-bold flex items-center">
                4. On Duty (Not Driving)
              </div>
              {hours.map((hour) => {
                const hourStart = hour * 60
                const segments = []

                for (let i = 0; i < 60; i += 15) {
                  const minute = hourStart + i
                  const isActive = statusMap[minute] === "onDutyNotDriving"
                  segments.push(
                    <div
                      key={`on-${hour}-${i}`}
                      className={`h-4 border-r border-gray-300 ${isActive ? "bg-black" : ""}`}
                    ></div>,
                  )
                }

                return (
                  <div key={`on-${hour}`} className="col-span-1 border-r border-black grid grid-cols-4">
                    {segments}
                  </div>
                )
              })}
              <div className="col-span-1 border-l border-black p-1 text-center font-bold">
                {totalHours.onDutyNotDriving.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        <div className="mt-6">
          <h3 className="font-bold border-b-2 border-black pb-1 mb-2">Remarks</h3>
          <div className="border border-black p-2 min-h-[100px]">
            {sortedActivities.map((activity, index) => (
              <div key={index} className="mb-1 text-sm">
                <span className="font-bold">
                  {activity.startTime}-{activity.endTime}:
                </span>{" "}
                {activity.type === "driving"
                  ? "Driving"
                  : activity.type === "onDutyNotDriving"
                    ? "On Duty (Not Driving)"
                    : activity.type === "offDuty"
                      ? "Off Duty"
                      : "Sleeper Berth"}
                {activity.remarks && ` - ${activity.remarks}`}
                {activity.location && ` at ${activity.location}`}
              </div>
            ))}
          </div>
        </div>

        {/* Totals Section */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="border border-black p-2">
            <h4 className="font-bold text-center border-b border-black pb-1 mb-2">Daily Recap</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm">Total Hours Today:</div>
              <div className="text-sm font-bold text-right">
                {(
                  totalHours.driving +
                  totalHours.onDutyNotDriving +
                  totalHours.offDuty +
                  totalHours.sleeperBerth
                ).toFixed(1)}
              </div>
              <div className="text-sm">Driving Hours:</div>
              <div className="text-sm font-bold text-right">{totalHours.driving.toFixed(1)}</div>
              <div className="text-sm">On-Duty Hours:</div>
              <div className="text-sm font-bold text-right">{totalHours.onDutyNotDriving.toFixed(1)}</div>
              <div className="text-sm">Off-Duty Hours:</div>
              <div className="text-sm font-bold text-right">{totalHours.offDuty.toFixed(1)}</div>
              <div className="text-sm">Sleeper Berth:</div>
              <div className="text-sm font-bold text-right">{totalHours.sleeperBerth.toFixed(1)}</div>
            </div>
          </div>

          <div className="border border-black p-2 col-span-1 lg:col-span-2">
            <h4 className="font-bold text-center border-b border-black pb-1 mb-2">Shipping Information</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm">Shipping Documents:</Label>
                <Input className="h-8 border-black" placeholder="Enter document numbers" />
              </div>
              <div>
                <Label className="text-sm">Shipper & Commodity:</Label>
                <Input className="h-8 border-black" placeholder="Enter shipper and commodity" />
              </div>
            </div>
          </div>
        </div>

        {/* Certification */}
        <div className="mt-6 border-t-2 border-black pt-2 text-center text-sm">
          I hereby certify that the information contained herein is true and correct to the best of my knowledge and
          belief, and that I was on duty and/or driving during the periods shown above.
        </div>
      </div>
    )
  }

  // Function to get the next and previous log days
  const getCurrentLogIndex = () => {
    return routeResult.logs.findIndex((log) => log.date === activeTab)
  }

  const goToPreviousLog = () => {
    const currentIndex = getCurrentLogIndex()
    if (currentIndex > 0) {
      setActiveTab(routeResult.logs[currentIndex - 1].date)
    }
  }

  const goToNextLog = () => {
    const currentIndex = getCurrentLogIndex()
    if (currentIndex < routeResult.logs.length - 1) {
      setActiveTab(routeResult.logs[currentIndex + 1].date)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gradient-premium flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          Driver's Daily Log
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 premium-button" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print Log
          </Button>
          <Button variant="outline" size="sm" className="gap-2 premium-button">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousLog}
          disabled={getCurrentLogIndex() === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Previous Day
        </Button>

        <div className="flex gap-2">
          {routeResult.logs.map((log, index) => {
            const logDate = new Date(log.date)
            return (
              <Button
                key={log.date}
                variant={activeTab === log.date ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(log.date)}
                className={activeTab === log.date ? "bg-gradient-premium" : ""}
              >
                Day {index + 1}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextLog}
          disabled={getCurrentLogIndex() === routeResult.logs.length - 1}
          className="gap-1"
        >
          Next Day <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Card className="premium-card border shadow-xl overflow-hidden print:shadow-none print:border-none">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {routeResult.logs.map((log) => (
              <TabsContent key={log.date} value={log.date} className="m-0 p-0">
                {renderLogGrid(log)}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

