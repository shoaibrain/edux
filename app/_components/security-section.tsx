import { Database, Cloud, Lock, Server } from "lucide-react";

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
];

export function SecuritySection() {
  return (
    <section id="security" className="w-full py-20 md:py-28 lg:py-32 bg-black/20">
      <div className="container px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-gray-200">
            Enterprise Grade
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Your Data, Our Priority: Uncompromised Security
          </h2>
          <p className="text-lg md:text-xl text-gray-400">
            Scholian is built with a multi-tenant architecture, ensuring robust enterprise-grade security and dedicated
            resources for every institution.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white/5 p-8 rounded-xl border border-white/10 shadow-lg"
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
