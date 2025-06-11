"""
Regular Expression to DFA conversion using direct construction method
"""

import re
from typing import List, Dict, Set, Optional, Any
from .automata_structures import DFA, State, Transition, AutomataUtils
import logging

logger = logging.getLogger(__name__)

class SyntaxTreeNode:
    """Node in the syntax tree for regular expression"""
    
    def __init__(self, node_type: str, symbol: str = None, left=None, right=None):
        self.type = node_type  # 'symbol', 'concat', 'union', 'star'
        self.symbol = symbol
        self.left = left
        self.right = right
        self.position = None  # Position number for leaves
        self.nullable = False
        self.firstpos = set()
        self.lastpos = set()
        self.followpos = set()
    
    def is_leaf(self):
        return self.type == 'symbol'
    
    def to_dict(self):
        """Convert node to dictionary for serialization"""
        return {
            'type': self.type,
            'symbol': self.symbol,
            'position': self.position,
            'nullable': self.nullable,
            'firstpos': list(self.firstpos),
            'lastpos': list(self.lastpos),
            'followpos': list(self.followpos),
            'left': self.left.to_dict() if self.left else None,
            'right': self.right.to_dict() if self.right else None
        }

class RegexParser:
    """Parser for regular expressions"""
    
    def __init__(self, regex: str):
        self.regex = self.preprocess_regex(regex)
        self.position_counter = 0
        self.position_symbols = {}  # position -> symbol mapping
    
    def preprocess_regex(self, regex: str) -> str:
        """Preprocess regex to handle implicit concatenation"""
        # Add explicit concatenation operators
        result = ""
        for i, char in enumerate(regex):
            result += char
            if i < len(regex) - 1:
                next_char = regex[i + 1]
                # Add concat operator between: symbol-symbol, )-symbol, )-( , *-symbol, *-(
                if ((char.isalnum() or char in [')', '*']) and 
                    (next_char.isalnum() or next_char == '(')):
                    result += '·'  # Concatenation operator
        return result
    
    def parse(self) -> SyntaxTreeNode:
        """Parse regex and return syntax tree"""
        return self.parse_union()
    
    def parse_union(self) -> SyntaxTreeNode:
        """Parse union (|) operations"""
        left = self.parse_concat()
        
        while self.current_char() == '|':
            self.consume('|')
            right = self.parse_concat()
            left = SyntaxTreeNode('union', left=left, right=right)
        
        return left
    
    def parse_concat(self) -> SyntaxTreeNode:
        """Parse concatenation (·) operations"""
        left = self.parse_star()
        
        while self.current_char() == '·':
            self.consume('·')
            right = self.parse_star()
            left = SyntaxTreeNode('concat', left=left, right=right)
        
        return left
    
    def parse_star(self) -> SyntaxTreeNode:
        """Parse Kleene star (*) operations"""
        node = self.parse_factor()
        
        while self.current_char() == '*':
            self.consume('*')
            node = SyntaxTreeNode('star', left=node)
        
        return node
    
    def parse_factor(self) -> SyntaxTreeNode:
        """Parse factors (symbols, parentheses)"""
        if self.current_char() == '(':
            self.consume('(')
            node = self.parse_union()
            self.consume(')')
            return node
        elif self.current_char() in ['ε', '∅'] or (self.current_char() and self.current_char().isalnum()):
            symbol = self.current_char()
            self.consume()
            
            # Create leaf node with position
            self.position_counter += 1
            node = SyntaxTreeNode('symbol', symbol=symbol)
            node.position = self.position_counter
            self.position_symbols[self.position_counter] = symbol
            
            return node
        else:
            raise ValueError(f"Unexpected character: {self.current_char()}")
    
    def current_char(self) -> Optional[str]:
        """Get current character without consuming"""
        if hasattr(self, 'pos') and self.pos < len(self.regex):
            return self.regex[self.pos]
        elif not hasattr(self, 'pos'):
            self.pos = 0
            return self.regex[self.pos] if self.pos < len(self.regex) else None
        return None
    
    def consume(self, expected: str = None):
        """Consume current character"""
        if expected and self.current_char() != expected:
            raise ValueError(f"Expected '{expected}', got '{self.current_char()}'")
        
        if hasattr(self, 'pos'):
            self.pos += 1
        else:
            self.pos = 1

