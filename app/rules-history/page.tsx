import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RulesTimeline } from "./components/rules-timeline";
import { RulesActivityHistory } from "./components/rules-activity-history";
import { DevSeedButton } from "./components/dev-seed-button";

export default function RulesHistoryPage() {
    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Rules History
                        </h1>
                        <p className="text-muted-foreground">
                            Track changes and activity of your trading rules
                            over time
                        </p>
                    </div>

                    {/* Add the DevSeedButton here */}
                    <DevSeedButton />
                </div>

                <Tabs defaultValue="timeline" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="timeline">
                            Rules Timeline
                        </TabsTrigger>
                        <TabsTrigger value="activity">
                            Activity History
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="timeline">
                        <RulesTimeline />
                    </TabsContent>
                    <TabsContent value="activity">
                        <RulesActivityHistory />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
