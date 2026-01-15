"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

function getAdminClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
    }
    return createClient(
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

export async function checkUserExists(email: string): Promise<{ exists: boolean, error?: string }> {
    console.log(`[CheckUserExists] Checking: ${email}`)
    const targetEmail = email.toLowerCase().trim()

    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return { exists: false, error: "Missing Server Config (SUPABASE_SERVICE_ROLE_KEY)" }
        }

        const supabase = getAdminClient()

        // 1. Check Public Profile
        const { data: profile } = await supabase
            .from("users")
            .select("id")
            .ilike("email", targetEmail)
            .maybeSingle()

        if (profile) return { exists: true }

        // 2. Fallback: Check Auth Users
        const { data: { users }, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })

        if (error) {
            console.error("[CheckUserExists] listUsers Error:", error)
            return { exists: false, error: `Auth List Error: ${error.message}` }
        }

        const foundInAuth = users.find(u => u.email?.toLowerCase() === targetEmail)

        if (foundInAuth) return { exists: true }

        return { exists: false }

    } catch (error: any) {
        console.error("CheckUserExists Critical Error:", error)
        return { exists: false, error: `Critical Check Error: ${error.message}` }
    }
}

export async function createInvestorAccount(formData: {
    fullName: string
    email: string
    phone: string
    password: string
    initialInvestment: string
    startDate: string
    notes: string
}) {
    console.log("[CreateInvestor] Starting creation for:", formData.email)

    // 1. Validation
    if (!formData.email || !formData.password || !formData.fullName) {
        return { success: false, error: "Missing required fields" }
    }

    try {
        const supabase = getAdminClient()

        // 2. Check overlap
        const check = await checkUserExists(formData.email)
        if (check.exists) {
            return { success: false, error: "User already exists with this email." }
        }

        // 3. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: formData.email,
            password: formData.password,
            email_confirm: true,
            user_metadata: {
                full_name: formData.fullName,
            },
        })

        if (authError) {
            console.error("[CreateInvestor] Auth Error:", authError)
            return { success: false, error: `Auth Error: ${authError.message}` }
        }

        if (!authData.user) {
            return { success: false, error: "Failed to create auth user (No data returned)" }
        }

        const userId = authData.user.id

        console.log("[CreateInvestor] Auth User Created:", userId)

        // 4. Create Public User Record
        const { error: userError } = await supabase.from("users").insert({
            id: userId,
            email: formData.email,
            full_name: formData.fullName,
            phone: formData.phone,
            role: "investor",
            profile_completed: true,
            created_at: new Date().toISOString()
        })

        if (userError) {
            // Rollback? Hard to rollback Auth. Just report error.
            console.error("[CreateInvestor] User Table Error:", userError)
            return { success: false, error: `User Database Error: ${userError.message}` }
        }

        // 5. Create Portfolio
        const { data: portfolioData, error: portfolioError } = await supabase
            .from("portfolios")
            .insert({
                investor_id: userId,
                portfolio_name: `${formData.fullName}'s Portfolio`,
                initial_investment: Number.parseFloat(formData.initialInvestment) || 0,
                start_date: formData.startDate,
                notes: formData.notes,
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (portfolioError) {
            console.error("[CreateInvestor] Portfolio Error:", portfolioError)
            return { success: false, error: `Portfolio Creation Error: ${portfolioError.message}` }
        }

        // 6. Add Initial Valuation (if applicable)
        if (Number.parseFloat(formData.initialInvestment) > 0) {
            const { error: valueError } = await supabase.from("portfolio_values").insert({
                portfolio_id: portfolioData.id,
                value: Number.parseFloat(formData.initialInvestment),
                date: formData.startDate,
                notes: "Initial investment",
            })

            if (valueError) {
                console.error("[CreateInvestor] Initial Value Error:", valueError)
                // Non-critical, but good to know
            }

            // Also add as a Deposit Cash Flow? 
            // Ideally yes, to balance the books? 
            // Usually "Initial Investment" implies a Deposit.
            // Let's add it as a Deposit flow so flow-based math works.
            const { error: flowError } = await supabase.from("cash_flows").insert({
                portfolio_id: portfolioData.id,
                date: formData.startDate,
                type: 'deposit',
                amount: Number.parseFloat(formData.initialInvestment),
                notes: "Initial investment deposit",
            })
        }

        revalidatePath('/admin')
        return { success: true }

    } catch (err: any) {
        console.error("[CreateInvestor] Critical Error:", err)
        return { success: false, error: err.message || "Internal Server Error" }
    }
}
