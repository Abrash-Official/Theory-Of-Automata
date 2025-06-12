"""
DFA to Regular Expression conversion using state elimination algorithm
"""

from typing import List, Set, Dict, Optional, Any
from .automata_structures import DFA, State, Transition, AutomataUtils
import logging

logger = logging.getLogger(__name__)

class GeneralizedNFA:
    """Generalized NFA for state elimination"""
    
    def __init__(self):
        self.states = set()
        self.transitions = {}  # (from, to) -> regex
        self.start_state = None
        self.final_state = None
    
    def _concatenate_regex(self, r1: str, r2: str) -> str:
        """Helper to concatenate regexes with proper handling of ∅ and ε."""
        if r1 == '∅' or r2 == '∅':
            return '∅'
        if r1 == 'ε':
            return r2
        if r2 == 'ε':
            return r1

        # Add parentheses if the regex contains union and is part of a concatenation
        if '|' in r1 and len(r1) > 1 and not (r1.startswith('(') and r1.endswith(')')):
            r1 = f"({r1})"
        if '|' in r2 and len(r2) > 1 and not (r2.startswith('(') and r2.endswith(')')):
            r2 = f"({r2})"

        return r1 + r2
    
    def _union_regex(self, r1: str, r2: str) -> str:
        """Helper to union regexes with proper handling of ∅ and ε."""
        if r1 == '∅':
            return r2
        if r2 == '∅':
            return r1
        if r1 == 'ε' and r2 == 'ε': # Redundant, but explicit
            return 'ε'
        if r1 == r2:
            return r1 # Avoid redundant union like a|a

        # Canonicalize order for consistent representation
        if r1 > r2:
            r1, r2 = r2, r1

        return f"({r1}|{r2})"
    
    def add_state(self, state_id: str):
        """Add state to GNFA"""
        self.states.add(state_id)
    
    def add_transition(self, from_state: str, to_state: str, regex: str):
        """Add transition with regex label"""
        key = (from_state, to_state)
        if key in self.transitions:
            self.transitions[key] = self._union_regex(self.transitions[key], regex)
        else:
            self.transitions[key] = regex
    
    def get_transition(self, from_state: str, to_state: str) -> Optional[str]:
        """Get transition regex between states"""
        return self.transitions.get((from_state, to_state), '∅')
    
    def remove_state(self, state_id: str):
        """Remove state and reroute transitions through it"""
        incoming_transitions = []
        outgoing_transitions = []
        self_loop = None
        
        # Find all transitions involving this state
        for (from_state, to_state), regex in list(self.transitions.items()):
            if to_state == state_id and from_state != state_id:
                incoming_transitions.append((from_state, regex))
            elif from_state == state_id and to_state != state_id:
                outgoing_transitions.append((to_state, regex))
            elif from_state == state_id and to_state == state_id:
                self_loop = regex
        
        # Create new transitions bypassing the eliminated state
        for from_state, in_regex in incoming_transitions:
            for to_state, out_regex in outgoing_transitions:
                # New transition from 'from_state' to 'to_state' is 'in_regex (self_loop*) out_regex'
                # This corresponds to R_ik R_kk* R_kj

                # Handle the self-loop part (R_kk*)
                self_loop_term = 'ε'  # Default to epsilon if no self-loop
                if self_loop:
                    self_loop_term = f"({self_loop})*"  # Apply Kleene star

                # Concatenate in_regex, self_loop_term, and out_regex
                temp_regex = self._concatenate_regex(in_regex, self_loop_term)
                new_regex = self._concatenate_regex(temp_regex, out_regex)

                self.add_transition(from_state, to_state, new_regex)
        
        # Remove all transitions involving the eliminated state
        keys_to_remove = [
            key for key in self.transitions.keys()
            if key[0] == state_id or key[1] == state_id
        ]
        
        for key in keys_to_remove:
            del self.transitions[key]
        
        self.states.remove(state_id)
    
    def get_states(self) -> List[str]:
        """Get list of states"""
        return list(self.states)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            'states': list(self.states),
            'transitions': {f"{k[0]}->{k[1]}": v for k, v in self.transitions.items()},
            'startState': self.start_state,
            'finalState': self.final_state
        }

