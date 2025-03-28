import type { LogDay, LogActivity, TripDetails, RouteStop, HOSComplianceResult, HOSViolation } from "@/lib/types"

const MAX_DRIVING_HOURS = 11 // Maximum driving hours before 10-hour break
const MAX_DUTY_WINDOW = 14 // Maximum on-duty window before 10-hour break
const REQUIRED_BREAK_AFTER = 8 // Required break after 8 hours of driving
const BREAK_DURATION = 30 // 30-minute break duration (in minutes)
const MAX_CYCLE_HOURS_7_DAY = 60 // Maximum on-duty hours in 7-day period
const MAX_CYCLE_HOURS_8_DAY = 70 // Maximum on-duty hours in 8-day period
const REQUIRED_REST_HOURS = 10 // Required consecutive off-duty hours
const SLEEPER_BERTH_MIN = 7 // Minimum hours for sleeper berth split
const SLEEPER_BERTH_PAIR_MIN = 2 // Minimum hours for second part of split

/**
 * Calculate Hours of Service (HOS) compliance for a trip
 * Based on FMCSA regulations for property-carrying drivers
 */
export function calculateHOSCompliance(tripDetails: TripDetails, logs: LogDay[]): HOSComplianceResult {
  const violations: HOSViolation[] = []
  const warnings: string[] = []

  // Calculate total driving and on-duty hours from logs
  const totalDrivingHours = logs.reduce((total, log) => total + Number.parseFloat(log.totalHours.driving), 0)

  const totalOnDutyHours = logs.reduce(
    (total, log) =>
      total + Number.parseFloat(log.totalHours.driving) + Number.parseFloat(log.totalHours.onDutyNotDriving),
    0,
  )

  // Calculate remaining cycle hours
  const cycleHoursUsed = tripDetails.cycleHoursUsed + totalOnDutyHours
  const maxCycleHours = tripDetails.cycleType === "60hour7day" ? MAX_CYCLE_HOURS_7_DAY : MAX_CYCLE_HOURS_8_DAY
  const cycleHoursRemaining = Math.max(0, maxCycleHours - cycleHoursUsed)

  // Check for cycle hours violation
  if (cycleHoursRemaining <= 0) {
    violations.push({
      type: "cycle",
      description: `${maxCycleHours}-hour cycle limit exceeded by ${Math.abs(maxCycleHours - cycleHoursUsed).toFixed(1)} hours`,
      severity: "high",
    })
  } else if (cycleHoursRemaining < 5) {
    warnings.push(`Only ${cycleHoursRemaining.toFixed(1)} hours remaining in your ${maxCycleHours}-hour cycle`)
  }

  // Check each log day for 11-hour driving and 14-hour window violations
  logs.forEach((log, index) => {
    const drivingHours = Number.parseFloat(log.totalHours.driving)
    if (drivingHours > MAX_DRIVING_HOURS) {
      violations.push({
        type: "driving",
        description: `Day ${index + 1}: 11-hour driving limit exceeded by ${(drivingHours - MAX_DRIVING_HOURS).toFixed(1)} hours`,
        severity: "high",
        day: index,
      })
    }

    // Check for 30-minute break violations
    const breakViolations = checkBreakViolations(log.activities)
    if (breakViolations.length > 0) {
      breakViolations.forEach((violation) => {
        violations.push({
          type: "break",
          description: `Day ${index + 1}: ${violation}`,
          severity: "medium",
          day: index,
        })
      })
    }

    // Check for 14-hour window violations
    const windowViolation = check14HourViolation(log.activities)
    if (windowViolation) {
      violations.push({
        type: "window",
        description: `Day ${index + 1}: 14-hour duty window exceeded by ${windowViolation.exceededBy.toFixed(1)} hours`,
        severity: "high",
        day: index,
      })
    }
  })

  // Calculate remaining driving hours and duty window for the current/last day
  const lastLog = logs[logs.length - 1]
  const lastDrivingHours = Number.parseFloat(lastLog.totalHours.driving)
  const drivingHoursRemaining = Math.max(0, MAX_DRIVING_HOURS - lastDrivingHours)

  // Calculate duty window remaining (simplified - in a real app would need to track actual start time)
  const lastOnDutyHours =
    Number.parseFloat(lastLog.totalHours.driving) + Number.parseFloat(lastLog.totalHours.onDutyNotDriving)
  const dutyWindowRemaining = Math.max(0, MAX_DUTY_WINDOW - lastOnDutyHours)

  // Check for sleeper berth provision usage
  const sleeperBerthUsage = checkSleeperBerthProvision(logs)

  return {
    isCompliant: violations.length === 0,
    violations,
    warnings,
    cycleHoursUsed,
    cycleHoursRemaining,
    drivingHoursRemaining,
    dutyWindowRemaining,
    totalDrivingHours,
    totalOnDutyHours,
    sleeperBerthUsage,
    cycleHoursUsedPercentage: (cycleHoursUsed / maxCycleHours) * 100,
    drivingHoursUsedPercentage: (lastDrivingHours / MAX_DRIVING_HOURS) * 100,
    dutyWindowUsedPercentage: (lastOnDutyHours / MAX_DUTY_WINDOW) * 100,
  }
}

