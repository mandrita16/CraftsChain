import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProductSection() {
  const products = [
    {
      title: "Basic Plan",
      description: "Perfect for individuals and small teams just getting started.",
      price: "$9.99",
      features: ["5 Projects", "Basic Analytics", "24/7 Support", "1GB Storage"],
    },
    {
      title: "Pro Plan",
      description: "Ideal for growing businesses with more advanced needs.",
      price: "$19.99",
      features: ["Unlimited Projects", "Advanced Analytics", "Priority Support", "10GB Storage"],
    },
    {
      title: "Enterprise Plan",
      description: "Custom solutions for large organizations with complex requirements.",
      price: "$49.99",
      features: ["Custom Solutions", "Dedicated Account Manager", "SLA Guarantee", "Unlimited Storage"],
    },
  ]

  return (
    <section id="products" className="py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Products</h2>
          <p className="mt-4 text-muted-foreground md:text-xl max-w-[700px]">Choose the perfect plan for your needs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{product.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-3xl font-bold mb-4">
                  {product.price}
                  <span className="text-sm font-normal text-muted-foreground"> / month</span>
                </p>
                <p className="text-muted-foreground mb-6">{product.description}</p>
                <ul className="space-y-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckIcon className="mr-2 h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Get Started</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
