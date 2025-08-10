"use client"

import { Badge } from "@/components/ui/badge"

const attendanceData = [
  { day: "Mon", rate: 96 },
  { day: "Tue", rate: 94 },
  { day: "Wed", rate: 92 },
  { day: "Thu", rate: 95 },
  { day: "Fri", rate: 89 },
  { day: "Sat", rate: 87 },
  { day: "Sun", rate: 0 },
]

export function AttendanceChart() {
  const weeklyAverage = Math.round(attendanceData.slice(0, 6).reduce((sum, day) => sum + day.rate, 0) / 6)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Weekly Avg: {weeklyAverage}%
        </Badge>
      </div>

      <div className="h-32 flex items-end justify-between space-x-1">
        {attendanceData.slice(0, 6).map((data, index) => {
          const height = data.rate
          const color = data.rate >= 95 ? "bg-green-500" : data.rate >= 90 ? "bg-yellow-500" : "bg-red-500"

          return (
            <div key={index} className="flex-1 flex flex-col items-center space-y-2">
              <div className="w-full h-24 flex items-end">
                <div
                  className={`w-full rounded-t-md min-h-[4px] relative group hover:opacity-80 transition-opacity ${color}`}
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.rate}%
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium">{data.day}</span>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded"></div>
          <span className="text-gray-600">95%+</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-yellow-500 rounded"></div>
          <span className="text-gray-600">90-94%</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded"></div>
          <span className="text-gray-600">&lt;90%</span>
        </div>
      </div>
    </div>
  )
}
