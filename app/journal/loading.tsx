import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-36" />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    {Array(4)
                        .fill(0)
                        .map((_, i) => (
                            <Card key={i}>
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-4 w-24" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-16 mb-2" />
                                    <Skeleton className="h-4 w-32" />
                                </CardContent>
                            </Card>
                        ))}
                </div>

                <div className="space-y-6">
                    <Skeleton className="h-6 w-32" />
                    <div className="space-y-4">
                        {Array(3)
                            .fill(0)
                            .map((_, i) => (
                                <Card key={i}>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <Skeleton className="h-5 w-24 mb-2" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                            <Skeleton className="h-5 w-16" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