class DFAToRegexConverter:
    """Convert DFA to Regular Expression using state elimination"""
    
    def __init__(self, dfa: DFA):
        self.dfa = dfa
        self.steps = []
        self.gnfa = None
    
    def convert(self) -> Dict[str, Any]:
        """Main conversion method"""
        self.steps = []
        
        try:
            # Step 1: Validate input DFA
            self.validate_dfa()
            self.add_step('validate', 'Validate Input DFA',
                         'Check that the input DFA is well-formed',
                         {'dfa': self.dfa.to_dict()})
            
            # Step 2: Convert DFA to Generalized NFA
            self.gnfa = self.create_generalized_nfa()
            self.add_step('create_gnfa', 'Create Generalized NFA',
                         'Convert DFA to GNFA by adding new start and final states',
                         {'gnfa': self.gnfa.to_dict()})
            
            # Step 3: Eliminate states one by one
            regex = self.eliminate_states()
            self.add_step('eliminate_states', 'Eliminate States',
                         'Remove intermediate states using state elimination algorithm',
                         {'finalRegex': regex})
            
            # Step 4: Simplify the resulting regular expression
            simplified_regex = self.simplify_regex(regex)
            self.add_step('simplify', 'Simplify Regular Expression',
                         'Apply simplification rules to make the regex more readable',
                         {'originalRegex': regex, 'simplifiedRegex': simplified_regex})
            
            return {
                'success': True,
                'regex': simplified_regex,
                'steps': self.steps,
                'originalDfa': self.dfa.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error in dfa-to-regex conversion: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'steps': self.steps,
                'originalDfa': self.dfa.to_dict()
            }
    
    def validate_dfa(self):
        """Validate the input DFA"""
        errors = AutomataUtils.validate_automaton(self.dfa)
        if errors:
            raise ValueError(f"Invalid DFA: {'; '.join(errors)}")
        
        if not self.dfa.start_state:
            raise ValueError("DFA must have exactly one start state")
    
    def create_generalized_nfa(self) -> GeneralizedNFA:
        """Create Generalized NFA from DFA"""
        gnfa = GeneralizedNFA()
        
        # Add new start and final states
        new_start_state = 'qstart'
        new_final_state = 'qfinal'
        
        gnfa.add_state(new_start_state)
        gnfa.add_state(new_final_state)
        gnfa.start_state = new_start_state
        gnfa.final_state = new_final_state
        
        # Add all original states
        for state_id in self.dfa.states.keys():
            gnfa.add_state(state_id)
        
        # Add epsilon transition from new start to original start
        gnfa.add_transition(new_start_state, self.dfa.start_state, 'ε')
        
        # Add epsilon transitions from all final states to new final state
        for final_state_id in self.dfa.final_states:
            gnfa.add_transition(final_state_id, new_final_state, 'ε')
        
        # Add all original transitions
        for transition in self.dfa.transitions.values():
            gnfa.add_transition(transition.from_state, transition.to_state, transition.symbol)
        
        return gnfa
    
    def eliminate_states(self) -> str:
        """Eliminate states using state elimination algorithm"""
        elimination_order = self.determine_elimination_order()
        
        for state_to_eliminate in elimination_order:
            self.add_step('eliminate_state', f'Eliminate State {state_to_eliminate}',
                         f'Remove state {state_to_eliminate} and reroute transitions',
                         {
                             'eliminatedState': state_to_eliminate,
                             'gnfaBefore': self.gnfa.to_dict()
                         })
            
            self.gnfa.remove_state(state_to_eliminate)
            
            self.add_step('after_elimination', f'After Eliminating {state_to_eliminate}',
                         f'GNFA state after eliminating {state_to_eliminate}',
                         {
                             'gnfaAfter': self.gnfa.to_dict()
                         })

            print(f"DEBUG: After eliminating {state_to_eliminate}, GNFA: {self.gnfa.to_dict()}")

        # The final regex is the transition from start to final state
        final_regex = self.gnfa.get_transition(self.gnfa.start_state, self.gnfa.final_state)
        print(f"DEBUG: Final regex from GNFA: {final_regex}")
        return final_regex or '∅'
    
    def determine_elimination_order(self) -> List[str]:
        """Determine the order in which to eliminate states"""
        states = self.gnfa.get_states()
        return [state for state in states if state not in [self.gnfa.start_state, self.gnfa.final_state]]
    
    def simplify_regex(self, regex: str) -> str:
        """Simplify regular expression"""
        if not regex or regex == '∅':
            return '∅'
        if regex == 'ε':
            return 'ε'
        
        simplified = regex
        
        # Apply simplification rules iteratively
        rules = [
            # Remove unnecessary parentheses around single symbols
            (r'\(([a-zA-Z0-9])\)', r'\1'),
            
            # Simplify epsilon
            (r'ε\*', 'ε'),
            (r'ε\+', 'ε'),
            (r'ε\|ε', 'ε'),
            
            # Simplify empty set
            (r'∅\*', 'ε'),
            (r'∅\+', '∅'),
            (r'∅\|(.+)', r'\1'),
            (r'(.+)\|∅', r'\1'),
            (r'∅(.+)', '∅'),
            (r'(.+)∅', '∅'),
            
            # Simplify concatenation with epsilon
            (r'ε(.+)', r'\1'),
            (r'(.+)ε', r'\1'),
            
            # Simplify redundant stars
            (r'\((.+)\*\)\*', r'(\1)*'),
            
            # Remove unnecessary outer parentheses
            (r'^\((.+)\)$', r'\1'),
        ]
        
        import re
        max_iterations = 10
        iteration = 0
        
        while iteration < max_iterations:
            previous_simplified = simplified
            for pattern, replacement in rules:
                simplified = re.sub(pattern, replacement, simplified)
            
            if simplified == previous_simplified:
                break
            iteration += 1
        
        return simplified
    
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

# Builder class for creating test DFAs
class DFABuilder:
    """Utility class for building DFAs"""
    
    @staticmethod
    def create_simple_dfa(alphabet: List[str], transitions: List[tuple], 
                         start_state: str, final_states: List[str]) -> DFA:
        """Create DFA from simple definition"""
        states = []
        dfa_transitions = []
        state_ids = set()

        # Collect all state IDs
        for from_state, symbol, to_state in transitions:
            state_ids.add(from_state)
            state_ids.add(to_state)
        
        # Add start state if not in transitions
        state_ids.add(start_state)
        
        # Add final states if not in transitions  
        for final_state in final_states:
            state_ids.add(final_state)

        # Create states
        for state_id in sorted(state_ids):
            states.append(State(
                state_id,
                state_id,
                state_id == start_state,
                state_id in final_states
            ))

        # Create transitions
        for from_state, symbol, to_state in transitions:
            dfa_transitions.append(Transition(from_state, to_state, symbol))

        return DFA(states, dfa_transitions, alphabet, start_state, final_states)
