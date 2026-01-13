"use server"

import { createClient } from "@supabase/supabase-js"

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
        // Explicit check for key to return visible error
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return { exists: false, error: "Missing Server Config (SUPABASE_SERVICE_ROLE_KEY)" }
        }

        const supabase = getAdminClient()

        // 1. Check Public Profile (Fast)
        const { data: profile } = await supabase
            .from("users")
            .select("id")
            .ilike("email", targetEmail)
            .maybeSingle()

        if (profile) return { exists: true }

        // 2. Fallback: Check Auth Users (Comprehensive)
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
