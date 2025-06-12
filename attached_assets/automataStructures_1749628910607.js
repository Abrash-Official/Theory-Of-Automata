// Data structures and utility functions for automata theory

/**
 * Represents a state in an automaton
 */
export class State {
  constructor(id, label = null, isStart = false, isFinal = false, position = null) {
    this.id = id;
    this.label = label || id;
    this.isStart = isStart;
    this.isFinal = isFinal;
    this.position = position || { x: 0, y: 0 };
  }

  clone() {
    return new State(this.id, this.label, this.isStart, this.isFinal, { ...this.position });
  }
}

/**
 * Represents a transition in an automaton
 */
export class Transition {
  constructor(from, to, symbol, id = null) {
    this.from = from;
    this.to = to;
    this.symbol = symbol; // Can be a string, array of strings, or regex
    this.id = id || `${from}-${to}-${symbol}`;
  }

  clone() {
    return new Transition(this.from, this.to, this.symbol, this.id);
  }
}

/**
 * Base class for finite automata
 */
export class FiniteAutomaton {
  constructor(states = [], transitions = [], alphabet = [], startStates = [], finalStates = []) {
    this.states = new Map(); // id -> State
    this.transitions = new Map(); // id -> Transition
    this.alphabet = new Set(alphabet);
    this.startStates = new Set(startStates);
    this.finalStates = new Set(finalStates);

    // Add states
    states.forEach(state => this.addState(state));
    
    // Add transitions
    transitions.forEach(transition => this.addTransition(transition));
  }

  addState(state) {
    this.states.set(state.id, state);
    if (state.isStart) this.startStates.add(state.id);
    if (state.isFinal) this.finalStates.add(state.id);
  }

  addTransition(transition) {
    this.transitions.set(transition.id, transition);
    if (typeof transition.symbol === 'string' && transition.symbol !== 'ε') {
      this.alphabet.add(transition.symbol);
    }
  }

  getState(id) {
    return this.states.get(id);
  }

  getTransition(id) {
    return this.transitions.get(id);
  }

  getTransitionsFrom(stateId) {
    return Array.from(this.transitions.values()).filter(t => t.from === stateId);
  }

  getTransitionsTo(stateId) {
    return Array.from(this.transitions.values()).filter(t => t.to === stateId);
  }

  getTransitionsWithSymbol(symbol) {
    return Array.from(this.transitions.values()).filter(t => t.symbol === symbol);
  }

  clone() {
    const clonedStates = Array.from(this.states.values()).map(s => s.clone());
    const clonedTransitions = Array.from(this.transitions.values()).map(t => t.clone());
    return new FiniteAutomaton(
      clonedStates,
      clonedTransitions,
      Array.from(this.alphabet),
      Array.from(this.startStates),
      Array.from(this.finalStates)
    );
  }

  toJSON() {
    return {
      states: Array.from(this.states.values()),
      transitions: Array.from(this.transitions.values()),
      alphabet: Array.from(this.alphabet),
      startStates: Array.from(this.startStates),
      finalStates: Array.from(this.finalStates)
    };
  }
}

/**
 * Deterministic Finite Automaton
 */
export class DFA extends FiniteAutomaton {
  constructor(states = [], transitions = [], alphabet = [], startState = null, finalStates = []) {
    super(states, transitions, alphabet, startState ? [startState] : [], finalStates);
    this.startState = startState;
  }

  // Get the next state for a given state and input symbol
  getNextState(stateId, symbol) {
    const transition = Array.from(this.transitions.values())
      .find(t => t.from === stateId && t.symbol === symbol);
    return transition ? transition.to : null;
  }

  // Check if a string is accepted by the DFA
  accepts(inputString) {
    let currentState = this.startState;
    
    for (const symbol of inputString) {
      currentState = this.getNextState(currentState, symbol);
      if (currentState === null) return false;
    }
    
    return this.finalStates.has(currentState);
  }

  // Get the execution trace for a string
  getExecutionTrace(inputString) {
    const trace = [];
    let currentState = this.startState;
    trace.push({ state: currentState, symbol: null, step: 0 });
    
    for (let i = 0; i < inputString.length; i++) {
      const symbol = inputString[i];
      const nextState = this.getNextState(currentState, symbol);
      trace.push({ 
        state: nextState, 
        symbol: symbol, 
        step: i + 1,
        transition: nextState ? `${currentState} --${symbol}--> ${nextState}` : null
      });
      
      if (nextState === null) break;
      currentState = nextState;
    }
    
    return trace;
  }

