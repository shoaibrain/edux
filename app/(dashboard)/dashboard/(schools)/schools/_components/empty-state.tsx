"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Building2, BookOpen, Users, ArrowUp } from "lucide-react"

interface EmptyStateProps {
  canCreateSchool: boolean
}

export function EmptyState({ canCreateSchool }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full animate-pulse" />
        <div className="relative p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full">
          <Building2 className="h-12 w-12 text-blue-600" />
        </div>
      </div>

      <div className="text-center max-w-md">
        <h3 className="text-2xl font-semibold  mb-2">No Schools Yet</h3>
        <p className="mb-8">
          Get started by creating your first school. You will be able to manage students, teachers, and all academic
          activities from a centralized dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
        <Card className="text-center p-4 border-dashed border-2 border-gray-200 hover:border-blue-300 transition-colors">
          <CardContent className="p-0">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Manage Students</p>
            <p className="text-xs">Track enrollment & progress</p>
          </CardContent>
        </Card>

        <Card className="text-center p-4 border-dashed border-2 border-gray-200 hover:border-green-300 transition-colors">
          <CardContent className="p-0">
            <BookOpen className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Course Management</p>
            <p className="text-xs">Organize curriculum</p>
          </CardContent>
        </Card>

        <Card className="text-center p-4 border-dashed border-2 border-gray-200 hover:border-purple-300 transition-colors">
          <CardContent className="p-0">
            <Building2 className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium">School Operations</p>
            <p className="text-xs">Administrative tools</p>
          </CardContent>
        </Card>
      </div>

      {/* Point users to the existing create button */}
      {canCreateSchool && (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
            <ArrowUp className="h-4 w-4" />
            <p className="text-sm font-medium">Ready to get started?</p>
          </div>
          <p className="text-sm">Use the Create School button in the top right corner to begin.</p>
        </div>
      )}
    </div>
  )
}
