"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Mail, Phone, MapPin } from "lucide-react"
import { SchoolFormData } from "../types/school-forms"

interface BasicInformationFormProps {
  data: Partial<SchoolFormData> // Can be partial during initial creation
  updateData: (updates: Partial<SchoolFormData>) => void
  // FIX: Update the error type to match Zod's fieldErrors
  errors: Record<string, string[] | undefined>
}

export function BasicInformationForm({ data, updateData, errors }: BasicInformationFormProps) {
  return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              School Name *
            </Label>
            <Input
                id="name"
                value={data.name || ''}
                onChange={(e) => updateData({ name: e.target.value })}
                placeholder="Enter your school name"
                className={`mt-1 ${errors.name ? "border-red-500" : ""}`}
            />
            {/* FIX: Display the first error in the array */}
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            <Textarea
                id="address"
                value={data.address || ''}
                onChange={(e) => updateData({ address: e.target.value })}
                placeholder="Enter your school's full address"
                className="mt-1 min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
                id="phone"
                value={data.phone || ''}
                onChange={(e) => updateData({ phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address *
            </Label>
            <Input
                id="email"
                type="email"
                value={data.email || ''}
                onChange={(e) => updateData({ email: e.target.value })}
                placeholder="contact@yourschool.edu"
                className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
            />
            {/* FIX: Display the first error in the array */}
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>}
          </div>
        </div>
      </div>
  );
}
