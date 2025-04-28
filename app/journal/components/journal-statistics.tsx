import { getTradeJournalStatisticsAction } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export async function JournalStatistics() {
    const statsResult = await getTradeJournalStatisticsAction();
    const stats =
        statsResult.success && statsResult.data
            ? statsResult.data
            : {
                  totalTrades: 0,
                  profitableTrades: 0,
                  unprofitableTrades: 0,
                  winRate: 0,
                  totalProfit: 0,
                  averageProfit: 0,
                  averageLoss: 0,
                  profitFactor: 0,
                  largestProfit: 0,
                  largestLoss: 0,
              };

    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Trades
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.totalTrades}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {stats.profitableTrades} profitable /{" "}
                        {stats.unprofitableTrades} unprofitable
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                        Win Rate
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center">
                        <Percent className="h-5 w-5 text-muted-foreground mr-2" />
                        <span className="text-2xl font-bold">
                            {stats.winRate.toFixed(1)}%
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Profit factor: {stats.profitFactor.toFixed(2)}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total P/L
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center">
                        {stats.totalProfit >= 0 ? (
                            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                            <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span
                            className={`text-2xl font-bold ${
                                stats.totalProfit >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                            }`}
                        >
                            {formatCurrency(stats.totalProfit)}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Avg win: {formatCurrency(stats.averageProfit)} / Avg
                        loss: {formatCurrency(stats.averageLoss)}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                        Largest Trade
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col">
                        <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm font-medium text-green-500">
                                {formatCurrency(stats.largestProfit)}
                            </span>
                        </div>
                        <div className="flex items-center mt-1">
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                            <span className="text-sm font-medium text-red-500">
                                {formatCurrency(stats.largestLoss)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
