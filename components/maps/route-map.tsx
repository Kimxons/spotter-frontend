"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RouteResult, RouteStop } from "@/lib/types"
import { MapPin, Clock, Coffee, FuelIcon as GasPump, Home, Navigation, Route, Calendar, Map } from "lucide-react"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import RouteMapView from "@/components/maps/route-map-view"

interface RouteMapProps {
  routeResult: RouteResult
}

export default function RouteMap({ routeResult }: RouteMapProps) {
  const [activeTab, setActiveTab] = useState("map")

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
              Interactive Map
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
            <RouteMapView routeResult={routeResult} />
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

