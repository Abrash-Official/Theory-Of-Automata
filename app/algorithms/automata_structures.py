"""
Core data structures for automata theory algorithms
"""

import json
from typing import List, Set, Dict, Optional, Any
import logging

logger = logging.getLogger(__name__)

class State:
    """Represents a state in an automaton"""
    
    def __init__(self, state_id: str, label: str = None, is_start: bool = False, is_final: bool = False):
        self.id = state_id
        self.label = label or state_id
        self.is_start = is_start
        self.is_final = is_final
        self.position = {'x': 0, 'y': 0}  # For visualization
    
    def to_dict(self):
        """Convert state to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'label': self.label,
            'isStart': self.is_start,
            'isFinal': self.is_final,
            'position': self.position
        }
    
    def __str__(self):
        return f"State({self.id}, start={self.is_start}, final={self.is_final})"
    
    def __repr__(self):
        return self.__str__()

class Transition:
    """Represents a transition between states"""
    
    def __init__(self, from_state: str, to_state: str, symbol: str, transition_id: str = None):
        self.from_state = from_state
        self.to_state = to_state
        self.symbol = symbol
        self.id = transition_id or f"{from_state}-{to_state}-{symbol}"
    
    def to_dict(self):
        """Convert transition to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'from': self.from_state,
            'to': self.to_state,
            'symbol': self.symbol
        }
    
    def __str__(self):
        return f"δ({self.from_state}, {self.symbol}) = {self.to_state}"
    
    def __repr__(self):
        return self.__str__()

class Automaton:
    """Base class for automata"""
    
    def __init__(self, states: List[State], transitions: List[Transition], alphabet: List[str]):
        self.states = {state.id: state for state in states}
        self.transitions = {trans.id: trans for trans in transitions}
        self.alphabet = set(alphabet)
        self._build_transition_map()
    
    def _build_transition_map(self):
        """Build transition lookup map for efficient access"""
        self.transition_map = {}
        for transition in self.transitions.values():
            key = (transition.from_state, transition.symbol)
            if key not in self.transition_map:
                self.transition_map[key] = []
            self.transition_map[key].append(transition.to_state)
    
    def get_state(self, state_id: str) -> Optional[State]:
        """Get state by ID"""
        return self.states.get(state_id)
    
    def get_transitions_from(self, state_id: str) -> List[Transition]:
        """Get all transitions from a given state"""
        return [t for t in self.transitions.values() if t.from_state == state_id]
    
    def get_transitions_to(self, state_id: str) -> List[Transition]:
        """Get all transitions to a given state"""
        return [t for t in self.transitions.values() if t.to_state == state_id]
    
    def get_transitions_on_symbol(self, state_id: str, symbol: str) -> List[str]:
        """Get destination states for transitions from state on symbol"""
        return self.transition_map.get((state_id, symbol), [])
    
    def to_dict(self):
        """Convert automaton to dictionary for JSON serialization"""
        return {
            'states': [state.to_dict() for state in self.states.values()],
            'transitions': [trans.to_dict() for trans in self.transitions.values()],
            'alphabet': list(self.alphabet)
        }
    
    def to_json(self):
        """Convert automaton to JSON string"""
        return json.dumps(self.to_dict(), indent=2)

class NFA(Automaton):
    """Nondeterministic Finite Automaton"""
    
    def __init__(self, states: List[State], transitions: List[Transition], 
                 alphabet: List[str], start_states: List[str], final_states: List[str]):
        super().__init__(states, transitions, alphabet)
        self.start_states = set(start_states)
        self.final_states = set(final_states)
        
        # Update state properties
        for state_id in self.start_states:
            if state_id in self.states:
                self.states[state_id].is_start = True
        
        for state_id in self.final_states:
            if state_id in self.states:
                self.states[state_id].is_final = True
    
    def epsilon_closure(self, states: Set[str]) -> Set[str]:
        """Compute epsilon closure of a set of states"""
        closure = set(states)
        stack = list(states)
        
        while stack:
            current = stack.pop()
            for transition in self.get_transitions_from(current):
                if transition.symbol in ['ε', 'epsilon'] and transition.to_state not in closure:
                    closure.add(transition.to_state)
                    stack.append(transition.to_state)
        
        return closure
    
    def to_dict(self):
        """Convert NFA to dictionary"""
        data = super().to_dict()
        data.update({
            'startStates': list(self.start_states),
            'finalStates': list(self.final_states),
            'type': 'NFA'
        })
        return data

