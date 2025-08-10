import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, TrendingUp, TrendingDown, DollarSign, BookOpen, Building, UserCheck } from "lucide-react"

const statsData = [
  {
    title: "Total Students",
    value: "1,234",
    change: "+5.2%",
    changeType: "increase",
    icon: Users,
    iconBgClass: "bg-blue-100",
    iconTextClass: "text-blue-600",
    badgeBgClass: "bg-gray-900",
    badgeTextClass: "text-white",
    description: "from last month",
  },
  {
    title: "Active Staff",
    value: "87",
    change: "+2",
    changeType: "increase",
    icon: UserCheck,
    iconBgClass: "bg-green-100",
    iconTextClass: "text-green-600",
    badgeBgClass: "bg-gray-900",
    badgeTextClass: "text-white",
    description: "since last month",
  },
  {
    title: "Average Attendance",
    value: "94.2%",
    change: "+1.8%",
    changeType: "increase",
    icon: GraduationCap,
    iconBgClass: "bg-purple-100",
    iconTextClass: "text-purple-600",
    badgeBgClass: "bg-gray-900",
    badgeTextClass: "text-white",
    description: "this week",
  },
  {
    title: "Monthly Revenue",
    value: "$124,500",
    change: "-2.1%",
    changeType: "decrease",
    icon: DollarSign,
    iconBgClass: "bg-orange-100",
    iconTextClass: "text-orange-600",
    badgeBgClass: "bg-red-600", // Red for decrease
    badgeTextClass: "text-white",
    description: "from last month",
  },
  {
    title: "Active Courses",
    value: "42",
    change: "+3",
    changeType: "increase",
    icon: BookOpen,
    iconBgClass: "bg-indigo-100",
    iconTextClass: "text-indigo-600",
    badgeBgClass: "bg-gray-900",
    badgeTextClass: "text-white",
    description: "this semester",
  },
  {
    title: "Facility Utilization",
    value: "78%",
    change: "+5.2%",
    changeType: "increase",
    icon: Building,
    iconBgClass: "bg-teal-100",
    iconTextClass: "text-teal-600",
    badgeBgClass: "bg-gray-900",
    badgeTextClass: "text-white",
    description: "capacity used",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon
        const isIncrease = stat.changeType === "increase"

        return (
          <Card key={index} className="shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.iconBgClass} group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-4 w-4 ${stat.iconTextClass}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs px-2 py-0.5 rounded-full ${stat.badgeBgClass} ${stat.badgeTextClass}`}>
                    {isIncrease ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {stat.change}
                  </Badge>
                  <span className="text-sm text-gray-500">{stat.description}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
