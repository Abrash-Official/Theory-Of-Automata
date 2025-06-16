// Regular Expression Display Component with mathematical formatting
import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * RegexDisplay Component
 * Displays regular expressions with proper mathematical formatting
 */
const RegexDisplay = ({ 
  regex, 
  title = "Regular Expression",
  description = null,
  showSteps = false,
  steps = [],
  inline = false,
  className = ''
}) => {
  if (!regex) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        No regular expression to display
      </div>
    );
  }

  // Convert regex to LaTeX format for better rendering
  const formatRegexForLatex = (regexStr) => {
    if (!regexStr || regexStr === '∅') return '\\emptyset';
    if (regexStr === 'ε' || regexStr === 'epsilon') return '\\varepsilon';
    
    let formatted = regexStr
      // Replace epsilon symbols
      .replace(/ε/g, '\\varepsilon')
      .replace(/epsilon/g, '\\varepsilon')
      // Replace empty set symbol
      .replace(/∅/g, '\\emptyset')
      // Handle Kleene star
      .replace(/\*/g, '^*')
      // Handle union (|)
      .replace(/\|/g, ' \\cup ')
      // Handle concatenation (make it explicit with cdot when needed)
      .replace(/([a-zA-Z0-9)])\s*([a-zA-Z0-9(])/g, '$1 \\cdot $2');
    
    return formatted;
  };

  const latexRegex = formatRegexForLatex(regex);

  if (inline) {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <InlineMath math={latexRegex} />
      </span>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {/* Main regex display */}
      <div className="p-6">
        <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="text-2xl">
            <BlockMath math={latexRegex} />
          </div>
        </div>

        {/* Raw regex for reference */}
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Raw Expression:</div>
          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
            {regex}
          </code>
        </div>
      </div>

      {/* Steps (if provided) */}
      {showSteps && steps && steps.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Derivation Steps:</h4>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-600">{step.description}</div>
                  {step.regex && (
                    <div className="mt-1">
                      <InlineMath math={formatRegexForLatex(step.regex)} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regex properties and info */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <RegexProperties regex={regex} />
      </div>
    </div>
  );
};

/**
 * Component showing properties of the regular expression
 */
const RegexProperties = ({ regex }) => {
  const analyzeRegex = (regexStr) => {
    if (!regexStr) return {};
    
    const properties = {
      length: regexStr.length,
      hasKleeneStar: regexStr.includes('*'),
      hasUnion: regexStr.includes('|'),
      hasEpsilon: regexStr.includes('ε') || regexStr.includes('epsilon'),
      hasEmptySet: regexStr.includes('∅'),
      symbols: new Set(),
      operators: new Set()
    };
    
    // Extract symbols and operators
    for (const char of regexStr) {
      if (/[a-zA-Z0-9]/.test(char)) {
        properties.symbols.add(char);
      } else if (['*', '|', '(', ')', '+', '?'].includes(char)) {
        properties.operators.add(char);
      }
    }
    
    return properties;
  };

  const props = analyzeRegex(regex);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
      <div>
        <div className="font-medium text-gray-600">Length</div>
        <div className="text-gray-900">{props.length}</div>
      </div>
      <div>
        <div className="font-medium text-gray-600">Symbols</div>
        <div className="text-gray-900">
          {props.symbols.size > 0 ? Array.from(props.symbols).join(', ') : 'None'}
        </div>
      </div>
      <div>
        <div className="font-medium text-gray-600">Operators</div>
        <div className="text-gray-900">
          {props.operators.size > 0 ? Array.from(props.operators).join(', ') : 'None'}
        </div>
      </div>
      <div>
        <div className="font-medium text-gray-600">Features</div>
        <div className="text-gray-900">
          {[
            props.hasKleeneStar && 'Star',
            props.hasUnion && 'Union',
            props.hasEpsilon && 'Epsilon',
            props.hasEmptySet && 'Empty'
          ].filter(Boolean).join(', ') || 'Basic'}
        </div>
      </div>
    </div>
  );
};

/**
 * Inline regex component for use within text
 */
export const InlineRegex = ({ regex, className = '' }) => {
  return (
    <RegexDisplay 
      regex={regex} 
      inline={true} 
      className={className}
    />
  );
};

/**
 * Regex comparison component for showing before/after
 */
export const RegexComparison = ({ 
  originalRegex, 
  simplifiedRegex, 
  title = "Regular Expression Simplification",
  className = ''
}) => {
  const formatRegexForLatex = (regexStr) => {
    if (!regexStr || regexStr === '∅') return '\\emptyset';
    if (regexStr === 'ε' || regexStr === 'epsilon') return '\\varepsilon';
    
    return regexStr
      .replace(/ε/g, '\\varepsilon')
      .replace(/epsilon/g, '\\varepsilon')
      .replace(/∅/g, '\\emptyset')
      .replace(/\*/g, '^*')
      .replace(/\|/g, ' \\cup ')
      .replace(/([a-zA-Z0-9)])\s*([a-zA-Z0-9(])/g, '$1 \\cdot $2');
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Original */}
        <div>
          <div className="text-sm font-medium text-gray-600 mb-2">Original:</div>
          <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
            <BlockMath math={formatRegexForLatex(originalRegex)} />
          </div>
        </div>

        {/* Arrow */}
        <div className="text-center text-gray-400">
          <div className="text-2xl">↓</div>
          <div className="text-xs">Simplified</div>
        </div>

        {/* Simplified */}
        <div>
          <div className="text-sm font-medium text-gray-600 mb-2">Simplified:</div>
          <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
            <BlockMath math={formatRegexForLatex(simplifiedRegex)} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Regex builder component for interactive construction
 */
export const RegexBuilder = ({ 
  onRegexChange = null,
  initialRegex = '',
  className = ''
}) => {
  const [regex, setRegex] = React.useState(initialRegex);
  const [isValid, setIsValid] = React.useState(true);

  const handleRegexChange = (newRegex) => {
    setRegex(newRegex);
    
    // Basic validation
    try {
      // Simple validation - check for balanced parentheses
      let depth = 0;
      for (const char of newRegex) {
        if (char === '(') depth++;
        if (char === ')') depth--;
        if (depth < 0) throw new Error('Unmatched closing parenthesis');
      }
      if (depth !== 0) throw new Error('Unmatched opening parenthesis');
      
      setIsValid(true);
      if (onRegexChange) {
        onRegexChange(newRegex);
      }
    } catch (error) {
      setIsValid(false);
    }
  };

  const insertSymbol = (symbol) => {
    handleRegexChange(regex + symbol);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Regular Expression Builder</h3>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Regular Expression:
          </label>
          <input
            type="text"
            value={regex}
            onChange={(e) => handleRegexChange(e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md font-mono text-sm
              ${isValid ? 'border-gray-300' : 'border-red-300 bg-red-50'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            `}
            placeholder="Enter regular expression..."
          />
          {!isValid && (
            <p className="mt-1 text-sm text-red-600">Invalid regular expression</p>
          )}
        </div>

        {/* Quick insert buttons */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Quick Insert:</div>
          <div className="flex flex-wrap gap-2">
            {['ε', '∅', '*', '|', '(', ')', 'a', 'b', '0', '1'].map(symbol => (
              <button
                key={symbol}
                onClick={() => insertSymbol(symbol)}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-mono"
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {regex && isValid && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
              <InlineMath math={formatRegexForLatex(regex)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function for external use
const formatRegexForLatex = (regexStr) => {
  if (!regexStr || regexStr === '∅') return '\\emptyset';
  if (regexStr === 'ε' || regexStr === 'epsilon') return '\\varepsilon';
  
  return regexStr
    .replace(/ε/g, '\\varepsilon')
    .replace(/epsilon/g, '\\varepsilon')
    .replace(/∅/g, '\\emptyset')
    .replace(/\*/g, '^*')
    .replace(/\|/g, ' \\cup ')
    .replace(/([a-zA-Z0-9)])\s*([a-zA-Z0-9(])/g, '$1 \\cdot $2');
};

export { formatRegexForLatex };
export default RegexDisplay;

