import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Award, BookOpen } from "lucide-react"

const staffData = [
  {
    department: "Mathematics",
    teachers: 12,
    ratio: "1:18",
    performance: 4.2,
    status: "optimal",
  },
  {
    department: "Science",
    teachers: 10,
    ratio: "1:20",
    performance: 4.5,
    status: "excellent",
  },
  {
    department: "English",
    teachers: 8,
    ratio: "1:22",
    performance: 4.1,
    status: "good",
  },
  {
    department: "History",
    teachers: 6,
    ratio: "1:25",
    performance: 3.9,
    status: "needs_attention",
  },
  {
    department: "Arts",
    teachers: 5,
    ratio: "1:15",
    performance: 4.3,
    status: "excellent",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "excellent":
      return "bg-green-100 text-green-800 border-green-200"
    case "optimal":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "good":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "needs_attention":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function StaffMetrics() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Users className="h-5 w-5 mr-2 text-blue-600" />
          Staff Performance & Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {staffData.map((dept, index) => (
            <div key={index} className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{dept.department}</h4>
                <Badge variant="outline" className={getStatusColor(dept.status)}>
                  {dept.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{dept.teachers}</div>
                    <div className="text-gray-500">Teachers</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{dept.ratio}</div>
                    <div className="text-gray-500">Student Ratio</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{dept.performance}/5.0</div>
                    <div className="text-gray-500">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">87</div>
              <div className="text-gray-500">Total Staff</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">4.2</div>
              <div className="text-gray-500">Avg Rating</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
