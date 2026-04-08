import {
  GraduationCap,
  Heart,
  Stethoscope,
  Refrigerator,
  Plane,
  Home,
} from "lucide-react"

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  education: <GraduationCap className="h-5 w-5 text-blue-600" />,
  marriage: <Heart className="h-5 w-5 text-pink-600" />,
  healthcare: <Stethoscope className="h-5 w-5 text-red-500" />,
  whitegoods: <Refrigerator className="h-5 w-5 text-slate-600" />,
  travel: <Plane className="h-5 w-5 text-sky-600" />,
  living: <Home className="h-5 w-5 text-emerald-600" />,
}
