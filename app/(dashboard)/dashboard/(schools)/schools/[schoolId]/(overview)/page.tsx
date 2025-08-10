import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Clock, Award, UserCheck, BarChart3, Activity } from "lucide-react"
import { StatsCards } from "../_components/stats-cards"
import { EnrollmentChart } from "../_components/enrollment-chart"
import { AcademicPerformanceChart } from "../_components/academic-performance-chart"
import { AttendanceChart } from "../_components/attendance-chart"
import { FinancialOverview } from "../_components/financial-overview"
import { StaffMetrics } from "../_components/staff-metrics"
import { AlertsPanel } from "../_components/alerts-panel"
import { QuickActions } from "../_components/quick-actions"
import { UpcomingEvents } from "../_components/upcoming-events"
import { RecentActivity } from "../_components/recent-activity"
import { getSession } from "@/lib/session"
import { getTenantDb } from "@/lib/db"
import { eq } from "drizzle-orm"
import {schools} from "@/lib/db/schema/tenant";
import {notFound} from "next/navigation";

// This School Dashboard page is a dynamic page.
// Get school data from the server by schoolId
export default async function SchoolDashboardPage({
  params,
}: {
  params: { schoolId: string }
}) {
    const session = await getSession()
  const schoolId = parseInt(params.schoolId, 10)

    if (isNaN(schoolId)) {
    notFound()
  }

    const db = await getTenantDb(session.tenantId)
  const school = await db.query.schools.findFirst({
    where: eq(schools.id, schoolId),
  })

  if (!school) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7.5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{school.name} Dashboard</h1>
            <p className=" mt-1">Welcome back! Heres whats happening at {school.name} today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              Last updated: 2 min ago
            </Badge>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </div>
        </div>

        {/* Key Stats Cards */}
        <Suspense fallback={<div>Loading stats...</div>}>
          <StatsCards />
        </Suspense>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts and Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enrollment Trends */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Enrollment Trends
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <EnrollmentChart />
              </CardContent>
            </Card>

            {/* Academic Performance & Attendance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Award className="h-5 w-5 mr-2 text-green-600" />
                    Academic Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AcademicPerformanceChart />
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-purple-600" />
                    Attendance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AttendanceChart />
                </CardContent>
              </Card>
            </div>

            {/* Financial Overview */}
            <FinancialOverview />

            {/* Staff Metrics */}
            <StaffMetrics />
          </div>

          {/* Right Column - Activities and Quick Actions */}
          <div className="space-y-6">
            {/* Alerts Panel */}
            <AlertsPanel />

            {/* Quick Actions */}
            <QuickActions />

            {/* Upcoming Events */}
            <UpcomingEvents />

            {/* Recent Activity */}
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  )
}
