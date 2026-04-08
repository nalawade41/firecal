import { Routes, Route } from "react-router"
import { FireCalculatorPage } from "@/pages/FireCalculator/FireCalculatorPage"
import { TaxHarvestPage } from "@/pages/TaxHarvest/TaxHarvestPage"
import { TrackingPage } from "@/pages/Tracking/TrackingPage"
import { ROUTE_PATHS } from "./routes.constants"

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.home} element={<FireCalculatorPage />} />
      <Route path={ROUTE_PATHS.taxHarvest} element={<TaxHarvestPage />} />
      <Route path={ROUTE_PATHS.tracking} element={<TrackingPage />} />
    </Routes>
  )
}
