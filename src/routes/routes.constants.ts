export const ROUTE_PATHS = {
  home: "/",
  taxHarvest: "/tax-harvest",
  tracking: "/tracking",
} as const

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS]