  toJSON() {
    return {
      states: Array.from(this.states.values()),
      transitions: Array.from(this.transitions.values()),
      alphabet: Array.from(this.alphabet),
      startState: this.startState,
      finalStates: Array.from(this.finalStates),
      type: 'DFA'
    };
  }
}

/**
 * Non-deterministic Finite Automaton
 */
export class NFA extends FiniteAutomaton {
  constructor(states = [], transitions = [], alphabet = [], startStates = [], finalStates = []) {
    super(states, transitions, alphabet, startStates, finalStates);
  }

  // Get all possible next states for a given state and input symbol
  getNextStates(stateId, symbol) {
    return Array.from(this.transitions.values())
      .filter(t => t.from === stateId && t.symbol === symbol)
      .map(t => t.to);
  }

  // Calculate epsilon closure of a set of states
  epsilonClosure(stateIds) {
    const closure = new Set(stateIds);
    const stack = [...stateIds];
    
    while (stack.length > 0) {
      const currentState = stack.pop();
      const epsilonTransitions = this.getTransitionsFrom(currentState)
        .filter(t => t.symbol === 'ε');
      
      for (const transition of epsilonTransitions) {
        if (!closure.has(transition.to)) {
          closure.add(transition.to);
          stack.push(transition.to);
        }
      }
    }
    
    return Array.from(closure).sort();
  }

  // Check if a string is accepted by the NFA
  accepts(inputString) {
    let currentStates = this.epsilonClosure(Array.from(this.startStates));
    
    for (const symbol of inputString) {
      const nextStates = new Set();
      
      for (const state of currentStates) {
        const reachableStates = this.getNextStates(state, symbol);
        reachableStates.forEach(s => nextStates.add(s));
      }
      
      currentStates = this.epsilonClosure(Array.from(nextStates));
      if (currentStates.length === 0) return false;
    }
    
    return currentStates.some(state => this.finalStates.has(state));
  }

  toJSON() {
    return {
      states: Array.from(this.states.values()),
      transitions: Array.from(this.transitions.values()),
      alphabet: Array.from(this.alphabet),
      startStates: Array.from(this.startStates),
      finalStates: Array.from(this.finalStates),
      type: 'NFA'
    };
  }
}

/**
 * Regular Expression utilities
 */
export class RegularExpression {
  constructor(pattern) {
    this.pattern = pattern;
    this.tree = null;
  }

  // Parse regular expression into syntax tree
  parse() {
    // This is a simplified parser - in a full implementation,
    // you would use a proper parsing algorithm
    this.tree = this.parseExpression(this.pattern);
    return this.tree;
  }

  parseExpression(expr) {
    // Simplified parsing logic
    // In a real implementation, this would be much more sophisticated
    return {
      type: 'expression',
      value: expr,
      children: []
    };
  }

  // Convert to augmented regular expression
  toAugmented() {
    return this.pattern + '#';
  }
}

/**
 * Utility functions
 */