/**
 * Check if the 30-minute break requirement is violated
 */
function checkBreakViolations(activities: LogActivity[]): string[] {
  const violations: string[] = []
  let consecutiveDrivingMinutes = 0
  let lastBreakTime: number | null = null

  // Sort activities by start time
  const sortedActivities = [...activities].sort((a, b) => {
    return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
  })

  for (let i = 0; i < sortedActivities.length; i++) {
    const activity = sortedActivities[i]

    if (activity.type === "driving") {
      const startMinutes = parseTimeToMinutes(activity.startTime)
      const endMinutes = parseTimeToMinutes(activity.endTime)
      const duration = endMinutes > startMinutes ? endMinutes - startMinutes : 24 * 60 - startMinutes + endMinutes

      // If we had a break, calculate how much driving time to count
      if (lastBreakTime !== null && startMinutes > lastBreakTime) {
        // Reset counter if we had a valid break
        consecutiveDrivingMinutes = 0
      }

      consecutiveDrivingMinutes += duration

      // Check if 8-hour limit is exceeded without a break
      if (consecutiveDrivingMinutes >= REQUIRED_BREAK_AFTER * 60) {
        violations.push("Required 30-minute break after 8 hours of driving not taken")
        // Reset counter after recording violation
        consecutiveDrivingMinutes = 0
      }
    } else if (activity.type === "offDuty" || activity.type === "sleeperBerth") {
      // Check if this non-driving period is at least 30 minutes
      const startMinutes = parseTimeToMinutes(activity.startTime)
      const endMinutes = parseTimeToMinutes(activity.endTime)
      const duration = endMinutes > startMinutes ? endMinutes - startMinutes : 24 * 60 - startMinutes + endMinutes

      if (duration >= BREAK_DURATION) {
        // Record when this break ended
        lastBreakTime = endMinutes
      }
    }
  }

  return violations
}

/**
 * Check if the 14-hour duty window is violated
 */
function check14HourViolation(activities: LogActivity[]): { violated: boolean; exceededBy: number } | null {
  // Sort activities by start time
  const sortedActivities = [...activities].sort((a, b) => {
    return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
  })

  // Find first on-duty activity
  const firstOnDutyIndex = sortedActivities.findIndex((a) => a.type === "driving" || a.type === "onDutyNotDriving")

  if (firstOnDutyIndex === -1) return null

  const firstOnDutyTime = parseTimeToMinutes(sortedActivities[firstOnDutyIndex].startTime)

  // Find last driving or on-duty activity
  const lastActivityIndex = sortedActivities.findIndex((a) => a.type === "driving" || a.type === "onDutyNotDriving")

  if (lastActivityIndex === -1) return null

  const lastActivity = sortedActivities[lastActivityIndex]
  const lastActivityEndTime = parseTimeToMinutes(lastActivity.endTime)

  // Calculate total window
  let windowMinutes =
    lastActivityEndTime > firstOnDutyTime
      ? lastActivityEndTime - firstOnDutyTime
      : 24 * 60 - firstOnDutyTime + lastActivityEndTime

  // Subtract sleeper berth periods that qualify for split break
  const sleeperPeriods = sortedActivities
    .filter((a) => a.type === "sleeperBerth")
    .map((a) => {
      const start = parseTimeToMinutes(a.startTime)
      const end = parseTimeToMinutes(a.endTime)
      return {
        start,
        end,
        duration: end > start ? end - start : 24 * 60 - start + end,
      }
    })
    .filter((period) => period.duration >= SLEEPER_BERTH_MIN * 60)

  // Apply sleeper berth provision (simplified - real implementation would be more complex)
  if (sleeperPeriods.length > 0) {
    windowMinutes -= sleeperPeriods.reduce((total, period) => total + period.duration, 0)
  }

  const exceededBy = (windowMinutes - MAX_DUTY_WINDOW * 60) / 60

  if (windowMinutes > MAX_DUTY_WINDOW * 60) {
    return { violated: true, exceededBy }
  }

  return null
}

