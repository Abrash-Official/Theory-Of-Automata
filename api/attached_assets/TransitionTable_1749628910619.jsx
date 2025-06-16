// Transition Table Component for displaying automaton transition tables
import React from 'react';

/**
 * TransitionTable Component
 * Displays the transition table for DFA/NFA
 */
const TransitionTable = ({ 
  automaton, 
  highlightedStates = [], 
  highlightedTransitions = [],
  showEpsilon = true,
  className = ''
}) => {
  if (!automaton || !automaton.states || automaton.states.size === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        No automaton data to display
      </div>
    );
  }

  // Get sorted states and alphabet
  const states = Array.from(automaton.states.keys()).sort();
  const alphabet = Array.from(automaton.alphabet).sort();
  
  // Add epsilon if needed and not already present
  if (showEpsilon && !alphabet.includes('ε') && !alphabet.includes('epsilon')) {
    // Check if there are any epsilon transitions
    const hasEpsilonTransitions = Array.from(automaton.transitions.values())
      .some(t => t.symbol === 'ε' || t.symbol === 'epsilon');
    
    if (hasEpsilonTransitions) {
      alphabet.unshift('ε');
    }
  }

  // Build transition table data
  const tableData = states.map(stateId => {
    const state = automaton.getState(stateId);
    const row = { stateId, state };
    
    alphabet.forEach(symbol => {
      const transitions = Array.from(automaton.transitions.values())
        .filter(t => t.from === stateId && t.symbol === symbol);
      
      if (transitions.length === 0) {
        row[symbol] = '∅';
      } else if (transitions.length === 1) {
        row[symbol] = transitions[0].to;
      } else {
        // Multiple transitions (NFA case)
        row[symbol] = `{${transitions.map(t => t.to).sort().join(', ')}}`;
      }
    });
    
    return row;
  });

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Transition Table</h3>
        <p className="text-sm text-gray-600 mt-1">
          Formal representation of the automaton's transition function
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                State
              </th>
              {alphabet.map(symbol => (
                <th 
                  key={symbol}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                >
                  <span className="font-mono text-sm">
                    {symbol === 'epsilon' ? 'ε' : symbol}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((row, index) => (
              <tr 
                key={row.stateId}
                className={`
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  ${highlightedStates.includes(row.stateId) ? 'bg-yellow-100' : ''}
                  hover:bg-blue-50 transition-colors duration-150
                `}
              >
                {/* State column */}
                <td className="px-4 py-3 border-r border-gray-200">
                  <div className="flex items-center">
                    <StateIndicator state={row.state} />
                    <span className="ml-2 font-mono text-sm font-medium">
                      {row.state.label}
                    </span>
                  </div>
                </td>
                
                {/* Transition columns */}
                {alphabet.map(symbol => (
                  <td 
                    key={symbol}
                    className="px-4 py-3 text-center border-r border-gray-200 last:border-r-0"
                  >
                    <span className={`
                      font-mono text-sm
                      ${row[symbol] === '∅' ? 'text-gray-400' : 'text-gray-900'}
                      ${isTransitionHighlighted(row.stateId, symbol, row[symbol], highlightedTransitions) 
                        ? 'bg-yellow-200 px-1 rounded' : ''}
                    `}>
                      {row[symbol]}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-600"></div>
            <span>Start State</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500 border-4 border-red-600" style={{borderStyle: 'double'}}></div>
            <span>Final State</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono text-gray-400">∅</span>
            <span>No transition</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-mono">{'{q1, q2}'}</span>
            <span>Multiple transitions (NFA)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * State indicator component showing start/final state markers
 */
const StateIndicator = ({ state }) => {
  if (state.isStart && state.isFinal) {
    return (
      <div className="relative">
        <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-purple-600" 
             style={{borderStyle: 'double'}} 
             title="Start and Final State" />
      </div>
    );
  } else if (state.isStart) {
    return (
      <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600" 
           title="Start State" />
    );
  } else if (state.isFinal) {
    return (
      <div className="w-4 h-4 rounded-full bg-red-500 border-4 border-red-600" 
           style={{borderStyle: 'double'}} 
           title="Final State" />
    );
  } else {
    return (
      <div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-gray-400" 
           title="Regular State" />
    );
  }
};

/**
 * Check if a transition should be highlighted
 */
function isTransitionHighlighted(fromState, symbol, toStates, highlightedTransitions) {
  if (!highlightedTransitions || highlightedTransitions.length === 0) {
    return false;
  }

  // Handle both single states and state sets
  const targetStates = toStates.startsWith('{') && toStates.endsWith('}')
    ? toStates.slice(1, -1).split(', ').map(s => s.trim())
    : [toStates];

  return highlightedTransitions.some(transitionId => {
    // Try to match transition ID pattern: from-to-symbol
    const parts = transitionId.split('-');
    if (parts.length >= 3) {
      const [from, to, sym] = parts;
      return from === fromState && 
             targetStates.includes(to) && 
             sym === symbol;
    }
    return false;
  });
}

/**
 * Compact transition table for smaller displays
 */
export const CompactTransitionTable = ({ 
  automaton, 
  maxStates = 5,
  className = ''
}) => {
  if (!automaton || automaton.states.size === 0) {
    return null;
  }

  const states = Array.from(automaton.states.keys()).sort().slice(0, maxStates);
  const alphabet = Array.from(automaton.alphabet).sort().slice(0, 3);
  const hasMore = automaton.states.size > maxStates || automaton.alphabet.size > 3;

  return (
    <div className={`bg-gray-50 rounded p-3 ${className}`}>
      <div className="text-xs font-medium text-gray-600 mb-2">Transition Table</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left pr-2">δ</th>
              {alphabet.map(symbol => (
                <th key={symbol} className="text-center px-1 font-mono">
                  {symbol}
                </th>
              ))}
              {hasMore && <th className="text-center px-1">...</th>}
            </tr>
          </thead>
          <tbody>
            {states.map(stateId => {
              const state = automaton.getState(stateId);
              return (
                <tr key={stateId}>
                  <td className="pr-2 font-mono">
                    <StateIndicator state={state} />
                    <span className="ml-1">{state.label}</span>
                  </td>
                  {alphabet.map(symbol => {
                    const transitions = Array.from(automaton.transitions.values())
                      .filter(t => t.from === stateId && t.symbol === symbol);
                    const result = transitions.length === 0 ? '∅' 
                      : transitions.length === 1 ? transitions[0].to
                      : `{${transitions.map(t => t.to).join(',')}}`;
                    
                    return (
                      <td key={symbol} className="text-center px-1 font-mono">
                        {result}
                      </td>
                    );
                  })}
                  {hasMore && <td className="text-center px-1">...</td>}
                </tr>
              );
            })}
            {automaton.states.size > maxStates && (
              <tr>
                <td colSpan={alphabet.length + 2} className="text-center text-gray-400">
                  ... {automaton.states.size - maxStates} more states
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransitionTable;