class DFA(Automaton):
    """Deterministic Finite Automaton"""
    
    def __init__(self, states: List[State], transitions: List[Transition], 
                 alphabet: List[str], start_state: str, final_states: List[str]):
        super().__init__(states, transitions, alphabet)
        self.start_state = start_state
        self.final_states = set(final_states)
        
        # Update state properties
        if start_state in self.states:
            self.states[start_state].is_start = True
        
        for state_id in self.final_states:
            if state_id in self.states:
                self.states[state_id].is_final = True
    
    def get_transition(self, state_id: str, symbol: str) -> Optional[str]:
        """Get the single destination state for DFA transition"""
        destinations = self.get_transitions_on_symbol(state_id, symbol)
        return destinations[0] if destinations else None
    
    def accepts(self, input_string: str) -> bool:
        """Check if the DFA accepts the given input string"""
        current_state = self.start_state
        
        for symbol in input_string:
            if symbol not in self.alphabet:
                return False
            
            next_state = self.get_transition(current_state, symbol)
            if next_state is None:
                return False
            
            current_state = next_state
        
        return current_state in self.final_states
    
    def to_dict(self):
        """Convert DFA to dictionary"""
        data = super().to_dict()
        data.update({
            'startState': self.start_state,
            'finalStates': list(self.final_states),
            'type': 'DFA'
        })
        return data

class AutomataUtils:
    """Utility functions for automata operations"""
    
    @staticmethod
    def validate_automaton(automaton: Automaton) -> List[str]:
        """Validate automaton structure and return list of errors"""
        errors = []
        
        if not automaton.states:
            errors.append("Automaton must have at least one state")
        
        if not automaton.alphabet:
            errors.append("Automaton must have non-empty alphabet")
        
        # Check transitions reference valid states
        for transition in automaton.transitions.values():
            if transition.from_state not in automaton.states:
                errors.append(f"Transition references invalid from-state: {transition.from_state}")
            
            if transition.to_state not in automaton.states:
                errors.append(f"Transition references invalid to-state: {transition.to_state}")
        
        return errors
    
    @staticmethod
    def remove_unreachable_states(automaton: Automaton, start_states: Set[str]) -> Automaton:
        """Remove unreachable states from automaton"""
        reachable = set()
        stack = list(start_states)
        
        while stack:
            current = stack.pop()
            if current in reachable:
                continue
            
            reachable.add(current)
            for transition in automaton.get_transitions_from(current):
                if transition.to_state not in reachable:
                    stack.append(transition.to_state)
        
        # Filter states and transitions
        new_states = [state for state in automaton.states.values() if state.id in reachable]
        new_transitions = [trans for trans in automaton.transitions.values() 
                          if trans.from_state in reachable and trans.to_state in reachable]
        
        return type(automaton)(new_states, new_transitions, list(automaton.alphabet))
    
    @staticmethod
    def format_state_set(state_set: Set[str]) -> str:
        """Format set of states for display"""
        if not state_set:
            return "∅"
        if len(state_set) == 1:
            return list(state_set)[0]
        return "{" + ", ".join(sorted(state_set)) + "}"
    
    @staticmethod
    def generate_state_positions(num_states: int, center_x: int = 300, center_y: int = 200, radius: int = 150):
        """Generate circular positions for states in visualization"""
        import math
        
        positions = []
        if num_states == 1:
            positions.append({'x': center_x, 'y': center_y})
        else:
            angle_step = 2 * math.pi / num_states
            for i in range(num_states):
                angle = i * angle_step
                x = center_x + radius * math.cos(angle)
                y = center_y + radius * math.sin(angle)
                positions.append({'x': int(x), 'y': int(y)})
        
        return positions
