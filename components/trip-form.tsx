"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2, MapPin, Clock, Info, AlertTriangle, Truck, Navigation, Route } from "lucide-react"
import type { TripDetails } from "@/lib/types"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

const formSchema = z.object({
  currentLocation: z.string().min(3, { message: "Please enter a valid location" }),
  pickupLocation: z.string().min(3, { message: "Please enter a valid pickup location" }),
  dropoffLocation: z.string().min(3, { message: "Please enter a valid dropoff location" }),
  cycleHoursUsed: z.coerce.number().min(0).max(70, { message: "Hours must be between 0 and 70" }),
})

interface TripFormProps {
  onSubmit: (data: TripDetails) => void
  isLoading: boolean
}

export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentLocation: "",
      pickupLocation: "",
      dropoffLocation: "",
      cycleHoursUsed: 0,
    },
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      currentLocation: values.currentLocation,
      pickupLocation: values.pickupLocation,
      dropoffLocation: values.dropoffLocation,
      cycleHoursUsed: values.cycleHoursUsed,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="premium-card overflow-hidden">
              <div className="bg-gradient-primary p-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location Details
                </h2>
              </div>
              <CardContent className="pt-6">
                <div className="absolute -mt-12 ml-auto mr-auto left-0 right-0 w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md border-4 border-white dark:border-slate-800">
                  <Truck className="h-8 w-8 text-primary" />
                </div>

                <FormField
                  control={form.control}
                  name="currentLocation"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="flex items-center text-base">
                        Current Location
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px]">Enter your current city and state (e.g., Chicago, IL)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Chicago, IL" {...field} className="premium-input" />
                      </FormControl>
                      <FormDescription>Enter your current city and state</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-4" />

                <FormField
                  control={form.control}
                  name="pickupLocation"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="flex items-center text-base">
                        Pickup Location
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px]">Enter the pickup city and state (e.g., Indianapolis, IN)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Indianapolis, IN" {...field} className="premium-input" />
                      </FormControl>
                      <FormDescription>Enter the pickup city and state</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-4" />

                <FormField
                  control={form.control}
                  name="dropoffLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-base">
                        Dropoff Location
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px]">Enter the delivery city and state (e.g., Columbus, OH)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Columbus, OH" {...field} className="premium-input" />
                      </FormControl>
                      <FormDescription>Enter the delivery city and state</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-6 flex justify-center">
                  <div className="relative w-full max-w-xs h-24">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center z-10 shadow-md">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center z-10 shadow-md">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute left-8 right-8 top-1/2 transform -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500 to-red-500"></div>
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-amber-500 flex items-center justify-center z-20 shadow-md animate-pulse-subtle">
                      <Navigation className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="premium-card overflow-hidden">
              <div className="bg-gradient-secondary p-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Hours of Service
                </h2>
              </div>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="cycleHoursUsed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-base">
                        Current Cycle Hours Used
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[250px]">
                                Enter the number of hours you've already used in your current 70-hour/8-day cycle
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="70" {...field} className="premium-input" />
                      </FormControl>
                      <FormDescription>Enter hours used in current 70-hour/8-day cycle</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-8 p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/30 rounded-lg shadow-inner">
                  <div className="flex items-center mb-3 text-amber-800 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <h3 className="text-base font-medium">Hours of Service Regulations</h3>
                  </div>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-2 list-disc pl-5">
                    <li>11-hour driving limit after 10 consecutive hours off duty</li>
                    <li>14-hour driving window limit</li>
                    <li>30-minute break required after 8 hours of driving</li>
                    <li>70-hour limit on duty in 8 consecutive days</li>
                  </ul>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-800/30 rounded-lg shadow-inner">
                  <div className="flex items-center mb-2">
                    <Route className="h-5 w-5 mr-2 text-blue-500" />
                    <h3 className="text-base font-medium text-blue-700 dark:text-blue-300">Trip Planning Benefits</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <div className="premium-icon-container bg-blue-100 dark:bg-blue-900/30">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M5 13L9 17L19 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span>Reduce fuel costs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <div className="premium-icon-container bg-blue-100 dark:bg-blue-900/30">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M5 13L9 17L19 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span>Avoid violations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <div className="premium-icon-container bg-blue-100 dark:bg-blue-900/30">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M5 13L9 17L19 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span>Optimize routes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <div className="premium-icon-container bg-blue-100 dark:bg-blue-900/30">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M5 13L9 17L19 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span>Improve safety</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex justify-end"
        >
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full md:w-auto premium-button bg-gradient-primary"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating Route...
              </>
            ) : (
              <>
                Calculate Route & Generate Logs
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
                  className="ml-2 h-4 w-4"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  )
}

