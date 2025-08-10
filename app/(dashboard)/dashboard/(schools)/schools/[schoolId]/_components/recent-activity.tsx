import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, UserPlus, FileText, AlertCircle, CheckCircle } from "lucide-react"

const recentActivities = [
  {
    type: "enrollment",
    title: "New Student Enrolled",
    description: "Sarah Johnson enrolled in Grade 10-A",
    time: "2 hours ago",
    icon: UserPlus,
    color: "text-green-600",
  },
  {
    type: "report",
    title: "Monthly Report Generated",
    description: "Academic performance report for December",
    time: "4 hours ago",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    type: "alert",
    title: "Attendance Alert",
    description: "Grade 9-C attendance below threshold",
    time: "6 hours ago",
    icon: AlertCircle,
    color: "text-orange-600",
  },
  {
    type: "completion",
    title: "Staff Training Completed",
    description: "Digital literacy training session finished",
    time: "1 day ago",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    type: "enrollment",
    title: "Student Transfer",
    description: "Mike Chen transferred to Grade 11-B",
    time: "1 day ago",
    icon: UserPlus,
    color: "text-blue-600",
  },
]

export function RecentActivity() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Activity className="h-5 w-5 mr-2 text-gray-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => {
            const Icon = activity.icon
            return (
              <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`flex-shrink-0 mt-1 ${activity.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">{activity.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
