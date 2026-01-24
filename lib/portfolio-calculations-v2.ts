// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface CashFlow {
    date: string
    amount: number // POSITIVE for deposits, NEGATIVE for withdrawals
    type: "deposit" | "withdrawal" | "fee" | "tax" | "adjustment" | "Other" | string
    portfolio_id: string
    description?: string
    notes?: string
    created_at?: string
}

export interface Valuation {
    id: string
    portfolio_id: string
    date: string
    value: number // Market Value (MV)
    created_at?: string // Optional for backward compatibility, but needed for strict sorting
}

export interface PortfolioMetrics {
    currentValue: number
    netContributions: number // Total Invested - |Total Withdrawn|
    totalInvested: number
    totalWithdrawn: number
    totalPnL: number // (MV + Withdrawn) - Invested, or (MV - NetInvested)
    simpleReturnPct: number | null // Time-Weighted Return (or Dietz for single period)
}

export interface PeriodPerformance {
    periodLabel: string // e.g. "Jan 2024"
    startDate: string
    endDate: string
    startValue: number
    endValue: number
    netFlow: number
    pnl: number
    returnPct: number
    cumulativeReturn: number
    principal: number // The Net Invested Capital used for this period's RETURN calculation
    endPrincipal: number // The Net Invested Capital at the END of the period (after flows)
    isOngoing?: boolean
}

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

export function getNetFlow(flows: CashFlow[]): number {
    return flows.reduce((sum, cf) => sum + Number(cf.amount), 0)
}

export function getExternalFlows(flows: CashFlow[]): CashFlow[] {
    const internalTypes = ['fee', 'tax', 'adjustment', 'expense', 'capital_gain', 'reinvestment']
    return flows.filter(cf => {
        const rawCf = cf as any;
        const typeLower = (cf.type || '').toLowerCase();

        // Check if strict Deposit/Withdrawal
        if (typeLower === 'deposit' || typeLower === 'withdrawal') return true

        // Debug Log
        // console.log(`[getExternalFlows] CF: ${cf.date} Type: ${cf.type} Notes: ${rawCf.notes}`);

        const notes = (rawCf.notes || rawCf.description || '').toLowerCase();

        // WORKAROUND: Exclude Internal Flows marked as 'other'
        // 1. Capital Gains
        if ((typeLower === 'other' || typeLower === 'capital_gain') && notes.includes('capital gain')) {
            return false; // EXCLUDE it (Internal Flow)
        }
        // 2. Reinvestments
        if ((typeLower === 'other' || typeLower === 'reinvestment') && notes.includes('(reinvestment)')) {
            return false; // EXCLUDE it (Internal Transfer)
        }

        return !internalTypes.includes(typeLower)
    })
}

export function getFlowsInRange(flows: CashFlow[], start: Date, end: Date): CashFlow[] {
    return flows.filter((cf) => {
        const d = new Date(cf.date)
        return d >= start && d <= end
    })
}

function diffInDays(d1: Date, d2: Date): number {
    const t1 = d1.getTime()
    const t2 = d2.getTime()
    return Math.floor((t1 - t2) / (1000 * 3600 * 24))
}

function getStartOfDay(d: Date): Date {
    const newD = new Date(d)
    newD.setUTCHours(0, 0, 0, 0)
    return newD
}

function getEndOfDay(d: Date): Date {
    const newD = new Date(d)
    newD.setUTCHours(23, 59, 59, 999)
    return newD
}

// -----------------------------------------------------------------------------
// CORE MATH
// -----------------------------------------------------------------------------

export function calculateModifiedDietz(
    startValue: number,
    endValue: number,
    flows: CashFlow[],
    startDate: Date,
    endDate: Date
): number {
    const purityStart = getStartOfDay(startDate)
    const purityEnd = getEndOfDay(endDate)
    const duration = Math.max(1, diffInDays(purityEnd, purityStart))
    const netFlow = getNetFlow(flows)

    let weightedFlows = 0
    flows.forEach(cf => {
        const flowDate = new Date(cf.date)
        const daysHeld = diffInDays(purityEnd, flowDate)
        const weight = Math.max(0, Math.min(1, daysHeld / duration))
        weightedFlows += Number(cf.amount) * weight
    })

    const denominator = startValue + weightedFlows
    if (Math.abs(denominator) < 0.01) {
        return 0
    }

    const pnl = endValue - startValue - netFlow
    return (pnl / denominator) * 100
}

