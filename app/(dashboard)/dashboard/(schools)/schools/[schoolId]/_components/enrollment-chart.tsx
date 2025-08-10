"use client"
import { Badge } from "@/components/ui/badge"

const enrollmentData = [
  { month: "Jan", students: 1180, target: 1200 },
  { month: "Feb", students: 1195, target: 1200 },
  { month: "Mar", students: 1210, target: 1220 },
  { month: "Apr", students: 1225, target: 1240 },
  { month: "May", students: 1234, target: 1250 },
  { month: "Jun", students: 1240, target: 1260 },
]

export function EnrollmentChart() {
  const maxValue = Math.max(...enrollmentData.map((d) => Math.max(d.students, d.target)))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Current: 1,234 students
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Target: 1,260 students
          </Badge>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between space-x-2">
        {enrollmentData.map((data, index) => {
          const studentHeight = (data.students / maxValue) * 100
          const targetHeight = (data.target / maxValue) * 100

          return (
            <div key={index} className="flex-1 flex flex-col items-center space-y-2">
              <div className="w-full flex justify-center space-x-1 h-48 items-end">
                <div
                  className="bg-blue-500 rounded-t-md flex-1 min-h-[4px] relative group hover:bg-blue-600 transition-colors"
                  style={{ height: `${studentHeight}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.students}
                  </div>
                </div>
                <div
                  className="bg-green-300 rounded-t-md flex-1 min-h-[4px] relative group hover:bg-green-400 transition-colors"
                  style={{ height: `${targetHeight}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.target}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-600 font-medium">{data.month}</span>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Actual Enrollment</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-300 rounded"></div>
          <span className="text-gray-600">Target Enrollment</span>
        </div>
      </div>
    </div>
  )
}
