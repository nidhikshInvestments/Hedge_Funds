import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, MailOpen, Trash2 } from "lucide-react"
import { markAsRead, deleteMessage, deleteReadMessages } from "@/lib/actions/message-actions"

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is admin
  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!userData || userData.role !== "admin") {
    redirect("/investor")
  }

  // Fetch all contact messages
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })

  const newMessages = messages?.filter((m) => m.status === "new").length || 0
  const readMessagesCount = messages?.filter((m) => m.status === "read").length || 0

  return (
    <div className="min-h-screen bg-black">
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/30 to-yellow-600/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-amber-600/30 to-yellow-500/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-amber-500 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Dashboard
          </Link>

          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Contact Messages</h1>
              <p className="text-gray-400">
                {newMessages > 0 ? `${newMessages} new message${newMessages > 1 ? "s" : ""}` : "No new messages"}
              </p>
            </div>
            {readMessagesCount > 0 && (
              <form action={deleteReadMessages}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-all font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All Read
                </button>
              </form>
            )}
          </div>

          <div className="space-y-4">
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:border-amber-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {message.status === "new" ? (
                        <Mail className="w-5 h-5 text-amber-500" />
                      ) : (
                        <MailOpen className="w-5 h-5 text-gray-500" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-white">{message.subject}</h3>
                        <p className="text-sm text-gray-400">
                          From: {message.name} ({message.email})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs ${message.status === "new"
                              ? "bg-amber-500/20 text-amber-500"
                              : message.status === "read"
                                ? "bg-blue-500/20 text-blue-500"
                                : "bg-green-500/20 text-green-500"
                            }`}
                        >
                          {message.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(message.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <form action={deleteMessage.bind(null, message.id)}>
                        <button
                          type="submit"
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete Message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
                    <p className="text-gray-300 whitespace-pre-wrap">{message.message}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a
                      href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all"
                    >
                      Reply via Email
                    </a>
                    {message.status === "new" && (
                      <form action={markAsRead.bind(null, message.id)}>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all"
                        >
                          Mark as Read
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No messages yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
