"use client"

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Truck,
  MapPin,
  Calendar,
  BarChart3,
  Route,
  FileText,
  Home,
} from "lucide-react"
import type { RouteResult, TripDetails } from "@/lib/types"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"

interface TripSummaryProps {
  routeResult: RouteResult
  tripDetails: TripDetails
}

export default function TripSummary({ routeResult, tripDetails }: TripSummaryProps) {
  // Calculating the remaining cycle hours
  const totalDrivingHours = routeResult.logs.reduce(
    (total, log) => total + Number.parseFloat(log.totalHours.driving),
    0,
  )

  const totalOnDutyHours = routeResult.logs.reduce(
    (total, log) =>
      total + Number.parseFloat(log.totalHours.driving) + Number.parseFloat(log.totalHours.onDutyNotDriving),
    0,
  )

  const cycleHoursRemaining = Math.max(0, 70 - (tripDetails.cycleHoursUsed + totalOnDutyHours))
  const cycleHoursUsedPercentage = ((tripDetails.cycleHoursUsed + totalOnDutyHours) / 70) * 100

  const isCompliant = cycleHoursRemaining >= 0

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-blue-500" />
            Trip Summary
          </h2>
          <p className="text-muted-foreground">Complete overview of your trip plan and HOS compliance</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="border shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
            <CardTitle className="flex items-center text-white">
              <Truck className="h-5 w-5 mr-2" />
              Trip Overview
            </CardTitle>
          </div>
          <CardContent className="pt-6">
            <dl className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <dt className="text-sm font-medium text-muted-foreground flex items-center">
                  <Home className="h-4 w-4 mr-1 text-blue-500" />
                  From
                </dt>
                <dd className="font-medium">{routeResult.startLocation}</dd>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <dt className="text-sm font-medium text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-red-500" />
                  To
                </dt>
                <dd className="font-medium">{routeResult.endLocation}</dd>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <dt className="text-sm font-medium text-muted-foreground flex items-center">
                  <Route className="h-4 w-4 mr-1 text-purple-500" />
                  Total Distance
                </dt>
                <dd className="font-medium">{routeResult.totalDistance} miles</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-sm font-medium text-muted-foreground flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-amber-500" />
                  Total Duration
                </dt>
                <dd className="font-medium">{routeResult.totalDuration}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="border shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4">
            <CardTitle className="flex items-center text-white">
              <Clock className="h-5 w-5 mr-2" />
              Hours of Service
            </CardTitle>
          </div>
          <CardContent className="pt-6">
            <dl className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <dt className="text-sm font-medium text-muted-foreground">Previous Cycle Hours</dt>
                <dd className="font-medium">{tripDetails.cycleHoursUsed} hours</dd>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <dt className="text-sm font-medium text-muted-foreground">Trip Driving Hours</dt>
                <dd className="font-medium">{totalDrivingHours.toFixed(1)} hours</dd>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <dt className="text-sm font-medium text-muted-foreground">Trip On-Duty Hours</dt>
                <dd className="font-medium">{totalOnDutyHours.toFixed(1)} hours</dd>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <dt className="text-sm font-medium text-muted-foreground">Cycle Hours Remaining</dt>
                  <dd
                    className={
                      isCompliant
                        ? "text-green-600 font-bold dark:text-green-400"
                        : "text-red-600 font-bold dark:text-red-400"
                    }
                  >
                    {cycleHoursRemaining.toFixed(1)} hours
                  </dd>
                </div>
                <Progress
                  value={Math.min(100, cycleHoursUsedPercentage)}
                  className={isCompliant ? "h-2" : "h-2 bg-red-100 dark:bg-red-900/30"}
                  indicatorClassName={isCompliant ? "bg-green-500" : "bg-red-500"}
                />
                <div className="flex justify-between text-xs mt-1">
                  <span>0 hours</span>
                  <span>70 hours</span>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="border shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
            <CardTitle className="flex items-center text-white">
              <Calendar className="h-5 w-5 mr-2" />
              Log Summary
            </CardTitle>
          </div>
          <CardContent className="pt-6">
            <dl className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <dt className="text-sm font-medium text-muted-foreground flex items-center">
                  <FileText className="h-4 w-4 mr-1 text-indigo-500" />
                  Total Days
                </dt>
                <dd className="font-medium">{routeResult.logs.length} days</dd>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
                <dd className="font-medium">{routeResult.logs[0].date}</dd>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <dt className="text-sm font-medium text-muted-foreground">End Date</dt>
                <dd className="font-medium">{routeResult.logs[routeResult.logs.length - 1].date}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Compliance Status</dt>
                <dd>
                  <Badge variant={isCompliant ? "success" : "destructive"} className="mt-1 w-full justify-center py-1">
                    {isCompliant ? "HOS Compliant" : "HOS Non-Compliant"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </motion.div>

      {!isCompliant && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>HOS Violation Warning</AlertTitle>
            <AlertDescription>
              This trip would exceed your available cycle hours. Please adjust your schedule or consider taking a
              34-hour restart before beginning this trip.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {isCompliant && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Alert
            variant="default"
            className="bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800/50"
          >
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Trip is HOS Compliant</AlertTitle>
            <AlertDescription>
              This trip plan complies with all Hours of Service regulations. Safe travels!
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="border shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4">
            <CardTitle className="flex items-center text-white">
              <MapPin className="h-5 w-5 mr-2" />
              Key Stops
            </CardTitle>
            <CardDescription className="text-indigo-100">Important locations and scheduled stops</CardDescription>
          </div>
          <CardContent>
            <div className="space-y-4 pt-2">
              {routeResult.stops
                .filter((stop) => ["start", "pickup", "dropoff", "overnight"].includes(stop.type))
                .map((stop, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="p-3 rounded-full bg-muted/30">
                      {stop.type === "start" && <Home className="h-5 w-5 text-blue-500" />}
                      {stop.type === "pickup" && <MapPin className="h-5 w-5 text-green-500" />}
                      {stop.type === "dropoff" && <MapPin className="h-5 w-5 text-red-500" />}
                      {stop.type === "overnight" && <Clock className="h-5 w-5 text-indigo-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{stop.location}</h4>
                          <p className="text-sm text-muted-foreground">{stop.description}</p>
                        </div>
                        <Badge variant="outline" className="bg-muted/30">
                          {stop.type === "start"
                            ? "Start"
                            : stop.type === "pickup"
                              ? "Pickup"
                              : stop.type === "dropoff"
                                ? "Dropoff"
                                : "Overnight"}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {stop.arrivalTime} - {stop.departureTime}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}