"""
NFA to DFA conversion using subset construction algorithm
"""

from typing import List, Set, Dict, Optional, Any, Tuple
from .automata_structures import DFA, NFA, State, Transition, AutomataUtils
import logging

logger = logging.getLogger(__name__)

class NFAToDFAConverter:
    """Convert NFA to DFA using subset construction"""
    
    def __init__(self, nfa: NFA):
        self.nfa = nfa
        self.steps = []
        self.epsilon_closures = {}  # Cache for epsilon closures
        self.state_mapping = {}  # Maps DFA state IDs to NFA state sets
    
    def convert(self) -> Dict[str, Any]:
        """Main conversion method"""
        self.steps = []
        self.epsilon_closures.clear()
        self.state_mapping.clear()
        
        try:
            # Step 1: Validate input NFA
            self.validate_nfa()
            self.add_step('validate', 'Validate Input NFA',
                         'Check that the input NFA is well-formed',
                         {'nfa': self.nfa.to_dict()})
            
            # Step 2: Calculate epsilon closures for all states
            self.calculate_all_epsilon_closures()
            self.add_step('epsilon_closures', 'Calculate Epsilon Closures',
                         'Compute ε-closure for each state in the NFA',
                         {'closures': self.serialize_epsilon_closures()})
            
            # Step 3: Construct DFA using subset construction
            dfa = self.subset_construction()
            self.add_step('subset_construction', 'Subset Construction',
                         'Build DFA states and transitions using subset construction algorithm',
                         {'dfa': dfa.to_dict(), 'stateMapping': self.serialize_state_mapping()})
            
            # Step 4: Minimize DFA (remove unreachable states)
            minimized_dfa = self.minimize_dfa(dfa)
            self.add_step('minimize', 'Minimize DFA',
                         'Remove unreachable states and optimize DFA',
                         {'minimizedDFA': minimized_dfa.to_dict()})
            
            return {
                'success': True,
                'dfa': minimized_dfa.to_dict(),
                'steps': self.steps,
                'stateMapping': self.state_mapping,
                'nfa': self.nfa.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error in nfa-to-dfa conversion: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'steps': self.steps,
                'nfa': self.nfa.to_dict()
            }
    
    def validate_nfa(self):
        """Validate the input NFA"""
        errors = AutomataUtils.validate_automaton(self.nfa)
        if errors:
            raise ValueError(f"Invalid NFA: {'; '.join(errors)}")
        
        if not self.nfa.start_states:
            raise ValueError("NFA must have at least one start state")
    
    def calculate_all_epsilon_closures(self):
        """Calculate epsilon closures for all states"""
        for state_id in self.nfa.states.keys():
            self.get_epsilon_closure({state_id})
    
    def get_epsilon_closure(self, state_set: Set[str]) -> Set[str]:
        """Calculate epsilon closure for a set of states"""
        key = frozenset(state_set)
        
        if key in self.epsilon_closures:
            return self.epsilon_closures[key]
        
        closure = set(state_set)
        stack = list(state_set)
        
        while stack:
            current_state = stack.pop()
            
            # Find all epsilon transitions from current state
            epsilon_transitions = [
                t for t in self.nfa.get_transitions_from(current_state)
                if t.symbol in ['ε', 'epsilon']
            ]
            
            for transition in epsilon_transitions:
                if transition.to_state not in closure:
                    closure.add(transition.to_state)
                    stack.append(transition.to_state)
        
        self.epsilon_closures[key] = closure
        return closure
    
    def subset_construction(self) -> DFA:
        """Subset construction algorithm"""
        dfa_states = []
        dfa_transitions = []
        alphabet = [symbol for symbol in self.nfa.alphabet if symbol not in ['ε', 'epsilon']]
        
        # Start state: epsilon closure of NFA start states
        start_state_closure = self.get_epsilon_closure(self.nfa.start_states)
        start_state_id = self.state_set_to_id(start_state_closure)
        
        # Queue for BFS construction
        queue = [(start_state_id, start_state_closure)]
        processed_states = {start_state_id}
        
        # Track state mapping
        self.state_mapping[start_state_id] = list(start_state_closure)
        
        while queue:
            current_dfa_state_id, current_nfa_states = queue.pop(0)
            
            # Determine if this DFA state is final
            is_final = bool(current_nfa_states.intersection(self.nfa.final_states))
            
            # Create DFA state
            dfa_states.append(State(
                current_dfa_state_id,
                current_dfa_state_id,
                current_dfa_state_id == start_state_id,
                is_final
            ))
            
            # For each symbol in alphabet
            for symbol in alphabet:
                next_nfa_states = set()
                
                # For each NFA state in current DFA state
                for nfa_state_id in current_nfa_states:
                    transitions_on_symbol = [
                        t for t in self.nfa.get_transitions_from(nfa_state_id)
                        if t.symbol == symbol
                    ]
                    
                    for transition in transitions_on_symbol:
                        next_nfa_states.add(transition.to_state)
                
                if next_nfa_states:
                    # Calculate epsilon closure of reachable states
                    next_state_closure = self.get_epsilon_closure(next_nfa_states)
                    next_state_id = self.state_set_to_id(next_state_closure)
                    
                    # Add transition
                    dfa_transitions.append(Transition(
                        current_dfa_state_id,
                        next_state_id,
                        symbol
                    ))
                    
                    # Add new state to queue if not processed
                    if next_state_id not in processed_states:
                        queue.append((next_state_id, next_state_closure))
                        processed_states.add(next_state_id)
                        self.state_mapping[next_state_id] = list(next_state_closure)
        
        final_states = [s.id for s in dfa_states if s.is_final]
        dfa = DFA(dfa_states, dfa_transitions, alphabet, start_state_id, final_states)
        
        # Set positions for visualization
        positions = AutomataUtils.generate_state_positions(len(dfa_states))
        for i, state in enumerate(dfa_states):
            if i < len(positions):
                state.position = positions[i]
        
        return dfa
    
    def minimize_dfa(self, dfa: DFA) -> DFA:
        """Minimize DFA by removing unreachable states"""
        reachable_states = self.find_reachable_states(dfa)
        return self.remove_unreachable_states(dfa, reachable_states)
    
    def find_reachable_states(self, dfa: DFA) -> Set[str]:
        """Find all reachable states from start state"""
        reachable = {dfa.start_state}
        queue = [dfa.start_state]
        
        while queue:
            current_state = queue.pop(0)
            
            for transition in dfa.get_transitions_from(current_state):
                if transition.to_state not in reachable:
                    reachable.add(transition.to_state)
                    queue.append(transition.to_state)
        
        return reachable
    
    def remove_unreachable_states(self, dfa: DFA, reachable_states: Set[str]) -> DFA:
        """Remove unreachable states from DFA"""
        new_states = [state for state in dfa.states.values() if state.id in reachable_states]
        new_transitions = [
            transition for transition in dfa.transitions.values()
            if transition.from_state in reachable_states and transition.to_state in reachable_states
        ]
        
        new_final_states = [state_id for state_id in dfa.final_states if state_id in reachable_states]
        
        return DFA(new_states, new_transitions, list(dfa.alphabet), dfa.start_state, new_final_states)
    
    def state_set_to_id(self, state_set: Set[str]) -> str:
        """Convert set of states to state ID"""
        if not state_set:
            return "∅"
        return "{" + ",".join(sorted(state_set)) + "}"
    
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
    
    def serialize_epsilon_closures(self) -> Dict[str, List[str]]:
        """Serialize epsilon closures for JSON"""
        result = {}
        for state_set, closure in self.epsilon_closures.items():
            key = "{" + ",".join(sorted(state_set)) + "}"
            result[key] = sorted(list(closure))
        return result
    
    def serialize_state_mapping(self) -> Dict[str, List[str]]:
        """Serialize state mapping for JSON"""
        return {dfa_state_id: nfa_states for dfa_state_id, nfa_states in self.state_mapping.items()}

# Builder class for creating NFAs from simple definitions
class NFABuilder:
    """Utility class for building NFAs"""
    
    @staticmethod
    def create_simple_nfa(alphabet: List[str], transitions: List[Tuple[str, str, str]], 
                         start_state: str, final_states: List[str]) -> NFA:
        """Create NFA from simple definition"""
        states = []
        nfa_transitions = []
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
            nfa_transitions.append(Transition(from_state, to_state, symbol))

        return NFA(states, nfa_transitions, alphabet, [start_state], final_states)
