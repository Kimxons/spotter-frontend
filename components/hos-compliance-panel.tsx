"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  Timer,
  Truck,
  Bed,
  Shield,
  AlertOctagon,
  FileText,
  BarChart3,
  Zap,
} from "lucide-react"
import type { RouteResult, TripDetails } from "@/lib/types"
import { calculateHOSCompliance } from "@/lib/hos-calculator"
import { motion } from "framer-motion"

interface HOSCompliancePanelProps {
  routeResult: RouteResult
  tripDetails: TripDetails
}

export default function HOSCompliancePanel({ routeResult, tripDetails }: HOSCompliancePanelProps) {
  const [activeTab, setActiveTab] = useState("summary")

  // Calculate HOS compliance
  const complianceResult = calculateHOSCompliance(tripDetails, routeResult.logs)

  // Determine status colors
  const getCycleStatusColor = () => {
    if (complianceResult.cycleHoursRemaining <= 0) return "text-red-600 dark:text-red-400"
    if (complianceResult.cycleHoursRemaining < 5) return "text-amber-600 dark:text-amber-400"
    return "text-green-600 dark:text-green-400"
  }

  const getDrivingStatusColor = () => {
    if (complianceResult.drivingHoursRemaining <= 0) return "text-red-600 dark:text-red-400"
    if (complianceResult.drivingHoursRemaining < 2) return "text-amber-600 dark:text-amber-400"
    return "text-green-600 dark:text-green-400"
  }

  const getWindowStatusColor = () => {
    if (complianceResult.dutyWindowRemaining <= 0) return "text-red-600 dark:text-red-400"
    if (complianceResult.dutyWindowRemaining < 2) return "text-amber-600 dark:text-amber-400"
    return "text-green-600 dark:text-green-400"
  }

  // Get progress bar colors
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 75) return "bg-amber-500"
    return "bg-green-500"
  }

  // Get violation severity badge
  const getViolationBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return (
          <Badge
            variant="outline"
            className="ml-2 bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50"
          >
            Critical
          </Badge>
        )
      case "medium":
        return (
          <Badge
            variant="outline"
            className="ml-2 bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50"
          >
            Warning
          </Badge>
        )
      case "low":
        return (
          <Badge
            variant="outline"
            className="ml-2 bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50"
          >
            Minor
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="h-6 w-6 mr-2 text-blue-500" />
            HOS Compliance Dashboard
          </h2>
          <p className="text-muted-foreground">Detailed analysis of Hours of Service regulations compliance</p>
        </div>
        <Badge
          variant={complianceResult.isCompliant ? "outline" : "destructive"}
          className={
            complianceResult.isCompliant
              ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50 text-sm py-1 px-3"
              : "text-sm py-1 px-3"
          }
        >
          {complianceResult.isCompliant ? (
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" /> Compliant
            </span>
          ) : (
            <span className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" /> Non-Compliant
            </span>
          )}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 p-1 bg-muted/30 rounded-lg">
          <TabsTrigger
            value="summary"
            className="rounded-md data-[state=active]:bg-gradient-to-r from-blue-600 to-blue-700 data-[state=active]:text-white"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger
            value="violations"
            className="rounded-md data-[state=active]:bg-gradient-to-r from-blue-600 to-blue-700 data-[state=active]:text-white"
          >
            <AlertOctagon className="h-4 w-4 mr-2" />
            Violations
          </TabsTrigger>
          <TabsTrigger
            value="regulations"
            className="rounded-md data-[state=active]:bg-gradient-to-r from-blue-600 to-blue-700 data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Regulations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          {!complianceResult.isCompliant && (
            <Alert
              variant="destructive"
              className="mb-6 border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800/50"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>HOS Violation Warning</AlertTitle>
              <AlertDescription>
                This trip would exceed your available hours of service. Please review the violations tab for details.
              </AlertDescription>
            </Alert>
          )}

          {complianceResult.warnings.length > 0 && (
            <Alert
              variant="default"
              className="mb-6 bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50"
            >
              <AlertOctagon className="h-4 w-4" />
              <AlertTitle>HOS Warnings</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {complianceResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {complianceResult.isCompliant && complianceResult.warnings.length === 0 && (
            <Alert
              variant="default"
              className="mb-6 bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800/50"
            >
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Trip is HOS Compliant</AlertTitle>
              <AlertDescription>
                This trip plan complies with all Hours of Service regulations. Safe travels!
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  {tripDetails.cycleType === "60hour7day" ? "60-Hour/7-Day Cycle" : "70-Hour/8-Day Cycle"}
                </CardTitle>
                <CardDescription>
                  {tripDetails.cycleType === "60hour7day" ? "7-day rolling period" : "8-day rolling period"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-muted-foreground">Previous Hours Used</span>
                      <span className="font-medium">{tripDetails.cycleHoursUsed} hrs</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-muted-foreground">Trip On-Duty Hours</span>
                      <span className="font-medium">{complianceResult.totalOnDutyHours.toFixed(1)} hrs</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-muted-foreground">Cycle Hours Remaining</span>
                      <span className={getCycleStatusColor() + " font-bold"}>
                        {complianceResult.cycleHoursRemaining.toFixed(1)} hrs
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(100, complianceResult.cycleHoursUsedPercentage)}
                    className={complianceResult.cycleHoursRemaining > 0 ? "h-2" : "h-2 bg-red-100 dark:bg-red-900/30"}
                    indicatorClassName={getProgressColor(complianceResult.cycleHoursUsedPercentage)}
                  />
                  <div className="flex justify-between text-xs">
                    <span>0 hours</span>
                    <span>{tripDetails.cycleType === "60hour7day" ? "60 hours" : "70 hours"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50">
                <CardTitle className="text-lg flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-amber-500" />
                  11-Hour Driving Limit
                </CardTitle>
                <CardDescription>Current day status</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-muted-foreground">Driving Hours Used</span>
                      <span className="font-medium">{complianceResult.totalDrivingHours.toFixed(1)} hrs</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-muted-foreground">Driving Hours Remaining</span>
                      <span className={getDrivingStatusColor() + " font-bold"}>
                        {complianceResult.drivingHoursRemaining.toFixed(1)} hrs
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(100, complianceResult.drivingHoursUsedPercentage)}
                    className="h-2"
                    indicatorClassName={getProgressColor(complianceResult.drivingHoursUsedPercentage)}
                  />
                  <div className="flex justify-between text-xs">
                    <span>0 hours</span>
                    <span>11 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50">
                <CardTitle className="text-lg flex items-center">
                  <Timer className="h-5 w-5 mr-2 text-indigo-500" />
                  14-Hour Duty Window
                </CardTitle>
                <CardDescription>Current day status</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-muted-foreground">On-Duty Hours Used</span>
                      <span className="font-medium">
                        {(
                          complianceResult.totalDrivingHours +
                          (complianceResult.totalOnDutyHours - complianceResult.totalDrivingHours)
                        ).toFixed(1)}{" "}
                        hrs
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-muted-foreground">Window Remaining</span>
                      <span className={getWindowStatusColor() + " font-bold"}>
                        {complianceResult.dutyWindowRemaining.toFixed(1)} hrs
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(100, complianceResult.dutyWindowUsedPercentage)}
                    className="h-2"
                    indicatorClassName={getProgressColor(complianceResult.dutyWindowUsedPercentage)}
                  />
                  <div className="flex justify-between text-xs">
                    <span>0 hours</span>
                    <span>14 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 border shadow-md">
            <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50">
              <CardTitle className="flex items-center">
                <Bed className="h-5 w-5 mr-2 text-purple-500" />
                Rest & Break Status
              </CardTitle>
              <CardDescription>Required breaks and rest periods</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-blue-500" />
                    30-Minute Break Requirement
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You must take a 30-minute break when you have driven for a period of 8 cumulative hours without at
                    least a 30-minute interruption.
                  </p>
                  <div className="flex items-center mt-2">
                    <Badge
                      variant={complianceResult.violations.some((v) => v.type === "break") ? "destructive" : "outline"}
                      className={
                        !complianceResult.violations.some((v) => v.type === "break")
                          ? "bg-green-100 text-green-800 border-green-300"
                          : ""
                      }
                    >
                      {complianceResult.violations.some((v) => v.type === "break") ? "Break Violation" : "Compliant"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center">
                    <Bed className="h-4 w-4 mr-1 text-purple-500" />
                    Sleeper Berth Provision
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You can split your required 10-hour off-duty period, as long as one off-duty period is at least 7
                    consecutive hours in the sleeper berth.
                  </p>
                  <div className="flex items-center mt-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                      {complianceResult.sleeperBerthUsage.used
                        ? `${complianceResult.sleeperBerthUsage.validPairs} Valid Pairs`
                        : "Not Used"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="mt-6">
          <Card className="border shadow-md">
            <CardHeader className="pb-2 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50">
              <CardTitle className="flex items-center">
                <AlertOctagon className="h-5 w-5 mr-2 text-red-500" />
                HOS Violations & Warnings
              </CardTitle>
              <CardDescription>Detailed breakdown of compliance issues</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {complianceResult.violations.length === 0 && complianceResult.warnings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-xl font-medium text-green-700 dark:text-green-400">No Violations Found</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    This trip plan is fully compliant with all Hours of Service regulations.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {complianceResult.violations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                        Violations
                      </h3>
                      <div className="space-y-3">
                        {complianceResult.violations.map((violation, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800/50"
                          >
                            <div className="flex items-start">
                              <div className="mr-3 mt-0.5">
                                <AlertOctagon className="h-5 w-5 text-red-500" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-red-800 dark:text-red-300 flex items-center">
                                    {violation.type === "driving" && "Driving Time Violation"}
                                    {violation.type === "window" && "14-Hour Window Violation"}
                                    {violation.type === "break" && "Break Requirement Violation"}
                                    {violation.type === "cycle" && "Cycle Hours Violation"}
                                    {violation.type === "other" && "HOS Violation"}
                                    {getViolationBadge(violation.severity)}
                                  </h4>
                                </div>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{violation.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {complianceResult.warnings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center">
                        <AlertOctagon className="h-5 w-5 mr-2 text-amber-500" />
                        Warnings
                      </h3>
                      <div className="space-y-3">
                        {complianceResult.warnings.map((warning, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800/50"
                          >
                            <div className="flex items-start">
                              <div className="mr-3 mt-0.5">
                                <AlertOctagon className="h-5 w-5 text-amber-500" />
                              </div>
                              <div>
                                <p className="text-sm text-amber-700 dark:text-amber-300">{warning}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4">
              <div className="text-sm text-muted-foreground">
                <p className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-blue-500" />
                  Violations must be addressed before beginning this trip to ensure compliance with FMCSA regulations.
                </p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="regulations" className="mt-6">
          <Card className="border shadow-md">
            <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950/50 dark:to-slate-900/50">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                HOS Regulations Reference
              </CardTitle>
              <CardDescription>Key Hours of Service rules for property-carrying drivers</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-amber-500" />
                      <span>11-Hour Driving Limit</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-6">
                      <p className="text-sm text-muted-foreground">
                        You may drive a maximum of 11 hours after 10 consecutive hours off duty.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Regulation:</span> 49 CFR § 395.3(a)(3)
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center">
                      <Timer className="h-4 w-4 mr-2 text-indigo-500" />
                      <span>14-Hour Driving Window</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-6">
                      <p className="text-sm text-muted-foreground">
                        You may not drive beyond the 14th consecutive hour after coming on duty, following 10
                        consecutive hours off duty. Off-duty time does not extend the 14-hour period.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Regulation:</span> 49 CFR § 395.3(a)(2)
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      <span>30-Minute Break Requirement</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-6">
                      <p className="text-sm text-muted-foreground">
                        You must take a 30-minute break when you have driven for a period of 8 cumulative hours without
                        at least a 30-minute interruption. The break may be satisfied by any non-driving period of 30
                        consecutive minutes (i.e., on-duty not driving, off-duty, or sleeper berth).
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Regulation:</span> 49 CFR § 395.3(a)(3)(ii)
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-500" />
                      <span>60/70-Hour Limit</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-6">
                      <p className="text-sm text-muted-foreground">
                        You may not drive after 60/70 hours on duty in 7/8 consecutive days. A driver may restart a 7/8
                        consecutive day period after taking 34 or more consecutive hours off duty.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Regulation:</span> 49 CFR § 395.3(b)
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-2 text-purple-500" />
                      <span>Sleeper Berth Provision</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-6">
                      <p className="text-sm text-muted-foreground">
                        Drivers may split their required 10-hour off-duty period, as long as one off-duty period
                        (whether in or out of the sleeper berth) is at least 2 hours long and the other involves at
                        least 7 consecutive hours in the sleeper berth. All sleeper berth pairings MUST add up to at
                        least 10 hours. When used together, neither time period counts against the maximum 14-hour
                        driving window.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Regulation:</span> 49 CFR § 395.1(g)(1)
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-amber-500" />
                      <span>Adverse Driving Conditions</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-6">
                      <p className="text-sm text-muted-foreground">
                        Drivers are allowed to extend the 11-hour maximum driving limit and 14-hour driving window by up
                        to 2 hours when adverse driving conditions are encountered.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Regulation:</span> 49 CFR § 395.1(b)(1)
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