export function chainReturns(returns: number[]): number {
    let chain = 1.0
    for (const r of returns) {
        chain *= (1 + r / 100)
    }
    return (chain - 1) * 100
}

// -----------------------------------------------------------------------------
// METRICS & AGGREGATION
// -----------------------------------------------------------------------------

export function calculatePortfolioMetrics(
    currentValue: number,
    cashFlows: CashFlow[],
    valuations: Valuation[] = []
): PortfolioMetrics {

    if (valuations.length > 0) {
        const periods = calculateMonthlyPerformanceV2(valuations, cashFlows)

        if (periods.length > 0) {
            // PERIODS ARE REVERSED (Newest First)
            const latest = periods[0]

            // FIXED: Use endPrincipal for the metrics view to account for late deposits
            const netInvested = latest.endPrincipal

            // calculate strictly Lifetime totals for PnL
            const totalInvested = cashFlows
                .filter(cf => {
                    const t = (cf.type || '').toLowerCase();
                    const n = (cf.notes || (cf as any).description || '').toLowerCase();
                    if ((t === 'other' || t === 'capital_gain') && n.includes('capital gain')) return false; // Exclude Gains
                    if (t === 'fee' || t === 'tax' || t === 'adjustment') return false;
                    return t === 'deposit' || Number(cf.amount) > 0;
                })
                .reduce((sum, cf) => sum + Number(cf.amount), 0);

            const totalWithdrawn = Math.abs(cashFlows
                .filter(cf => {
                    const t = (cf.type || '').toLowerCase();
                    if (t === 'fee' || t === 'tax' || t === 'adjustment') return false;
                    return t === 'withdrawal' || Number(cf.amount) < 0;
                })
                .reduce((sum, cf) => sum + Number(cf.amount), 0));

            // Total PnL = (Current Value + Distributed aka Withdrawn) - Contributed
            const totalPnL = (currentValue + totalWithdrawn) - totalInvested



            return {
                currentValue,
                netContributions: netInvested,
                totalInvested,
                totalWithdrawn,
                totalPnL,
                simpleReturnPct: latest.cumulativeReturn
            }
        }
    }

    // Fallback (Legacy)
    const totalInvested = cashFlows
        .filter(cf => {
            const type = cf.type.toLowerCase()

            // Workaround Check
            if ((type === 'other') && (cf.description?.includes('(Capital Gain)') || (cf as any).notes?.includes('(Capital Gain)'))) {
                return false;
            }

            if (type === 'adjustment' || type === 'fee' || type === 'tax' || type === 'capital_gain') return false
            return Number(cf.amount) > 0 || type === 'deposit'
        })
        .reduce((sum, cf) => sum + Number(cf.amount), 0)

    const totalWithdrawn = Math.abs(
        cashFlows
            .filter(cf => {
                const type = cf.type.toLowerCase()
                if (type === 'fee' || type === 'tax' || type === 'adjustment') return false
                return Number(cf.amount) < 0 || type === 'withdrawal'
            })
            .reduce((sum, cf) => sum + Number(cf.amount), 0)
    )

    const netContributions = totalInvested - totalWithdrawn
    const totalPnL = currentValue - netContributions
    let simpleReturnPct = 0
    if (netContributions > 0) {
        simpleReturnPct = (totalPnL / netContributions) * 100
    }

    return {
        currentValue,
        netContributions,
        totalInvested,
        totalWithdrawn,
        totalPnL,
        simpleReturnPct
    }
}

