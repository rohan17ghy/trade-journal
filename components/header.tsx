import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LineChartIcon as ChartLine } from "lucide-react";

export function Header() {
    return (
        <header className="border-b border-border">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6 mx-4">
                    <Link href="/" className="font-semibold">
                        Trade Journal
                    </Link>
                    <nav className="hidden md:flex gap-6">
                        <Link
                            href="/"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            href="/rules"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Rules
                        </Link>
                        <Link
                            href="/rules-performance"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Rules Performance
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4 mx-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard">
                            <ChartLine className="h-4 w-4 mr-2" />
                            Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