class RegexToDFAConverter:
    """Convert regular expression to DFA using direct construction"""
    
    def __init__(self, regex: str):
        self.regex = regex
        self.steps = []
        self.syntax_tree = None
        self.position_symbols = {}
        self.followpos_table = {}
    
    def convert(self) -> Dict[str, Any]:
        """Main conversion method"""
        self.steps = []
        
        try:
            # Step 1: Validate and preprocess regex
            self.validate_regex()
            
            # Step 2: Create augmented regex
            augmented_regex = self.create_augmented_regex()
            self.add_step('augment', 'Create Augmented Regular Expression',
                         f'Add end marker to regex: {self.regex} → {augmented_regex}',
                         {'originalRegex': self.regex, 'augmentedRegex': augmented_regex})
            
            # Step 3: Build syntax tree
            self.syntax_tree = self.build_syntax_tree(augmented_regex)
            self.add_step('syntax_tree', 'Build Syntax Tree',
                         'Construct syntax tree from augmented regular expression',
                         {'syntaxTree': self.syntax_tree.to_dict()})
            
            # Step 4: Calculate functions (nullable, firstpos, lastpos)
            self.calculate_functions()
            self.add_step('functions', 'Calculate nullable, firstpos, lastpos',
                         'Compute attributes for each node in syntax tree',
                         {'syntaxTree': self.syntax_tree.to_dict()})
            
            # Step 5: Calculate followpos
            self.calculate_followpos()
            self.add_step('followpos', 'Calculate followpos',
                         'Compute followpos for each position',
                         {'followposTable': self.serialize_followpos()})
            
            # Step 6: Construct DFA
            dfa = self.construct_dfa()
            self.add_step('construct_dfa', 'Construct DFA',
                         'Build DFA states and transitions using position sets',
                         {'dfa': dfa.to_dict()})
            
            return {
                'success': True,
                'dfa': dfa.to_dict(),
                'steps': self.steps,
                'syntaxTree': self.syntax_tree.to_dict(),
                'followposTable': self.serialize_followpos()
            }
            
        except Exception as e:
            logger.error(f"Error in regex-to-dfa conversion: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'steps': self.steps
            }
    
    def validate_regex(self):
        """Validate the input regular expression"""
        if not self.regex:
            raise ValueError("Regular expression cannot be empty")
        
        # Check for balanced parentheses
        paren_count = 0
        for char in self.regex:
            if char == '(':
                paren_count += 1
            elif char == ')':
                paren_count -= 1
                if paren_count < 0:
                    raise ValueError("Unbalanced parentheses")
        
        if paren_count != 0:
            raise ValueError("Unbalanced parentheses")
    
    def create_augmented_regex(self) -> str:
        """Create augmented regular expression by adding end marker"""
        return f"({self.regex})#"
    
    def build_syntax_tree(self, regex: str) -> SyntaxTreeNode:
        """Build syntax tree from regular expression"""
        parser = RegexParser(regex)
        tree = parser.parse()
        self.position_symbols = parser.position_symbols
        return tree
    
    def calculate_functions(self):
        """Calculate nullable, firstpos, and lastpos for all nodes"""
        self._calculate_functions_recursive(self.syntax_tree)
    
    def _calculate_functions_recursive(self, node: SyntaxTreeNode):
        """Recursively calculate functions for syntax tree nodes"""
        if node.is_leaf():
            # Leaf node
            if node.symbol in ['ε', 'epsilon']:
                node.nullable = True
                node.firstpos = set()
                node.lastpos = set()
            else:
                node.nullable = False
                node.firstpos = {node.position}
                node.lastpos = {node.position}
        else:
            # Internal node - calculate for children first
            if node.left:
                self._calculate_functions_recursive(node.left)
            if node.right:
                self._calculate_functions_recursive(node.right)
            
            # Calculate based on node type
            if node.type == 'union':
                node.nullable = node.left.nullable or node.right.nullable
                node.firstpos = node.left.firstpos | node.right.firstpos
                node.lastpos = node.left.lastpos | node.right.lastpos
                
            elif node.type == 'concat':
                node.nullable = node.left.nullable and node.right.nullable
                if node.left.nullable:
                    node.firstpos = node.left.firstpos | node.right.firstpos
                else:
                    node.firstpos = node.left.firstpos
                
                if node.right.nullable:
                    node.lastpos = node.left.lastpos | node.right.lastpos
                else:
                    node.lastpos = node.right.lastpos
                    
            elif node.type == 'star':
                node.nullable = True
                node.firstpos = node.left.firstpos
                node.lastpos = node.left.lastpos
    
    def calculate_followpos(self):
        """Calculate followpos for each position"""
        self.followpos_table = {pos: set() for pos in self.position_symbols.keys()}
        self._calculate_followpos_recursive(self.syntax_tree)
    
    def _calculate_followpos_recursive(self, node: SyntaxTreeNode):
        """Recursively calculate followpos"""
        if node.type == 'concat':
            # For concat: followpos(i) includes firstpos(right) for all i in lastpos(left)
            for pos in node.left.lastpos:
                self.followpos_table[pos] |= node.right.firstpos
                
        elif node.type == 'star':
            # For star: followpos(i) includes firstpos(star) for all i in lastpos(star)
            for pos in node.lastpos:
                self.followpos_table[pos] |= node.firstpos
        
        # Recurse on children
        if node.left:
            self._calculate_followpos_recursive(node.left)
        if node.right:
            self._calculate_followpos_recursive(node.right)
    
    def construct_dfa(self) -> DFA:
        """Construct DFA from syntax tree and followpos table"""
        states = []
        transitions = []
        alphabet = set()
        
        # Extract alphabet (excluding end marker #)
        for symbol in self.position_symbols.values():
            if symbol not in ['#', 'ε', 'epsilon', '∅']:
                alphabet.add(symbol)
        
        # Start state is firstpos of root
        start_positions = self.syntax_tree.firstpos
        start_state_id = self.positions_to_state_id(start_positions)
        
        # BFS to construct states
        state_queue = [(start_state_id, start_positions)]
        processed_states = {start_state_id}
        state_mapping = {start_state_id: start_positions}
        
        while state_queue:
            current_state_id, current_positions = state_queue.pop(0)
            
            # Check if this is a final state (contains end marker position)
            end_marker_pos = None
            for pos, symbol in self.position_symbols.items():
                if symbol == '#':
                    end_marker_pos = pos
                    break
            
            is_final = end_marker_pos in current_positions
            
            # Create state
            states.append(State(
                current_state_id,
                current_state_id,
                current_state_id == start_state_id,
                is_final
            ))
            
            # For each symbol in alphabet
            for symbol in alphabet:
                next_positions = set()
                
                # Find positions with this symbol
                for pos in current_positions:
                    if self.position_symbols.get(pos) == symbol:
                        next_positions |= self.followpos_table[pos]
                
                if next_positions:
                    next_state_id = self.positions_to_state_id(next_positions)
                    
                    # Add transition
                    transitions.append(Transition(
                        current_state_id,
                        next_state_id,
                        symbol
                    ))
                    
                    # Add new state if not processed
                    if next_state_id not in processed_states:
                        state_queue.append((next_state_id, next_positions))
                        processed_states.add(next_state_id)
                        state_mapping[next_state_id] = next_positions
        
        final_states = [s.id for s in states if s.is_final]
        dfa = DFA(states, transitions, list(alphabet), start_state_id, final_states)
        
        # Set positions for visualization
        positions = AutomataUtils.generate_state_positions(len(states))
        for i, state in enumerate(states):
            if i < len(positions):
                state.position = positions[i]
        
        return dfa
    
    def positions_to_state_id(self, positions: Set[int]) -> str:
        """Convert set of positions to state ID"""
        if not positions:
            return "∅"
        return "{" + ",".join(map(str, sorted(positions))) + "}"
    
    def serialize_followpos(self) -> Dict[str, List[int]]:
        """Serialize followpos table for JSON"""
        return {str(pos): list(followpos) for pos, followpos in self.followpos_table.items()}
    
    def add_step(self, step_type: str, title: str, description: str, data: Dict[str, Any]):
        """Add a conversion step"""
        self.steps.append({
            'id': f"step_{len(self.steps) + 1}",
            'type': step_type,
            'title': title,
            'description': description,
            'data': data,
            'timestamp': len(self.steps) + 1
        })