export function calculateMonthlyPerformanceV2(
    valuations: Valuation[],
    cashFlows: CashFlow[]
): PeriodPerformance[] {
    if (valuations.length < 1) return []

    const valuationsByDate = new Map<string, Valuation[]>()
    valuations.forEach(val => {
        const dateKey = val.date.substring(0, 10)
        if (!valuationsByDate.has(dateKey)) valuationsByDate.set(dateKey, [])
        valuationsByDate.get(dateKey)!.push(val)
    })

    // Select the winner for each date
    const uniqueValuations: Valuation[] = []
    Array.from(valuationsByDate.keys()).sort().forEach(dateKey => {
        const candidates = valuationsByDate.get(dateKey)!
        candidates.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
            return timeB - timeA
        })
        uniqueValuations.push(candidates[0])
    })

    const sortedValuations = uniqueValuations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Sort Cash Flows: Date Ascending -> Then by Type (Income before Outflow)
    const sortedFlows = [...cashFlows].sort((a, b) => {
        const timeA = new Date(a.date).getTime()
        const timeB = new Date(b.date).getTime()

        if (timeA !== timeB) {
            return timeA - timeB
        }

        // Same Date: Prioritize Income (Deposit, Gain, Other) before Outflow (Withdrawal, Fee, Tax)
        // This guarantees "Profit First" behavior for same-day transactions regardless of entry order.
        const typeA = (a.type || '').toLowerCase()
        const typeB = (b.type || '').toLowerCase()

        const isIncome = (t: string) => ['deposit', 'capital_gain', 'other'].includes(t)

        const incomeA = isIncome(typeA)
        const incomeB = isIncome(typeB)

        if (incomeA && !incomeB) return -1 // A comes first
        if (!incomeA && incomeB) return 1  // B comes first

        // Final Tie-Breaker: Creation Time (if types are same class)
        const createdA = a.created_at ? new Date(a.created_at).getTime() : 0
        const createdB = b.created_at ? new Date(b.created_at).getTime() : 0
        return createdA - createdB
    })

    const monthlyMap = new Map<string, Valuation[]>()
    sortedValuations.forEach(val => {
        const d = new Date(val.date)
        const year = d.getUTCFullYear()
        const month = d.getUTCMonth() + 1
        const key = `${year}-${String(month).padStart(2, '0')}`
        if (!monthlyMap.has(key)) monthlyMap.set(key, [])
        monthlyMap.get(key)!.push(val)
    })

    const firstActiveValuation = sortedValuations.find(v => v.value > 0)
    const firstValuationDate = firstActiveValuation ? new Date(firstActiveValuation.date) : new Date()
    const startYear = firstValuationDate.getUTCFullYear()
    const startMonth = firstValuationDate.getUTCMonth() + 1
    const startKey = `${startYear}-${String(startMonth).padStart(2, '0')}`

    const systematicNow = new Date()
    const lastDataDate = sortedValuations.length > 0 ? new Date(sortedValuations[sortedValuations.length - 1].date) : new Date()
    const effectiveNow = lastDataDate > systematicNow ? lastDataDate : systematicNow
    const currentYear = effectiveNow.getUTCFullYear()
    const currentMonth = effectiveNow.getUTCMonth() + 1
    const currentKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

    if (!monthlyMap.has(currentKey)) {
        monthlyMap.set(currentKey, [])
    }

    let periods = Array.from(monthlyMap.keys()).sort()
    periods = periods.filter(p => p >= startKey)

    const rawResults: PeriodPerformance[] = []
    let previousEndValue = 0
    let runningPrincipal = 0
    let runningRetainedEarnings = 0
    let runningCumulativeReturn = 0

    for (let i = 0; i < periods.length; i++) {
        const periodKey = periods[i]
        const periodVals = monthlyMap.get(periodKey) || []

        // Parse Period date range
        const [yearStr, monthStr] = periodKey.split('-')
        const year = parseInt(yearStr)
        const month = parseInt(monthStr) - 1
        const startDate = new Date(Date.UTC(year, month, 1))
        const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))

        let startValue = (i === 0) ? 0 : previousEndValue

        let endValue = 0
        if (periodVals.length > 0) {
            endValue = periodVals[periodVals.length - 1].value
        } else {
            endValue = previousEndValue
        }

        const flowsInMonth = sortedFlows.filter(cf => {
            const d = new Date(cf.date)
            return d >= startDate && d <= endDate
        })
        const externalFlows = getExternalFlows(flowsInMonth)
        const netFlow = getNetFlow(externalFlows)

        // Per User Rule:
        // Capital Add (Deposit) -> Beginning of Month (BOM) -> Adds to Basis for THIS month.
        // Withdrawal -> End of Month (EOM) -> Does NOT reduce Basis for THIS month (money worked whole month).

        const monthlyDeposits = externalFlows
            .filter(f => Number(f.amount) > 0)
            .reduce((sum, f) => sum + Number(f.amount), 0)

        const monthlyReinvestments = flowsInMonth.reduce((sum, f) => {
            const t = (f.type || '').toLowerCase()
            const n = (f.notes || (f as any).description || '').toLowerCase()
            if (t === 'reinvestment' || (['other', 'adjustment'].includes(t) && n.includes('(reinvestment)'))) {
                return sum + Number(f.amount)
            }
            return sum
        }, 0)

        const pnl = endValue - startValue - netFlow
        runningRetainedEarnings += pnl

        let returnPct = 0
        // Basis = StartPrincipal + BOM Deposits + BOM Reinvestments.
        // Withdrawals are ignored for Basis (EOM).
        let denominator = runningPrincipal + monthlyDeposits + monthlyReinvestments

        if (denominator > 0) {
            returnPct = (pnl / denominator) * 100
        }

        // --- Update Principal for NEXT month (End of Month Rule + Profit First) ---
        // Apply to ALL months including the first one.
        // --- Update Principal for NEXT month (End of Month Rule + Profit First) ---
        // Apply to ALL months including the first one.
        // FIXED LOGIC: Process flows INDIVIDUALLY in sorted order.
        // Do NOT aggregate into 'netFlow', because a large Deposit + small Withdrawal 
        // results in Positive Net Flow, effectively hiding the Withdrawal from the Profit Check.

        externalFlows.forEach(flow => {
            const amt = Number(flow.amount)
            const typeLower = (flow.type || '').toLowerCase()

            // NEW: Reinvestment Logic
            // This is actually an INTERNAL flow, but we might have passed it in differently?
            // Wait, getExternalFlows filters it out!
            // So we won't see it here if we filter it out.
            // CORRECT APPROACH: We need to iterate ALL flows or filtered flows that INCLUDE reinvestment?
            // Actually, getExternalFlows is used to calculate NET FLOW (for PnL). Reinvestment is Net Flow neutral (0).
            // But it AFFECTS Principal and Earnings.

            // So we need to process reinvestments separately or include them here. 
            // Let's modify the loop to iterate `flowsInMonth` but ignore non-relevant ones, 
            // OR checks generic logic.
        })

        // RE-THINK: 
        // We are iterating `externalFlows` currently.
        // `externalFlows` filters out `reinvestment` (based on my change above).
        // So this loop WON'T see the reinvestment to adjust the principal.

        // FIX: We must iterate `flowsInMonth` here, but handle types specifically.

        flowsInMonth.forEach(flow => {
            const amt = Number(flow.amount)
            const type = (flow.type || '').toLowerCase()
            const notes = (flow.notes || (flow as any).description || '').toLowerCase()

            // 1. Reinvestment
            // Check for strict type OR workaround (type=other/adjustment + notes includes 'reinvestment')
            if (type === 'reinvestment' || (['other', 'adjustment'].includes(type) && notes.includes('(reinvestment)'))) {
                // Transfer: Earnings -> Principal
                // Amount should be POSITIVE in DB for this logic (we are adding to principal).
                runningPrincipal += amt
                runningRetainedEarnings -= amt
                return
            }

            // 2. Deposit (External)
            if (type === 'deposit') {
                runningPrincipal += amt
                return
            }

            // 3. Withdrawal (External)
            // Check against internal types (fee/tax excluded by getExternalFlows logic generally, but here we view all)
            const internalTypes = ['fee', 'tax', 'adjustment', 'expense', 'capital_gain']

            // Handle "Capital Gain in Notes" check
            if ((type === 'other' || type === 'capital_gain') && notes.includes('capital gain')) {
                // Ignore (it's PnL, irrelevant for Principal/Earnings breakdown adjustment generally?? 
                // Wait, PnL handled by EndValue - StartValue. 
                // So we do NOTHING here. Correct.
                return;
            }

            if (internalTypes.includes(type)) return // Ignore fees/taxes for Principal check (they reduce PnL implicitly in EndValue)

            // Valid Withdrawal
            if (type === 'withdrawal' || amt < 0) {
                const withdrawalAmount = Math.abs(amt)
                // Profit First Logic
                if (runningRetainedEarnings >= withdrawalAmount) {
                    runningRetainedEarnings -= withdrawalAmount
                } else {
                    const remainder = withdrawalAmount - runningRetainedEarnings
                    runningRetainedEarnings = 0
                    runningPrincipal -= remainder
                }
            }
        })

        // Cumulative Return Logic:
        // User Preference: Arithmetic Sum of Monthly Returns.
        // (e.g., 10% + 10% + 10% + 10% = 40%)
        // Valid for simple performance visual tracking.
        runningCumulativeReturn += returnPct
        let cumulativeReturn = runningCumulativeReturn

        const periodLabel = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })

        // Determine if period is ongoing
        // It is ongoing if it matches the current month AND we don't have data covering the end of the month
        const isCurrentMonth = periodKey === currentKey
        let isOngoing = isCurrentMonth

        if (isCurrentMonth) {
            // Check if we have a valuation or data for the "end" of this month
            // We can check if effectiveNow (last data date) is close to endDate
            // endDate is the last ms of the month.
            // If lastDataDate is within the last 3 days of the month, consider it closed?
            // Or simpler: If we have a valuation on the last day of the month.

            const lastValuation = periodVals[periodVals.length - 1]
            if (lastValuation) {
                const valDate = new Date(lastValuation.date)

                // Strict Production Check:
                // Compare valuation date parts (Year, Month, Day) with the calculated End of Month
                const valYear = valDate.getUTCFullYear()
                const valMonth = valDate.getUTCMonth()
                const valDay = valDate.getUTCDate()

                const eomDate = new Date(Date.UTC(year, month + 1, 0)) // Standard JS trick for last day

                const eomYear = eomDate.getUTCFullYear()
                const eomMonth = eomDate.getUTCMonth()
                const eomDay = eomDate.getUTCDate()

                // If the valuation matches the exact last day of the month
                if (valYear === eomYear && valMonth === eomMonth && valDay === eomDay) {
                    isOngoing = false
                }
            }
        }

        rawResults.push({
            periodLabel,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            startValue,
            endValue,
            netFlow,
            pnl,
            returnPct,
            cumulativeReturn,
            principal: denominator, // Start Basis for Monthly Return
            endPrincipal: runningPrincipal, // End Basis for Cumulative Return
            isOngoing
        })

        previousEndValue = endValue
    }

    return rawResults.reverse()
}