export const AutomataUtils = {
  // Generate unique state ID
  generateStateId: (prefix = 'q', existingIds = []) => {
    let counter = 0;
    let id = `${prefix}${counter}`;
    while (existingIds.includes(id)) {
      counter++;
      id = `${prefix}${counter}`;
    }
    return id;
  },

  // Generate unique transition ID
  generateTransitionId: (from, to, symbol) => {
    return `${from}-${to}-${symbol}-${Date.now()}`;
  },

  // Validate automaton structure
  validateAutomaton: (automaton) => {
    const errors = [];
    
    if (!automaton || !automaton.states || !automaton.transitions || !automaton.alphabet) {
      errors.push('Automaton object is incomplete (missing states, transitions, or alphabet).');
      return errors;
    }

    if (automaton.states.size === 0) {
      errors.push('Automaton must have at least one state.');
    }

    if (automaton.alphabet.size === 0) {
      errors.push('Automaton must have at least one symbol in its alphabet (excluding epsilon).');
    }

    // Check if all transitions refer to existing states and valid symbols
    automaton.transitions.forEach(transition => {
      if (!automaton.states.has(transition.from)) {
        errors.push(`Transition from non-existent state: ${transition.from}`);
      }
      if (!automaton.states.has(transition.to)) {
        errors.push(`Transition to non-existent state: ${transition.to}`);
      }
      if (transition.symbol !== 'ε' && !automaton.alphabet.has(transition.symbol)) {
        errors.push(`Transition uses unknown symbol '${transition.symbol}'.`);
      }
    });

    // Check for start and final states
    if (automaton instanceof DFA) {
      if (!automaton.startState || !automaton.states.has(automaton.startState)) {
        errors.push('DFA must have exactly one valid start state.');
      }
    } else if (automaton instanceof NFA) {
      if (automaton.startStates.size === 0) {
        errors.push('NFA must have at least one start state.');
      }
    }

    automaton.finalStates.forEach(stateId => {
      if (!automaton.states.has(stateId)) {
        errors.push(`Final state '${stateId}' is not defined in states.`);
      }
    });

    // Check for duplicate states or transitions (by ID)
    const stateIds = new Set();
    automaton.states.forEach(state => {
      if (stateIds.has(state.id)) {
        errors.push(`Duplicate state ID: ${state.id}`);
      }
      stateIds.add(state.id);
    });

    const transitionIds = new Set();
    automaton.transitions.forEach(transition => {
      // For transitions, we might allow multiple transitions between same states with different symbols
      // But duplicate exact transitions should be flagged
      const uniqueTransitionId = `${transition.from}-${transition.to}-${transition.symbol}`;
      if (transitionIds.has(uniqueTransitionId)) {
        // This might not be a strict error for NFA, but good to note for DFA
        // errors.push(`Duplicate transition: ${uniqueTransitionId}`);
      }
      transitionIds.add(uniqueTransitionId);
    });

    return errors;
  },

  // Convert automaton to Cytoscape.js format
  toCytoscapeFormat: (automaton) => {
    const elements = [];
    
    // Add nodes (states)
    for (const state of automaton.states.values()) {
      elements.push({
        data: {
          id: state.id,
          label: state.label,
          isStart: state.isStart,
          isFinal: state.isFinal
        },
        position: state.position,
        classes: [
          state.isStart ? 'start-state' : '',
          state.isFinal ? 'final-state' : ''
        ].filter(Boolean).join(' ')
      });
    }
    
    // Add edges (transitions)
    for (const transition of automaton.transitions.values()) {
      elements.push({
        data: {
          id: transition.id,
          source: transition.from,
          target: transition.to,
          label: transition.symbol
        },
        classes: 'transition'
      });
    }
    
    return elements;
  },

  // Create automaton from Cytoscape.js format
  fromCytoscapeFormat: (elements) => {
    const states = [];
    const transitions = [];
    const alphabet = new Set();
    const startStates = [];
    const finalStates = [];
    
    elements.forEach(element => {
      if (element.data.source && element.data.target) {
        // This is an edge (transition)
        const transition = new Transition(
          element.data.source,
          element.data.target,
          element.data.label,
          element.data.id
        );
        transitions.push(transition);
        if (element.data.label !== 'ε') {
          alphabet.add(element.data.label);
        }
      } else {
        // This is a node (state)
        const state = new State(
          element.data.id,
          element.data.label,
          element.data.isStart,
          element.data.isFinal,
          element.position
        );
        states.push(state);
        if (state.isStart) startStates.push(state.id);
        if (state.isFinal) finalStates.push(state.id);
      }
    });
    
    return new FiniteAutomaton(states, transitions, Array.from(alphabet), startStates, finalStates);
  },

  /**
   * Generates positions for states in a circular layout.
   * @param {number} numStates - The total number of states.
   * @param {number} centerX - The X coordinate of the center of the circle.
   * @param {number} centerY - The Y coordinate of the center of the circle.
   * @param {number} radius - The radius of the circle.
   * @returns {Array<Object>} An array of {x, y} position objects for each state.
   */
  generateStatePositions: (numStates, centerX = 200, centerY = 150, radius = 100) => {
    const positions = [];
    if (numStates === 0) return positions;

    for (let i = 0; i < numStates; i++) {
      const angle = (i / numStates) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      positions.push({ x, y });
    }
    return positions;
  }
};

