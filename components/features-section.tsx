import { CheckCircle } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      title: "Easy Integration",
      description: "Seamlessly integrate with your existing systems and workflows.",
    },
    {
      title: "Powerful Analytics",
      description: "Gain insights with comprehensive analytics and reporting tools.",
    },
    {
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee.",
    },
    {
      title: "24/7 Support",
      description: "Our dedicated team is always available to help you succeed.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features</h2>
          <p className="mt-4 text-muted-foreground md:text-xl max-w-[700px]">
            Everything you need to take your business to the next level
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
