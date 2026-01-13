"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

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

const resend = new Resend(process.env.RESEND_API_KEY)

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
    // Use supabaseAdmin for ALL DB operations to bypass RLS.
    // The previous 'supabase' client respects RLS, preventing Admin from creating other users' profiles.

    for (const row of rows) {
        const rowId = `${row.action} - ${row.email}`
        try {
            const email = row.email?.trim()
            if (!email) throw new Error("Missing Email")

            // 1. ACTION: CREATE
            if (row.action === 'CREATE') {
                if (!row.fullName) throw new Error("Missing Full Name for CREATE")

                // IDEMPOTENCY & TEMP PASSWORD LOGIC
                let userId: string | null = null
                let isNewUser = false
                const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!" // Secure-ish temp password

                // 1. Try to Create User (Auto-Confirm)
                const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                    email: email,
                    password: tempPassword,
                    email_confirm: true, // Auto-confirm email so they can login immediately
                    user_metadata: {
                        full_name: row.fullName,
                        force_password_change: true
                    }
                })

                if (authError) {
                    // 2. Handle Existing User
                    if (authError.message.includes("already registered") || authError.status === 422) {
                        const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
                        const existingUser = listData.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())

                        if (!existingUser) throw new Error(`User exists but could not be retrieved.`)
                        userId = existingUser.id
                        console.log(`[Bulk Import] User ${email} already exists. Skipping creation.`)
                        // NOTE: We do NOT send a temp password for existing users to avoid resetting their access unexpectedly.
                    } else {
                        throw new Error(`Auth creation failed: ${authError.message}`)
                    }
                } else {
                    // SWAPPED TO NEW USER
                    isNewUser = true
                    userId = authData.user.id

                    // 3. SEND WELCOME EMAIL WITH TEMP PASSWORD (ONLY FOR NEW USERS)
                    // BACKUP LOG: Valid for debugging if email fails
                    console.log(`[Bulk Import] New User: ${email}, TempPassword: ${tempPassword}`)

                    try {
                        if (!process.env.RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY")

                        const data = await resend.emails.send({
                            from: 'Nidhiksh Investments <admin@nidhiksh-investments.com>',
                            reply_to: 'nidhiksh.investments@gmail.com',
                            to: [email],
                            subject: 'Welcome to Nidhiksh Investments - Your Login Details',
                            html: `
                              <h2>Welcome to Nidhiksh Investments</h2>
                              <p>A new account has been created for you.</p>
                              <div style="background:#f4f4f5; padding:20px; border-radius:8px; margin:20px 0;">
                                <p><strong>Temporary Password:</strong> <span style="font-family:monospace; font-size:16px;">${tempPassword}</span></p>
                              </div>
                              <p>Please log in immediately and change your password.</p>
                              <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background:#2563eb; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Login Now</a>
                            `
                        })
                        console.log(`[Bulk Import] Email sent to ${email}:`, data.data?.id)
                    } catch (emailErr: any) {
                        console.error(`[Bulk Import] Failed to send email to ${email}:`, emailErr)
                        // Don't fail the whole row, but log it.
                        outcomes.errors.push(`${email} [EMAIL]: Failed to send temp password. Check Server Logs for password. Error: ${emailErr.message}`)
                    }
                }

                if (!userId) throw new Error("Failed to resolve User ID")

                // Create Public Profile (Idempotent Upsert) - USE ADMIN CLIENT
                const { error: profileError } = await supabaseAdmin.from("users").upsert({
                    id: userId,
                    email: email,
                    full_name: row.fullName,
                    phone: row.phone || null,
                    role: "investor",
                    profile_completed: true,
                    created_at: new Date().toISOString()
                }, { onConflict: 'id', ignoreDuplicates: true })

                if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`)

                // Create Portfolio (Check if exists first to avoid duplicates) - USE ADMIN CLIENT
                const { data: existingPorts } = await supabaseAdmin.from("portfolios").select("id").eq("investor_id", userId)

                let portfolioId = existingPorts?.[0]?.id

                if (!portfolioId) {
                    const { data: newPort, error: portError } = await supabaseAdmin.from("portfolios").insert({
                        investor_id: userId,
                        portfolio_name: `${row.fullName} Portfolio`,
                        initial_investment: row.amount || 0,
                        start_date: row.date || new Date().toISOString().split('T')[0],
                        total_deposits: row.amount || 0
                    }).select().single()

                    if (portError) throw new Error(`Portfolio creation failed: ${portError.message}`)
                    portfolioId = newPort.id
                }

                // Initial Deposit Logic (Only if NEW transaction implied or amount > 0)
                // If it's an existing user, we might double-count initial investment if we run this again?
                // We should only insert a "Initial Investment" Cash Flow if the portfolio was JUST created (isNewUser logic or check cashflows).
                // But row.amount here implies "Initial Investment" from the CSV line.

                if (row.amount && row.amount > 0) {
                    // Idempotency: Check if an "Initial Investment" already exists for this amount/date?
                    // Or simplify: If the portfolio was just created, add it.
                    // If portfolio existed, maybe this is just a reset?

                    // Safer: Check if cashflows exist.
                    const { count } = await supabaseAdmin.from("cash_flows").select("*", { count: 'exact', head: true }).eq("portfolio_id", portfolioId)

                    if (count === 0) {
                        await supabaseAdmin.from("cash_flows").insert({
                            portfolio_id: portfolioId,
                            date: row.date || new Date().toISOString().split('T')[0],
                            amount: row.amount,
                            type: "deposit",
                            description: "Initial Investment"
                        })
                    } else {
                        // Warning: Using CREATE on existing user does NOT add new deposits automatically to secure from duplicates.
                        // Use TRANSACTION action for explicit adds.
                    }
                }
            }

            // 2. ACTION: UPDATE
            else if (row.action === 'UPDATE') {
                // Find user by email - USE ADMIN CLIENT
                const { data: users } = await supabaseAdmin.from("users").select("id").eq("email", email).limit(1)
                if (!users || users.length === 0) throw new Error("User not found for UPDATE")
                const userId = users[0].id

                const updates: any = {}
                if (row.fullName) updates.full_name = row.fullName
                if (row.phone) updates.phone = row.phone

                if (Object.keys(updates).length > 0) {
                    const { error: updateError } = await supabaseAdmin.from("users").update(updates).eq("id", userId)
                    if (updateError) throw new Error(`Update failed: ${updateError.message}`)
                }
            }

            // 3. ACTION: TRANSACTION
            else if (row.action === 'TRANSACTION') {
                if (!row.amount) throw new Error("Missing Amount for TRANSACTION")
                if (!row.type) throw new Error("Missing Type (deposit/withdrawal) for TRANSACTION")

                // Resolve Portfolio - USE ADMIN CLIENT
                const { data: users } = await supabaseAdmin.from("users").select("id").eq("email", email).single()
                if (!users) throw new Error("User not found for TRANSACTION")

                const { data: portfolio } = await supabaseAdmin.from("portfolios").select("id").eq("investor_id", users.id).single()
                if (!portfolio) throw new Error("Portfolio not found for user")

                let type = row.type.toLowerCase()
                // Map user-friendly terms to internal types
                if (type === 'capital gain' || type === 'gain' || type === 'profit') type = 'capital_gain'
                if (type === 'fee' || type === 'fees') type = 'fee'

                const { error: txError } = await supabaseAdmin.from("cash_flows").insert({
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

                const { data: users } = await supabaseAdmin.from("users").select("id").eq("email", email).single()
                if (!users) throw new Error("User not found for VALUATION")

                const { data: portfolio } = await supabaseAdmin.from("portfolios").select("id").eq("investor_id", users.id).single()
                if (!portfolio) throw new Error("Portfolio not found for user")

                const { error: valError } = await supabaseAdmin.from("portfolio_values").insert({
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
