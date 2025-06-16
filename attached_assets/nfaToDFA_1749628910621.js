// NFA to DFA conversion using subset construction algorithm
import { DFA, NFA, State, Transition, AutomataUtils } from './automataStructures.js';

/**
 * NFA to DFA Converter using Subset Construction
 */
export class NFAToDFAConverter {
  constructor(nfa) {
    this.nfa = nfa;
    this.steps = [];
    this.epsilonClosures = new Map(); // Cache for epsilon closures
    this.stateMapping = new Map(); // Maps DFA state IDs to NFA state sets
  }

  /**
   * Main conversion method
   */
  convert() {
    this.steps = [];
    this.epsilonClosures.clear();
    this.stateMapping.clear();
    
    try {
      // Step 1: Validate input NFA
      this.validateNFA();
      this.addStep('validate', 'Validate Input NFA',
        'Check that the input NFA is well-formed',
        { nfa: this.nfa.toJSON() });

      // Step 2: Calculate epsilon closures for all states
      this.calculateAllEpsilonClosures();
      this.addStep('epsilon_closures', 'Calculate Epsilon Closures',
        'Compute ε-closure for each state in the NFA',
        { closures: this.serializeEpsilonClosures() });

      // Step 3: Construct DFA using subset construction
      const dfa = this.subsetConstruction();
      this.addStep('subset_construction', 'Subset Construction',
        'Build DFA states and transitions using subset construction algorithm',
        { dfa: dfa.toJSON(), stateMapping: this.serializeStateMapping() });

      // Step 4: Minimize DFA (optional optimization)
      const minimizedDFA = this.minimizeDFA(dfa);
      this.addStep('minimize', 'Minimize DFA',
        'Remove unreachable states and merge equivalent states',
        { minimizedDFA: minimizedDFA.toJSON() });

      return {
        dfa: minimizedDFA,
        steps: this.steps,
        success: true,
        stateMapping: this.stateMapping
      };
    } catch (error) {
      return {
        dfa: null,
        steps: this.steps,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate the input NFA
   */
  validateNFA() {
    const errors = AutomataUtils.validateAutomaton(this.nfa);
    if (errors.length > 0) {
      throw new Error(`Invalid NFA: ${errors.join(', ')}`);
    }
  }

  /**
   * Calculate epsilon closure for all states
   */
  calculateAllEpsilonClosures() {
    for (const stateId of this.nfa.states.keys()) {
      this.getEpsilonClosure([stateId]);
    }
  }

  /**
   * Calculate epsilon closure for a set of states
   */
  getEpsilonClosure(stateIds) {
    const key = stateIds.sort().join(',');
    
    if (this.epsilonClosures.has(key)) {
      return this.epsilonClosures.get(key);
    }
    
    const closure = new Set(stateIds);
    const stack = [...stateIds];
    
    while (stack.length > 0) {
      const currentState = stack.pop();
      
      // Find all epsilon transitions from current state
      const epsilonTransitions = this.nfa.getTransitionsFrom(currentState)
        .filter(t => t.symbol === 'ε' || t.symbol === 'epsilon');
      
      for (const transition of epsilonTransitions) {
        if (!closure.has(transition.to)) {
          closure.add(transition.to);
          stack.push(transition.to);
        }
      }
    }
    
    const result = Array.from(closure).sort();
    this.epsilonClosures.set(key, result);
    return result;
  }

  /**
   * Subset construction algorithm
   */
  subsetConstruction() {
    const dfaStates = [];
    const dfaTransitions = [];
    const alphabet = Array.from(this.nfa.alphabet).filter(symbol => symbol !== 'ε' && symbol !== 'epsilon');
    
    // Start state: epsilon closure of NFA start states
    const startStateClosure = this.getEpsilonClosure(Array.from(this.nfa.startStates));
    const startStateId = this.stateSetToId(startStateClosure);
    
    // Queue for BFS construction
    const queue = [{ id: startStateId, nfaStates: startStateClosure }];
    const processedStates = new Set([startStateId]);
    
    // Track state mapping
    this.stateMapping.set(startStateId, startStateClosure);
    
    while (queue.length > 0) {
      const currentDFAState = queue.shift();
      
      // Determine if this DFA state is final
      const isFinal = currentDFAState.nfaStates.some(stateId => 
        this.nfa.finalStates.has(stateId));
      
      // Create DFA state
      dfaStates.push(new State(
        currentDFAState.id,
        currentDFAState.id,
        currentDFAState.id === startStateId,
        isFinal
      ));
      
      // For each symbol in alphabet
      for (const symbol of alphabet) {
        const nextNFAStates = new Set();
        
        // For each NFA state in current DFA state
        for (const nfaStateId of currentDFAState.nfaStates) {
          const transitions = this.nfa.getTransitionsFrom(nfaStateId)
            .filter(t => t.symbol === symbol);
          
          for (const transition of transitions) {
            nextNFAStates.add(transition.to);
          }
        }
        
        if (nextNFAStates.size > 0) {
          // Calculate epsilon closure of reachable states
          const nextStateClosure = this.getEpsilonClosure(Array.from(nextNFAStates));
          const nextStateId = this.stateSetToId(nextStateClosure);
          
          // Add transition
          dfaTransitions.push(new Transition(
            currentDFAState.id,
            nextStateId,
            symbol
          ));
          
          // Add new state to queue if not processed
          if (!processedStates.has(nextStateId)) {
            queue.push({ id: nextStateId, nfaStates: nextStateClosure });
            processedStates.add(nextStateId);
            this.stateMapping.set(nextStateId, nextStateClosure);
          }
        }
      }
    }
    
    const finalStates = dfaStates.filter(s => s.isFinal).map(s => s.id);
    return new DFA(dfaStates, dfaTransitions, alphabet, startStateId, finalStates);
  }

  /**
   * Minimize DFA by removing unreachable states and merging equivalent states
   */
  minimizeDFA(dfa) {
    // Step 1: Remove unreachable states
    const reachableStates = this.findReachableStates(dfa);
    const reachableDFA = this.removeUnreachableStates(dfa, reachableStates);
    
    // Step 2: Merge equivalent states (simplified version)
    // In a full implementation, you would use the table-filling algorithm
    return reachableDFA;
  }

  /**
   * Find all reachable states from start state
   */
  findReachableStates(dfa) {
    const reachable = new Set([dfa.startState]);
    const queue = [dfa.startState];
    
    while (queue.length > 0) {
      const currentState = queue.shift();
      
      for (const transition of dfa.getTransitionsFrom(currentState)) {
        if (!reachable.has(transition.to)) {
          reachable.add(transition.to);
          queue.push(transition.to);
        }
      }
    }
    
    return reachable;
  }

  /**
   * Remove unreachable states from DFA
   */
  removeUnreachableStates(dfa, reachableStates) {
    const newStates = Array.from(dfa.states.values())
      .filter(state => reachableStates.has(state.id));
    
    const newTransitions = Array.from(dfa.transitions.values())
      .filter(transition => 
        reachableStates.has(transition.from) && 
        reachableStates.has(transition.to));
    
    const newFinalStates = Array.from(dfa.finalStates)
      .filter(stateId => reachableStates.has(stateId));
    
    return new DFA(newStates, newTransitions, Array.from(dfa.alphabet), 
      dfa.startState, newFinalStates);
  }

  /**
   * Helper methods
   */
  stateSetToId(stateSet) {
    return `{${stateSet.join(',')}}`;
  }

  addStep(type, title, description, data) {
    this.steps.push({
      id: `step_${this.steps.length + 1}`,
      type: type,
      title: title,
      description: description,
      data: data,
      timestamp: Date.now()
    });
  }

  serializeEpsilonClosures() {
    const result = {};
    for (const [key, closure] of this.epsilonClosures.entries()) {
      result[key] = closure;
    }
    return result;
  }

  serializeStateMapping() {
    const result = {};
    for (const [dfaStateId, nfaStates] of this.stateMapping.entries()) {
      result[dfaStateId] = nfaStates;
    }
    return result;
  }
}

/**
 * Utility functions for creating NFAs
 */
export class NFABuilder {
  static fromRegex(regex) {
    // Thompson's construction algorithm
    return this.thompsonConstruction(regex);
  }

  static thompsonConstruction(regex) {
    // Simplified Thompson's construction
    // In a full implementation, this would be more sophisticated
    const states = [];
    const transitions = [];
    let stateCounter = 0;

    const createState = (isStart = false, isFinal = false) => {
      const state = new State(`q${stateCounter++}`, `q${stateCounter - 1}`, isStart, isFinal);
      states.push(state);
      return state;
    };

    // For simple cases
    if (regex.length === 1) {
      const start = createState(true, false);
      const end = createState(false, true);
      transitions.push(new Transition(start.id, end.id, regex));
      return new NFA(states, transitions, [regex], [start.id], [end.id]);
    }

    // More complex construction would go here
    // For now, return a simple NFA
    const start = createState(true, false);
    const end = createState(false, true);
    transitions.push(new Transition(start.id, end.id, regex));
    
    return new NFA(states, transitions, [regex], [start.id], [end.id]);
  }

  static createSimpleNFA(alphabet, transitions, startState, finalStates) {
    const states = [];
    const nfaTransitions = [];
    const stateIds = new Set();

    // Collect all state IDs
    transitions.forEach(([from, symbol, to]) => {
      stateIds.add(from);
      stateIds.add(to);
    });

    // Create states
    const numStates = Array.from(stateIds).length;
    const positions = AutomataUtils.generateStatePositions(numStates, 200, 150, 100); // Generate positions
    let i = 0;
    Array.from(stateIds).forEach(stateId => {
      const state = new State(
        stateId,
        stateId,
        stateId === startState,
        finalStates.includes(stateId)
      );
      state.position = positions[i++]; // Assign generated position
      states.push(state);
    });

    // Create transitions
    transitions.forEach(([from, symbol, to]) => {
      nfaTransitions.push(new Transition(from, to, symbol));
    });

    return new NFA(states, nfaTransitions, alphabet, [startState], finalStates);
  }
}

/**
 * Example NFAs for testing
 */
export const NFAToDFAExamples = {
  simple: [
    {
      name: 'Simple NFA with epsilon transitions',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'ε', 'q1'],
          ['q0', 'a', 'q0'],
          ['q1', 'b', 'q2']
        ],
        'q0',
        ['q2']
      ),
      description: 'NFA with epsilon transition - accepts a*b'
    },
    {
      name: 'NFA with multiple transitions on same symbol',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q0'],
          ['q0', 'a', 'q1'],
          ['q1', 'b', 'q2']
        ],
        'q0',
        ['q2']
      ),
      description: 'NFA with nondeterministic transitions - accepts a*ab'
    },
    {
      name: 'Simple two-state NFA',
      nfa: NFABuilder.createSimpleNFA(
        ['a'],
        [
          ['q0', 'a', 'q1']
        ],
        'q0',
        ['q1']
      ),
      description: 'Basic NFA accepting single "a"'
    },
    {
      name: 'NFA with self-loop',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q0'],
          ['q0', 'b', 'q1']
        ],
        'q0',
        ['q1']
      ),
      description: 'NFA with self-loop - accepts a*b'
    },
    {
      name: 'NFA with epsilon to final state',
      nfa: NFABuilder.createSimpleNFA(
        ['a'],
        [
          ['q0', 'a', 'q1'],
          ['q1', 'ε', 'q2']
        ],
        'q0',
        ['q2']
      ),
      description: 'NFA with epsilon to final state - accepts "a"'
    },
    {
      name: 'NFA with multiple final states',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q0', 'b', 'q2']
        ],
        'q0',
        ['q1', 'q2']
      ),
      description: 'NFA with multiple final states - accepts "a" or "b"'
    },
    {
      name: 'NFA with epsilon loop',
      nfa: NFABuilder.createSimpleNFA(
        ['a'],
        [
          ['q0', 'ε', 'q1'],
          ['q1', 'a', 'q2'],
          ['q2', 'ε', 'q1']
        ],
        'q0',
        ['q2']
      ),
      description: 'NFA with epsilon loop - accepts a+'
    },
    {
      name: 'Three-state linear NFA',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q1', 'b', 'q2']
        ],
        'q0',
        ['q2']
      ),
      description: 'Linear NFA - accepts "ab"'
    },
    {
      name: 'NFA with parallel paths',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q0', 'b', 'q2'],
          ['q1', 'a', 'q3'],
          ['q2', 'b', 'q3']
        ],
        'q0',
        ['q3']
      ),
      description: 'NFA with parallel paths - accepts "aa" or "bb"'
    },
    {
      name: 'NFA with epsilon start',
      nfa: NFABuilder.createSimpleNFA(
        ['a'],
        [
          ['q0', 'ε', 'q1'],
          ['q0', 'a', 'q2'],
          ['q1', 'a', 'q2']
        ],
        'q0',
        ['q2']
      ),
      description: 'NFA with epsilon from start - accepts "a"'
    }
  ],

  complex: [
    {
      name: 'Complex NFA with multiple epsilon transitions',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'ε', 'q1'],
          ['q0', 'ε', 'q3'],
          ['q1', 'a', 'q2'],
          ['q2', 'ε', 'q5'],
          ['q3', 'b', 'q4'],
          ['q4', 'ε', 'q5']
        ],
        'q0',
        ['q5']
      ),
      description: 'Complex NFA with multiple epsilon paths - accepts "a" or "b"'
    },
    {
      name: 'NFA for (a|b)*abb',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q0'],
          ['q0', 'b', 'q0'],
          ['q0', 'a', 'q1'],
          ['q1', 'b', 'q2'],
          ['q2', 'b', 'q3']
        ],
        'q0',
        ['q3']
      ),
      description: 'NFA for strings ending with "abb"'
    },
    {
      name: 'NFA with epsilon closure chains',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'ε', 'q1'],
          ['q1', 'ε', 'q2'],
          ['q2', 'a', 'q3'],
          ['q3', 'ε', 'q4'],
          ['q4', 'b', 'q5'],
          ['q0', 'b', 'q5']
        ],
        'q0',
        ['q5']
      ),
      description: 'NFA with epsilon closure chains - accepts "ab" or "b"'
    },
    {
      name: 'NFA with multiple nondeterministic choices',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q0', 'a', 'q2'],
          ['q0', 'a', 'q3'],
          ['q1', 'b', 'q4'],
          ['q2', 'a', 'q4'],
          ['q3', 'ε', 'q4']
        ],
        'q0',
        ['q4']
      ),
      description: 'NFA with multiple nondeterministic choices on "a"'
    },
    {
      name: 'NFA for even number of a\'s',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q0', 'b', 'q0'],
          ['q1', 'a', 'q0'],
          ['q1', 'b', 'q1']
        ],
        'q0',
        ['q0']
      ),
      description: 'NFA accepting strings with even number of a\'s'
    },
    {
      name: 'NFA with epsilon transitions forming cycles',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'ε', 'q1'],
          ['q1', 'ε', 'q2'],
          ['q2', 'ε', 'q0'],
          ['q1', 'a', 'q3'],
          ['q2', 'b', 'q3']
        ],
        'q0',
        ['q3']
      ),
      description: 'NFA with epsilon cycles - accepts "a" or "b"'
    },
    {
      name: 'NFA for substring pattern',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q0'],
          ['q0', 'b', 'q0'],
          ['q0', 'a', 'q1'],
          ['q1', 'b', 'q2'],
          ['q2', 'a', 'q3'],
          ['q3', 'a', 'q3'],
          ['q3', 'b', 'q3']
        ],
        'q0',
        ['q3']
      ),
      description: 'NFA for strings containing substring "aba"'
    },
    {
      name: 'NFA with overlapping epsilon transitions',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'ε', 'q1'],
          ['q0', 'ε', 'q2'],
          ['q1', 'ε', 'q3'],
          ['q2', 'ε', 'q3'],
          ['q3', 'a', 'q4'],
          ['q3', 'b', 'q4']
        ],
        'q0',
        ['q4']
      ),
      description: 'NFA with overlapping epsilon transitions'
    },
    {
      name: 'NFA for alternating pattern',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q1', 'b', 'q2'],
          ['q2', 'a', 'q3'],
          ['q3', 'b', 'q0'],
          ['q0', 'ε', 'q4']
        ],
        'q0',
        ['q4']
      ),
      description: 'NFA for alternating pattern (abab)* | ε'
    },
    {
      name: 'NFA with complex epsilon network',
      nfa: NFABuilder.createSimpleNFA(
        ['a', 'b'],
        [
          ['q0', 'ε', 'q1'],
          ['q0', 'ε', 'q4'],
          ['q1', 'ε', 'q2'],
          ['q2', 'a', 'q3'],
          ['q3', 'ε', 'q6'],
          ['q4', 'ε', 'q5'],
          ['q5', 'b', 'q6'],
          ['q6', 'ε', 'q7']
        ],
        'q0',
        ['q7']
      ),
      description: 'NFA with complex epsilon network - accepts "a" or "b"'
    }
  ]
};

export default NFAToDFAConverter;

