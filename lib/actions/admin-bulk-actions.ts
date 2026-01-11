"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

// Helper to get Admin Client
function getAdminClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
    }
    return createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
}

export async function bulkDeleteInvestors(investorIds: string[]) {
    const supabase = await createClient()
    const successIds: string[] = []
    const failedIds: string[] = []

    console.log(`[Bulk Delete] Starting deletion for ${investorIds.length} investors`)

    // We need Admin Client for Auth Deletion
    let supabaseAdmin: any = null
    try {
        supabaseAdmin = getAdminClient()
    } catch (e) {
        console.error("[Bulk Delete] Admin client init failed:", e)
        return { success: false, error: "Server configuration error: Missing Admin Key" }
    }

    for (const investorId of investorIds) {
        try {
            // 1. Delete Auth User (Cascade triggers might handle DB, but we do explicitly too)
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(investorId)

            if (authError) {
                console.error(`[Bulk Delete] Auth delete failed for ${investorId}:`, authError)
                failedIds.push(investorId)
                continue
            }

            // 2. Cleanup Public Data (Safeguard in case cascades miss)
            // Find portfolios
            const { data: portfolios } = await supabase.from('portfolios').select('id').eq('investor_id', investorId)
            const portfolioIds = portfolios?.map(p => p.id) || []

            for (const pid of portfolioIds) {
                await supabase.from('portfolio_values').delete().eq('portfolio_id', pid)
                await supabase.from('cash_flows').delete().eq('portfolio_id', pid)
                await supabase.from('investments').delete().eq('portfolio_id', pid)
                await supabase.from('portfolios').delete().eq('id', pid)
            }

            await supabase.from('users').delete().eq('id', investorId)

            successIds.push(investorId)
        } catch (err) {
            console.error(`[Bulk Delete] Unexpected error for ${investorId}:`, err)
            failedIds.push(investorId)
        }
    }

    revalidatePath("/admin")
    return {
        success: true,
        deletedCount: successIds.length,
        failedCount: failedIds.length,
        message: `Deleted ${successIds.length} investors`
    }
}

export type UniversalRow = {
    action: 'CREATE' | 'UPDATE' | 'TRANSACTION' | 'VALUATION'
    email: string
    date?: string      // Used for Start Date, Transaction Date, Valuation Date
    amount?: number    // Used for Initial Investment, Transaction Amount, Portfolio Value
    type?: string      // Used for Transaction Type (deposit/withdrawal)
    description?: string // Notes
    fullName?: string
    phone?: string
}

