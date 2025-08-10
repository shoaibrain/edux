import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, FileText, Calendar, Settings, Download, Bell, Users } from "lucide-react"

const quickActions = [
  {
    title: "Add Student",
    icon: UserPlus,
    color: "bg-blue-500 hover:bg-blue-600",
    description: "Enroll new student",
  },
  {
    title: "Generate Report",
    icon: FileText,
    color: "bg-green-500 hover:bg-green-600",
    description: "Academic reports",
  },
  {
    title: "Schedule Event",
    icon: Calendar,
    color: "bg-purple-500 hover:bg-purple-600",
    description: "Add to calendar",
  },
  {
    title: "Send Notice",
    icon: Bell,
    color: "bg-orange-500 hover:bg-orange-600",
    description: "Notify parents/staff",
  },
  {
    title: "Staff Meeting",
    icon: Users,
    color: "bg-indigo-500 hover:bg-indigo-600",
    description: "Schedule meeting",
  },
  {
    title: "Export Data",
    icon: Download,
    color: "bg-teal-500 hover:bg-teal-600",
    description: "Download reports",
  },
]

export function QuickActions() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Settings className="h-5 w-5 mr-2 text-gray-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200 border-gray-200 bg-transparent"
              >
                <div className={`p-2 rounded-lg text-white ${action.color} transition-colors`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">{action.title}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
