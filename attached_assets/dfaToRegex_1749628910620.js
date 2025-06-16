// DFA to Regular Expression conversion using state elimination algorithm
import { DFA, State, Transition, AutomataUtils } from './automataStructures.js';

/**
 * Generalized NFA for state elimination
 */
class GeneralizedNFA {
  constructor() {
    this.states = new Map();
    this.transitions = new Map(); // (from, to) -> regex
    this.startState = null;
    this.finalState = null;
  }

  addState(stateId) {
    this.states.set(stateId, stateId);
  }

  addTransition(from, to, regex) {
    const key = `${from}->${to}`;
    if (this.transitions.has(key)) {
      // Combine with existing transition using union
      const existing = this.transitions.get(key);
      this.transitions.set(key, `(${existing})|(${regex})`);
    } else {
      this.transitions.set(key, regex);
    }
  }

  getTransition(from, to) {
    const key = `${from}->${to}`;
    return this.transitions.get(key) || null;
  }

  removeState(stateId) {
    // Remove the state and reroute all transitions through it
    const incomingTransitions = [];
    const outgoingTransitions = [];
    let selfLoop = null;

    // Find all transitions involving this state
    for (const [key, regex] of this.transitions.entries()) {
      const [from, to] = key.split('->');
      
      if (to === stateId && from !== stateId) {
        incomingTransitions.push({ from, regex });
      } else if (from === stateId && to !== stateId) {
        outgoingTransitions.push({ to, regex });
      } else if (from === stateId && to === stateId) {
        selfLoop = regex;
      }
    }

    // Create new transitions bypassing the eliminated state
    for (const incoming of incomingTransitions) {
      for (const outgoing of outgoingTransitions) {
        let newRegex = incoming.regex;
        
        if (selfLoop) {
          newRegex += `(${selfLoop})*`;
        }
        
        newRegex += outgoing.regex;
        
        this.addTransition(incoming.from, outgoing.to, newRegex);
      }
    }

    // Remove all transitions involving the eliminated state
    const keysToRemove = [];
    for (const key of this.transitions.keys()) {
      const [from, to] = key.split('->');
      if (from === stateId || to === stateId) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => this.transitions.delete(key));
    this.states.delete(stateId);
  }

  getStates() {
    return Array.from(this.states.keys());
  }

  toJSON() {
    return {
      states: Array.from(this.states.keys()),
      transitions: Object.fromEntries(this.transitions),
      startState: this.startState,
      finalState: this.finalState
    };
  }
}

/**
 * DFA to Regular Expression Converter
 */
export class DFAToRegexConverter {
  constructor(dfa) {
    this.dfa = dfa;
    this.steps = [];
    this.gnfa = null;
  }

