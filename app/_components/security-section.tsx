import { Database, Cloud, Lock, Server } from "lucide-react"

const securityFeatures = [
  {
    icon: Database,
    title: "Dedicated Databases",
    description: "Each tenant gets a dedicated, isolated database for maximum data integrity and performance.",
  },
  {
    icon: Lock,
    title: "Robust Encryption",
    description: "All data is encrypted at rest and in transit using industry-leading protocols.",
  },
  {
    icon: Server,
    title: "Scalable Infrastructure",
    description: "Built on a resilient cloud infrastructure designed for high availability and performance.",
  },
  {
    icon: Cloud,
    title: "Regular Audits & Compliance",
    description: "Undergo frequent security audits and comply with educational data privacy regulations.",
  },
]

export function SecuritySection() {
  return (
    <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-gray-950 to-purple-950">
      <div className="container px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-block rounded-full bg-purple-600/20 px-4 py-1 text-sm font-semibold text-purple-300">
            Enterprise Grade
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Your Data, Our Priority: <span className="text-green-400">Uncompromised Security</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300">
            Scholian is built with a multi-tenant architecture, ensuring robust enterprise-grade security and dedicated
            resources for every institution.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-700"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-600/30 text-purple-400 mb-6 mx-auto">
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
