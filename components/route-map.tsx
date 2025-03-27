"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RouteResult, RouteStop } from "@/lib/types"
import { MapPin, Truck, Clock, Coffee, FuelIcon as GasPump, Home, Navigation, Route, Calendar, Map } from "lucide-react"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RouteMapProps {
  routeResult: RouteResult
}

export default function RouteMap({ routeResult }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("map")

  // In a real implementation, we would use a mapping library like Google Maps, Mapbox, or Leaflet
  useEffect(() => {
    // This would be where we initialize the map with the actual route
    // For now, we'll just simulate having a map
  }, [routeResult])

  const getStopIcon = (stop: RouteStop) => {
    switch (stop.type) {
      case "start":
        return <Home className="h-5 w-5 text-blue-500" />
      case "pickup":
        return <MapPin className="h-5 w-5 text-green-500" />
      case "dropoff":
        return <MapPin className="h-5 w-5 text-red-500" />
      case "rest":
        return <Coffee className="h-5 w-5 text-amber-500" />
      case "fuel":
        return <GasPump className="h-5 w-5 text-purple-500" />
      case "overnight":
        return <Clock className="h-5 w-5 text-indigo-500" />
      default:
        return <Navigation className="h-5 w-5" />
    }
  }

  const getStopColor = (stop: RouteStop) => {
    switch (stop.type) {
      case "start":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50"
      case "pickup":
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50"
      case "dropoff":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50"
      case "rest":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50"
      case "fuel":
        return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50"
      case "overnight":
        return "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/50"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 p-1 bg-muted/30 rounded-lg">
            <TabsTrigger
              value="map"
              className="rounded-md data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
            >
              <Map className="h-4 w-4 mr-2" />
              Map View
            </TabsTrigger>
            <TabsTrigger
              value="stops"
              className="rounded-md data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Stops & Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6 mt-6">
            <Card className="premium-card overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-subtle">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center">
                      <Route className="h-5 w-5 mr-2 text-blue-500" />
                      Route Overview
                    </CardTitle>
                    <CardDescription>
                      {routeResult.startLocation} to {routeResult.endLocation} • {routeResult.totalDistance} miles
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50"
                  >
                    <Clock className="h-3 w-3" />
                    {routeResult.totalDuration}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div
                  ref={mapRef}
                  className="h-[400px] w-full bg-gradient-to-b from-blue-50 to-slate-100 dark:from-blue-950/20 dark:to-slate-900/50 flex items-center justify-center relative overflow-hidden"
                >
                  {/* This would be replaced with an actual map in a real implementation */}
                  <div className="absolute inset-0 overflow-hidden">
                    <svg className="w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="#4338ca" strokeWidth="0.5"></path>
                      <path d="M0,0 L100,100" stroke="#4338ca" strokeWidth="0.5"></path>
                      <path d="M100,0 L0,100" stroke="#4338ca" strokeWidth="0.5"></path>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <path key={i} d={`M${i * 10},0 L${i * 10},100`} stroke="#4338ca" strokeWidth="0.2"></path>
                      ))}
                      {Array.from({ length: 10 }).map((_, i) => (
                        <path key={i} d={`M0,${i * 10} L100,${i * 10}`} stroke="#4338ca" strokeWidth="0.2"></path>
                      ))}
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <div className="w-full max-w-md glass-effect p-6 rounded-lg shadow-lg text-center">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <Truck className="h-16 w-16 text-blue-500" />
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            {routeResult.logs.length}
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">
                        {routeResult.startLocation} to {routeResult.endLocation}
                      </h3>
                      <p className="text-muted-foreground">
                        {routeResult.totalDistance} miles • {routeResult.totalDuration}
                      </p>
                      <div className="mt-4 flex justify-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50"
                        >
                          {routeResult.stops.filter((s) => s.type === "rest").length} Rest Stops
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50"
                        >
                          {routeResult.stops.filter((s) => s.type === "fuel").length} Fuel Stops
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/50"
                        >
                          {routeResult.stops.filter((s) => s.type === "overnight").length} Overnight Stops
                        </Badge>
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">
                        (In a real implementation, this would display an interactive map with the route)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="hover-lift"
              >
                <Card className="premium-card overflow-hidden">
                  <div className="bg-gradient-primary p-3">
                    <CardTitle className="text-base flex items-center text-white">
                      <Route className="h-4 w-4 mr-2" />
                      Total Distance
                    </CardTitle>
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-3xl font-bold">
                      {routeResult.totalDistance}{" "}
                      <span className="text-lg font-normal text-muted-foreground">miles</span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="hover-lift"
              >
                <Card className="premium-card overflow-hidden">
                  <div className="bg-gradient-secondary p-3">
                    <CardTitle className="text-base flex items-center text-white">
                      <Clock className="h-4 w-4 mr-2" />
                      Total Duration
                    </CardTitle>
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-3xl font-bold">
                      {routeResult.totalDuration.split(",")[0]}{" "}
                      <span className="text-lg font-normal text-muted-foreground">days</span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="hover-lift"
              >
                <Card className="premium-card overflow-hidden">
                  <div className="bg-gradient-success p-3">
                    <CardTitle className="text-base flex items-center text-white">
                      <Calendar className="h-4 w-4 mr-2" />
                      Required Logs
                    </CardTitle>
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-3xl font-bold">
                      {routeResult.logs.length} <span className="text-lg font-normal text-muted-foreground">days</span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="stops" className="mt-6">
            <Card className="premium-card overflow-hidden">
              <div className="bg-gradient-primary p-4">
                <CardTitle className="flex items-center text-white">
                  <Calendar className="h-5 w-5 mr-2" />
                  Detailed Itinerary
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  All stops including pickup, delivery, rest periods, and fuel stops
                </CardDescription>
              </div>
              <CardContent>
                <div className="space-y-4 py-2">
                  {routeResult.stops.map((stop, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="hover-lift"
                    >
                      <div className="flex items-start gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow">
                        <div className={`p-3 rounded-full ${getStopColor(stop)}`}>{getStopIcon(stop)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{stop.location}</h4>
                              <p className="text-sm text-muted-foreground">{stop.description}</p>
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className={getStopColor(stop)}>
                                    {stop.type.charAt(0).toUpperCase() + stop.type.slice(1)}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {stop.type === "start"
                                      ? "Starting point"
                                      : stop.type === "pickup"
                                        ? "Cargo pickup location"
                                        : stop.type === "dropoff"
                                          ? "Final delivery location"
                                          : stop.type === "rest"
                                            ? "Required rest break"
                                            : stop.type === "fuel"
                                              ? "Refueling stop"
                                              : "Overnight rest period"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm">
                            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                              <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                              {stop.arrivalTime} - {stop.departureTime}
                            </span>
                            {stop.duration && (
                              <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-muted-foreground">
                                <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                {stop.duration}
                              </span>
                            )}
                            {stop.mileage && (
                              <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-muted-foreground">
                                <Route className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                {stop.mileage} miles
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

