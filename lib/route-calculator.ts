import type { RouteResult, TripDetails, RouteStop, LogDay } from "@/lib/types"
import { calculateFuelStops, formatDuration, geocodeAddress, getDirections, metersToMiles } from "./mapbox-api";

/**
 * Calculate a route between two locations
 */
export async function calculateRoute(
  origin: string,
  destination: string,
  departureTime: Date,
  truckType: string,
): Promise<{ routeResult: RouteResult; tripDetails: TripDetails }> {
  try {
    // Geocode origin and destination
    const originCoords = await geocodeAddress(origin)
    const destinationCoords = await geocodeAddress(destination)

    if (!originCoords || !destinationCoords) {
      throw new Error("Could not geocode one or both locations")
    }

    // Get directions from Mapbox
    const directions = await getDirections(originCoords, destinationCoords)

    if (!directions || !directions.routes || directions.routes.length === 0) {
      throw new Error("Could not calculate route")
    }

    // Extract route information
    const route = directions.routes[0]
    const distanceInMiles = metersToMiles(route.distance)
    const durationInHours = route.duration / 3600

    // Calculate number of fuel stops needed
    const fuelStops = calculateFuelStops(distanceInMiles)

    // Generate stops along the route
    const stops = generateStops(origin, destination, departureTime, distanceInMiles, durationInHours, fuelStops)

    // Generate log days
    const logs = generateLogs(stops, departureTime)

    // Calculate arrival time
    const arrivalTime = new Date(stops[stops.length - 1].departureTime)

    // Create route result
    const routeResult: RouteResult = {
      startLocation: origin,
      endLocation: destination,
      departureTime: departureTime.toLocaleString(),
      arrivalTime: arrivalTime.toLocaleString(),
      totalDistance: Math.round(distanceInMiles),
      totalDuration: formatDuration(route.duration),
      stops,
      logs,
    }

    // Create trip details
    const tripDetails: TripDetails = {
      origin,
      destination,
      departureTime,
      truckType,
      cycleHoursUsed: 0, // Default to 0, should be provided by user
      cycleType: "70hour8day", // Default to 70-hour/8-day cycle
    }

    return { routeResult, tripDetails }
  } catch (error) {
    console.error("Error calculating route:", error)
    throw error
  }
}

/**
 * Generate stops along the route
 */
function generateStops(
  origin: string,
  destination: string,
  departureTime: Date,
  distanceInMiles: number,
  durationInHours: number,
  fuelStops: number,
): RouteStop[] {
  const stops: RouteStop[] = []
  const currentTime = new Date(departureTime)

  // Add starting point
  stops.push({
    type: "start",
    location: origin,
    description: "Trip start",
    arrivalTime: currentTime.toLocaleString(),
    departureTime: currentTime.toLocaleString(),
  })

  // Add pickup stop (1 hour after departure)
  currentTime.setHours(currentTime.getHours() + 1)
  stops.push({
    type: "pickup",
    location: origin,
    description: "Pickup cargo",
    arrivalTime: new Date(departureTime).toLocaleString(),
    departureTime: currentTime.toLocaleString(),
    duration: "1 hour",
  })

  // Calculate segment distance
  const segmentDistance = distanceInMiles / (fuelStops + 1)
  const segmentDuration = durationInHours / (fuelStops + 1)

  // Add fuel and rest stops
  let currentDistance = 0
  for (let i = 0; i < fuelStops; i++) {
    // Add driving segment
    currentDistance += segmentDistance
    currentTime.setHours(currentTime.getHours() + segmentDuration)

    // Add fuel stop (30 minutes)
    stops.push({
      type: "fuel",
      location: `Fuel Stop ${i + 1}`,
      description: `Refuel at mile ${Math.round(currentDistance)}`,
      arrivalTime: currentTime.toLocaleString(),
      departureTime: new Date(currentTime.getTime() + 30 * 60000).toLocaleString(),
      duration: "30 minutes",
      mileage: Math.round(currentDistance),
    })
    currentTime.setMinutes(currentTime.getMinutes() + 30)

    // Add rest stop if needed (based on HOS regulations)
    if (i % 2 === 1) {
      stops.push({
        type: "rest",
        location: `Rest Stop ${Math.floor(i / 2) + 1}`,
        description: "Required rest period",
        arrivalTime: currentTime.toLocaleString(),
        departureTime: new Date(currentTime.getTime() + 10 * 60 * 60000).toLocaleString(),
        duration: "10 hours",
        mileage: Math.round(currentDistance),
      })
      currentTime.setHours(currentTime.getHours() + 10)
    }
  }

  // Add final driving segment
  currentTime.setHours(currentTime.getHours() + segmentDuration)

  // Add dropoff (1 hour)
  stops.push({
    type: "dropoff",
    location: destination,
    description: "Deliver cargo",
    arrivalTime: currentTime.toLocaleString(),
    departureTime: new Date(currentTime.getTime() + 60 * 60000).toLocaleString(),
    duration: "1 hour",
    mileage: Math.round(distanceInMiles),
  })

  return stops
}

