import type { TripDetails, RouteResult } from "./types"
import { api } from "./api"

/**
 * Calculates a route based on trip details by calling the backend API.
 *
 * @param tripDetails - The trip details including current location, pickup location, dropoff location, and cycle hours used
 * @returns A promise that resolves to the route result
 */
export async function calculateRoute(tripDetails: TripDetails): Promise<RouteResult> {
  try {
    console.log("Calling API to calculate route with details:", tripDetails)

    const result = await api.calculateRoute(tripDetails)
    console.log("API returned result:", result)

    return result
  } catch (error) {
    console.error("Failed to calculate route:", error)

    throw error
  }
}

