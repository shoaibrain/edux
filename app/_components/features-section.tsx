import { BookOpen, BarChart, Users, CalendarDays, DollarSign, LayoutGrid } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Student Management",
    description: "Effortlessly manage student records, attendance, grades, and communication in a centralized system.",
  },
  {
    icon: BookOpen,
    title: "Curriculum Planning",
    description: "Design, organize, and track courses, subjects, and lesson plans with intuitive tools.",
  },
  {
    icon: BarChart,
    title: "Analytics & Reporting",
    description: "Gain deep insights into academic performance, attendance trends, and operational efficiency.",
  },
  {
    icon: CalendarDays,
    title: "Event Scheduling",
    description: "Plan and manage school events, holidays, and academic calendars with ease.",
  },
  {
    icon: DollarSign,
    title: "Financial Tracking",
    description: "Monitor tuition, fees, expenses, and budget allocation for complete financial oversight.",
  },
  {
    icon: LayoutGrid,
    title: "Customizable Dashboards",
    description: "Personalize dashboards to display the most relevant data and metrics for each role.",
  },
]

export function FeaturesSection() {
  return (
    <section className="w-full py-20 md:py-32 lg:py-40 bg-gray-900">
      <div className="container px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-block rounded-full bg-blue-600/20 px-4 py-1 text-sm font-semibold text-blue-300">
            Key Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Everything You Need to <span className="text-purple-400">Succeed</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300">
            Our comprehensive platform is packed with features designed to streamline your administrative tasks, enhance
            the learning experience, and empower your institution.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-700"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/30 text-blue-400 mb-6 mx-auto">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 text-base">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
