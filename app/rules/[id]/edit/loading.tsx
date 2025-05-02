import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <div className="flex flex-col gap-8">
                <div>
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48 mt-2" />
                </div>

                <div className="border rounded-lg p-4 border-border">
                    <Skeleton className="h-6 w-32 mb-4" />

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>

                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>

                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-40 w-full" />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
