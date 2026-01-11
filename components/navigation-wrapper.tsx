import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"

export async function NavigationWrapper() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userData = null
  if (user) {
    const { data } = await supabase.from("users").select("role, full_name").eq("id", user.id).single()
    userData = data
  }

  const isLoggedIn = !!user
  const isAdmin = userData?.role === "admin"
  const userName = userData?.full_name || user?.email?.split("@")[0] || "Account"

  return <Navigation isLoggedIn={isLoggedIn} isAdmin={isAdmin} userName={userName} />
}
