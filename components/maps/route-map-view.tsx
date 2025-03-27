"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Clock,
  Coffee,
  FuelIcon as GasPump,
  Home,
  Navigation,
  RouteIcon,
  Calendar,
  Map,
  Layers,
  Truck,
} from "lucide-react"
import type { RouteResult, RouteStop } from "@/lib/types"
import { cn } from "@/lib/utils"

mapboxgl.accessToken = process.env.MAPBOX_TOKEN as string;

interface RouteMapViewProps {
  routeResult: RouteResult
  className?: string
}

export default function RouteMapView({ routeResult, className }: RouteMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapView, setMapView] = useState<"satellite" | "streets" | "terrain">("streets")
  const [showTraffic, setShowTraffic] = useState(false)
  const [simulationActive, setSimulationActive] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const simulationRef = useRef<number | null>(null)

  const getStopCoordinates = useCallback(
    (stop: RouteStop, index: number): [number, number] => {
      if (stop.coordinates) {
        return stop.coordinates
      }

      if (stop.latitude && stop.longitude) {
        return [stop.longitude, stop.latitude]
      }

      // Fallback to default coordinates if none are provided
      // Create a path that roughly goes from Chicago to Columbus via Indianapolis
      const startLng = -87.6298 // Chicago
      const startLat = 41.8781
      const endLng = -82.9988 // Columbus
      const endLat = 39.9612

      // Calculate position along the route based on index and total stops
      const progress = index / Math.max(1, routeResult.stops.length - 1)

      // Linear interpolation between start and end points
      const lng = startLng + (endLng - startLng) * progress
      const lat = startLat + (endLat - startLat) * progress

      return [lng, lat]
    },
    [routeResult.stops],
  )

  // Adding the route data to the map
  const addRouteToMap = useCallback(() => {
    if (!map.current) return

    try {
      if (map.current.getSource("route")) {
        map.current.removeLayer("route-line")
        map.current.removeSource("route")
      }

      if (map.current.getSource("stops")) {
        if (map.current.getLayer("stops-labels")) map.current.removeLayer("stops-labels")
        if (map.current.getLayer("stops-circles")) map.current.removeLayer("stops-circles")
        map.current.removeSource("stops")
      }

      let routeCoordinates: [number, number][] = []

      if (routeResult.routeGeometry && routeResult.routeGeometry.coordinates) {
        routeCoordinates = routeResult.routeGeometry.coordinates as [number, number][]
      } else {
        routeCoordinates = routeResult.stops
          .filter((stop) => stop.coordinates)
          .map((stop, index) => getStopCoordinates(stop, index))
      }

      if (routeCoordinates.length < 2) {
        routeCoordinates = routeResult.stops.map((stop, index) => getStopCoordinates(stop, index))
      }

      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates,
          },
        },
      })

      map.current.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#4a6ee0",
          "line-width": 6,
          "line-opacity": 0.8,
        },
      })

      // Add stops source and layers
      const stopFeatures = routeResult.stops.map((stop, index) => ({
        type: "Feature" as const,
        properties: {
          id: index,
          type: stop.type,
          location: stop.location,
          description: stop.description,
          arrivalTime: stop.arrivalTime,
          departureTime: stop.departureTime,
          duration: stop.duration,
          mileage: stop.mileage,
        },
        geometry: {
          type: "Point" as const,
          coordinates: getStopCoordinates(stop, index),
        },
      }))

      map.current.addSource("stops", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: stopFeatures,
        },
      })

      map.current.addLayer({
        id: "stops-circles",
        type: "circle",
        source: "stops",
        paint: {
          "circle-radius": [
            "case",
            ["==", ["get", "id"], activeStopIndex !== null ? activeStopIndex : -1],
            12, // size when active
            8, // default size
          ],
          "circle-color": [
            "match",
            ["get", "type"],
            "start",
            "#3b82f6", 
            "pickup",
            "#22c55e", 
            "dropoff",
            "#ef4444", 
            "rest",
            "#f59e0b", 
            "fuel",
            "#8b5cf6", 
            "overnight",
            "#6366f1", 
            "#3b82f6", 
          ],
          "circle-opacity": 0.8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      })

      map.current.addLayer({
        id: "stops-labels",
        type: "symbol",
        source: "stops",
        layout: {
          "text-field": ["get", "location"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [0, -1.5],
          "text-anchor": "bottom",
          "text-size": 12,
        },
        paint: {
          "text-color": "#333",
          "text-halo-color": "#fff",
          "text-halo-width": 1,
        },
      })

      // Add click event for stops
      map.current.on("click", "stops-circles", (e) => {
        if (!e.features || e.features.length === 0 || !map.current) return

        const feature = e.features[0]
        const properties = feature.properties

        if (properties && properties.id !== undefined) {
          setActiveStopIndex(properties.id)

          // Create popup content
          const popupContent = document.createElement("div")
          popupContent.className = "p-2"
          popupContent.innerHTML = `
            <h3 class="font-bold">${properties.location}</h3>
            <p class="text-sm">${properties.description}</p>
            <div class="text-xs mt-1">
              <div>Arrival: ${properties.arrivalTime}</div>
              <div>Departure: ${properties.departureTime}</div>
              ${properties.duration ? `<div>Duration: ${properties.duration}</div>` : ""}
              ${properties.mileage ? `<div>Mileage: ${properties.mileage} miles</div>` : ""}
            </div>
          `

          // Create and add popup
          if (feature.geometry.type === "Point") {
            const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number]

            new mapboxgl.Popup({ closeButton: true, maxWidth: "300px" })
              .setLngLat(coordinates)
              .setDOMContent(popupContent)
              .addTo(map.current)
          }
        }
      })

      // Change cursor on hover
      map.current.on("mouseenter", "stops-circles", () => {
        if (map.current) map.current.getCanvas().style.cursor = "pointer"
      })

      map.current.on("mouseleave", "stops-circles", () => {
        if (map.current) map.current.getCanvas().style.cursor = ""
      })

      // Fit map to show the entire route
      const coordinates = routeResult.stops
        .map((stop, index) => getStopCoordinates(stop, index))
        .filter((coord) => coord[0] !== 0 && coord[1] !== 0) // Filter out invalid coordinates

      if (coordinates.length > 0) {
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord)
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))

        map.current.fitBounds(bounds, {
          padding: 50,
          duration: 1000,
        })
      }
    } catch (error) {
      console.error("Error loading route data:", error)
    }
  }, [routeResult, activeStopIndex, getStopCoordinates])

  // Initializing map when component mounts
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-85.5, 40.5], // Default center of the US
        zoom: 5,
      })

      // navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

      // geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        }),
        "top-right",
      )

      map.current.on("load", () => {
        setMapLoaded(true)
      })
    } catch (error) {
      console.error("Error initializing map:", error)
    }

    return () => {
      if (map.current) {
        try {
          map.current.remove()
          map.current = null
        } catch (error) {
          console.error("Error removing map:", error)
        }
      }
      if (simulationRef.current) {
        window.cancelAnimationFrame(simulationRef.current)
        simulationRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded || !map.current) return
    addRouteToMap()
  }, [mapLoaded, addRouteToMap])

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    let style = "mapbox://styles/mapbox/"

    switch (mapView) {
      case "satellite":
        style += "satellite-streets-v12"
        break
      case "terrain":
        style += "outdoors-v12"
        break
      case "streets":
      default:
        style += "streets-v12"
        break
    }

    map.current.setStyle(style)

    map.current.once("style.load", () => {
      addRouteToMap()
    })
  }, [mapView, mapLoaded, addRouteToMap])

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    try {
      if (showTraffic) {
        if (!map.current.getSource("mapbox-traffic")) {
          map.current.addSource("mapbox-traffic", {
            type: "vector",
            url: "mapbox://mapbox.mapbox-traffic-v1",
          })

          map.current.addLayer(
            {
              id: "traffic",
              type: "line",
              source: "mapbox-traffic",
              "source-layer": "traffic",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-width": 2,
                "line-color": [
                  "match",
                  ["get", "congestion"],
                  "low",
                  "#4caf50",
                  "moderate",
                  "#ffeb3b",
                  "heavy",
                  "#ff9800",
                  "severe",
                  "#f44336",
                  "#4caf50",
                ],
              },
            },
            "route-line",
          )
        }
      } else {
        if (map.current.getLayer("traffic")) {
          map.current.removeLayer("traffic")
        }
        if (map.current.getSource("mapbox-traffic")) {
          map.current.removeSource("mapbox-traffic")
        }
      }
    } catch (error) {
      console.error("Error toggling traffic layer:", error)
    }
  }, [showTraffic, mapLoaded])

  useEffect(() => {
    if (!map.current || !simulationActive) {
      if (simulationRef.current) {
        window.cancelAnimationFrame(simulationRef.current)
        simulationRef.current = null
      }
      return
    }

    let startTime: number | null = null
    const duration = 10000 // 10 seconds for full simulation

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1) * 100

      setSimulationProgress(progress)

      const stopIndex = Math.min(Math.floor((progress / 100) * routeResult.stops.length), routeResult.stops.length - 1)

      if (stopIndex !== activeStopIndex) {
        setActiveStopIndex(stopIndex)

        if (map.current && stopIndex >= 0) {
          const coordinates = getStopCoordinates(routeResult.stops[stopIndex], stopIndex)
          map.current.flyTo({
            center: coordinates,
            zoom: 10,
            duration: 1000,
          })
        }
      }

      if (progress < 100) {
        simulationRef.current = window.requestAnimationFrame(animate)
      } else {
        setTimeout(() => {
          setSimulationActive(false)
          setSimulationProgress(0)
        }, 1000)
      }
    }

    simulationRef.current = window.requestAnimationFrame(animate)

    return () => {
      if (simulationRef.current) {
        window.cancelAnimationFrame(simulationRef.current)
      }
    }
  }, [simulationActive, routeResult.stops, activeStopIndex, getStopCoordinates])

  const getBearing = (start: [number, number], end: [number, number]): number => {
    const startLat = (start[1] * Math.PI) / 180
    const startLng = (start[0] * Math.PI) / 180
    const endLat = (end[1] * Math.PI) / 180
    const endLng = (end[0] * Math.PI) / 180

    const y = Math.sin(endLng - startLng) * Math.cos(endLat)
    const x =
      Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng)
    const bearing = (Math.atan2(y, x) * 180) / Math.PI

    return (bearing + 360) % 360
  }

  const getStopIcon = (type: string) => {
    switch (type) {
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

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center">
            <Map className="h-5 w-5 mr-2 text-blue-500" />
            Interactive Route Map
          </h2>
          <p className="text-sm text-muted-foreground">View your route and stops with real-time traffic data</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-md overflow-hidden border">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-none border-r h-9 px-3",
                mapView === "streets" && "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
              onClick={() => setMapView("streets")}
            >
              <RouteIcon className="h-4 w-4 mr-1" />
              Streets
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-none border-r h-9 px-3",
                mapView === "satellite" && "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
              onClick={() => setMapView("satellite")}
            >
              <Layers className="h-4 w-4 mr-1" />
              Satellite
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-none h-9 px-3",
                mapView === "terrain" && "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
              onClick={() => setMapView("terrain")}
            >
              <Map className="h-4 w-4 mr-1" />
              Terrain
            </Button>
          </div>
          <Button
            variant={showTraffic ? "default" : "outline"}
            size="sm"
            className="h-9"
            onClick={() => setShowTraffic(!showTraffic)}
          >
            <RouteIcon className="h-4 w-4 mr-1" />
            Traffic
          </Button>
          <Button
            variant={simulationActive ? "destructive" : "default"}
            size="sm"
            className="h-9"
            onClick={() => setSimulationActive(!simulationActive)}
          >
            <Truck className="h-4 w-4 mr-1" />
            {simulationActive ? "Stop Simulation" : "Simulate Trip"}
          </Button>
        </div>
      </div>

      {simulationActive && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800/50">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <Truck className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Trip Simulation in Progress</span>
            </div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {Math.round(simulationProgress)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800/50 rounded-full h-2.5">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-2.5 rounded-full"
              style={{ width: `${simulationProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {activeStopIndex !== null && routeResult.stops[activeStopIndex]
              ? `Current location: ${routeResult.stops[activeStopIndex].location}`
              : "Starting trip..."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <Card className="border shadow-md overflow-hidden">
            <CardContent className="p-0">
              <div ref={mapContainer} className="h-[500px] w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="border shadow-md h-[500px] overflow-hidden">
            <CardContent className="p-0">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600">
                <h3 className="text-white font-semibold flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Route Stops
                </h3>
              </div>
              <div className="p-2 max-h-[450px] overflow-y-auto">
                {routeResult.stops.map((stop, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-2 border rounded-md mb-2 cursor-pointer transition-all",
                      activeStopIndex === index
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "hover:border-primary/50 hover:bg-primary/5",
                    )}
                    onClick={() => {
                      setActiveStopIndex(index)
                      if (map.current) {
                        map.current.flyTo({
                          center: getStopCoordinates(stop, index),
                          zoom: 10,
                          duration: 1000,
                        })
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-1">{getStopIcon(stop.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm truncate">{stop.location}</h4>
                          <Badge variant="outline" className="ml-1 text-xs whitespace-nowrap">
                            {stop.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{stop.description}</p>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span className="truncate">
                            {stop.arrivalTime.split(", ").length > 1
                              ? stop.arrivalTime.split(", ")[1]
                              : stop.arrivalTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

