// Regular Expression to DFA conversion using direct construction
import { DFA, State, Transition, AutomataUtils } from './automataStructures.js';

/**
 * Syntax tree node for regular expressions
 */
class SyntaxTreeNode {
  constructor(type, value = null, left = null, right = null) {
    this.type = type; // 'symbol', 'concat', 'union', 'star', 'epsilon'
    this.value = value;
    this.left = left;
    this.right = right;
    this.position = null; // For leaf nodes
    this.nullable = false;
    this.firstpos = new Set();
    this.lastpos = new Set();
  }
}

/**
 * Regular Expression to DFA Converter
 */
export class RegexToDFAConverter {
  constructor(regex) {
    this.regex = regex;
    this.augmentedRegex = regex + '#';
    this.syntaxTree = null;
    this.positions = new Map(); // position -> symbol
    this.followpos = new Map(); // position -> Set of positions
    this.steps = [];
    this.positionCounter = 1;
  }

  /**
   * Main conversion method
   */
  convert() {
    this.steps = [];
    
    try {
      // Step 1: Create augmented regular expression
      this.addStep('augment', 'Create Augmented Regular Expression', 
        `Add end marker '#' to the regular expression: ${this.regex} → ${this.augmentedRegex}`,
        { original: this.regex, augmented: this.augmentedRegex });

      // Step 2: Build syntax tree
      this.syntaxTree = this.buildSyntaxTree(this.augmentedRegex);
      this.addStep('syntax_tree', 'Build Syntax Tree',
        'Construct the syntax tree for the augmented regular expression',
        { tree: this.serializeSyntaxTree(this.syntaxTree) });

      // Step 3: Calculate nullable, firstpos, lastpos
      this.calculateFunctions(this.syntaxTree);
      this.addStep('functions', 'Calculate Functions',
        'Calculate nullable, firstpos, and lastpos for each node',
        { 
          nullable: this.syntaxTree.nullable,
          firstpos: Array.from(this.syntaxTree.firstpos),
          lastpos: Array.from(this.syntaxTree.lastpos)
        });

      // Step 4: Calculate followpos
      this.calculateFollowpos(this.syntaxTree);
      this.addStep('followpos', 'Calculate Followpos',
        'Calculate followpos for each position',
        { followpos: this.serializeFollowpos() });

      // Step 5: Construct DFA
      const dfa = this.constructDFA();
      this.addStep('dfa', 'Construct DFA',
        'Build the DFA using the calculated functions',
        { dfa: dfa.toJSON() });

      return {
        dfa: dfa,
        steps: this.steps,
        success: true
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
   * Build syntax tree from regular expression
   */
  buildSyntaxTree(regex) {
    // This is a simplified parser for basic regular expressions
    // In a production system, you'd use a proper parser
    return this.parseExpression(regex, 0).node;
  }

  parseExpression(regex, index) {
    let result = this.parseTerm(regex, index);
    
    while (result.index < regex.length && regex[result.index] === '|') {
      result.index++; // skip '|'
      const right = this.parseTerm(regex, result.index);
      result = {
        node: new SyntaxTreeNode('union', '|', result.node, right.node),
        index: right.index
      };
    }
    
    return result;
  }

  parseTerm(regex, index) {
    let result = this.parseFactor(regex, index);
    
    while (result.index < regex.length && 
           regex[result.index] !== '|' && 
           regex[result.index] !== ')') {
      const right = this.parseFactor(regex, result.index);
      result = {
        node: new SyntaxTreeNode('concat', '·', result.node, right.node),
        index: right.index
      };
    }
    
    return result;
  }

  parseFactor(regex, index) {
    let result = this.parseAtom(regex, index);
    
    if (result.index < regex.length && regex[result.index] === '*') {
      result = {
        node: new SyntaxTreeNode('star', '*', result.node),
        index: result.index + 1
      };
    }
    
    return result;
  }

  parseAtom(regex, index) {
    if (index >= regex.length) {
      throw new Error('Unexpected end of expression');
    }
    
    const char = regex[index];
    
    if (char === '(') {
      const result = this.parseExpression(regex, index + 1);
      if (result.index >= regex.length || regex[result.index] !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      return { node: result.node, index: result.index + 1 };
    } else {
      // Symbol or epsilon
      const node = new SyntaxTreeNode('symbol', char);
      node.position = this.positionCounter++;
      this.positions.set(node.position, char);
      return { node: node, index: index + 1 };
    }
  }

  /**
   * Calculate nullable, firstpos, lastpos for all nodes
   */
  calculateFunctions(node) {
    if (!node) return;
    
    // Post-order traversal
    if (node.left) this.calculateFunctions(node.left);
    if (node.right) this.calculateFunctions(node.right);
    
    switch (node.type) {
      case 'symbol':
        node.nullable = false;
        node.firstpos.add(node.position);
        node.lastpos.add(node.position);
        break;
        
      case 'epsilon':
        node.nullable = true;
        // firstpos and lastpos remain empty
        break;
        
      case 'union':
        node.nullable = node.left.nullable || node.right.nullable;
        node.firstpos = new Set([...node.left.firstpos, ...node.right.firstpos]);
        node.lastpos = new Set([...node.left.lastpos, ...node.right.lastpos]);
        break;
        
      case 'concat':
        node.nullable = node.left.nullable && node.right.nullable;
        
        if (node.left.nullable) {
          node.firstpos = new Set([...node.left.firstpos, ...node.right.firstpos]);
        } else {
          node.firstpos = new Set(node.left.firstpos);
        }
        
        if (node.right.nullable) {
          node.lastpos = new Set([...node.left.lastpos, ...node.right.lastpos]);
        } else {
          node.lastpos = new Set(node.right.lastpos);
        }
        break;
        
      case 'star':
        node.nullable = true;
        node.firstpos = new Set(node.left.firstpos);
        node.lastpos = new Set(node.left.lastpos);
        break;
    }
  }

  /**
   * Calculate followpos for all positions
   */
  calculateFollowpos(node) {
    if (!node) return;
    
    // Initialize followpos for all positions
    for (let i = 1; i < this.positionCounter; i++) {
      this.followpos.set(i, new Set());
    }
    
    this.calculateFollowposRecursive(node);
  }

  calculateFollowposRecursive(node) {
    if (!node) return;
    
    if (node.type === 'concat') {
      // For each position in lastpos(left), add firstpos(right) to followpos
      for (const pos of node.left.lastpos) {
        const followSet = this.followpos.get(pos);
        for (const rightPos of node.right.firstpos) {
          followSet.add(rightPos);
        }
      }
    } else if (node.type === 'star') {
      // For each position in lastpos(node), add firstpos(node) to followpos
      for (const pos of node.lastpos) {
        const followSet = this.followpos.get(pos);
        for (const firstPos of node.firstpos) {
          followSet.add(firstPos);
        }
      }
    }
    
    // Recurse on children
    if (node.left) this.calculateFollowposRecursive(node.left);
    if (node.right) this.calculateFollowposRecursive(node.right);
  }

  /**
   * Construct DFA from calculated functions
   */
  constructDFA() {
    const states = [];
    const transitions = [];
    const alphabet = new Set();
    
    // Get alphabet (excluding end marker)
    for (const symbol of this.positions.values()) {
      if (symbol !== '#') {
        alphabet.add(symbol);
      }
    }
    
    // Start state is firstpos of root
    const startStatePositions = Array.from(this.syntaxTree.firstpos).sort();
    const startStateId = this.positionsToStateId(startStatePositions);
    
    // Queue for BFS construction
    const queue = [{ id: startStateId, positions: startStatePositions }];
    const processedStates = new Set([startStateId]);
    
    while (queue.length > 0) {
      const currentState = queue.shift();
      
      // Check if this is a final state (contains position of '#')
      const endMarkerPosition = Array.from(this.positions.entries())
        .find(([pos, symbol]) => symbol === '#')?.[0];
      const isFinal = currentState.positions.includes(endMarkerPosition);
      
      states.push(new State(
        currentState.id,
        currentState.id,
        currentState.id === startStateId,
        isFinal
      ));
      
      // For each symbol in alphabet
      for (const symbol of alphabet) {
        const nextPositions = new Set();
        
        // For each position in current state
        for (const pos of currentState.positions) {
          if (this.positions.get(pos) === symbol) {
            // Add all positions in followpos(pos)
            for (const followPos of this.followpos.get(pos)) {
              nextPositions.add(followPos);
            }
          }
        }
        
        if (nextPositions.size > 0) {
          const nextPositionsArray = Array.from(nextPositions).sort();
          const nextStateId = this.positionsToStateId(nextPositionsArray);
          
          // Add transition
          transitions.push(new Transition(
            currentState.id,
            nextStateId,
            symbol
          ));
          
          // Add new state to queue if not processed
          if (!processedStates.has(nextStateId)) {
            queue.push({ id: nextStateId, positions: nextPositionsArray });
            processedStates.add(nextStateId);
          }
        }
      }
    }
    
    return new DFA(states, transitions, Array.from(alphabet), startStateId, 
      states.filter(s => s.isFinal).map(s => s.id));
  }

  /**
   * Helper methods
   */
  positionsToStateId(positions) {
    return `{${positions.join(',')}}`;
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

  serializeSyntaxTree(node) {
    if (!node) return null;
    
    return {
      type: node.type,
      value: node.value,
      position: node.position,
      nullable: node.nullable,
      firstpos: Array.from(node.firstpos),
      lastpos: Array.from(node.lastpos),
      left: this.serializeSyntaxTree(node.left),
      right: this.serializeSyntaxTree(node.right)
    };
  }

  serializeFollowpos() {
    const result = {};
    for (const [pos, followSet] of this.followpos.entries()) {
      result[pos] = Array.from(followSet);
    }
    return result;
  }
}

/**
 * Example usage and testing
 */
export const RegexToDFAExamples = {
  simple: [
    { regex: 'a', description: 'Single symbol - accepts only "a"' },
    { regex: 'ab', description: 'Simple concatenation - accepts only "ab"' },
    { regex: 'a|b', description: 'Simple union - accepts "a" or "b"' },
    { regex: 'a*', description: 'Kleene star - zero or more a\'s' },
    { regex: '(a|b)*', description: 'Union with Kleene star - any string of a\'s and b\'s' },
    { regex: 'aa', description: 'Two consecutive a\'s' },
    { regex: 'a|ε', description: 'Optional a - accepts empty string or "a"' },
    { regex: 'bb*', description: 'One or more b\'s' },
    { regex: '(ab)', description: 'Grouped concatenation - accepts "ab"' },
    { regex: 'a|b|c', description: 'Three-way union - accepts "a", "b", or "c"' }
  ],
  
  complex: [
    { regex: '(a|b)*abb', description: 'Strings ending with "abb"' },
    { regex: 'a*b*', description: 'Zero or more a\'s followed by zero or more b\'s' },
    { regex: '(a|b)*a(a|b)(a|b)', description: 'Strings with \'a\' as third-to-last symbol' },
    { regex: '((a|b)(a|b))*', description: 'Even length strings over {a,b}' },
    { regex: 'a(a|b)*a|b(a|b)*b', description: 'Strings starting and ending with same symbol' },
    { regex: '(a|b)*a(a|b)*b(a|b)*', description: 'Strings containing both \'a\' and \'b\'' },
    { regex: '(aa|bb)*', description: 'Strings of even length with paired symbols' },
    { regex: '(a|b)*aba(a|b)*', description: 'Strings containing substring "aba"' },
    { regex: 'a*ba*ba*', description: 'Strings with exactly two b\'s' },
    { regex: '(a|b)*a(a|b)a(a|b)*', description: 'Strings with \'a\' in positions differing by 2' }
  ]
};

// Export the main converter
export default RegexToDFAConverter;

