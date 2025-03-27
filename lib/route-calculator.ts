import type { TripDetails, RouteResult } from "./types"
import { api } from "./api"

// This function now calls the Django backend API
export async function calculateRoute(tripDetails: TripDetails): Promise<RouteResult> {
  try {
    // Call the Django API to calculate the route
    const result = await api.calculateRoute(tripDetails)
    return result
  } catch (error) {
    console.error("Failed to calculate route:", error)

    // If the API call fails, we can either:
    // 1. Throw the error to be handled by the caller
    // 2. Return mock data for development/fallback

    // For production, you would typically want to throw the error:
    throw new Error("Failed to calculate route. Please try again.")

    // For development or as a fallback mechanism, you could return mock data:
    // return generateMockRouteData(tripDetails)
  }
}

// This function can be used during development or as a fallback
// if the API is unavailable
function generateMockRouteData(tripDetails: TripDetails): RouteResult {
  // Mock implementation (same as before)
  // This would be removed in production

  // Return a simplified mock result
  return {
    startLocation: tripDetails.currentLocation,
    endLocation: tripDetails.dropoffLocation,
    totalDistance: 750,
    totalDuration: "2 days, 3 hours",
    stops: [],
    logs: [],
  }
}

import type { RouteStop, LogDay, LogActivity } from "./types"

function generateMockStops(tripDetails: TripDetails): RouteStop[] {
  // Day 1
  const stops: RouteStop[] = [
    {
      type: "start",
      location: tripDetails.currentLocation,
      description: "Starting location",
      arrivalTime: "Day 1, 08:00 AM",
      departureTime: "Day 1, 08:30 AM",
      duration: "30 min",
    },
    {
      type: "pickup",
      location: tripDetails.pickupLocation,
      description: "Cargo pickup",
      arrivalTime: "Day 1, 10:30 AM",
      departureTime: "Day 1, 11:30 AM",
      duration: "1 hour",
      mileage: 120,
    },
    {
      type: "rest",
      location: "Rest Area - Highway 70",
      description: "Required 30-minute break",
      arrivalTime: "Day 1, 01:30 PM",
      departureTime: "Day 1, 02:00 PM",
      duration: "30 min",
      mileage: 240,
    },
    {
      type: "fuel",
      location: "Truck Stop - Junction City",
      description: "Refueling and meal break",
      arrivalTime: "Day 1, 04:30 PM",
      departureTime: "Day 1, 05:30 PM",
      duration: "1 hour",
      mileage: 380,
    },
    {
      type: "overnight",
      location: "Truck Stop - Riverside",
      description: "10-hour rest period",
      arrivalTime: "Day 1, 08:00 PM",
      departureTime: "Day 2, 06:00 AM",
      duration: "10 hours",
      mileage: 520,
    },

    // Day 2
    {
      type: "rest",
      location: "Rest Area - Highway 40",
      description: "Required 30-minute break",
      arrivalTime: "Day 2, 10:00 AM",
      departureTime: "Day 2, 10:30 AM",
      duration: "30 min",
      mileage: 620,
    },
    {
      type: "dropoff",
      location: tripDetails.dropoffLocation,
      description: "Final delivery",
      arrivalTime: "Day 2, 01:30 PM",
      departureTime: "Day 2, 02:30 PM",
      duration: "1 hour",
      mileage: 750,
    },
  ]

  return stops
}

function generateMockLogs(tripDetails: TripDetails): LogDay[] {
  // Day 1 Log
  const day1Activities: LogActivity[] = [
    {
      type: "offDuty",
      startTime: "00:00",
      endTime: "08:00",
      location: tripDetails.currentLocation,
    },
    {
      type: "onDutyNotDriving",
      startTime: "08:00",
      endTime: "08:30",
      location: tripDetails.currentLocation,
      description: "Pre-trip inspection",
    },
    {
      type: "driving",
      startTime: "08:30",
      endTime: "10:30",
      location: "En route to pickup",
    },
    {
      type: "onDutyNotDriving",
      startTime: "10:30",
      endTime: "11:30",
      location: tripDetails.pickupLocation,
      description: "Loading cargo",
    },
    {
      type: "driving",
      startTime: "11:30",
      endTime: "13:30",
      location: "En route",
    },
    {
      type: "offDuty",
      startTime: "13:30",
      endTime: "14:00",
      location: "Rest Area - Highway 70",
      description: "Required 30-minute break",
    },
    {
      type: "driving",
      startTime: "14:00",
      endTime: "16:30",
      location: "En route",
    },
    {
      type: "onDutyNotDriving",
      startTime: "16:30",
      endTime: "17:30",
      location: "Truck Stop - Junction City",
      description: "Refueling",
    },
    {
      type: "driving",
      startTime: "17:30",
      endTime: "20:00",
      location: "En route",
    },
    {
      type: "sleeperBerth",
      startTime: "20:00",
      endTime: "24:00",
      location: "Truck Stop - Riverside",
    },
  ]

  // Day 2 Log
  const day2Activities: LogActivity[] = [
    {
      type: "sleeperBerth",
      startTime: "00:00",
      endTime: "06:00",
      location: "Truck Stop - Riverside",
    },
    {
      type: "onDutyNotDriving",
      startTime: "06:00",
      endTime: "06:30",
      location: "Truck Stop - Riverside",
      description: "Pre-trip inspection",
    },
    {
      type: "driving",
      startTime: "06:30",
      endTime: "10:00",
      location: "En route",
    },
    {
      type: "offDuty",
      startTime: "10:00",
      endTime: "10:30",
      location: "Rest Area - Highway 40",
      description: "Required 30-minute break",
    },
    {
      type: "driving",
      startTime: "10:30",
      endTime: "13:30",
      location: "En route to delivery",
    },
    {
      type: "onDutyNotDriving",
      startTime: "13:30",
      endTime: "14:30",
      location: tripDetails.dropoffLocation,
      description: "Unloading cargo",
    },
    {
      type: "offDuty",
      startTime: "14:30",
      endTime: "24:00",
      location: tripDetails.dropoffLocation,
    },
  ]

  const logs: LogDay[] = [
    {
      date: "04/15/2023",
      startLocation: tripDetails.currentLocation,
      endLocation: "Truck Stop - Riverside",
      totalMiles: 520,
      shippingDocuments: "BOL-12345",
      remarks: [
        "08:00 - Started in " + tripDetails.currentLocation,
        "10:30 - Arrived at " + tripDetails.pickupLocation + " for pickup",
        "13:30 - 30-minute break at Rest Area - Highway 70",
        "16:30 - Fuel stop at Junction City",
        "20:00 - 10-hour rest period at Riverside Truck Stop",
      ],
      activities: day1Activities,
      totalHours: {
        offDuty: "8.5",
        sleeperBerth: "4.0",
        driving: "8.0",
        onDutyNotDriving: "3.5",
      },
    },
    {
      date: "04/16/2023",
      startLocation: "Truck Stop - Riverside",
      endLocation: tripDetails.dropoffLocation,
      totalMiles: 230,
      shippingDocuments: "BOL-12345",
      remarks: [
        "06:00 - Pre-trip inspection at Riverside Truck Stop",
        "10:00 - 30-minute break at Rest Area - Highway 40",
        "13:30 - Arrived at " + tripDetails.dropoffLocation + " for delivery",
        "14:30 - Off duty after delivery completion",
      ],
      activities: day2Activities,
      totalHours: {
        offDuty: "10.0",
        sleeperBerth: "6.0",
        driving: "6.5",
        onDutyNotDriving: "1.5",
      },
    },
  ]

  return logs
}

