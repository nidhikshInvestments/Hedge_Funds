"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function markAsRead(messageId: string) {
    const supabase = await createClient()

    // Verify admin
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()
    if (!userData || userData.role !== "admin") return

    await supabase.from("contact_messages").update({ status: "read" }).eq("id", messageId)
    revalidatePath("/admin/messages")
}

export async function deleteMessage(messageId: string) {
    const supabase = await createClient()

    // Verify admin
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()
    if (!userData || userData.role !== "admin") return

    await supabase.from("contact_messages").delete().eq("id", messageId)
    revalidatePath("/admin/messages")
}

export async function deleteReadMessages() {
    const supabase = await createClient()

    // Verify admin
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()
    if (!userData || userData.role !== "admin") return

    await supabase.from("contact_messages").delete().eq("status", "read")
    revalidatePath("/admin/messages")
}
