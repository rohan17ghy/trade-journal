import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TrendEventForm } from "./trend-form";
import { TrendTimeline } from "./trend-timeline";
import { TrendCalendar } from "./trend-calendar";
import { TrendingUp, CalendarIcon, ListFilter } from "lucide-react";

export default function TrendAnalysisPage() {
    const INSTRUMENT = process.env.INSTRUMENT || "NIFTY50"; // Replace with your preferred default instrument

    return (
        <div className="container py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Trend Analysis: {INSTRUMENT}
                    </h1>
                    <p className="text-muted-foreground">
                        Track market trend changes and failed reversal attempts
                    </p>
                </div>
            </div>

            <Tabs defaultValue="calendar" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="calendar" className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Calendar View
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="flex items-center">
                        <ListFilter className="mr-2 h-4 w-4" />
                        Timeline
                    </TabsTrigger>
                    <TabsTrigger value="add" className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Add Event
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="space-y-4">
                    <TrendCalendar />
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                    <TrendTimeline />
                </TabsContent>

                <TabsContent value="add">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="mr-2 h-5 w-5" />
                                Add New Trend Event
                            </CardTitle>
                            <CardDescription>
                                Record a market trend change or a failed
                                reversal attempt
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TrendEventForm />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
