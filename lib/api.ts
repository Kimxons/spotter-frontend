import { User } from "./ auth-context"
import type { TripDetails, RouteResult } from "./types"

const API_BASE_URL = "http://localhost:8000/api"

export class ApiError extends Error {
  status: number
  data?: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

let authToken: string | null = null

/**
 * Generic fetch wrapper with error handling and typing
 * @param endpoint - API endpoint path (without base URL)
 * @param options - Fetch options
 * @returns Promise with typed response data
 */
async function fetchFromAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string> || {}),
  }

  if (authToken) {
    headers["Authorization"] = `Token ${authToken}`
  }

  console.log(`Making API request to: ${url}`, {
    method: options.method,
    headers,
    body: options.body ? JSON.parse(options.body as string) : undefined,
  })

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    console.log(`Received response with status: ${response.status}`)

    const responseClone = response.clone()

    const rawText = await responseClone.text()
    console.log("Raw response text:", rawText)

    if (!response.ok) {
      let errorData: { detail?: any; message?: string; error?: string } = {}

      if (rawText) {
        try {
          errorData = JSON.parse(rawText)
          console.log("Parsed error data:", errorData)
        } catch (e) {
          console.error("Failed to parse error response as JSON:", e)
          errorData = {
            message: rawText || `Server responded with ${response.status}: ${response.statusText}`,
          }
        }
      } else {
        errorData = {
          message: `Server responded with ${response.status}: ${response.statusText}`,
        }
      }

      console.error("API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        rawText,
      })

      let errorMessage = ""

      if (typeof errorData === "object" && errorData !== null) {
        if (errorData.detail && typeof errorData.detail === "object") {
          errorMessage = Object.entries(errorData.detail)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
            .join("; ")
        } else if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else {
          const fieldErrors = Object.entries(errorData)
            .filter(([key, value]) => typeof value === "string" || Array.isArray(value))
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
            .join("; ")

          if (fieldErrors) {
            errorMessage = fieldErrors
          } else {
            errorMessage = `API error: ${response.status} ${response.statusText}`
          }
        }
      } else {
        errorMessage = `API error: ${response.status} ${response.statusText}`
      }

      throw new ApiError(errorMessage, response.status, errorData)
    }

    let data
    try {
      data = rawText ? JSON.parse(rawText) : await response.json()
    } catch (e) {
      console.error("Failed to parse response as JSON:", e)
      const errorMessage = e instanceof Error ? e.message : 'Unknown parsing error'
      throw new ApiError(`Failed to parse response as JSON: ${errorMessage}`, response.status, { rawResponse: rawText })
    }

    console.log("API response data:", data)
    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof Error) {
      console.error(`API request to ${url} failed:`, error.message, error)
      throw new ApiError(`Network error: ${error.message}. Make sure the Django server is running on port 8000.`, 0)
    }

    console.error(`Unknown API error during request to ${url}:`, error)
    throw new ApiError("An unknown error occurred while communicating with the server", 0)
  }
}

/**
 * API client with typed methods for all endpoints
 */
export const api = {
  // Auth token management
  setAuthToken: (token: string) => {
    authToken = token
  },

  clearAuthToken: () => {
    authToken = null
  },

  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    return fetchFromAPI<{ token: string; user: User }>("/users/auth/token/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
  },

  register: async (userData: { username: string; email: string; password: string }): Promise<{
    token: string
    user: User
  }> => {
    return fetchFromAPI<{ token: string; user: User }>("/users/register/", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  getCurrentUser: async (): Promise<User> => {
    return fetchFromAPI<User>("/users/me/")
  },

  calculateRoute: async (tripDetails: TripDetails): Promise<RouteResult> => {
    console.log("Sending trip details to API:", tripDetails)

    const formattedTripDetails = {
      current_location: tripDetails.currentLocation,
      pickup_location: tripDetails.pickupLocation,
      dropoff_location: tripDetails.dropoffLocation,
      cycle_hours_used: String(tripDetails.cycleHoursUsed),
    }

    console.log("Formatted trip details for API:", formattedTripDetails)

    return fetchFromAPI<RouteResult>("/routes/calculate/", {
      method: "POST",
      body: JSON.stringify(formattedTripDetails),
    })
  },

  // Save a route
  saveRoute: async (routeData: RouteResult): Promise<RouteResult> => {
    // Convert camelCase to snake_case for the backend
    const formattedRouteData = {
      start_location: routeData.startLocation,
      end_location: routeData.endLocation,
      total_distance: routeData.totalDistance,
      total_duration: routeData.totalDuration,
      stops: routeData.stops.map((stop) => ({
        type: stop.type,
        location: stop.location,
        description: stop.description,
        arrival_time: stop.arrivalTime,
        departure_time: stop.departureTime,
        duration: stop.duration,
        mileage: stop.mileage,
        coordinates: stop.coordinates,
        latitude: stop.latitude,
        longitude: stop.longitude,
      })),
      logs: routeData.logs.map((log) => ({
        date: log.date,
        start_location: log.startLocation,
        end_location: log.endLocation,
        total_miles: log.totalMiles,
        shipping_documents: log.shippingDocuments,
        remarks: log.remarks,
        activities: log.activities.map((activity) => ({
          type: activity.type,
          start_time: activity.startTime,
          end_time: activity.endTime,
          location: activity.location,
          description: activity.description,
        })),
        total_hours: {
          off_duty: log.totalHours.offDuty,
          sleeper_berth: log.totalHours.sleeperBerth,
          driving: log.totalHours.driving,
          on_duty_not_driving: log.totalHours.onDutyNotDriving,
        },
      })),
    }

    return fetchFromAPI<RouteResult>("/routes/", {
      method: "POST",
      body: JSON.stringify(formattedRouteData),
    })
  },

  // Get saved routes
  getSavedRoutes: async (): Promise<RouteResult[]> => {
    return fetchFromAPI<RouteResult[]>("/routes/")
  },

  // Get a specific route by ID
  getRoute: async (routeId: string): Promise<RouteResult> => {
    return fetchFromAPI<RouteResult>(`/routes/${routeId}/`)
  },

  // Delete a route
  deleteRoute: async (routeId: string): Promise<void> => {
    return fetchFromAPI<void>(`/routes/${routeId}/`, {
      method: "DELETE",
    })
  },
}

/**
 * Helper function to handle API errors with appropriate user messages
 */
export function getApiErrorMessage(error: unknown): string {
  console.error("API Error details:", error)

  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "The requested resource was not found. Please try again."
    }

    if (error.status === 401 || error.status === 403) {
      return "You don't have permission to access this resource. Please log in."
    }

    if (error.status === 422 || error.status === 400) {
      if (error.data && typeof error.data === "object") {
        const validationErrors = Object.entries(error.data)
          .filter(([key, value]) => key !== "error" && key !== "detail" && key !== "message")
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join("; ")

        if (validationErrors) {
          return `Validation error: ${validationErrors}`
        }
      }

      return error.message || "Invalid data provided. Please check your inputs and try again."
    }

    if (error.status >= 500) {
      return "The server encountered an error. Please try again later."
    }

    if (error.status === 0) {
      return `Network error: ${error.message}. Make sure the Django server is running.`
    }

    return error.message || "An error occurred while communicating with the server."
  }

  if (error instanceof Error) {
    return error.message
  }

  return "An unknown error occurred. Please try again."
}

