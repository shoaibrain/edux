"use client"

import { Badge } from "@/components/ui/badge"

const performanceData = [
  { grade: "A", percentage: 25, count: 308 },
  { grade: "B", percentage: 35, count: 432 },
  { grade: "C", percentage: 28, count: 346 },
  { grade: "D", percentage: 8, count: 99 },
  { grade: "F", percentage: 4, count: 49 },
]

const gradeColors = {
  A: "bg-green-500",
  B: "bg-blue-500",
  C: "bg-yellow-500",
  D: "bg-orange-500",
  F: "bg-red-500",
}

export function AcademicPerformanceChart() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Overall GPA: 3.2
        </Badge>
      </div>

      <div className="space-y-3">
        {performanceData.map((data, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Grade {data.grade}</span>
              <span className="">
                {data.count} students ({data.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${gradeColors[data.grade as keyof typeof gradeColors]}`}
                style={{ width: `${data.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-500 text-center">
          Based on current semester performance across all subjects
        </div>
      </div>
    </div>
  )
}
