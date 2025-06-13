"""
NFA to Regular Expression conversion using state elimination algorithm
"""
from .automata_structures import NFA, State, Transition, AutomataUtils
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class NFAToRegexConverter:
    """Convert NFA to Regular Expression using state elimination"""
    def __init__(self, nfa: NFA):
        self.nfa = nfa
        self.steps = []
        self.gnfa = None

    def convert(self) -> Dict[str, Any]:
        self.steps = []
        try:
            self.validate_nfa()
            self.add_step('validate', 'Validate Input NFA',
                          'Check that the input NFA is well-formed',
                          {'nfa': self.nfa.to_dict()})
            self.gnfa = self.create_generalized_nfa()
            self.add_step('create_gnfa', 'Create Generalized NFA',
                          'Convert NFA to GNFA by adding new start and final states',
                          {'gnfa': self.gnfa.to_dict()})
            regex = self.eliminate_states()
            self.add_step('eliminate_states', 'Eliminate States',
                          'Remove intermediate states using state elimination algorithm',
                          {'finalRegex': regex})
            simplified_regex = self.simplify_regex(regex)
            self.add_step('simplify', 'Simplify Regular Expression',
                          'Apply simplification rules to make the regex more readable',
                          {'originalRegex': regex, 'simplifiedRegex': simplified_regex})
            return {
                'success': True,
                'regex': simplified_regex,
                'steps': self.steps,
                'originalNfa': self.nfa.to_dict()
            }
        except Exception as e:
            logger.error(f"Error in nfa-to-regex conversion: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'steps': self.steps,
                'originalNfa': self.nfa.to_dict()
            }

    def validate_nfa(self):
        errors = AutomataUtils.validate_automaton(self.nfa)
        if errors:
            raise ValueError(f"Invalid NFA: {'; '.join(errors)}")
        if not self.nfa.start_states:
            raise ValueError("NFA must have at least one start state")

    def add_step(self, key, title, desc, data):
        self.steps.append({'key': key, 'title': title, 'description': desc, 'data': data})

    def create_generalized_nfa(self):
        from .dfa_to_regex import GeneralizedNFA
        gnfa = GeneralizedNFA()
        new_start = 'qstart'
        new_final = 'qfinal'
        gnfa.add_state(new_start)
        gnfa.add_state(new_final)
        gnfa.start_state = new_start
        gnfa.final_state = new_final
        for state_id in self.nfa.states.keys():
            gnfa.add_state(state_id)
        for s in self.nfa.start_states:
            gnfa.add_transition(new_start, s, 'ε')
        for f in self.nfa.final_states:
            gnfa.add_transition(f, new_final, 'ε')
        for t in self.nfa.transitions.values():
            gnfa.add_transition(t.from_state, t.to_state, t.symbol)
        return gnfa

    def eliminate_states(self):
        states = self.gnfa.get_states()
        elimination_order = [s for s in states if s not in [self.gnfa.start_state, self.gnfa.final_state]]
        for state in elimination_order:
            self.gnfa.remove_state(state)
        return self.gnfa.get_transition(self.gnfa.start_state, self.gnfa.final_state) or '∅'

    def simplify_regex(self, regex: str) -> str:
        # Use the same simplification as DFAToRegexConverter
        import re
        if not regex or regex == '∅':
            return '∅'
        if regex == 'ε':
            return 'ε'
        simplified = regex
        rules = [
            (r'\(([a-zA-Z0-9])\)', r'\1'),
            (r'ε\*', 'ε'),
            (r'ε\+', 'ε'),
            (r'ε\|ε', 'ε'),
            (r'∅\*', 'ε'),
            (r'∅\+', '∅'),
            (r'∅\|(.+)', r'\1'),
            (r'(.+)\|∅', r'\1'),
            (r'∅(.+)', '∅'),
            (r'(.+)∅', '∅'),
            (r'ε(.+)', r'\1'),
            (r'(.+)ε', r'\1'),
            (r'\((.+)\*\)\*', r'(\1)*'),
            (r'^\((.+)\)$', r'\1'),
        ]
        max_iterations = 10
        iteration = 0
        while iteration < max_iterations:
            previous = simplified
            for pattern, replacement in rules:
                simplified = re.sub(pattern, replacement, simplified)
            if simplified == previous:
                break
            iteration += 1
        return simplified 