import { BrowserRouter } from "react-router"
import { AppShell } from "@/components/layout/AppShell"
import { AppRoutes } from "@/routes"
import { fetchSchemeList } from "@/services/mf-api"

// Warm the MF scheme cache on app load — silent, non-blocking
fetchSchemeList().catch(() => {})

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </BrowserRouter>
  )
}