  /**
   * Main conversion method
   */
  convert() {
    this.steps = [];
    
    try {
      // Step 1: Validate input DFA
      this.validateDFA();
      this.addStep('validate', 'Validate Input DFA',
        'Check that the input DFA is well-formed',
        { dfa: this.dfa.toJSON() });

      // Step 2: Convert DFA to Generalized NFA
      this.gnfa = this.createGeneralizedNFA();
      this.addStep('create_gnfa', 'Create Generalized NFA',
        'Convert DFA to GNFA by adding new start and final states',
        { gnfa: this.gnfa.toJSON() });

      // Step 3: Eliminate states one by one
      const regex = this.eliminateStates();
      this.addStep('eliminate_states', 'Eliminate States',
        'Remove intermediate states using state elimination algorithm',
        { finalRegex: regex });

      // Step 4: Simplify the resulting regular expression
      const simplifiedRegex = this.simplifyRegex(regex);
      this.addStep('simplify', 'Simplify Regular Expression',
        'Apply simplification rules to make the regex more readable',
        { originalRegex: regex, simplifiedRegex: simplifiedRegex });

      return {
        regex: simplifiedRegex,
        steps: this.steps,
        success: true
      };
    } catch (error) {
      return {
        regex: null,
        steps: this.steps,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate the input DFA
   */
  validateDFA() {
    const errors = AutomataUtils.validateAutomaton(this.dfa);
    if (errors.length > 0) {
      throw new Error(`Invalid DFA: ${errors.join(', ')}`);
    }

    if (!this.dfa.startState) {
      throw new Error('DFA must have exactly one start state');
    }
  }

  /**
   * Create Generalized NFA from DFA
   */
  createGeneralizedNFA() {
    const gnfa = new GeneralizedNFA();
    
    // Add new start and final states
    const newStartState = 'qstart';
    const newFinalState = 'qfinal';
    
    gnfa.addState(newStartState);
    gnfa.addState(newFinalState);
    gnfa.startState = newStartState;
    gnfa.finalState = newFinalState;
    
    // Add all original states
    for (const stateId of this.dfa.states.keys()) {
      gnfa.addState(stateId);
    }
    
    // Add epsilon transition from new start to original start
    gnfa.addTransition(newStartState, this.dfa.startState, 'ε');
    
    // Add epsilon transitions from all final states to new final state
    for (const finalStateId of this.dfa.finalStates) {
      gnfa.addTransition(finalStateId, newFinalState, 'ε');
    }
    
    // Add all original transitions
    for (const transition of this.dfa.transitions.values()) {
      gnfa.addTransition(transition.from, transition.to, transition.symbol);
    }
    
    // Add empty transitions between all pairs of states that don't have transitions
    const states = gnfa.getStates();
    for (const from of states) {
      for (const to of states) {
        if (from !== to && !gnfa.getTransition(from, to)) {
          gnfa.addTransition(from, to, '∅'); // Empty set
        }
      }
    }
    
    return gnfa;
  }

  /**
   * Eliminate states using state elimination algorithm
   */
  eliminateStates() {
    const eliminationOrder = this.determineEliminationOrder();
    
    for (const stateToEliminate of eliminationOrder) {
      this.addStep('eliminate_state', `Eliminate State ${stateToEliminate}`,
        `Remove state ${stateToEliminate} and reroute transitions`,
        { 
          eliminatedState: stateToEliminate,
          gnfaBefore: this.gnfa.toJSON()
        });
      
      this.gnfa.removeState(stateToEliminate);
      
      this.addStep('after_elimination', `After Eliminating ${stateToEliminate}`,
        `GNFA state after eliminating ${stateToEliminate}`,
        { gnfaAfter: this.gnfa.toJSON() });
    }
    
    // The final regex is the transition from start to final state
    const finalRegex = this.gnfa.getTransition(this.gnfa.startState, this.gnfa.finalState);
    return finalRegex || '∅';
  }

  /**
   * Determine the order in which to eliminate states
   */
  determineEliminationOrder() {
    const states = this.gnfa.getStates();
    return states.filter(state => 
      state !== this.gnfa.startState && 
      state !== this.gnfa.finalState
    );
  }

  /**
   * Simplify regular expression
   */
  simplifyRegex(regex) {
    if (!regex || regex === '∅') return '∅';
    if (regex === 'ε') return 'ε';
    
    let simplified = regex;
    
    // Apply simplification rules
    const rules = [
      // Remove unnecessary parentheses around single symbols
      [/\(([a-zA-Z0-9])\)/g, '$1'],
      
      // Simplify epsilon
      [/ε\*/g, 'ε'],
      [/ε\+/g, 'ε'],
      [/ε\|ε/g, 'ε'],
      
      // Simplify empty set
      [/∅\*/g, 'ε'],
      [/∅\+/g, '∅'],
      [/∅\|(.+)/g, '$1'],
      [/(.+)\|∅/g, '$1'],
      [/∅(.+)/g, '∅'],
      [/(.+)∅/g, '∅'],
      
      // Simplify concatenation with epsilon
      [/ε(.+)/g, '$1'],
      [/(.+)ε/g, '$1'],
      
      // Simplify redundant stars
      [/\((.+)\*\)\*/g, '($1)*'],
      
      // Simplify union with same expression
      [/(.+)\|\1/g, '$1'],
      
      // Remove unnecessary outer parentheses
      [/^\((.+)\)$/, '$1']
    ];
    
    let previousSimplified;
    do {
      previousSimplified = simplified;
      for (const [pattern, replacement] of rules) {
        simplified = simplified.replace(pattern, replacement);
      }
    } while (simplified !== previousSimplified);
    
    return simplified;
  }

  /**
   * Helper methods
   */
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
}

/**
 * Utility functions for creating test DFAs
 */
export class DFABuilder {
  static createSimpleDFA(alphabet, transitions, startState, finalStates) {
    const states = [];
    const dfaTransitions = [];
    const stateIds = new Set();

    // Collect all state IDs
    transitions.forEach(([from, symbol, to]) => {
      stateIds.add(from);
      stateIds.add(to);
    });

    // Create states
    Array.from(stateIds).forEach(stateId => {
      states.push(new State(
        stateId,
        stateId,
        stateId === startState,
        finalStates.includes(stateId)
      ));
    });

    // Create transitions
    transitions.forEach(([from, symbol, to]) => {
      dfaTransitions.push(new Transition(from, to, symbol));
    });

    return new DFA(states, dfaTransitions, alphabet, startState, finalStates);
  }

  static createMinimalDFA() {
    // Creates a minimal DFA that accepts strings ending with 'ab'
    return this.createSimpleDFA(
      ['a', 'b'],
      [
        ['q0', 'a', 'q1'],
        ['q0', 'b', 'q0'],
        ['q1', 'a', 'q1'],
        ['q1', 'b', 'q2'],
        ['q2', 'a', 'q1'],
        ['q2', 'b', 'q0']
      ],
      'q0',
      ['q2']
    );
  }
}

/**
 * Example DFAs for testing
 */
export const DFAToRegexExamples = {
  simple: [
    {
      name: 'Single symbol',
      dfa: DFABuilder.createSimpleDFA(
        ['a'],
        [['q0', 'a', 'q1']],
        'q0',
        ['q1']
      ),
      description: 'DFA that accepts only "a"'
    },
    {
      name: 'Two symbols',
      dfa: DFABuilder.createSimpleDFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q1', 'b', 'q2']
        ],
        'q0',
        ['q2']
      ),
      description: 'DFA that accepts only "ab"'
    },
    {
      name: 'Self-loop on single symbol',
      dfa: DFABuilder.createSimpleDFA(
        ['a'],
        [['q0', 'a', 'q0']],
        'q0',
        ['q0']
      ),
      description: 'DFA that accepts a* (zero or more a\'s)'
    },
    {
      name: 'Simple alternation',
      dfa: DFABuilder.createSimpleDFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q0', 'b', 'q2']
        ],
        'q0',
        ['q1', 'q2']
      ),
      description: 'DFA that accepts "a" or "b"'
    },
    {
      name: 'One or more a\'s',
      dfa: DFABuilder.createSimpleDFA(
        ['a'],
        [
          ['q0', 'a', 'q1'],
          ['q1', 'a', 'q1']
        ],
        'q0',
        ['q1']
      ),
      description: 'DFA that accepts a+ (one or more a\'s)'
    },
    {
      name: 'Exactly two symbols',
      dfa: DFABuilder.createSimpleDFA(
        ['a'],
        [
          ['q0', 'a', 'q1'],
          ['q1', 'a', 'q2']
        ],
        'q0',
        ['q2']
      ),
      description: 'DFA that accepts exactly "aa"'
    },
    {
      name: 'Empty string only',
      dfa: DFABuilder.createSimpleDFA(
        ['a'],
        [['q0', 'a', 'q1']],
        'q0',
        ['q0']
      ),
      description: 'DFA that accepts only empty string'
    },
    {
      name: 'Three-state linear',
      dfa: DFABuilder.createSimpleDFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q1', 'b', 'q2'],
          ['q2', 'a', 'q0']
        ],
        'q0',
        ['q0']
      ),
      description: 'DFA with cycle - accepts (aba)*'
    },
    {
      name: 'Binary choice with loops',
      dfa: DFABuilder.createSimpleDFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q0', 'b', 'q0'],
          ['q1', 'a', 'q1'],
          ['q1', 'b', 'q0']
        ],
        'q0',
        ['q1']
      ),
      description: 'DFA that accepts strings ending with "a"'
    },
    {
      name: 'Simple dead state',
      dfa: DFABuilder.createSimpleDFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q0', 'b', 'q2'],
          ['q1', 'a', 'q2'],
          ['q1', 'b', 'q2'],
          ['q2', 'a', 'q2'],
          ['q2', 'b', 'q2']
        ],
        'q0',
        ['q1']
      ),
      description: 'DFA with dead state - accepts only "a"'
    }
  ],

  complex: [
    {
      name: 'Strings ending with "ab"',
      dfa: DFABuilder.createMinimalDFA(),
      description: 'DFA that accepts strings ending with "ab"'
    },
    {
      name: 'Even number of a\'s',
      dfa: DFABuilder.createSimpleDFA(
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
      description: 'DFA that accepts strings with even number of a\'s'
    },
    {
      name: 'Strings containing "aba"',
      dfa: DFABuilder.createSimpleDFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q0', 'b', 'q0'],
          ['q1', 'a', 'q1'],
          ['q1', 'b', 'q2'],
          ['q2', 'a', 'q3'],
          ['q2', 'b', 'q0'],
          ['q3', 'a', 'q3'],
          ['q3', 'b', 'q3']
        ],
        'q0',
        ['q3']
      ),
      description: 'DFA that accepts strings containing substring "aba"'
    },
    {
      name: 'Modulo 3 counter',
      dfa: DFABuilder.createSimpleDFA(
        ['a'],
        [
          ['q0', 'a', 'q1'],
          ['q1', 'a', 'q2'],
          ['q2', 'a', 'q0']
        ],
        'q0',
        ['q0']
      ),
      description: 'DFA that accepts strings with length divisible by 3'
    },
    {
      name: 'Binary number divisible by 3',
      dfa: DFABuilder.createSimpleDFA(
        ['0', '1'],
        [
          ['q0', '0', 'q0'],
          ['q0', '1', 'q1'],
          ['q1', '0', 'q2'],
          ['q1', '1', 'q0'],
          ['q2', '0', 'q1'],
          ['q2', '1', 'q2']
        ],
        'q0',
        ['q0']
      ),
      description: 'DFA for binary numbers divisible by 3'
    },
    {
      name: 'Strings with equal number of a\'s and b\'s (mod 2)',
      dfa: DFABuilder.createSimpleDFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q0', 'b', 'q2'],
          ['q1', 'a', 'q0'],
          ['q1', 'b', 'q3'],
          ['q2', 'a', 'q3'],
          ['q2', 'b', 'q0'],
          ['q3', 'a', 'q2'],
          ['q3', 'b', 'q1']
        ],
        'q0',
        ['q0']
      ),
      description: 'DFA for strings with equal number of a\'s and b\'s (mod 2)'
    },
    {
      name: 'Strings not containing "aa"',
      dfa: DFABuilder.createSimpleDFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q0', 'b', 'q0'],
          ['q1', 'a', 'q2'],
          ['q1', 'b', 'q0'],
          ['q2', 'a', 'q2'],
          ['q2', 'b', 'q2']
        ],
        'q0',
        ['q0', 'q1']
      ),
      description: 'DFA that accepts strings not containing "aa"'
    },
    {
      name: 'Strings with odd number of a\'s and even number of b\'s',
      dfa: DFABuilder.createSimpleDFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q0', 'b', 'q2'],
          ['q1', 'a', 'q0'],
          ['q1', 'b', 'q3'],
          ['q2', 'a', 'q3'],
          ['q2', 'b', 'q0'],
          ['q3', 'a', 'q2'],
          ['q3', 'b', 'q1']
        ],
        'q0',
        ['q1']
      ),
      description: 'DFA for strings with odd number of a\'s and even number of b\'s'
    },
    {
      name: 'Strings starting and ending with different symbols',
      dfa: DFABuilder.createSimpleDFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q0', 'b', 'q2'],
          ['q1', 'a', 'q1'],
          ['q1', 'b', 'q3'],
          ['q2', 'a', 'q4'],
          ['q2', 'b', 'q2'],
          ['q3', 'a', 'q1'],
          ['q3', 'b', 'q3'],
          ['q4', 'a', 'q4'],
          ['q4', 'b', 'q2']
        ],
        'q0',
        ['q3', 'q4']
      ),
      description: 'DFA for strings starting and ending with different symbols'
    },
    {
      name: 'Complex pattern with multiple cycles',
      dfa: DFABuilder.createSimpleDFA(
        ['a', 'b'],
        [
          ['q0', 'a', 'q1'],
          ['q0', 'b', 'q3'],
          ['q1', 'a', 'q2'],
          ['q1', 'b', 'q0'],
          ['q2', 'a', 'q1'],
          ['q2', 'b', 'q4'],
          ['q3', 'a', 'q4'],
          ['q3', 'b', 'q0'],
          ['q4', 'a', 'q3'],
          ['q4', 'b', 'q2']
        ],
        'q0',
        ['q2', 'q4']
      ),
      description: 'DFA with complex pattern and multiple accepting states'
    }
  ]
};

export default DFAToRegexConverter;

