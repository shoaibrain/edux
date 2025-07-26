"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  Globe,
  Palette,
  Type,
  Layout,
  Settings,
  Monitor,
  Sun,
  Moon,
  Eye,
  Smartphone,
  Tablet,
  ComputerIcon as Desktop, // Alias ComputerIcon to Desktop
} from "lucide-react"
import { BrandingConfig, SchoolFormData } from "../types/school-forms"


interface BrandingFormProps {
  data: SchoolFormData
  updateData: (updates: Partial<SchoolFormData>) => void
  errors: Record<string, string>
}

// Ensure colorPresets and fontOptions match your BrandingConfig structure and defaults
const colorPresets = [
  { name: "Ocean Blue", primary: "#0ea5e9", secondary: "#0284c7", accent: "#38bdf8" },
  { name: "Forest Green", primary: "#10b981", secondary: "#059669", accent: "#34d399" },
  { name: "Royal Purple", primary: "#8b5cf6", secondary: "#7c3aed", accent: "#a78bfa" },
  { name: "Sunset Orange", primary: "#f97316", secondary: "#ea580c", accent: "#fb923c" },
  { name: "Rose Pink", primary: "#f43f5e", secondary: "#e11d48", accent: "#fb7185" },
  { name: "Emerald", primary: "#10b981", secondary: "#047857", accent: "#6ee7b7" },
]

const fontOptions = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "Open Sans, sans-serif" },
  { name: "Lato", value: "Lato, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
]

