/**
 * Mapbox API integration for route mapping and distance calculations
 */

// Replace with your actual Mapbox access token
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.placeholder_token"

export interface MapboxCoordinates {
  longitude: number
  latitude: number
}

export interface MapboxRoute {
  distance: number // in meters
  duration: number // in seconds
  geometry: {
    coordinates: [number, number][]
    type: string
  }
}

export interface MapboxDirectionsResponse {
  routes: MapboxRoute[]
  waypoints: {
    name: string
    coordinates: [number, number]
  }[]
}

/**
 * Geocode an address to coordinates
 */
export async function geocodeAddress(address: string): Promise<MapboxCoordinates | null> {
  try {
    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=us&limit=1`,
    )

    if (!response.ok) {
      throw new Error(`Geocoding error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center
      return { longitude, latitude }
    }

    return null
  } catch (error) {
    console.error("Geocoding error:", error)
    return null
  }
}

/**
 * Get directions between multiple points
 */
export async function getDirections(
  origin: MapboxCoordinates,
  destination: MapboxCoordinates,
  waypoints: MapboxCoordinates[] = [],
): Promise<MapboxDirectionsResponse | null> {
  try {
    // Format coordinates for the API
    const coordinates = [
      `${origin.longitude},${origin.latitude}`,
      ...waypoints.map((wp) => `${wp.longitude},${wp.latitude}`),
      `${destination.longitude},${destination.latitude}`,
    ].join(";")

    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?access_token=${MAPBOX_ACCESS_TOKEN}&geometries=geojson&overview=full`,
    )

    if (!response.ok) {
      throw new Error(`Directions error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Directions error:", error)
    return null
  }
}

/**
 * Convert meters to miles
 */
export function metersToMiles(meters: number): number {
  return meters / 1609.344
}

/**
 * Convert seconds to a formatted duration string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24

  if (days > 0) {
    return `${days} days, ${remainingHours} hours`
  }

  return `${hours} hours`
}

/**
 * Calculate estimated fuel stops based on distance
 */
export function calculateFuelStops(distanceInMiles: number): number {
  // Assuming average truck gets 6.5 mpg and has a 200-gallon tank
  const avgMpg = 6.5
  const tankSize = 200
  const range = tankSize * avgMpg

  // Subtract 100 miles as a safety buffer (don't run tank completely empty)
  const effectiveRange = range - 100

  return Math.max(0, Math.floor(distanceInMiles / effectiveRange))
}

