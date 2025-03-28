export interface TripDetails {
  origin: string
  destination: string
  departureTime: Date
  truckType: string
  cycleHoursUsed: number
  cycleType: "60hour7day" | "70hour8day"
}

export interface RouteStop {
  type: "start" | "pickup" | "dropoff" | "rest" | "fuel" | "overnight"
  location: string
  description: string
  arrivalTime: string
  departureTime: string
  duration?: string
  mileage?: number
}

export interface LogActivity {
  type: "driving" | "onDutyNotDriving" | "offDuty" | "sleeperBerth"
  startTime: string
  endTime: string
  location?: string
  remarks?: string
}

export interface LogDay {
  date: string
  activities: LogActivity[]
  totalHours: {
    driving: string
    onDutyNotDriving: string
    offDuty: string
    sleeperBerth: string
  }
}

export interface RouteResult {
  startLocation: string
  endLocation: string
  departureTime: string
  arrivalTime: string
  totalDistance: number
  totalDuration: string
  stops: RouteStop[]
  logs: LogDay[]
}

export interface HOSViolation {
  type: "driving" | "window" | "break" | "cycle" | "other"
  description: string
  severity: "low" | "medium" | "high"
  day?: number
}

export interface HOSComplianceResult {
  isCompliant: boolean
  violations: HOSViolation[]
  warnings: string[]
  cycleHoursUsed: number
  cycleHoursRemaining: number
  drivingHoursRemaining: number
  dutyWindowRemaining: number
  totalDrivingHours: number
  totalOnDutyHours: number
  sleeperBerthUsage: {
    used: boolean
    validPairs: number
    details: string
  }
  cycleHoursUsedPercentage: number
  drivingHoursUsedPercentage: number
  dutyWindowUsedPercentage: number
}