export function BrandingForm({ data, updateData, errors }: BrandingFormProps) {
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")

  const updateBranding = (field: keyof BrandingConfig, value: any) => { // Type field as keyof BrandingConfig
    updateData({
      branding: {
        ...data.branding,
        [field]: value,
      },
    })
  }

  const updateNestedBranding = (section: keyof BrandingConfig, field: string, value: any) => { // Type section as keyof BrandingConfig
    updateData({
      branding: {
        ...data.branding,
        [section]: {
          ...(data.branding[section] as any), // Cast to any to allow dynamic access to nested properties
          [field]: value,
        },
      },
    })
  }

  const selectColorPreset = (preset: (typeof colorPresets)[0]) => {
    updateNestedBranding("colors", "primary", preset.primary)
    updateNestedBranding("colors", "secondary", preset.secondary)
    updateNestedBranding("colors", "accent", preset.accent)
    // Update other default colors if not part of preset but needed for consistency
    updateNestedBranding("colors", "background", "#ffffff") // Assuming default white background
    updateNestedBranding("colors", "text", "#1f2937") // Assuming default dark text
  }

  return (
    <div className="space-y-8">
      {/* Website URL */}
      <div>
        <Label htmlFor="website" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Website URL
        </Label>
        <Input
          id="website"
          value={data.website || ''} // Handle nullable
          onChange={(e) => updateData({ website: e.target.value })}
          placeholder="https://www.yourschool.edu"
          className={`mt-1 ${errors.website ? "border-red-500" : ""}`}
        />
        {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
      </div>

      <Separator />

      {/* Logo Upload */}
      <div>
        <Label className="flex items-center gap-2 mb-3">
          <Upload className="h-4 w-4" />
          School Logo
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Button variant="outline" className="mb-2 bg-transparent">
                Choose File
              </Button>
              <p className="text-sm text-gray-500">Upload your school logo (PNG, JPG up to 5MB)</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Logo URL</Label> {/* Add input for logo URL */}
              <Input
                value={data.logoUrl || ''} // Handle nullable
                onChange={(e) => updateData({ logoUrl: e.target.value })}
                placeholder="https://www.yourschool.edu/logo.png"
                className={`mt-1 ${errors.logoUrl ? "border-red-500" : ""}`}
              />
              {errors.logoUrl && <p className="mt-1 text-sm text-red-600">{errors.logoUrl}</p>}
            </div>
            <div>
              <Label>Logo Position</Label>
              <Select
                value={data.branding.logo?.position || "left"}
                onValueChange={(value) => updateNestedBranding("logo", "position", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Logo Size</Label>
              <Select
                value={data.branding.logo?.size || "medium"}
                onValueChange={(value) => updateNestedBranding("logo", "size", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Branding Customization Tabs */}
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">Color Presets</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => selectColorPreset(preset)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    data.branding.colors.primary === preset.primary
                      ? "border-gray-900 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }} />
                  </div>
                  <span className="text-xs font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: "primary", label: "Primary Color" },
              { key: "secondary", label: "Secondary Color" },
              { key: "accent", label: "Accent Color" },
              { key: "background", label: "Background Color" },
              { key: "text", label: "Text Color" },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label htmlFor={`color-${key}`} className="text-sm font-medium">
                  {label}
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id={`color-${key}`}
                    type="color"
                    // Ensure type compatibility for value. 
                    // Colors are strings in BrandingConfig, but type "color" input expects string.
                    value={data.branding.colors[key as keyof typeof data.branding.colors]} 
                    onChange={(e) => updateNestedBranding("colors", key, e.target.value)}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={data.branding.colors[key as keyof typeof data.branding.colors]}
                    onChange={(e) => updateNestedBranding("colors", key, e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Heading Font</Label>
              <Select
                value={data.branding.typography.headingFont}
                onValueChange={(value) => updateNestedBranding("typography", "headingFont", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Body Font</Label>
              <Select
                value={data.branding.typography.bodyFont}
                onValueChange={(value) => updateNestedBranding("typography", "bodyFont", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Font Size</Label>
            <Select
              value={data.branding.typography.fontSize}
              onValueChange={(value) => updateNestedBranding("typography", "fontSize", value)}
            >
              <SelectTrigger className="mt-1 max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="theme" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Theme Mode</Label>
              <Select
                value={data.branding.theme.mode}
                onValueChange={(value) => updateNestedBranding("theme", "mode", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="auto">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Auto
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Border Radius</Label>
              <Select
                value={data.branding.theme.borderRadius}
                onValueChange={(value) => updateNestedBranding("theme", "borderRadius", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="shadows"
              checked={data.branding.theme.shadows}
              onCheckedChange={(checked) => updateNestedBranding("theme", "shadows", checked)}
            />
            <Label htmlFor="shadows">Enable shadows and depth effects</Label>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Sidebar Position</Label>
              <Select
                value={data.branding.layout.sidebarPosition}
                onValueChange={(value) => updateNestedBranding("layout", "sidebarPosition", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Header Style</Label>
              <Select
                value={data.branding.layout.headerStyle}
                onValueChange={(value) => updateNestedBranding("layout", "headerStyle", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="prominent">Prominent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Card Style</Label>
            <Select
              value={data.branding.layout.cardStyle}
              onValueChange={(value) => updateNestedBranding("layout", "cardStyle", value)}
            >
              <SelectTrigger className="mt-1 max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
                <SelectItem value="outlined">Outlined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Live Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Live Preview
          </Label>
          <div className="flex items-center gap-2">
            <Button
              variant={previewDevice === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewDevice("desktop")}
            >
              <Desktop className="h-4 w-4" />
            </Button>
            <Button
              variant={previewDevice === "tablet" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewDevice("tablet")}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={previewDevice === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewDevice("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          className={`border rounded-lg overflow-hidden ${
            previewDevice === "desktop"
              ? "max-w-full"
              : previewDevice === "tablet"
                ? "max-w-2xl mx-auto"
                : "max-w-sm mx-auto"
          }`}
        >
          <div
            className="min-h-[500px]"
            style={{
              backgroundColor: data.branding.colors.background,
              color: data.branding.colors.text,
              fontFamily: data.branding.typography.bodyFont,
            }}
          >
            {/* Header */}
            <div
              className={`h-16 flex items-center px-6 ${
                data.branding.layout.headerStyle === "prominent"
                  ? "h-20"
                  : data.branding.layout.headerStyle === "minimal"
                    ? "h-12"
                    : "h-16"
              }`}
              style={{ backgroundColor: data.branding.colors.primary }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`rounded-lg flex items-center justify-center text-white font-bold ${
                    data.branding.logo?.size === "large"
                      ? "w-12 h-12"
                      : data.branding.logo?.size === "small"
                        ? "w-8 h-8"
                        : "w-10 h-10"
                  }`}
                  style={{ backgroundColor: data.branding.colors.secondary }}
                >
                  {data.name.charAt(0) || "S"}
                </div>
                <div>
                  <h1
                    className="font-bold text-white"
                    style={{
                      fontFamily: data.branding.typography.headingFont,
                      fontSize:
                        data.branding.typography.fontSize === "large"
                          ? "1.25rem"
                          : data.branding.typography.fontSize === "small"
                            ? "1rem"
                            : "1.125rem",
                    }}
                  >
                    {data.name || "Your School Name"}
                  </h1>
                  <p className="text-white/80 text-sm">School Management System</p>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20"></div>
                <div className="w-8 h-8 rounded-full bg-white/20"></div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex">
              {/* Sidebar */}
              <div
                className={`w-64 min-h-[400px] p-4 ${
                  data.branding.layout.sidebarPosition === "right" ? "order-2" : ""
                }`}
                style={{ backgroundColor: data.branding.colors.background }}
              >
                <div className="space-y-2">
                  {["Dashboard", "Students", "Teachers", "Classes", "Reports"].map((item, index) => (
                    <div
                      key={item}
                      className={`p-3 rounded-lg flex items-center gap-3 ${
                        index === 0 ? "text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                      style={{
                        backgroundColor: index === 0 ? data.branding.colors.primary : "transparent",
                        borderRadius:
                          data.branding.theme.borderRadius === "large"
                            ? "12px"
                            : data.branding.theme.borderRadius === "small"
                              ? "4px"
                              : data.branding.theme.borderRadius === "none"
                                ? "0"
                                : "8px",
                      }}
                    >
                      <div className="w-5 h-5 rounded bg-current opacity-20"></div>
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Dashboard */}
              <div className="flex-1 p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Total Students", value: "1,234", color: data.branding.colors.primary },
                    { label: "Active Teachers", value: "89", color: data.branding.colors.secondary },
                    { label: "Classes", value: "45", color: data.branding.colors.accent },
                  ].map((stat, index) => (
                    <div
                      key={stat.label}
                      className={`p-4 rounded-lg ${
                        data.branding.layout.cardStyle === "elevated" && data.branding.theme.shadows
                          ? "shadow-md"
                          : data.branding.layout.cardStyle === "outlined"
                            ? "border"
                            : ""
                      }`}
                      style={{
                        backgroundColor: "white",
                        borderRadius:
                          data.branding.theme.borderRadius === "large"
                            ? "12px"
                            : data.branding.theme.borderRadius === "small"
                              ? "4px"
                              : data.branding.theme.borderRadius === "none"
                                ? "0"
                                : "8px",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                          <p
                            className="text-2xl font-bold"
                            style={{
                              color: stat.color,
                              fontFamily: data.branding.typography.headingFont,
                            }}
                          >
                            {stat.value}
                          </p>
                        </div>
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${stat.color}20` }}
                        >
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: stat.color }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart Area */}
                <div
                  className={`p-6 rounded-lg mb-6 ${
                    data.branding.layout.cardStyle === "elevated" && data.branding.theme.shadows
                      ? "shadow-md"
                      : data.branding.layout.cardStyle === "outlined"
                        ? "border"
                        : ""
                  }`}
                  style={{
                    backgroundColor: "white",
                    borderRadius:
                      data.branding.theme.borderRadius === "large"
                        ? "12px"
                        : data.branding.theme.borderRadius === "small"
                          ? "4px"
                          : data.branding.theme.borderRadius === "none"
                            ? "0"
                            : "8px",
                  }}
                >
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{
                      fontFamily: data.branding.typography.headingFont,
                      color: data.branding.colors.text,
                    }}
                  >
                    Student Enrollment Trends
                  </h3>
                  <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg flex items-end justify-center gap-2 p-4">
                    {[40, 65, 45, 80, 60, 90, 75].map((height, index) => (
                      <div
                        key={index}
                        className="rounded-t"
                        style={{
                          height: `${height}%`,
                          width: "20px",
                          backgroundColor:
                            index % 2 === 0 ? data.branding.colors.primary : data.branding.colors.secondary,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div
                  className={`p-6 rounded-lg ${
                    data.branding.layout.cardStyle === "elevated" && data.branding.theme.shadows
                      ? "shadow-md"
                      : data.branding.layout.cardStyle === "outlined"
                        ? "border"
                        : ""
                  }`}
                  style={{
                    backgroundColor: "white",
                    borderRadius:
                      data.branding.theme.borderRadius === "large"
                        ? "12px"
                        : data.branding.theme.borderRadius === "small"
                          ? "4px"
                          : data.branding.theme.borderRadius === "none"
                            ? "0"
                            : "8px",
                  }}
                >
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{
                      fontFamily: data.branding.typography.headingFont,
                      color: data.branding.colors.text,
                    }}
                  >
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {[
                      "New student John Doe enrolled in Grade 10",
                      "Math exam scheduled for next week",
                      "Parent-teacher meeting on Friday",
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: data.branding.colors.accent }}
                        ></div>
                        <span className="text-sm text-gray-600">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
