
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function DebugViewPage({
    searchParams,
}: {
    searchParams: Promise<{ viewAs?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="p-10 text-white bg-slate-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-4">Debug Access View</h1>
            <pre className="bg-black p-4 rounded border border-white/20 overflow-auto">
                {JSON.stringify({
                    message: "If you see this, the /investor path itself is NOT blocked.",
                    currentUser: user?.email,
                    params: params,
                }, null, 2)}
            </pre>
        </div>
    )
}