export function calculateTWR(valuations: Valuation[], cashFlows: CashFlow[]): number | null {
    const monthly = calculateMonthlyPerformanceV2(valuations, cashFlows);
    if (monthly.length === 0) return null;
    return monthly[0].cumulativeReturn;
}

export function filterByRange(
    valuations: Valuation[],
    cashFlows: CashFlow[],
    range: "30D" | "60D" | "90D" | "1Y" | "ALL" | "YTD" | "monthly" | "yearly",
): { filteredValuations: Valuation[]; filteredCashFlows: CashFlow[]; startDate: Date | null } {
    const now = new Date()
    let startDate: Date | null = null

    const subDays = (d: Date, days: number) => new Date(d.getTime() - days * 24 * 60 * 60 * 1000)

    switch (range) {
        case "30D": startDate = subDays(now, 30); break
        case "60D": startDate = subDays(now, 60); break
        case "90D": startDate = subDays(now, 90); break
        case "1Y": startDate = subDays(now, 365); break
        case "YTD": startDate = new Date(now.getFullYear(), 0, 1); break
        case "monthly": startDate = new Date(now.getFullYear(), now.getMonth(), 1); break
        case "yearly": startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); break
        case "ALL": startDate = null; break
    }

    if (!startDate) {
        return { filteredValuations: valuations, filteredCashFlows: cashFlows, startDate: null }
    }

    const sortedValuations = [...valuations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const baseline = sortedValuations.filter(v => new Date(v.date) < startDate!).pop()

    const filteredValuations = sortedValuations.filter(v => new Date(v.date) >= startDate!)
    if (baseline) filteredValuations.unshift(baseline)

    const filteredCashFlows = cashFlows.filter(cf => new Date(cf.date) >= startDate!)

    return { filteredValuations, filteredCashFlows, startDate }
}