/**
 * Check for sleeper berth provision usage
 */
function checkSleeperBerthProvision(logs: LogDay[]): {
  used: boolean
  validPairs: number
  details: string
} {
  let validPairs = 0
  let details = "No sleeper berth provision used"

  // Flatten all activities across all logs
  const allActivities = logs.flatMap((log) => log.activities)

  // Find sleeper berth periods
  const sleeperPeriods = allActivities
    .filter((a) => a.type === "sleeperBerth")
    .map((a) => {
      const start = parseTimeToMinutes(a.startTime)
      const end = parseTimeToMinutes(a.endTime)
      return {
        start,
        end,
        duration: end > start ? end - start : 24 * 60 - start + end,
      }
    })

  // Find off-duty periods
  const offDutyPeriods = allActivities
    .filter((a) => a.type === "offDuty")
    .map((a) => {
      const start = parseTimeToMinutes(a.startTime)
      const end = parseTimeToMinutes(a.endTime)
      return {
        start,
        end,
        duration: end > start ? end - start : 24 * 60 - start + end,
      }
    })

  // Check for valid 7/3 split
  const validSleeperPeriods = sleeperPeriods.filter((p) => p.duration >= SLEEPER_BERTH_MIN * 60)

  if (validSleeperPeriods.length > 0) {
    // Look for matching periods (either sleeper or off-duty) that could form a pair
    for (const sleeperPeriod of validSleeperPeriods) {
      // Check for off-duty periods that could pair with this sleeper period
      const matchingOffDuty = offDutyPeriods.find(
        (p) =>
          p.duration >= SLEEPER_BERTH_PAIR_MIN * 60 && p.duration + sleeperPeriod.duration >= REQUIRED_REST_HOURS * 60,
      )

      if (matchingOffDuty) {
        validPairs++
      }

      // Check for other sleeper periods that could pair with this one
      const matchingSleeper = sleeperPeriods.find(
        (p) =>
          p !== sleeperPeriod &&
          p.duration >= SLEEPER_BERTH_PAIR_MIN * 60 &&
          p.duration + sleeperPeriod.duration >= REQUIRED_REST_HOURS * 60,
      )

      if (matchingSleeper) {
        validPairs++
      }
    }
  }

  if (validPairs > 0) {
    details = `Found ${validPairs} valid sleeper berth provision pairs`
    return { used: true, validPairs, details }
  }

  return { used: false, validPairs: 0, details }
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number)
  return hours * 60 + minutes
}

/**
 * Generate optimized log days based on trip details and stops
 * This creates more accurate logs based on HOS regulations
 */
