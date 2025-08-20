"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, Edit, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTenant } from "@/components/tenant-provider";
import { 
  getAcademicYears, 
  createAcademicYear, 
  updateAcademicYear, 
  deleteAcademicYear 
} from "@/lib/actions/academic";
import { CreateAcademicYearOptions, AcademicYear, AcademicTerm } from "@/lib/types/academic";
import { toast } from "sonner";

interface AcademicYearManagerProps {
  schoolId: string;
  tenantId: string;
  onAcademicYearCreate: (academicYear: AcademicYear) => void;
}

export function AcademicYearManager({ schoolId, tenantId, onAcademicYearCreate }: AcademicYearManagerProps) {

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [expandedYear, setExpandedYear] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<CreateAcademicYearOptions>({
    yearName: "",
    startDate: new Date(),
    endDate: new Date(),
    isCurrent: false,
    schoolId,
    terms: [],
  });

  const [newTerm, setNewTerm] = useState({
    termName: "",
    startDate: new Date(),
    endDate: new Date(),
  });

  useEffect(() => {
    if (tenantId) {
      loadAcademicYears();
    }
  }, [schoolId, tenantId]);

  const loadAcademicYears = async () => {
    if (!tenantId) return;
    
    try {
      const years = await getAcademicYears(schoolId, tenantId);
      setAcademicYears(years);
    } catch (error) {
      console.error('Error loading academic years:', error);
      toast.error('Failed to load academic years');
    }
  };

  const handleCreateAcademicYear = async () => {
    if (!validateForm() || !tenantId) return;

    setIsLoading(true);
    try {
      const result = await createAcademicYear(formData, tenantId);
      
      if (result.success && result.data) {
        setAcademicYears(prev => [...prev, result.data!]);
        onAcademicYearCreate(result.data);
        setShowCreateForm(false);
        resetForm();
        toast.success('Academic year created successfully');
      } else {
        toast.error(result.error || 'Failed to create academic year');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create academic year');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAcademicYear = async (academicYearId: string) => {
    if (!tenantId || !confirm('Are you sure you want to delete this academic year? This will also delete all associated terms.')) {
      return;
    }

    try {
      const result = await deleteAcademicYear(academicYearId, schoolId, tenantId);
      
      if (result.success) {
        setAcademicYears(prev => prev.filter(year => year.id !== academicYearId));
        toast.success('Academic year deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete academic year');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete academic year');
    }
  };

  const addTerm = () => {
    if (!newTerm.termName.trim()) return;

    setFormData(prev => ({
      ...prev,
      terms: [...prev.terms, { 
        termName: newTerm.termName,
        startDate: newTerm.startDate,
        endDate: newTerm.endDate,
      }]
    }));

    setNewTerm({
      termName: "",
      startDate: new Date(),
      endDate: new Date(),
    });
  };

  const removeTerm = (index: number) => {
    setFormData(prev => ({
      ...prev,
      terms: prev.terms.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.yearName.trim()) {
      toast.error('Year name is required');
      return false;
    }

    if (formData.terms.length === 0) {
      toast.error('At least one term is required');
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      yearName: "",
      startDate: new Date(),
      endDate: new Date(),
      isCurrent: false,
      schoolId,
      terms: [],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Define your schools academic calendar structure
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant={showCreateForm ? "outline" : "default"}
        >
          {showCreateForm ? "Cancel" : "Add Academic Year"}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Academic Year</CardTitle>
            <CardDescription>
              Set up the academic year with terms and important dates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yearName">Year Name *</Label>
                <Input
                  id="yearName"
                  value={formData.yearName}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearName: e.target.value }))}
                  placeholder="e.g., 2024-2025"
                />
              </div>
              <div className="space-y-2">
                <Label>Current Year</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isCurrent}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isCurrent: checked }))}
                  />
                  <span className="text-sm text-muted-foreground">
                    Mark as current academic year
                  </span>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Terms Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Academic Terms</Label>
                <Button onClick={addTerm} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Term
                </Button>
              </div>

              {/* New Term Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Term Name</Label>
                  <Input
                    value={newTerm.termName}
                    onChange={(e) => setNewTerm(prev => ({ ...prev, termName: e.target.value }))}
                    placeholder="e.g., Fall Semester"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newTerm.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTerm.startDate ? format(newTerm.startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newTerm.startDate}
                        onSelect={(date) => date && setNewTerm(prev => ({ ...prev, startDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newTerm.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTerm.endDate ? format(newTerm.endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newTerm.endDate}
                        onSelect={(date) => date && setNewTerm(prev => ({ ...prev, endDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Existing Terms */}
              {formData.terms.map((term, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{term.termName}</span>
                    <span className="text-sm text-muted-foreground">
                      {format(term.startDate, "MMM d")} - {format(term.endDate, "MMM d, yyyy")}
                    </span>
                  </div>
                  <Button
                    onClick={() => removeTerm(index)}
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateAcademicYear} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Academic Year"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Academic Years */}
      {academicYears.map((academicYear) => (
        <Card key={academicYear.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedYear(expandedYear === academicYear.id ? null : academicYear.id)}
                >
                  {expandedYear === academicYear.id ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{academicYear.yearName}</span>
                    {academicYear.isCurrent && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Current
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {format(academicYear.startDate, "MMM d, yyyy")} - {format(academicYear.endDate, "MMM d, yyyy")}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteAcademicYear(academicYear.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {expandedYear === academicYear.id && (
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Academic Terms</h4>
                  <div className="space-y-2">
                    {academicYear.terms.map((term) => (
                      <div key={term.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{term.termName}</span>
                          <span className="text-sm text-muted-foreground ml-3">
                            {format(term.startDate, "MMM d")} - {format(term.endDate, "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            term.isActive 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {term.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
