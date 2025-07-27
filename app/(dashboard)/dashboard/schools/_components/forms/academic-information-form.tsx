"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import { BookOpen, Calendar, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { AcademicTerm, AcademicYear, SchoolFormData } from "../types/school-forms"

interface AcademicInformationFormProps {
  data: SchoolFormData
  updateData: (updates: Partial<SchoolFormData>) => void
  // FIX: Update the error type to match Zod's fieldErrors
  errors: Record<string, string[] | undefined>
}

export function AcademicInformationForm({ data, updateData, errors }: AcademicInformationFormProps) {
  const [expandedYear, setExpandedYear] = useState<string | null>(null)

  const addAcademicYear = () => {
    const newYear: AcademicYear = {
      id: Date.now().toString(),
      yearName: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      terms: [],
    }
    updateData({ academicYears: [...data.academicYears, newYear] })
  }

  const updateAcademicYear = (yearId: string, updates: Partial<AcademicYear>) => {
    const updatedYears = data.academicYears.map((year) => (year.id === yearId ? { ...year, ...updates } : year))
    updateData({ academicYears: updatedYears })
  }

  const removeAcademicYear = (yearId: string) => {
    const updatedYears = data.academicYears.filter((year) => year.id !== yearId)
    updateData({ academicYears: updatedYears })
  }

  const addTerm = (yearId: string) => {
    const newTerm: AcademicTerm = {
      id: Date.now().toString(),
      termName: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
    }
    const updatedYears = data.academicYears.map((year) =>
        year.id === yearId ? { ...year, terms: [...year.terms, newTerm] } : year,
    )
    updateData({ academicYears: updatedYears })
  }

  const updateTerm = (yearId: string, termId: string, updates: Partial<AcademicTerm>) => {
    const updatedYears = data.academicYears.map((year) =>
        year.id === yearId
            ? {
              ...year,
              terms: year.terms.map((term) => (term.id === termId ? { ...term, ...updates } : term)),
            }
            : year,
    )
    updateData({ academicYears: updatedYears })
  }

  const removeTerm = (yearId: string, termId: string) => {
    const updatedYears = data.academicYears.map((year) =>
        year.id === yearId ? { ...year, terms: year.terms.filter((term) => term.id !== termId) } : year,
    )
    updateData({ academicYears: updatedYears })
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Academic Years
            </h3>
            <p className="text-sm text-gray-600">Define your schools academic calendar structure</p>
          </div>
          <Button onClick={addAcademicYear} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Academic Year
          </Button>
        </div>

        {data.academicYears.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  No academic years defined yet.
                  <br />
                  Click Add Academic Year to get started.
                </p>
              </CardContent>
            </Card>
        )}

        <div className="space-y-4">
          {data.academicYears.map((year, yearIndex) => (
              <div
                  key={year.id}
                  className="group border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">{year.yearName || "Untitled Academic Year"}</h3>
                      {year.isCurrent && (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            Current
                          </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                          variant="ghost"
                          size="sm"
                          // FIX: Ensure a null value is passed if year.id is undefined
                          onClick={() => setExpandedYear(expandedYear === year.id ? null : year.id ?? null)}
                          className="text-gray-500 hover:text-gray-700"
                      >
                        {expandedYear === year.id ? "Collapse" : "Expand"}
                      </Button>
                      <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAcademicYear(year.id!)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`year-name-${year.id}`} className="text-sm font-medium text-gray-700">
                        Year Name *
                      </Label>
                      <Input
                          id={`year-name-${year.id}`}
                          value={year.yearName}
                          onChange={(e) => updateAcademicYear(year.id!, { yearName: e.target.value })}
                          placeholder="2024-2025"
                          className={`mt-1 h-9 ${errors[`academicYears[${yearIndex}].yearName`] ? "border-red-500" : ""}`}
                      />
                      {errors[`academicYears[${yearIndex}].yearName`] && <p className="mt-1 text-xs text-red-600">{errors[`academicYears[${yearIndex}].yearName`]?.[0]}</p>}
                    </div>
                    <div>
                      <Label htmlFor={`start-date-${year.id}`} className="text-sm font-medium text-gray-700">
                        Start Date *
                      </Label>
                      <Input
                          id={`start-date-${year.id}`}
                          type="date"
                          value={year.startDate}
                          onChange={(e) => updateAcademicYear(year.id!, { startDate: e.target.value })}
                          className={`mt-1 h-9 ${errors[`academicYears[${yearIndex}].startDate`] ? "border-red-500" : ""}`}
                      />
                      {errors[`academicYears[${yearIndex}].startDate`] && <p className="mt-1 text-xs text-red-600">{errors[`academicYears[${yearIndex}].startDate`]?.[0]}</p>}
                    </div>
                    <div>
                      <Label htmlFor={`end-date-${year.id}`} className="text-sm font-medium text-gray-700">
                        End Date *
                      </Label>
                      <Input
                          id={`end-date-${year.id}`}
                          type="date"
                          value={year.endDate}
                          onChange={(e) => updateAcademicYear(year.id!, { endDate: e.target.value })}
                          className={`mt-1 h-9 ${errors[`academicYears[${yearIndex}].endDate`] ? "border-red-500" : ""}`}
                      />
                      {errors[`academicYears[${yearIndex}].endDate`] && <p className="mt-1 text-xs text-red-600">{errors[`academicYears[${yearIndex}].endDate`]?.[0]}</p>}
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center space-x-2">
                        <Switch
                            id={`current-year-${year.id}`}
                            checked={year.isCurrent}
                            onCheckedChange={(checked) => updateAcademicYear(year.id!, { isCurrent: checked })}
                        />
                        <Label htmlFor={`current-year-${year.id}`} className="text-sm text-gray-700">
                          Current
                        </Label>
                      </div>
                    </div>
                  </div>

                  {expandedYear === year.id && (
                      <div className="border-t mt-4 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Academic Terms
                          </h4>
                          <Button variant="outline" size="sm" onClick={() => addTerm(year.id!)} className="h-8 text-xs">
                            <Plus className="h-3 w-3 mr-1" />
                            Add Term
                          </Button>
                        </div>

                        {year.terms.length === 0 ? (
                            <>
                              <p className="text-sm text-gray-500 text-center py-3 bg-gray-50 rounded">
                                No terms defined for this academic year
                              </p>
                              {errors[`academicYears[${yearIndex}].terms`] && <p className="mt-1 text-xs text-red-600 text-center">{errors[`academicYears[${yearIndex}].terms`]?.[0]}</p>}
                            </>
                        ) : (
                            <div className="space-y-2">
                              {year.terms.map((term, termIndex) => (
                                  <div key={term.id} className="bg-gray-50 p-3 rounded border">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                                      <div>
                                        <Label htmlFor={`term-name-${term.id}`} className="text-xs text-gray-600">
                                          Term Name
                                        </Label>
                                        <Input
                                            id={`term-name-${term.id}`}
                                            value={term.termName}
                                            onChange={(e) => updateTerm(year.id!, term.id!, { termName: e.target.value })}
                                            placeholder="Fall Semester"
                                            className={`mt-1 h-8 text-sm ${errors[`academicYears[${yearIndex}].terms[${termIndex}].termName`] ? "border-red-500" : ""}`}
                                        />
                                        {errors[`academicYears[${yearIndex}].terms[${termIndex}].termName`] && <p className="mt-1 text-xs text-red-600">{errors[`academicYears[${yearIndex}].terms[${termIndex}].termName`]?.[0]}</p>}
                                      </div>
                                      <div>
                                        <Label htmlFor={`term-start-${term.id}`} className="text-xs text-gray-600">
                                          Start Date
                                        </Label>
                                        <Input
                                            id={`term-start-${term.id}`}
                                            type="date"
                                            value={term.startDate}
                                            onChange={(e) => updateTerm(year.id!, term.id!, { startDate: e.target.value })}
                                            className={`mt-1 h-8 text-sm ${errors[`academicYears[${yearIndex}].terms[${termIndex}].startDate`] ? "border-red-500" : ""}`}
                                        />
                                        {errors[`academicYears[${yearIndex}].terms[${termIndex}].startDate`] && <p className="mt-1 text-xs text-red-600">{errors[`academicYears[${yearIndex}].terms[${termIndex}].startDate`]?.[0]}</p>}
                                      </div>
                                      <div>
                                        <Label htmlFor={`term-end-${term.id}`} className="text-xs text-gray-600">
                                          End Date
                                        </Label>
                                        <Input
                                            id={`term-end-${term.id}`}
                                            type="date"
                                            value={term.endDate}
                                            onChange={(e) => updateTerm(year.id!, term.id!, { endDate: e.target.value })}
                                            className={`mt-1 h-8 text-sm ${errors[`academicYears[${yearIndex}].terms[${termIndex}].endDate`] ? "border-red-500" : ""}`}
                                        />
                                        {errors[`academicYears[${yearIndex}].terms[${termIndex}].endDate`] && <p className="mt-1 text-xs text-red-600">{errors[`academicYears[${yearIndex}].terms[${termIndex}].endDate`]?.[0]}</p>}
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                            id={`current-term-${term.id}`}
                                            checked={term.isCurrent}
                                            onCheckedChange={(checked) => updateTerm(year.id!, term.id!, { isCurrent: checked })}
                                        />
                                        <Label htmlFor={`current-term-${term.id}`} className="text-xs text-gray-600">
                                          Current
                                        </Label>
                                      </div>
                                      <div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeTerm(year.id!, term.id!)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                              ))}
                            </div>
                        )}
                      </div>
                  )}
                </div>
              </div>
          ))}
        </div>
      </div>
  )
}