export function prepareChartData(valuations: Valuation[], cashFlows: CashFlow[]) {
    const valuationsByDate = new Map<string, Valuation[]>()
    valuations.forEach(val => {
        const dateKey = val.date.substring(0, 10)
        if (!valuationsByDate.has(dateKey)) valuationsByDate.set(dateKey, [])
        valuationsByDate.get(dateKey)!.push(val)
    })

    const uniqueValuations: Valuation[] = []
    Array.from(valuationsByDate.keys()).sort().forEach(dateKey => {
        const candidates = valuationsByDate.get(dateKey)!
        candidates.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
            return timeB - timeA
        })
        uniqueValuations.push(candidates[0])
    })

    uniqueValuations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const sortedFlows = [...cashFlows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return uniqueValuations.map(v => {
        const vDate = getEndOfDay(new Date(v.date))
        const invested = sortedFlows
            .filter(cf => new Date(cf.date).getTime() <= vDate.getTime())
            .filter(cf => cf.type === 'deposit' || cf.type === 'withdrawal' || (cf.type !== 'fee' && cf.type !== 'tax' && cf.type !== 'adjustment' && cf.type !== 'capital_gain'))
            .reduce((sum, cf) => sum + Number(cf.amount), 0)

        return {
            date: v.date,
            value: v.value,
            invested: invested
        }
    })
}