/**
 * Generate log days based on stops
 */
function generateLogs(stops: RouteStop[], departureTime: Date): LogDay[] {
  const logs: LogDay[] = []
  let currentDate = new Date(departureTime)
  currentDate.setHours(0, 0, 0, 0)

  let currentLog: LogDay = {
    date: currentDate.toLocaleDateString(),
    activities: [],
    totalHours: {
      driving: "0",
      onDutyNotDriving: "0",
      offDuty: "0",
      sleeperBerth: "0",
    },
  }

  // Process each stop to create activities
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]
    const nextStop = stops[i + 1]

    const arrivalTime = new Date(stop.arrivalTime)
    const departureTime = new Date(stop.departureTime)

    // Check if we need to start a new log day
    const stopDate = new Date(arrivalTime)
    stopDate.setHours(0, 0, 0, 0)

    if (stopDate.getTime() !== currentDate.getTime()) {
      // Save current log and start a new one
      if (currentLog.activities.length > 0) {
        logs.push(currentLog)
      }
      currentDate = new Date(stopDate)
      currentLog = {
        date: currentDate.toLocaleDateString(),
        activities: [],
        totalHours: {
          driving: "0",
          onDutyNotDriving: "0",
          offDuty: "0",
          sleeperBerth: "0",
        },
      }
    }

    // Add activity based on stop type
    switch (stop.type) {
      case "start":
        // No activity for start
        break
      case "pickup":
      case "dropoff":
        currentLog.activities.push({
          type: "onDutyNotDriving",
          startTime: formatTimeForLog(arrivalTime),
          endTime: formatTimeForLog(departureTime),
          location: stop.location,
          remarks: stop.description,
        })
        break
      case "fuel":
        currentLog.activities.push({
          type: "onDutyNotDriving",
          startTime: formatTimeForLog(arrivalTime),
          endTime: formatTimeForLog(departureTime),
          location: stop.location,
          remarks: "Refueling",
        })
        break
      case "rest":
        currentLog.activities.push({
          type: "sleeperBerth",
          startTime: formatTimeForLog(arrivalTime),
          endTime: formatTimeForLog(departureTime),
          location: stop.location,
          remarks: "Rest period",
        })
        break
    }

    // Add driving activity if there's a next stop
    if (nextStop) {
      const nextArrivalTime = new Date(nextStop.arrivalTime)

      // Check if driving spans multiple days
      if (isSameDay(departureTime, nextArrivalTime)) {
        // Driving within the same day
        currentLog.activities.push({
          type: "driving",
          startTime: formatTimeForLog(departureTime),
          endTime: formatTimeForLog(nextArrivalTime),
          remarks: `Driving to ${nextStop.location}`,
        })
      } else {
        // Driving spans multiple days
        // Add driving until midnight
        const midnight = new Date(departureTime)
        midnight.setHours(23, 59, 59, 999)

        currentLog.activities.push({
          type: "driving",
          startTime: formatTimeForLog(departureTime),
          endTime: "23:59",
          remarks: `Driving to ${nextStop.location}`,
        })

        // Add driving from midnight to arrival on the next day
        // This will be handled in the next iteration when we create a new log day
      }
    }

    // Calculate total hours for the current log
    updateTotalHours(currentLog)
  }

  // Add the last log if it has activities
  if (currentLog.activities.length > 0) {
    updateTotalHours(currentLog)
    logs.push(currentLog)
  }

  return logs
}

/**
 * Format time for log entry (HH:MM)
 */
function formatTimeForLog(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
}

/**
 * Check if two dates are on the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Update total hours for a log day
 */
function updateTotalHours(log: LogDay): void {
  let drivingMinutes = 0
  let onDutyNotDrivingMinutes = 0
  let offDutyMinutes = 0
  let sleeperBerthMinutes = 0

  log.activities.forEach((activity) => {
    const startMinutes = timeToMinutes(activity.startTime)
    const endMinutes = timeToMinutes(activity.endTime)
    const duration = endMinutes >= startMinutes ? endMinutes - startMinutes : 24 * 60 - startMinutes + endMinutes

    switch (activity.type) {
      case "driving":
        drivingMinutes += duration
        break
      case "onDutyNotDriving":
        onDutyNotDrivingMinutes += duration
        break
      case "offDuty":
        offDutyMinutes += duration
        break
      case "sleeperBerth":
        sleeperBerthMinutes += duration
        break
    }
  })

  log.totalHours = {
    driving: (drivingMinutes / 60).toFixed(1),
    onDutyNotDriving: (onDutyNotDrivingMinutes / 60).toFixed(1),
    offDuty: (offDutyMinutes / 60).toFixed(1),
    sleeperBerth: (sleeperBerthMinutes / 60).toFixed(1),
  }
}

/**
 * Convert time string (HH:MM) to minutes
 */
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number)
  return hours * 60 + minutes
}

