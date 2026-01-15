
import { calculatePortfolioMetrics } from './lib/portfolio-calculations-v2';

// Mocks
const cashFlows = [
    {
        date: "2025-12-01",
        amount: 100000,
        type: "deposit",
        portfolio_id: "1",
        notes: "Initial"
    },
    {
        date: "2025-12-31",
        amount: 5000,
        type: "other", // Workaround
        portfolio_id: "1",
        notes: "(Capital Gain) Profit",
        created_at: "2025-12-31T10:00:00Z"
    },
    {
        date: "2025-12-31",
        amount: -10000,
        type: "withdrawal",
        portfolio_id: "1",
        notes: "Taking Profit",
        created_at: "2025-12-31T10:05:00Z"
    }
];

const valuations = [
    {
        id: "1",
        portfolio_id: "1",
        date: "2025-12-01",
        value: 100000,
        created_at: "2025-12-01T00:00:00Z"
    },
    // Synthetic Valuation representing Current Value
    {
        id: "synthetic",
        portfolio_id: "1",
        date: "2025-12-31T23:59:59Z",
        value: 95000,
        created_at: "2025-12-31T23:59:59Z"
    }
];

console.log("--- Running Calculation Trace ---");
const result = calculatePortfolioMetrics(95000, cashFlows as any, valuations as any);

console.log("Net Contributions (Net Invested):", result.netContributions);
console.log("Total PnL:", result.totalPnL);
console.log("Expected: 95000. Actual:", result.netContributions);