export function generateOptimizedLogs(tripDetails: TripDetails, stops: RouteStop[]): LogDay[] {
  const logs: LogDay[] = []
  let currentDate = new Date(tripDetails.departureTime)
  let currentLog: LogDay = createNewLogDay(currentDate)

  // Process each stop to create activities
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]
    const nextStop = stops[i + 1]

    const arrivalTime = new Date(stop.arrivalTime)
    const departureTime = new Date(stop.departureTime)

    // Check if we need to start a new log day
    if (
      arrivalTime.getDate() !== currentDate.getDate() ||
      arrivalTime.getMonth() !== currentDate.getMonth() ||
      arrivalTime.getFullYear() !== currentDate.getFullYear()
    ) {
      // Save current log and start a new one
      if (currentLog.activities.length > 0) {
        updateTotalHours(currentLog)
        logs.push(currentLog)
      }

      currentDate = new Date(arrivalTime)
      currentDate.setHours(0, 0, 0, 0)
      currentLog = createNewLogDay(currentDate)
    }

    // Add activity based on stop type
    switch (stop.type) {
      case "start":
        // No activity for start, just a reference point
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
        // Check if this is a short rest (30 min) or longer rest
        const restDuration = (departureTime.getTime() - arrivalTime.getTime()) / (60 * 1000)

        if (restDuration >= 7 * 60) {
          // 7 hours or more
          currentLog.activities.push({
            type: "sleeperBerth",
            startTime: formatTimeForLog(arrivalTime),
            endTime: formatTimeForLog(departureTime),
            location: stop.location,
            remarks: "Sleeper berth rest period",
          })
        } else if (restDuration >= 2 * 60) {
          // 2 hours or more
          currentLog.activities.push({
            type: "sleeperBerth",
            startTime: formatTimeForLog(arrivalTime),
            endTime: formatTimeForLog(departureTime),
            location: stop.location,
            remarks: "Short sleeper berth period",
          })
        } else {
          currentLog.activities.push({
            type: "offDuty",
            startTime: formatTimeForLog(arrivalTime),
            endTime: formatTimeForLog(departureTime),
            location: stop.location,
            remarks: "Break",
          })
        }
        break
      case "overnight":
        currentLog.activities.push({
          type: "sleeperBerth",
          startTime: formatTimeForLog(arrivalTime),
          endTime: formatTimeForLog(departureTime),
          location: stop.location,
          remarks: "Overnight rest",
        })
        break
    }

    if (nextStop) {
      const nextArrivalTime = new Date(nextStop.arrivalTime)

      if (isSameDay(departureTime, nextArrivalTime)) {
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
        midnight.setHours(23, 59, 0, 0)

        currentLog.activities.push({
          type: "driving",
          startTime: formatTimeForLog(departureTime),
          endTime: "23:59",
          remarks: `Driving to ${nextStop.location}`,
        })

        // Save current log
        updateTotalHours(currentLog)
        logs.push(currentLog)

        // Create new log for next day
        currentDate = new Date(nextArrivalTime)
        currentDate.setHours(0, 0, 0, 0)
        currentLog = createNewLogDay(currentDate)

        // Add driving from midnight to arrival on the next day
        currentLog.activities.push({
          type: "driving",
          startTime: "00:00",
          endTime: formatTimeForLog(nextArrivalTime),
          remarks: `Driving to ${nextStop.location}`,
        })
      }
    }
  }

  // Add the last log if it has activities
  if (currentLog.activities.length > 0) {
    updateTotalHours(currentLog)
    logs.push(currentLog)
  }

  return logs
}

/**
 * Create a new log day
 */
function createNewLogDay(date: Date): LogDay {
  return {
    date: date.toLocaleDateString(),
    activities: [],
    totalHours: {
      driving: "0",
      onDutyNotDriving: "0",
      offDuty: "0",
      sleeperBerth: "0",
    },
  }
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

/**
 * Validate trip details for HOS compliance
 */
export function validateTripDetails(tripDetails: TripDetails): {
  valid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  // Check if cycle hours used is within limits
  if (tripDetails.cycleHoursUsed < 0) {
    errors.cycleHoursUsed = "Cycle hours used cannot be negative."
  } else if (tripDetails.cycleHoursUsed > 70) {
    errors.cycleHoursUsed = "Cycle hours used must be between 0 and 70."
  }

  // Check if locations are valid
  if (!tripDetails.origin) {
    errors.origin = "Origin location is required."
  }

  if (!tripDetails.destination) {
    errors.destination = "Destination location is required."
  }

  // Check if departure time is valid
  if (!tripDetails.departureTime) {
    errors.departureTime = "Departure time is required."
  } else {
    const departureDate = new Date(tripDetails.departureTime)
    if (isNaN(departureDate.getTime())) {
      errors.departureTime = "Invalid departure time format."
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

