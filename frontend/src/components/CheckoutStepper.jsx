import React from 'react';
import { ShoppingBag, MapPin, CreditCard, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Cart', icon: ShoppingBag, path: '/cart' },
  { id: 2, label: 'Shipping', icon: MapPin, path: '/checkout' },
  { id: 3, label: 'Payment', icon: CreditCard, path: '/payment' },
  { id: 4, label: 'Confirmation', icon: CheckCircle2, path: null },
];

const CheckoutStepper = ({ currentStep = 1 }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-border-color -translate-y-1/2 z-0 rounded-full" />
        
        {/* Active progress track line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-md ${
                  isCompleted
                    ? 'bg-primary text-white scale-95 shadow-primary/30'
                    : isCurrent
                    ? 'bg-primary text-white ring-4 ring-primary/20 scale-110 shadow-lg shadow-primary/40'
                    : 'bg-bg-card border-2 border-border-color text-text-muted'
                }`}
              >
                {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
              </div>

              <span
                className={`text-xs md:text-sm font-bold mt-2.5 transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'text-primary font-black'
                    : isCompleted
                    ? 'text-text-main font-semibold'
                    : 'text-text-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutStepper;
