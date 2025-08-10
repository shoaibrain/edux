"use client"

import type React from "react"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, MoreVertical, Settings, Eye, Globe, Mail, Phone, Calendar, LayoutDashboard, TrashIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Match your existing School type exactly
interface School {
  id: number
  name: string
  address: string | null
  email: string | null
  phone: string | null
  website: string | null
  logoUrl: string | null
  brandingJson: unknown
  createdAt: Date
  updatedAt: Date
  // Optional fields that might be added later
  studentCount?: number
  teacherCount?: number
  status?: "active" | "inactive"
  type?: string
}

interface EnhancedSchoolCardProps {
  school: School
  canEditSchool: boolean
  canDeleteSchool?: boolean
}

export function EnhancedSchoolCard({ school, canEditSchool, canDeleteSchool = false }: EnhancedSchoolCardProps) {
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = `/dashboard/schools/${school.id}`
  }

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = `/dashboard/schools/${school.id}/settings`
  }

  const cardContent = (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 shadow-lg h-full">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-blue-50/50 to-purple-50/80 opacity-0 group-hover:opacity-100 transition-all duration-500" />

      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="relative pb-4 pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {school.logoUrl ? (
              <div className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 group-hover:border-blue-200 transition-colors">
                <img
                  src={school.logoUrl || "/placeholder.svg"}
                  alt={`${school.name} logo`}
                  className="h-10 w-10 object-contain"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                <Building2 className="h-6 w-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold group-hover:text-blue-700 transition-colors duration-300 line-clamp-2 leading-tight">
                {school.name}
              </h3>
              <div className="flex items-center space-x-2 mt-2">
                <Badge
                  variant={school.status === "active" ? "default" : "secondary"}
                  className="text-xs font-medium px-2 py-1"
                >
                  {school.status || "Active"}
                </Badge>
                {school.type && (
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    {school.type}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {(canEditSchool || canDeleteSchool) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-50 h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleDashboardClick} className="cursor-pointer">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                {canEditSchool && (
                  <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                )}
                {canDeleteSchool && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 cursor-pointer">
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete School
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative pt-0 pb-6">
        {/* Contact Information - Fixed height container */}
        <div className="space-y-3 mb-6 min-h-[120px]">
          {school.address && (
            <div className="flex items-start space-x-3">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm line-clamp-2 leading-relaxed">{school.address}</span>
            </div>
          )}

          {school.email && (
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm truncate">{school.email}</span>
            </div>
          )}

          {school.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{school.phone}</span>
            </div>
          )}

          {school.website && (
            <div className="flex items-center space-x-3">
              <Globe className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm truncate">{school.website}</span>
            </div>
          )}
        </div>

        {/* Bottom section - Fixed position */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <Calendar className="h-3 w-3" />
              <span>Created {school.createdAt.toLocaleDateString()}</span>
            </div>

            {canEditSchool && (
              <Button
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 text-xs font-medium"
              >
                Manage →
              </Button>
            )}
          </div>

          {!canEditSchool && <p className="text-xs mt-2">No permission to manage this school.</p>}
        </div>
      </CardContent>
    </Card>
  )

  // Use conditional rendering for navigation
  if (canEditSchool) {
    return <Link href={`/dashboard/schools/${school.id}`}>{cardContent}</Link>
  }

  return cardContent
}
