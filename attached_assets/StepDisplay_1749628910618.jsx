// Step Display Component for showing conversion steps
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * StepDisplay Component
 * Shows step-by-step explanations for automata conversions
 */
const StepDisplay = ({ 
  steps = [], 
  currentStep = 0, 
  onStepChange = null,
  autoPlay = false,
  autoPlaySpeed = 2000,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState(null);

  // Handle step navigation
  const goToStep = (stepIndex) => {
    const newStep = Math.max(0, Math.min(stepIndex, steps.length - 1));
    if (onStepChange) {
      onStepChange(newStep);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const resetToStart = () => {
    goToStep(0);
    setIsPlaying(false);
    if (playInterval) {
      clearInterval(playInterval);
      setPlayInterval(null);
    }
  };

  // Handle auto-play
  const toggleAutoPlay = () => {
    if (isPlaying) {
      // Stop auto-play
      setIsPlaying(false);
      if (playInterval) {
        clearInterval(playInterval);
        setPlayInterval(null);
      }
    } else {
      // Start auto-play
      setIsPlaying(true);
      const interval = setInterval(() => {
        goToStep(prevStep => {
          if (prevStep >= steps.length - 1) {
            // Reached the end, stop auto-play
            setIsPlaying(false);
            clearInterval(interval);
            setPlayInterval(null);
            return prevStep;
          }
          return prevStep + 1;
        });
      }, autoPlaySpeed);
      setPlayInterval(interval);
    }
  };

  // Cleanup interval on unmount
  React.useEffect(() => {
    return () => {
      if (playInterval) {
        clearInterval(playInterval);
      }
    };
  }, [playInterval]);

  if (!steps || steps.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        No steps to display
      </div>
    );
  }

  const step = steps[currentStep];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header with controls */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Step {currentStep + 1} of {steps.length}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToStart}
              disabled={currentStep === 0 && !isPlaying}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoPlay}
              disabled={steps.length <= 1}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={currentStep === 0 || isPlaying}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <span className="text-sm text-gray-600">
            {step?.type && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                {step.type.replace('_', ' ').toUpperCase()}
              </span>
            )}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={nextStep}
            disabled={currentStep === steps.length - 1 || isPlaying}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Step content */}
      <div className="p-4">
        {/* Step title */}
        <h4 className="text-md font-medium text-gray-900 mb-2">
          {step?.title || 'Step Title'}
        </h4>

        {/* Step description */}
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          {step?.description || 'Step description'}
        </p>

        {/* Step data visualization */}
        {step?.data && (
          <div className="bg-gray-50 rounded-lg p-3">
            <StepDataDisplay data={step.data} type={step.type} />
          </div>
        )}
      </div>

      {/* Step timeline */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {steps.map((s, index) => (
            <button
              key={index}
              onClick={() => goToStep(index)}
              disabled={isPlaying}
              className={`
                flex-shrink-0 w-8 h-8 rounded-full border-2 text-xs font-medium
                transition-all duration-200
                ${index === currentStep 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : index < currentStep
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }
                ${!isPlaying ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed'}
              `}
              title={s.title}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Component for displaying step data based on type
 */
const StepDataDisplay = ({ data, type }) => {
  if (!data) return null;

  switch (type) {
    case 'augment':
      return (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-1">Augmented Expression:</div>
          <div className="font-mono text-sm bg-white p-2 rounded border">
            {data.original} → {data.augmented}
          </div>
        </div>
      );

    case 'functions':
      return (
        <div className="space-y-2">
          <div>
            <span className="text-xs font-medium text-gray-600">Nullable:</span>
            <span className="ml-2 font-mono text-sm">{data.nullable ? 'true' : 'false'}</span>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-600">Firstpos:</span>
            <span className="ml-2 font-mono text-sm">{`{${data.firstpos?.join(', ') || ''}}`}</span>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-600">Lastpos:</span>
            <span className="ml-2 font-mono text-sm">{`{${data.lastpos?.join(', ') || ''}}`}</span>
          </div>
        </div>
      );

    case 'followpos':
      return (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Followpos Table:</div>
          <div className="space-y-1">
            {Object.entries(data.followpos || {}).map(([pos, follows]) => (
              <div key={pos} className="flex items-center text-sm">
                <span className="font-mono w-8">{pos}:</span>
                <span className="font-mono">{`{${follows.join(', ')}}`}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'epsilon_closures':
      return (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Epsilon Closures:</div>
          <div className="space-y-1">
            {Object.entries(data.closures || {}).map(([state, closure]) => (
              <div key={state} className="flex items-center text-sm">
                <span className="font-mono w-12">ε({state}):</span>
                <span className="font-mono">{`{${closure.join(', ')}}`}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'subset_construction':
      return (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">State Mapping:</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {Object.entries(data.stateMapping || {}).map(([dfaState, nfaStates]) => (
              <div key={dfaState} className="flex items-center text-sm">
                <span className="font-mono text-xs mr-2">{dfaState}:</span>
                <span className="font-mono text-xs">{`{${nfaStates.join(', ')}}`}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'eliminate_state':
      return (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-1">Eliminated State:</div>
          <div className="font-mono text-sm bg-red-50 text-red-700 p-2 rounded border">
            {data.eliminatedState}
          </div>
        </div>
      );

    case 'simplify':
      return (
        <div className="space-y-2">
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Original:</div>
            <div className="font-mono text-sm bg-white p-2 rounded border">
              {data.originalRegex}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">Simplified:</div>
            <div className="font-mono text-sm bg-green-50 text-green-700 p-2 rounded border">
              {data.simplifiedRegex}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-xs text-gray-600">
          <pre className="whitespace-pre-wrap font-mono text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
  }
};

export default StepDisplay;

