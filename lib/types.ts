// Trip input details
export interface TripDetails {
  currentLocation: string
  pickupLocation: string
  dropoffLocation: string
  cycleHoursUsed: number
}

// Route calculation result
export interface RouteResult {
  id?: string
  startLocation: string
  endLocation: string
  totalDistance: number
  totalDuration: string
  stops: RouteStop[]
  logs: LogDay[]
  createdAt?: string
}

// Individual stop on the route
export interface RouteStop {
  type: "start" | "pickup" | "dropoff" | "rest" | "fuel" | "overnight"
  location: string
  description: string
  arrivalTime: string
  departureTime: string
  duration?: string
  mileage?: number
}

// Daily log sheet
export interface LogDay {
  date: string
  startLocation: string
  endLocation: string
  totalMiles: number
  shippingDocuments: string
  remarks: string[]
  activities: LogActivity[]
  totalHours: {
    offDuty: string
    sleeperBerth: string
    driving: string
    onDutyNotDriving: string
  }
}

// Activity entry in the log
export interface LogActivity {
  type: "offDuty" | "sleeperBerth" | "driving" | "onDutyNotDriving"
  startTime: string
  endTime: string
  location: string
  description?: string
}

