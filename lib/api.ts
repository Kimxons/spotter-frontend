import { User } from "./ auth-context"
import type { TripDetails, RouteResult } from "./types"

const API_BASE_URL = "http://localhost:8000/api"

/**
 * Custom API error class for better error handling
 */
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

// Storing auth token for API requests
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
    ...(options.headers as Record<string, string>),
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
      interface ErrorData {
        detail?: { [key: string]: string[] | string } | string;
        message?: string;
        error?: string;
      }
      let errorData: ErrorData = {}

      if (rawText) {
        try {
          errorData = JSON.parse(rawText) as ErrorData
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
        errorMessage = `API error: ${response.status} ${response.statusText}`
      }

      throw new ApiError(errorMessage, response.status, errorData)
    }

    let data
    try {
      data = rawText ? JSON.parse(rawText) : await response.json()
    } catch (e) {
      console.error("Failed to parse response as JSON:", e)
      const errorMessage = e instanceof Error ? e.message : 'Unknown JSON parsing error'
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

  // Authentication
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

  // Calculate route based on trip details
  calculateRoute: async (tripDetails: TripDetails): Promise<RouteResult> => {
    console.log("Sending trip details to API:", tripDetails)

    // Format the trip details for the API
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
    return fetchFromAPI<RouteResult>("/routes/", {
      method: "POST",
      body: JSON.stringify(routeData),
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
    // Handle specific error codes
    if (error.status === 404) {
      return "The requested resource was not found. Please try again."
    }

    if (error.status === 401 || error.status === 403) {
      return "You don't have permission to access this resource. Please log in."
    }

    if (error.status === 422 || error.status === 400) {
      if (error.data && typeof error.data === "object") {
        // Try to format validation errors nicely
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

    // Return the error message if available
    return error.message || "An error occurred while communicating with the server."
  }

  if (error instanceof Error) {
    return error.message
  }

  return "An unknown error occurred. Please try again."
}

