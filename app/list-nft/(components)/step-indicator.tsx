import React from "react"
import { CheckCircle2, ChevronRight } from "lucide-react"
import { FileText, DollarSign, Truck, CheckSquare } from "lucide-react"

interface Step {
  id: string
  title: string
  icon: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

// Map of icon names to components
const iconMap = {
  FileText,
  DollarSign,
  Truck,
  CheckSquare,
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <>
      {/* Desktop steps indicator */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const IconComponent = iconMap[step.icon as keyof typeof iconMap]

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                  currentStep >= index
                    ? "border-cyan-500 bg-gradient-to-r from-cyan-500 to-red-600 text-white"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {currentStep > index ? <CheckCircle2 className="h-5 w-5" /> : <IconComponent className="h-5 w-5" />}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  currentStep >= index ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />}
            </div>
          )
        })}
      </div>

      {/* Mobile steps indicator */}
      <div className="md:hidden">
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Step {currentStep + 1} of {steps.length}
        </p>
        <h2 className="text-xl font-semibold flex items-center">
          {steps[currentStep] && (
            <>
              <span className="mr-2">
                {React.createElement(iconMap[steps[currentStep].icon as keyof typeof iconMap], {
                  className: "h-5 w-5",
                })}
              </span>
              {steps[currentStep].title}
            </>
          )}
        </h2>
      </div>
    </>
  )
}
