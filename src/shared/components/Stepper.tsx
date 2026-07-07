import { Fragment } from 'react'
import { Check } from 'lucide-react'

interface StepperProps {
  steps: string[]
  currentStep: number
}

export default function Stepper({ steps, currentStep }: Readonly<StepperProps>) {
  return (
    <div>
      <div className="flex items-center">
        {steps.map((label, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          return (
            <Fragment key={label}>
              <div className="flex w-16 shrink-0 justify-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-rem-85 font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                        ? 'border-2 border-primary bg-background text-primary ring-2 ring-primary/20'
                        : 'border border-border text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 ${index < currentStep ? 'bg-primary' : 'bg-border'}`} />
              )}
            </Fragment>
          )
        })}
      </div>
      <div className="mt-2 flex items-start">
        {steps.map((label, index) => (
          <Fragment key={label}>
            <div
              className={`w-16 shrink-0 text-center text-rem-80 ${
                index === currentStep ? 'font-semibold text-foreground' : 'text-muted-foreground'
              }`}
            >
              {label}
            </div>
            {index < steps.length - 1 && <div className="flex-1" />}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
