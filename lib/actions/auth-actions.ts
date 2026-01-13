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

export async function checkUserExists(email: string) {
    console.log(`[CheckUserExists] Checking: ${email}`)
    const targetEmail = email.toLowerCase().trim()

    try {
        const supabase = getAdminClient()

        // 1. Check Public Profile (Fast)
        const { data: profile } = await supabase
            .from("users")
            .select("id")
            .ilike("email", targetEmail) // Case-insensitive match
            .maybeSingle()

        if (profile) {
            console.log(`[CheckUserExists] Found in Public Profile: ${profile.id}`)
            return true
        }

        // 2. Fallback: Check Auth Users (Comprehensive)
        // This handles cases where profile might be missing or RLS weirdness
        const { data: { users }, error } = await supabase.auth.admin.listUsers()

        if (error) {
            console.error("[CheckUserExists] listUsers Error:", error)
            return false
        }

        const foundInAuth = users.find(u => u.email?.toLowerCase() === targetEmail)

        if (foundInAuth) {
            console.log(`[CheckUserExists] Found in Auth Users: ${foundInAuth.id}`)
            return true
        }

        console.log(`[CheckUserExists] User NOT found.`)
        return false

    } catch (error) {
        console.error("CheckUserExists Critical Error:", error)
        return false
    }
}
