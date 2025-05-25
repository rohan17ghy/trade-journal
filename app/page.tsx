import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, LineChart, TrendingUp } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 w-full max-w-5xl mx-auto py-12 md:py-24 px-4">
                <div className="flex flex-col items-center gap-6 text-center">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Trade Journal
                    </h1>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl">
                        Track your trading rules, journal your daily progress,
                        and analyze your performance over time.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button asChild>
                            <Link href="/daily-journal">
                                <BookOpen className="mr-2 h-4 w-4" />
                                Daily Journal
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/journal">
                                <LineChart className="mr-2 h-4 w-4" />
                                Trade Journal
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/rules">
                                Rules <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/trend-analysis">
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Trend Analysis
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
