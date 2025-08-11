import { BookOpen, BarChart, Users, CalendarDays, DollarSign, LayoutGrid } from "lucide-react";

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
];

export function FeaturesSection() {
  return (
    <section id="features" className="w-full py-20 md:py-28 lg:py-32">
      <div className="container px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-gray-200">
            Key Features
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg md:text-xl text-gray-400">
            Our comprehensive platform is packed with features designed to streamline your administrative tasks, enhance
            the learning experience, and empower your institution.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white/5 p-8 rounded-xl border border-white/10 shadow-lg hover:border-white/20 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 text-white mb-6 mx-auto">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-base">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
