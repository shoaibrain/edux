"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, GraduationCap, ArrowUp, ArrowDown } from "lucide-react"
import { GradeLevel, SchoolFormData } from "../types/school-forms"

interface GradeLevelsFormProps {
  data: SchoolFormData
  updateData: (updates: Partial<SchoolFormData>) => void
  // FIX: Update the error type to match Zod's fieldErrors
  errors: Record<string, string[] | undefined>
}

export function GradeLevelsForm({ data, updateData, errors }: GradeLevelsFormProps) {
  const addGradeLevel = () => {
    const nextOrder = data.gradeLevels.length > 0 ? Math.max(...data.gradeLevels.map((g) => g.levelOrder), 0) + 1 : 1
    const newGrade: GradeLevel = {
      id: Date.now().toString(),
      name: "",
      levelOrder: nextOrder,
      description: "",
    }
    updateData({ gradeLevels: [...data.gradeLevels, newGrade] })
  }

  const updateGradeLevel = (gradeId: string, updates: Partial<GradeLevel>) => {
    const updatedGrades = data.gradeLevels.map((grade) => (grade.id === gradeId ? { ...grade, ...updates } : grade))
    updateData({ gradeLevels: updatedGrades })
  }

  const removeGradeLevel = (gradeId: string) => {
    const updatedGrades = data.gradeLevels.filter((grade) => grade.id !== gradeId)
    const reorderedGrades = updatedGrades
      .sort((a, b) => a.levelOrder - b.levelOrder)
      .map((grade, index) => ({ ...grade, levelOrder: index + 1 }))
    updateData({ gradeLevels: reorderedGrades })
  }

  const moveGrade = (gradeId: string, direction: "up" | "down") => {
    const sortedGrades = [...data.gradeLevels].sort((a, b) => a.levelOrder - b.levelOrder)
    const currentIndex = sortedGrades.findIndex((g) => g.id === gradeId)

    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === sortedGrades.length - 1)
    ) {
      return
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const updatedGrades = [...sortedGrades]
    ;[updatedGrades[currentIndex], updatedGrades[newIndex]] = [updatedGrades[newIndex], updatedGrades[currentIndex]]
    const reorderedGrades = updatedGrades.map((grade, index) => ({
      ...grade,
      levelOrder: index + 1,
    }))
    updateData({ gradeLevels: reorderedGrades })
  }

  const sortedGrades = [...data.gradeLevels].sort((a, b) => a.levelOrder - b.levelOrder)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Grade Levels
          </h3>
          <p className="text-sm text-gray-600">Define the grade levels or classes in your school</p>
        </div>
        <Button onClick={addGradeLevel} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Grade Level
        </Button>
      </div>

      {data.gradeLevels.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              No grade levels defined yet.
              <br />
              Click Add Grade Level to create your first grade.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {sortedGrades.map((grade, index) => (
          <Card key={grade.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    #{grade.levelOrder}
                  </Badge>
                  <CardTitle className="text-base">{grade.name || "Untitled Grade Level"}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => moveGrade(grade.id!, "up")} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveGrade(grade.id!, "down")}
                    disabled={index === sortedGrades.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGradeLevel(grade.id!)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`grade-name-${grade.id}`}>Grade Name *</Label>
                  <Input
                    id={`grade-name-${grade.id}`}
                    value={grade.name}
                    onChange={(e) => updateGradeLevel(grade.id!, { name: e.target.value })}
                    placeholder="Grade 1, Kindergarten, Senior Year..."
                    className={`mt-1 ${errors[`gradeLevels[${index}].name`] ? "border-red-500" : ""}`}
                  />
                  {/* FIX: Display the first error in the array */}
                  {errors[`gradeLevels[${index}].name`] && <p className="mt-1 text-xs text-red-600">{errors[`gradeLevels[${index}].name`]?.[0]}</p>}
                </div>
                <div>
                  <Label htmlFor={`grade-order-${grade.id}`}>Level Order</Label>
                  <Input
                    id={`grade-order-${grade.id}`}
                    type="number"
                    value={grade.levelOrder}
                    onChange={(e) => updateGradeLevel(grade.id!, { levelOrder: Number.parseInt(e.target.value) || 1 })}
                    className={`mt-1 ${errors[`gradeLevels[${index}].levelOrder`] ? "border-red-500" : ""}`}
                    min="1"
                  />
                  {/* FIX: Display the first error in the array */}
                  {errors[`gradeLevels[${index}].levelOrder`] && <p className="mt-1 text-xs text-red-600">{errors[`gradeLevels[${index}].levelOrder`]?.[0]}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor={`grade-desc-${grade.id}`}>Description</Label>
                <Textarea
                  id={`grade-desc-${grade.id}`}
                  value={grade.description || ''}
                  onChange={(e) => updateGradeLevel(grade.id!, { description: e.target.value })}
                  placeholder="Brief description of this grade level"
                  className="mt-1 min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
