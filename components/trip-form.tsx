"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Truck, Calendar, Clock, Info, MapPin, AlertTriangle } from "lucide-react"
import type { TripDetails } from "@/lib/types"
import { motion } from "framer-motion"

const formSchema = z.object({
  origin: z.string().min(2, { message: "Origin location is required" }),
  destination: z.string().min(2, { message: "Destination location is required" }),
  departureTime: z.string().min(1, { message: "Departure time is required" }),
  truckType: z.string().min(1, { message: "Truck type is required" }),
  cycleHoursUsed: z
    .number()
    .min(0, { message: "Cycle hours used cannot be negative" })
    .max(70, { message: "Cycle hours used must be between 0 and 70" }),
  cycleType: z.enum(["60hour7day", "70hour8day"], {
    required_error: "Cycle type is required",
  }),
})

interface TripFormProps {
  onSubmit: (data: TripDetails) => void
  isLoading: boolean
}

export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [activeTab, setActiveTab] = useState("basic")

  // Setting tomorrow at 8:00 AM as default departure time
  const getTomorrowMorning = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(8, 0, 0, 0)
    return tomorrow.toISOString().slice(0, 16)
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: "",
      destination: "",
      departureTime: getTomorrowMorning(),
      truckType: "semi",
      cycleHoursUsed: 0,
      cycleType: "70hour8day",
    },
  })

  // Handle form submission
  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    const tripDetails: TripDetails = {
      ...values,
      departureTime: new Date(values.departureTime),
    }
    onSubmit(tripDetails)
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="border shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2 text-blue-500" />
              Plan Your Trip
            </CardTitle>
            <CardDescription>Enter your trip details to calculate the route and HOS compliance</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 p-1 bg-muted/30 rounded-lg">
                    <TabsTrigger
                      value="basic"
                      className="rounded-md data-[state=active]:bg-gradient-to-r from-blue-600 to-blue-700 data-[state=active]:text-white"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Route Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="hos"
                      className="rounded-md data-[state=active]:bg-gradient-to-r from-blue-600 to-blue-700 data-[state=active]:text-white"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      HOS Settings
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="origin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-green-500" />
                              Origin Location
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter starting location" {...field} />
                            </FormControl>
                            <FormDescription>The location where your trip will begin</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="destination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-red-500" />
                              Destination
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter destination" {...field} />
                            </FormControl>
                            <FormDescription>The final destination of your trip</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="departureTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                              Departure Time
                            </FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormDescription>When you plan to start your trip</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="truckType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Truck className="h-4 w-4 mr-1 text-amber-500" />
                              Truck Type
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select truck type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="semi">Semi-Truck</SelectItem>
                                <SelectItem value="box">Box Truck</SelectItem>
                                <SelectItem value="flatbed">Flatbed</SelectItem>
                                <SelectItem value="tanker">Tanker</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>The type of truck you'll be driving</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="hos" className="mt-6">
                    <div className="space-y-6">
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 dark:bg-amber-950/30 dark:border-amber-800/50">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-800 dark:text-amber-300">HOS Compliance Notice</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                              Accurate HOS information is critical for regulatory compliance. Please ensure all values
                              are correct.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="cycleType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-indigo-500" />
                                Duty Cycle
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm">
                                      <p>
                                        60-hour/7-day: If your carrier does not operate every day of the week.
                                        <br />
                                        <br />
                                        70-hour/8-day: If your carrier operates vehicles every day of the week.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select duty cycle" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="60hour7day">60-Hour/7-Day Cycle</SelectItem>
                                  <SelectItem value="70hour8day">70-Hour/8-Day Cycle</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>The Hours of Service cycle you're operating under</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cycleHoursUsed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-blue-500" />
                                Cycle Hours Used
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm">
                                      <p>
                                        The total on-duty hours you've accumulated in the current 7 or 8-day period
                                        before starting this trip.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="70"
                                  step="0.5"
                                  placeholder="Hours used in current cycle"
                                  {...field}
                                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>Hours already used in your current duty cycle</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 dark:bg-blue-950/30 dark:border-blue-800/50">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-800 dark:text-blue-300">HOS Regulations Summary</h4>
                            <ul className="text-sm text-blue-700 dark:text-blue-400 mt-1 space-y-1 list-disc pl-4">
                              <li>
                                11-Hour Driving Limit: May drive up to 11 hours after 10 consecutive hours off duty
                              </li>
                              <li>
                                14-Hour Limit: May not drive beyond the 14th consecutive hour after coming on duty
                              </li>
                              <li>30-Minute Break: Must take a 30-minute break after 8 cumulative hours of driving</li>
                              <li>60/70-Hour Limit: May not drive after 60/70 hours on duty in 7/8 consecutive days</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                  {activeTab === "basic" ? (
                    <Button
                      type="button"
                      onClick={() => setActiveTab("hos")}
                      className="group bg-gradient-primary premium-button"
                    >
                      Continue to HOS Settings
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
                        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                      >
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("basic")}
                        className="premium-button"
                      >
                        Back
                      </Button>
                      <Button type="submit" disabled={isLoading} className="bg-gradient-primary premium-button">
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Calculating...
                          </>
                        ) : (
                          <>Calculate Route</>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

