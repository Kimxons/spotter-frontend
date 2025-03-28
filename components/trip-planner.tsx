"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { api, getApiErrorMessage } from "@/lib/api"
import {
  Truck,
  FileText,
  BarChart3,
  Loader2,
  AlertTriangle,
  Download,
  Share2,
  Bookmark,
  RotateCcw,
  Shield,
  Menu,
  X,
  ChevronRight,
  Settings,
  HelpCircle,
  Star,
  Award,
  Zap,
  MapPin,
} from "lucide-react"

import type { TripDetails, RouteResult } from "@/lib/types"
import RouteMap from "@/components/maps/route-map"
import TripSummary from "@/components/trip-summary"
import UserMenu from "@/components/auth/user-menu"
import { calculateRoute } from "@/lib/route-calculator"
import { useAuth } from "@/lib/ auth-context"
import TripForm from "./trip-form"
import LogSheet from "./log-sheet"
import HOSCompliancePanel from "./hos-compliance-panel"

export default function TripPlanner() {
  const [activeTab, setActiveTab] = useState("input")
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null)
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()

  const startProgressSimulation = useCallback(() => {
    let progress = 0
    const stages = [
      "Connecting to servers...",
      "Validating inputs...",
      "Calculating optimal route...",
      "Analyzing HOS compliance...",
      "Generating ELD logs...",
      "Finalizing results...",
    ]

    setLoadingStage(stages[0])

    const interval = setInterval(() => {
      progress += Math.random() * 8

      const stageIndex = Math.min(Math.floor(progress / (100 / stages.length)), stages.length - 1)
      setLoadingStage(stages[stageIndex])

      if (progress >= 95) {
        clearInterval(interval)
        setLoadingProgress(95)
      } else {
        setLoadingProgress(progress)
      }
    }, 400)

    return interval
  }, [])

  useEffect(() => {
    setError(null)
  }, [activeTab])

  const handleTripSubmit = async (details: TripDetails) => {
    setIsLoading(true)
    setError(null)
    setTripDetails(details)

    const progressInterval = startProgressSimulation()

    try {
      const { routeResult } = await calculateRoute(details.origin, details.destination, details.departureTime, details.truckType)
      setRouteResult(routeResult)
      setActiveTab("map")
      toast({
        title: "Route calculated successfully",
        description: `${routeResult.totalDistance} miles from ${details.origin} to ${details.destination}`,
        variant: "default",
      })
    } catch (err) {
      const errorMessage = getApiErrorMessage(err)
      setError(errorMessage)
      toast({
        title: "Error calculating route",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      clearInterval(progressInterval)
      setLoadingProgress(100)
      setLoadingStage("Complete!")
      setTimeout(() => {
        setIsLoading(false)
        setLoadingProgress(0)
      }, 500)
    }
  }

  const handleSaveRoute = async () => {
    if (!routeResult) return

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your route",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      console.log("Saving route data:", routeResult)

      await api.saveRoute(routeResult)
      toast({
        title: "Route saved successfully",
        description: "You can access this route later from your saved routes.",
        variant: "default",
      })
    } catch (err) {
      console.error("Error details when saving route:", err)
      const errorMessage = getApiErrorMessage(err)
      toast({
        title: "Error saving route",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setTripDetails(null)
    setRouteResult(null)
    setActiveTab("input")
  }

  const handleExport = (format: string) => {
    toast({
      title: `Exporting as ${format.toUpperCase()}`,
      description: "Your file will be downloaded shortly.",
    })
    // TODO: Make a call an API endpoint to generate and download the file
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "input":
        return <MapPin className="h-4 w-4 mr-2" />
      case "map":
        return <Truck className="h-4 w-4 mr-2" />
      case "logs":
        return <FileText className="h-4 w-4 mr-2" />
      case "compliance":
        return <Shield className="h-4 w-4 mr-2" />
      case "summary":
        return <BarChart3 className="h-4 w-4 mr-2" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-premium p-3 rounded-xl shadow-glow">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient-premium">ELD Trip Planner</h1>
                <p className="text-muted-foreground">Plan routes and generate compliant logs with confidence</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* Desktop actions */}
              <div className="hidden md:flex items-center gap-3">
                {routeResult && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 premium-button">
                        <Share2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Export</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="premium-dropdown">
                      <DropdownMenuItem onClick={() => handleExport("pdf")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("csv")}>
                        <Download className="h-4 w-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <ThemeToggle />
                <UserMenu />
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden mt-4"
              >
                <Card className="premium-card">
                  <div className="p-4 space-y-3">
                    {routeResult && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-2"
                          onClick={() => handleExport("pdf")}
                        >
                          <FileText className="h-4 w-4" />
                          Export as PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-2"
                          onClick={() => handleExport("csv")}
                        >
                          <Download className="h-4 w-4" />
                          Export as CSV
                        </Button>
                        <Separator className="my-2" />
                      </>
                    )}
                    <div className="flex justify-between">
                      <ThemeToggle />
                      <UserMenu />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="premium-card border overflow-hidden shadow-xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="glass-effect border-b sticky top-0 z-10">
                <TabsList className="w-full h-auto p-0 bg-transparent justify-start rounded-none overflow-x-auto flex-nowrap">
                  {["input", "map", "logs", "compliance", "summary"].map((tab, index) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      disabled={tab !== "input" && !routeResult}
                      className="flex items-center py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none transition-all whitespace-nowrap"
                    >
                      {getTabIcon(tab)}
                      <span className="capitalize">
                        {tab === "input"
                          ? "Trip Details"
                          : tab === "map"
                            ? "Route Map"
                            : tab === "logs"
                              ? "ELD Logs"
                              : tab === "compliance"
                                ? "HOS Compliance"
                                : "Trip Summary"}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {isLoading && (
                <div className="p-6 bg-background animate-in">
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
                        <span className="text-sm font-medium">{loadingStage}</span>
                      </div>
                      <span className="text-sm font-medium text-primary">{Math.round(loadingProgress)}%</span>
                    </div>
                    <Progress value={loadingProgress} className="h-2 mb-4" indicatorClassName="bg-gradient-premium" />

                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div
                        className={`p-2 rounded-md ${loadingProgress > 30 ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : "bg-muted"}`}
                      >
                        Route Calculation
                      </div>
                      <div
                        className={`p-2 rounded-md ${loadingProgress > 60 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-muted"}`}
                      >
                        HOS Compliance
                      </div>
                      <div
                        className={`p-2 rounded-md ${loadingProgress > 85 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-muted"}`}
                      >
                        Log Generation
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <TabsContent value="input" className="p-0 m-0">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6"
                >
                  <TripForm onSubmit={handleTripSubmit} isLoading={isLoading} />
                  {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="map" className="p-0 m-0">
                {routeResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold text-gradient-premium">Route Overview</h2>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleSaveRoute}
                          disabled={isSaving}
                          className="gap-2 transition-all premium-button"
                        >
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className="h-4 w-4" />}
                          {isSaving ? "Saving..." : "Save Route"}
                        </Button>
                      </div>
                    </div>

                    <RouteMap routeResult={routeResult} />

                    <div className="mt-6 flex justify-end">
                      <Button onClick={() => setActiveTab("logs")} className="group bg-gradient-premium premium-button">
                        View ELD Logs
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="logs" className="p-0 m-0">
                {routeResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
                    <LogSheet routeResult={routeResult} />
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => setActiveTab("compliance")}
                        className="group bg-gradient-premium premium-button"
                      >
                        View HOS Compliance
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="compliance" className="p-0 m-0">
                {routeResult && tripDetails && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
                    <HOSCompliancePanel routeResult={routeResult} tripDetails={tripDetails} />
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => setActiveTab("summary")}
                        className="group bg-gradient-premium premium-button"
                      >
                        View Trip Summary
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="summary" className="p-0 m-0">
                {routeResult && tripDetails && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                  >
                    <TripSummary routeResult={routeResult} tripDetails={tripDetails} />
                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <Button variant="outline" onClick={handleReset} className="gap-2 w-full sm:w-auto premium-button">
                        <RotateCcw className="h-4 w-4" />
                        Plan New Trip
                      </Button>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          onClick={() => handleExport("pdf")}
                          className="gap-2 flex-1 sm:flex-initial premium-button"
                        >
                          <FileText className="h-4 w-4" />
                          Export PDF
                        </Button>

                        <Button
                          onClick={() => window.print()}
                          className="gap-2 flex-1 sm:flex-initial bg-gradient-premium premium-button"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect width="12" height="8" x="6" y="14"></rect>
                          </svg>
                          Print All Logs
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>

        {/* Help & Support */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <Card className="premium-card border overflow-hidden shadow-md">
            <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-premium p-2 rounded-full">
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">Need assistance?</h3>
                  <p className="text-sm text-muted-foreground">Our support team is available 24/7</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="premium-button">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help Center
                </Button>
                <Button size="sm" className="bg-gradient-premium premium-button">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Separator className="mb-4" />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ELD Trip Planner. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Support
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