export async function processBulkUpload(rows: UniversalRow[]) {
    const outcomes = { success: 0, failed: 0, errors: [] as string[] }
    const supabase = await createClient()
    let supabaseAdmin: any = null

    try {
        supabaseAdmin = getAdminClient()
    } catch (e) {
        return { success: false, error: "Server configuration error: Missing Admin Key" }
    }

    // Pre-fetch portfolios to minimize queries in loop?
    // For robustness, fetching one-by-one inside loop is safer against race conditions in bulk creation, though slower.
    // Given typical batch sizes (10-100), one-by-one is acceptable.

    for (const row of rows) {
        const rowId = `${row.action} - ${row.email}`
        try {
            const email = row.email?.trim()
            if (!email) throw new Error("Missing Email")

            // 1. ACTION: CREATE
            if (row.action === 'CREATE') {
                if (!row.fullName) throw new Error("Missing Full Name for CREATE")

                // Generate temp password
                const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!"

                const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
                    email: email,
                    password: tempPassword,
                    email_confirm: true,
                    user_metadata: { full_name: row.fullName }
                })

                if (authError) {
                    // If user already exists, treat as "Soft Skip" or Error?
                    // Let's check error message. If "User already registered", maybe check if we should just ensure portfolio?
                    // For now, fail safely.
                    throw new Error(`Auth creation failed: ${authError.message}`)
                }
                if (!authUser.user) throw new Error("No user returned from auth creation")

                // Create Public Profile
                const { error: profileError } = await supabase.from("users").upsert({
                    id: authUser.user.id,
                    email: email,
                    full_name: row.fullName,
                    phone: row.phone || null,
                    role: "investor",
                    profile_completed: true,
                    created_at: new Date().toISOString()
                })
                if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`)

                // Create Portfolio
                const { error: portError } = await supabase.from("portfolios").insert({
                    investor_id: authUser.user.id,
                    portfolio_name: `${row.fullName} Portfolio`,
                    initial_investment: row.amount || 0,
                    start_date: row.date || new Date().toISOString().split('T')[0],
                    total_deposits: row.amount || 0
                })
                if (portError) throw new Error(`Portfolio creation failed: ${portError.message}`)

                // Initial Deposit Logic
                if (row.amount && row.amount > 0) {
                    const { data: portData } = await supabase.from("portfolios").select("id").eq("investor_id", authUser.user.id).single()
                    if (portData) {
                        await supabase.from("cash_flows").insert({
                            portfolio_id: portData.id,
                            date: row.date || new Date().toISOString().split('T')[0],
                            amount: row.amount,
                            type: "deposit",
                            description: "Initial Investment"
                        })
                    }
                }
            }

            // 2. ACTION: UPDATE
            else if (row.action === 'UPDATE') {
                // Find user by email
                const { data: users } = await supabase.from("users").select("id").eq("email", email).limit(1)
                if (!users || users.length === 0) throw new Error("User not found for UPDATE")
                const userId = users[0].id

                const updates: any = {}
                if (row.fullName) updates.full_name = row.fullName
                if (row.phone) updates.phone = row.phone

                if (Object.keys(updates).length > 0) {
                    const { error: updateError } = await supabase.from("users").update(updates).eq("id", userId)
                    if (updateError) throw new Error(`Update failed: ${updateError.message}`)
                }
            }

            // 3. ACTION: TRANSACTION
            else if (row.action === 'TRANSACTION') {
                if (!row.amount) throw new Error("Missing Amount for TRANSACTION")
                if (!row.type) throw new Error("Missing Type (deposit/withdrawal) for TRANSACTION")

                // Resolve Portfolio
                const { data: users } = await supabase.from("users").select("id").eq("email", email).single()
                if (!users) throw new Error("User not found for TRANSACTION")

                const { data: portfolio } = await supabase.from("portfolios").select("id").eq("investor_id", users.id).single()
                if (!portfolio) throw new Error("Portfolio not found for user")

                let type = row.type.toLowerCase()
                // Map user-friendly terms to internal types
                if (type === 'capital gain' || type === 'gain' || type === 'profit') type = 'capital_gain'
                if (type === 'fee' || type === 'fees') type = 'fee'

                const { error: txError } = await supabase.from("cash_flows").insert({
                    portfolio_id: portfolio.id,
                    date: row.date || new Date().toISOString().split('T')[0],
                    amount: Math.abs(row.amount),
                    type: type,
                    description: row.description || "Bulk Import Transaction"
                })
                if (txError) throw new Error(`Transaction insert failed: ${txError.message}`)
            }

            // 4. ACTION: VALUATION
            else if (row.action === 'VALUATION') {
                if (row.amount === undefined || row.amount === null) throw new Error("Missing Amount for VALUATION")

                const { data: users } = await supabase.from("users").select("id").eq("email", email).single()
                if (!users) throw new Error("User not found for VALUATION")

                const { data: portfolio } = await supabase.from("portfolios").select("id").eq("investor_id", users.id).single()
                if (!portfolio) throw new Error("Portfolio not found for user")

                const { error: valError } = await supabase.from("portfolio_values").insert({
                    portfolio_id: portfolio.id,
                    date: row.date || new Date().toISOString().split('T')[0],
                    value: row.amount,
                    notes: row.description || "Bulk Import Valuation"
                })
                if (valError) throw new Error(`Valuation insert failed: ${valError.message}`)
            }
            else {
                throw new Error(`Unknown Action: ${row.action}`)
            }

            outcomes.success++

        } catch (err: any) {
            console.error(`[Bulk Process] Error row ${rowId}:`, err)
            outcomes.failed++
            outcomes.errors.push(`${row.email} [${row.action}]: ${err.message}`)
        }
    }

    revalidatePath("/admin")
    return { success: true, outcomes }
}
