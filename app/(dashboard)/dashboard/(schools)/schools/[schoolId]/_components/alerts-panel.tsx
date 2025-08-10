import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"

const alerts = [
  {
    type: "warning",
    title: "Low Attendance Alert",
    message: "Grade 10-B has 78% attendance this week",
    time: "2 hours ago",
    priority: "medium",
  },
  {
    type: "info",
    title: "Parent-Teacher Conference",
    message: "Scheduled for next Friday at 2:00 PM",
    time: "4 hours ago",
    priority: "low",
  },
  {
    type: "error",
    title: "System Maintenance",
    message: "Student portal will be down tonight 11 PM - 2 AM",
    time: "6 hours ago",
    priority: "high",
  },
  {
    type: "success",
    title: "Budget Approved",
    message: "Q2 budget has been approved by the board",
    time: "1 day ago",
    priority: "low",
  },
]

const getAlertIcon = (type: string) => {
  switch (type) {
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    case "error":
      return <XCircle className="h-4 w-4 text-red-600" />
    case "info":
      return <Info className="h-4 w-4 text-blue-600" />
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    default:
      return <Info className="h-4 w-4 text-gray-600" />
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "low":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function AlertsPanel() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
          Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div key={index} className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{alert.title}</h4>
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(alert.priority)}`}>
                      {alert.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                  <p className="text-xs text-gray-400">{alert.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
