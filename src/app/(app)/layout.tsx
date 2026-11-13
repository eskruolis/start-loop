import type { ReactNode } from "react"
import { AppSidebar } from "@/components/app/app-sidebar"
import { ThemeToggle } from "@/components/app/theme-toggle"
import { UserMenu } from "@/components/app/user-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { requireUser } from "@/server/session"

/**
 * Every page here belongs to a signed-in user and shows live data: never pre-rendered at build
 * time or cached between users.
 */
export const dynamic = "force-dynamic"

/** The signed-in app: sidebar, top bar, page. Every page inside it needs a signed-in user. */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser()
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <UserMenu name={user.name} email={user.email} role={user.role} />
          </div>
        </header>
        {/* SidebarInset is the page's <main>; this is only its padding. */}
        <div className="flex flex-1 flex-col gap-6 overflow-x-clip p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
