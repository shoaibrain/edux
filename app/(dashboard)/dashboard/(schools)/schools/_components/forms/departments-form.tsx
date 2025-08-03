"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Building } from "lucide-react"
import { Department, SchoolFormData } from "../types/school-forms"

interface DepartmentsFormProps {
  data: SchoolFormData
  updateData: (updates: Partial<SchoolFormData>) => void
  errors: Record<string, string[] | undefined>
}

export function DepartmentsForm({ data, updateData, errors }: DepartmentsFormProps) {
  const addDepartment = () => {
    const newDepartment: Department = {
      id: Date.now().toString(),
      name: "",
      description: "",
    }
    updateData({ departments: [...data.departments, newDepartment] })
  }

  const updateDepartment = (deptId: string, updates: Partial<Department>) => {
    const updatedDepartments = data.departments.map((dept) => (dept.id === deptId ? { ...dept, ...updates } : dept))
    updateData({ departments: updatedDepartments })
  }

  const removeDepartment = (deptId: string) => {
    const updatedDepartments = data.departments.filter((dept) => dept.id !== deptId)
    updateData({ departments: updatedDepartments })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building className="h-5 w-5" />
            School Departments
          </h3>
          <p className="text-sm text-gray-600">Organize your school into departments or divisions</p>
        </div>
        <Button onClick={addDepartment} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      {data.departments.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              No departments defined yet.
              <br />
              Click Add Department to create your first department.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {data.departments.map((department, index) => (
          <div
            key={department.id}
            className="group border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`dept-name-${department.id}`} className="text-sm font-medium text-gray-700">
                    Department Name *
                  </Label>
                  <Input
                    id={`dept-name-${department.id}`}
                    value={department.name}
                    onChange={(e) => updateDepartment(department.id!, { name: e.target.value })}
                    placeholder="Mathematics Department"
                    className={`mt-1 h-9 ${errors[`departments[${index}].name`] ? "border-red-500" : ""}`}
                  />
                  {errors[`departments[${index}].name`] && <p className="mt-1 text-xs text-red-600">{errors[`departments[${index}].name`]?.[0]}</p>}
                </div>
                <div>
                  <Label htmlFor={`dept-desc-${department.id}`} className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Input
                    id={`dept-desc-${department.id}`}
                    value={department.description || ''}
                    onChange={(e) => updateDepartment(department.id!, { description: e.target.value })}
                    placeholder="Brief description..."
                    className="mt-1 h-9"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDepartment(department.id!)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity mt-6"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}