import { LayoutDashboard, type LucideIcon, ReceiptText } from "lucide-react"

/**
 * The app's navigation and its data modules, in one list. Add a module here and it appears in the
 * sidebar; `key` is also its data source setting (DATA_SOURCE_<KEY>).
 */
export type NavItem = { label: string; href: string; icon: LucideIcon }
export type DataModule = NavItem & { key: string; description: string }

export const modules: DataModule[] = [
  {
    key: "sales",
    label: "Sales",
    href: "/sales",
    icon: ReceiptText,
    description: "Every sale, its customer and status.",
  },
]

export const navigation: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  ...modules,
]
