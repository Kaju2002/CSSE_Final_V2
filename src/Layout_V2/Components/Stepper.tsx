import React from 'react';

interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'simple' | 'progress';
  allowClickableSteps?: boolean;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  variant = 'default',
  allowClickableSteps = false
}) => {
  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  if (variant === 'progress') {
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {steps[currentStep]?.label}
        </p>
      </div>
    );
  }

  if (orientation === 'vertical') {
    return (
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isClickable = allowClickableSteps && status === 'completed';

          return (
            <div
              key={step.id}
              className={`flex items-start ${isClickable ? 'cursor-pointer' : ''}`}
              onClick={() => isClickable && onStepClick?.(index)}
            >
              {/* Step Circle */}
              <div className="flex-shrink-0">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    border-2 transition-all
                    ${
                      status === 'completed'
                        ? 'bg-blue-600 border-blue-600'
                        : status === 'current'
                        ? 'border-blue-600 bg-white'
                        : 'border-gray-300 bg-white'
                    }
                  `}
                >
                  {status === 'completed' ? (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : step.icon ? (
                    <span className={status === 'current' ? 'text-blue-600' : 'text-gray-400'}>
                      {step.icon}
                    </span>
                  ) : (
                    <span
                      className={`text-sm font-medium ${
                        status === 'current' ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`
                      w-0.5 h-12 ml-5 mt-2
                      ${status === 'completed' ? 'bg-blue-600' : 'bg-gray-300'}
                    `}
                  />
                )}
              </div>

              {/* Step Content */}
              <div className="ml-4 flex-1">
                <p
                  className={`
                    text-sm font-medium
                    ${status === 'current' ? 'text-blue-600' : status === 'completed' ? 'text-gray-900' : 'text-gray-500'}
                  `}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal Layout
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isClickable = allowClickableSteps && status === 'completed';
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div
                className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : ''}`}
                onClick={() => isClickable && onStepClick?.(index)}
              >
                {/* Step Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    border-2 transition-all
                    ${
                      status === 'completed'
                        ? 'bg-blue-600 border-blue-600'
                        : status === 'current'
                        ? 'border-blue-600 bg-white'
                        : 'border-gray-300 bg-white'
                    }
                  `}
                >
                  {status === 'completed' ? (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span
                      className={`text-sm font-medium ${
                        status === 'current' ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Step Label */}
                <p
                  className={`
                    text-xs font-medium mt-2 text-center
                    ${status === 'current' ? 'text-blue-600' : status === 'completed' ? 'text-gray-900' : 'text-gray-500'}
                  `}
                >
                  {step.label}
                </p>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2
                    ${status === 'completed' ? 'bg-blue-600' : 'bg-gray-300'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

