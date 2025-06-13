"""
Example problems database for automata theory conversions
"""

from algorithms.automata_structures import NFA, DFA, State, Transition
from algorithms.nfa_to_dfa import NFABuilder
from algorithms.dfa_to_regex import DFABuilder

def get_examples():
    """Get all example problems organized by conversion type"""
    return {
        'regex-to-dfa': get_regex_to_dfa_examples(),
        'nfa-to-dfa': get_nfa_to_dfa_examples(),
        'dfa-to-regex': get_dfa_to_regex_examples(),
        'dfa-to-nfa': get_dfa_to_nfa_examples(),
        'nfa-to-regex': get_nfa_to_regex_examples(),
    }

def get_regex_to_dfa_examples():
    """Get Regular Expression to DFA examples"""
    return {
        'simple': [
            {
                'id': 'simple_1',
                'name': 'Single symbol: a',
                'regex': 'a',
                'description': 'Basic single symbol - accepts only "a"',
                'difficulty': 'easy'
            },
            {
                'id': 'simple_2', 
                'name': 'Simple concatenation: ab',
                'regex': 'ab',
                'description': 'Basic concatenation - accepts only "ab"',
                'difficulty': 'easy'
            },
            {
                'id': 'simple_3',
                'name': 'Simple union: a|b',
                'regex': 'a|b',
                'description': 'Basic union - accepts "a" or "b"',
                'difficulty': 'easy'
            },
            {
                'id': 'simple_4',
                'name': 'Kleene star: a*',
                'regex': 'a*',
                'description': 'Zero or more repetitions of "a"',
                'difficulty': 'easy'
            },
            {
                'id': 'simple_5',
                'name': 'Union with Kleene star: (a|b)*',
                'regex': '(a|b)*',
                'description': 'Zero or more repetitions of "a" or "b"',
                'difficulty': 'easy'
            },
            {
                'id': 'simple_6',
                'name': 'Simple concatenation with star: a*b',
                'regex': 'a*b',
                'description': 'Zero or more "a"s followed by "b"',
                'difficulty': 'easy'
            },
            {
                'id': 'simple_7',
                'name': 'Parentheses: (ab)*',
                'regex': '(ab)*',
                'description': 'Zero or more repetitions of "ab"',
                'difficulty': 'easy'
            },
            {
                'id': 'simple_8',
                'name': 'Three symbols: abc',
                'regex': 'abc',
                'description': 'Concatenation of three symbols',
                'difficulty': 'easy'
            },
            {
                'id': 'simple_9',
                'name': 'Optional symbol: a|ε',
                'regex': 'a|ε',
                'description': 'Optional "a" - accepts empty string or "a"',
                'difficulty': 'easy'
            },
            {
                'id': 'simple_10',
                'name': 'Two Kleene stars: a*b*',
                'regex': 'a*b*',
                'description': 'Zero or more "a"s followed by zero or more "b"s',
                'difficulty': 'easy'
            }
        ],
        'complex': [
            {
                'id': 'complex_1',
                'name': 'Strings ending with "abb": (a|b)*abb',
                'regex': '(a|b)*abb',
                'description': 'All strings over {a,b} ending with "abb"',
                'difficulty': 'hard'
            },
            {
                'id': 'complex_2',
                'name': 'Even number of a\'s: (b|ab*ab*)*',
                'regex': '(b|ab*ab*)*',
                'description': 'Strings with even number of "a"s',
                'difficulty': 'hard'
            },
            {
                'id': 'complex_3',
                'name': 'Strings with "a" as third-to-last: (a|b)*a(a|b)(a|b)',
                'regex': '(a|b)*a(a|b)(a|b)',
                'description': 'Strings where third-to-last symbol is "a"',
                'difficulty': 'hard'
            },
            {
                'id': 'complex_4',
                'name': 'Even length strings: ((a|b)(a|b))*',
                'regex': '((a|b)(a|b))*',
                'description': 'Strings of even length over {a,b}',
                'difficulty': 'hard'
            },
            {
                'id': 'complex_5',
                'name': 'Start and end with same symbol: a(a|b)*a|b(a|b)*b|a|b',
                'regex': 'a(a|b)*a|b(a|b)*b|a|b',
                'description': 'Strings starting and ending with same symbol',
                'difficulty': 'hard'
            },
            {
                'id': 'complex_6',
                'name': 'Contains "aba" as substring: (a|b)*aba(a|b)*',
                'regex': '(a|b)*aba(a|b)*',
                'description': 'Strings containing "aba" as substring',
                'difficulty': 'hard'
            },
            {
                'id': 'complex_7',
                'name': 'Alternating pattern: (ab|ba)*',
                'regex': '(ab|ba)*',
                'description': 'Strings of alternating "ab" or "ba" patterns',
                'difficulty': 'hard'
            },
            {
                'id': 'complex_8',
                'name': 'No consecutive b\'s: (a|ba)*b?',
                'regex': '(a|ba)*b?',
                'description': 'Strings with no consecutive "b"s',
                'difficulty': 'hard'
            },
            {
                'id': 'complex_9',
                'name': 'Binary numbers divisible by 3: (0|(1(01*01|01*00)*(1|01*10)))*',
                'regex': '(0|(1(01*01|01*00)*(1|01*10)))*',
                'description': 'Binary strings representing numbers divisible by 3',
                'difficulty': 'hard'
            },
            {
                'id': 'complex_10',
                'name': 'Palindromes of odd length: a|b|(a(a|b)*a)|(b(a|b)*b)',
                'regex': 'a|b|(a(a|b)*a)|(b(a|b)*b)',
                'description': 'Palindromes of odd length over {a,b}',
                'difficulty': 'hard'
            }
        ]
    }

def get_nfa_to_dfa_examples():
    """Get NFA to DFA examples"""
    return {
        'simple': [
            {
                'id': 'nfa_simple_1',
                'name': 'Simple NFA with epsilon transitions',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'ε', 'q1'),
                        ('q0', 'a', 'q0'),
                        ('q1', 'b', 'q2')
                    ],
                    'q0',
                    ['q2']
                ).to_dict(),
                'description': 'NFA with epsilon transition - accepts a*b'
            },
            {
                'id': 'nfa_simple_2',
                'name': 'NFA with multiple transitions on same symbol',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q0'),
                        ('q0', 'a', 'q1'),
                        ('q1', 'b', 'q2')
                    ],
                    'q0',
                    ['q2']
                ).to_dict(),
                'description': 'NFA with nondeterministic transitions - accepts a*ab'
            },
            {
                'id': 'nfa_simple_3',
                'name': 'Simple two-state NFA',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a'],
                    [
                        ('q0', 'a', 'q1')
                    ],
                    'q0',
                    ['q1']
                ).to_dict(),
                'description': 'Basic NFA accepting single "a"'
            },
            {
                'id': 'nfa_simple_4',
                'name': 'NFA with self-loop',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q0'),
                        ('q0', 'b', 'q1')
                    ],
                    'q0',
                    ['q1']
                ).to_dict(),
                'description': 'NFA with self-loop - accepts a*b'
            },
            {
                'id': 'nfa_simple_5',
                'name': 'NFA with epsilon to final state',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q1', 'ε', 'q2')
                    ],
                    'q0',
                    ['q2']
                ).to_dict(),
                'description': 'NFA with epsilon to final state - accepts "a"'
            },
            {
                'id': 'nfa_simple_6',
                'name': 'NFA with multiple final states',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q2')
                    ],
                    'q0',
                    ['q1', 'q2']
                ).to_dict(),
                'description': 'NFA with multiple final states - accepts "a" or "b"'
            },
            {
                'id': 'nfa_simple_7',
                'name': 'NFA with epsilon loop',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a'],
                    [
                        ('q0', 'ε', 'q1'),
                        ('q1', 'a', 'q2'),
                        ('q2', 'ε', 'q1')
                    ],
                    'q0',
                    ['q2']
                ).to_dict(),
                'description': 'NFA with epsilon loop - accepts a+'
            },
            {
                'id': 'nfa_simple_8',
                'name': 'Three-state linear NFA',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q1', 'b', 'q2')
                    ],
                    'q0',
                    ['q2']
                ).to_dict(),
                'description': 'Linear NFA - accepts "ab"'
            },
            {
                'id': 'nfa_simple_9',
                'name': 'NFA with parallel paths',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q2'),
                        ('q1', 'a', 'q3'),
                        ('q2', 'b', 'q3')
                    ],
                    'q0',
                    ['q3']
                ).to_dict(),
                'description': 'NFA with parallel paths - accepts "aa" or "bb"'
            },
            {
                'id': 'nfa_simple_10',
                'name': 'NFA accepting empty string',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a'],
                    [
                        ('q0', 'a', 'q1')
                    ],
                    'q0',
                    ['q0']
                ).to_dict(),
                'description': 'NFA accepting empty string and "a"'
            }
        ],
        'complex': [
            {
                'id': 'nfa_complex_1',
                'name': 'Complex NFA with multiple epsilon transitions',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'ε', 'q1'),
                        ('q0', 'ε', 'q2'),
                        ('q1', 'a', 'q3'),
                        ('q2', 'b', 'q3'),
                        ('q3', 'ε', 'q4'),
                        ('q4', 'a', 'q4'),
                        ('q4', 'b', 'q4')
                    ],
                    'q0',
                    ['q4']
                ).to_dict(),
                'description': 'Complex NFA - accepts (a|b)(a|b)*'
            },
            {
                'id': 'nfa_complex_2',
                'name': 'NFA for strings ending with "ab"',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q0'),
                        ('q0', 'b', 'q0'),
                        ('q0', 'a', 'q1'),
                        ('q1', 'b', 'q2')
                    ],
                    'q0',
                    ['q2']
                ).to_dict(),
                'description': 'NFA accepting strings ending with "ab"'
            },
            {
                'id': 'nfa_complex_3',
                'name': 'NFA with multiple nondeterministic choices',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b', 'c'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'a', 'q2'),
                        ('q0', 'a', 'q3'),
                        ('q1', 'b', 'q4'),
                        ('q2', 'c', 'q4'),
                        ('q3', 'b', 'q5'),
                        ('q3', 'c', 'q5')
                    ],
                    'q0',
                    ['q4', 'q5']
                ).to_dict(),
                'description': 'NFA with multiple nondeterministic paths'
            },
            {
                'id': 'nfa_complex_4',
                'name': 'NFA with epsilon transitions forming cycles',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'ε', 'q1'),
                        ('q1', 'a', 'q2'),
                        ('q2', 'ε', 'q3'),
                        ('q3', 'b', 'q4'),
                        ('q4', 'ε', 'q1'),
                        ('q4', 'ε', 'q5')
                    ],
                    'q0',
                    ['q5']
                ).to_dict(),
                'description': 'NFA with epsilon cycles - accepts (ab)+'
            },
            {
                'id': 'nfa_complex_5',
                'name': 'NFA for palindromes of length 3',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q2'),
                        ('q1', 'a', 'q3'),
                        ('q1', 'b', 'q4'),
                        ('q2', 'a', 'q4'),
                        ('q2', 'b', 'q3'),
                        ('q3', 'a', 'q5'),
                        ('q4', 'b', 'q5')
                    ],
                    'q0',
                    ['q5']
                ).to_dict(),
                'description': 'NFA accepting palindromes of length 3'
            },
            {
                'id': 'nfa_complex_6',
                'name': 'NFA with overlapping patterns',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q0'),
                        ('q0', 'b', 'q0'),
                        ('q0', 'a', 'q1'),
                        ('q1', 'b', 'q2'),
                        ('q2', 'a', 'q3'),
                        ('q2', 'a', 'q1')
                    ],
                    'q0',
                    ['q3']
                ).to_dict(),
                'description': 'NFA with overlapping pattern matching for "aba"'
            },
            {
                'id': 'nfa_complex_7',
                'name': 'NFA with multiple epsilon closures',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'ε', 'q1'),
                        ('q0', 'ε', 'q4'),
                        ('q1', 'a', 'q2'),
                        ('q2', 'ε', 'q3'),
                        ('q4', 'b', 'q5'),
                        ('q5', 'ε', 'q3'),
                        ('q3', 'a', 'q6'),
                        ('q3', 'b', 'q6')
                    ],
                    'q0',
                    ['q6']
                ).to_dict(),
                'description': 'NFA with complex epsilon closures'
            },
            {
                'id': 'nfa_complex_8',
                'name': 'NFA for strings with odd number of a\'s',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q0'),
                        ('q1', 'a', 'q0'),
                        ('q1', 'b', 'q1')
                    ],
                    'q0',
                    ['q1']
                ).to_dict(),
                'description': 'NFA accepting strings with odd number of "a"s'
            },
            {
                'id': 'nfa_complex_9',
                'name': 'NFA with dead states and epsilon transitions',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'ε', 'q1'),
                        ('q0', 'a', 'q2'),
                        ('q1', 'b', 'q3'),
                        ('q2', 'a', 'q2'),
                        ('q2', 'b', 'q4'),
                        ('q3', 'ε', 'q5'),
                        ('q4', 'a', 'q4'),
                        ('q4', 'b', 'q4')
                    ],
                    'q0',
                    ['q5']
                ).to_dict(),
                'description': 'NFA with unreachable states and complex structure'
            },
            {
                'id': 'nfa_complex_10',
                'name': 'NFA for union of complex patterns',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b', 'c'],
                    [
                        ('q0', 'ε', 'q1'),
                        ('q0', 'ε', 'q5'),
                        ('q1', 'a', 'q2'),
                        ('q2', 'b', 'q3'),
                        ('q3', 'c', 'q4'),
                        ('q5', 'c', 'q6'),
                        ('q6', 'b', 'q7'),
                        ('q7', 'a', 'q8')
                    ],
                    'q0',
                    ['q4', 'q8']
                ).to_dict(),
                'description': 'NFA representing union of "abc" and "cba"'
            }
        ]
    }

def get_dfa_to_regex_examples():
    """Get DFA to Regular Expression examples"""
    return {
        'simple': [
            {
                'id': 'dfa_simple_1',
                'name': 'Single symbol',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a'],
                    [('q0', 'a', 'q1')],
                    'q0',
                    ['q1']
                ).to_dict(),
                'description': 'DFA that accepts only "a"'
            },
            {
                'id': 'dfa_simple_2',
                'name': 'Two symbols',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q1', 'b', 'q2')
                    ],
                    'q0',
                    ['q2']
                ).to_dict(),
                'description': 'DFA that accepts only "ab"'
            },
            {
                'id': 'dfa_simple_3',
                'name': 'Self-loop on single symbol',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a'],
                    [('q0', 'a', 'q0')],
                    'q0',
                    ['q0']
                ).to_dict(),
                'description': 'DFA that accepts a* (zero or more a\'s)'
            },
            {
                'id': 'dfa_simple_4',
                'name': 'Simple alternation',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q2')
                    ],
                    'q0',
                    ['q1', 'q2']
                ).to_dict(),
                'description': 'DFA that accepts "a" or "b"'
            },
            {
                'id': 'dfa_simple_5',
                'name': 'One or more a\'s',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q1', 'a', 'q1')
                    ],
                    'q0',
                    ['q1']
                ).to_dict(),
                'description': 'DFA that accepts a+ (one or more a\'s)'
            },
            {
                'id': 'dfa_simple_6',
                'name': 'Exactly two symbols',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q1', 'a', 'q2')
                    ],
                    'q0',
                    ['q2']
                ).to_dict(),
                'description': 'DFA that accepts exactly "aa"'
            },
            {
                'id': 'dfa_simple_7',
                'name': 'Empty string only',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a'],
                    [('q0', 'a', 'q1')],
                    'q0',
                    ['q0']
                ).to_dict(),
                'description': 'DFA that accepts only empty string'
            },
            {
                'id': 'dfa_simple_8',
                'name': 'Three-state cycle',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q1', 'a', 'q2'),
                        ('q2', 'a', 'q0')
                    ],
                    'q0',
                    ['q0']
                ).to_dict(),
                'description': 'DFA with 3-state cycle - accepts (aaa)*'
            },
            {
                'id': 'dfa_simple_9',
                'name': 'Binary choice',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q0'),
                        ('q1', 'a', 'q1'),
                        ('q1', 'b', 'q0')
                    ],
                    'q0',
                    ['q1']
                ).to_dict(),
                'description': 'DFA that accepts strings ending with "a"'
            },
            {
                'id': 'dfa_simple_10',
                'name': 'Simple dead state',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q2'),
                        ('q1', 'a', 'q2'),
                        ('q1', 'b', 'q2'),
                        ('q2', 'a', 'q2'),
                        ('q2', 'b', 'q2')
                    ],
                    'q0',
                    ['q1']
                ).to_dict(),
                'description': 'DFA with dead state - accepts only "a"'
            }
        ],
        'complex': [
            {
                'id': 'dfa_complex_1',
                'name': 'Strings ending with "abb"',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q0'),
                        ('q1', 'a', 'q1'),
                        ('q1', 'b', 'q2'),
                        ('q2', 'a', 'q1'),
                        ('q2', 'b', 'q3'),
                        ('q3', 'a', 'q1'),
                        ('q3', 'b', 'q0')
                    ],
                    'q0',
                    ['q3']
                ).to_dict(),
                'description': 'DFA accepting strings ending with "abb"'
            },
            {
                'id': 'dfa_complex_2',
                'name': 'Even number of a\'s and b\'s',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q2'),
                        ('q1', 'a', 'q0'),
                        ('q1', 'b', 'q3'),
                        ('q2', 'a', 'q3'),
                        ('q2', 'b', 'q0'),
                        ('q3', 'a', 'q2'),
                        ('q3', 'b', 'q1')
                    ],
                    'q0',
                    ['q0']
                ).to_dict(),
                'description': 'DFA accepting strings with even number of both a\'s and b\'s'
            },
            {
                'id': 'dfa_complex_3',
                'name': 'Strings divisible by 3 (binary)',
                'dfa': DFABuilder.create_simple_dfa(
                    ['0', '1'],
                    [
                        ('q0', '0', 'q0'),
                        ('q0', '1', 'q1'),
                        ('q1', '0', 'q2'),
                        ('q1', '1', 'q0'),
                        ('q2', '0', 'q1'),
                        ('q2', '1', 'q2')
                    ],
                    'q0',
                    ['q0']
                ).to_dict(),
                'description': 'DFA for binary numbers divisible by 3'
            },
            {
                'id': 'dfa_complex_4',
                'name': 'Contains "aba" as substring',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q0'),
                        ('q1', 'a', 'q1'),
                        ('q1', 'b', 'q2'),
                        ('q2', 'a', 'q3'),
                        ('q2', 'b', 'q0'),
                        ('q3', 'a', 'q3'),
                        ('q3', 'b', 'q3')
                    ],
                    'q0',
                    ['q3']
                ).to_dict(),
                'description': 'DFA accepting strings containing "aba"'
            },
            {
                'id': 'dfa_complex_5',
                'name': 'Length modulo 4 equals 1',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q1'),
                        ('q1', 'a', 'q2'),
                        ('q1', 'b', 'q2'),
                        ('q2', 'a', 'q3'),
                        ('q2', 'b', 'q3'),
                        ('q3', 'a', 'q0'),
                        ('q3', 'b', 'q0')
                    ],
                    'q0',
                    ['q1']
                ).to_dict(),
                'description': 'DFA for strings whose length ≡ 1 (mod 4)'
            },
            {
                'id': 'dfa_complex_6',
                'name': 'No two consecutive a\'s',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q0'),
                        ('q1', 'a', 'q2'),
                        ('q1', 'b', 'q0'),
                        ('q2', 'a', 'q2'),
                        ('q2', 'b', 'q2')
                    ],
                    'q0',
                    ['q0', 'q1']
                ).to_dict(),
                'description': 'DFA accepting strings with no two consecutive a\'s'
            },
            {
                'id': 'dfa_complex_7',
                'name': 'Third symbol from right is a',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q0'),
                        ('q1', 'a', 'q2'),
                        ('q1', 'b', 'q1'),
                        ('q2', 'a', 'q3'),
                        ('q2', 'b', 'q3'),
                        ('q3', 'a', 'q4'),
                        ('q3', 'b', 'q4'),
                        ('q4', 'a', 'q3'),
                        ('q4', 'b', 'q3')
                    ],
                    'q0',
                    ['q3', 'q4']
                ).to_dict(),
                'description': 'DFA where third symbol from right is "a"'
            },
            {
                'id': 'dfa_complex_8',
                'name': 'Starts with a and ends with b',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q2'),
                        ('q1', 'a', 'q1'),
                        ('q1', 'b', 'q3'),
                        ('q2', 'a', 'q2'),
                        ('q2', 'b', 'q2'),
                        ('q3', 'a', 'q1'),
                        ('q3', 'b', 'q3')
                    ],
                    'q0',
                    ['q3']
                ).to_dict(),
                'description': 'DFA for strings starting with "a" and ending with "b"'
            },
            {
                'id': 'dfa_complex_9',
                'name': 'At least two a\'s and at least one b',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q0'),
                        ('q1', 'a', 'q2'),
                        ('q1', 'b', 'q1'),
                        ('q2', 'a', 'q2'),
                        ('q2', 'b', 'q3'),
                        ('q3', 'a', 'q3'),
                        ('q3', 'b', 'q3')
                    ],
                    'q0',
                    ['q3']
                ).to_dict(),
                'description': 'DFA requiring at least two a\'s and at least one b'
            },
            {
                'id': 'dfa_complex_10',
                'name': 'Palindromes of even length',
                'dfa': DFABuilder.create_simple_dfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q2'),
                        ('q1', 'a', 'q0'),
                        ('q1', 'b', 'q3'),
                        ('q2', 'a', 'q3'),
                        ('q2', 'b', 'q0'),
                        ('q3', 'a', 'q2'),
                        ('q3', 'b', 'q1')
                    ],
                    'q0',
                    ['q0']
                ).to_dict(),
                'description': 'DFA accepting even-length palindromes'
            }
        ]
    }

def get_nfa_to_regex_examples():
    """Get NFA to Regex examples"""
    return {
        'simple': [
            {
                'id': 'nfa_regex_simple_1',
                'name': 'NFA for a*',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a'],
                    [
                        ('q0', 'a', 'q0')
                    ],
                    'q0',
                    ['q0']
                ).to_dict(),
                'description': 'NFA that accepts any number of a (a*)'
            },
            {
                'id': 'nfa_regex_simple_2',
                'name': 'NFA for a|b',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q0', 'b', 'q1')
                    ],
                    'q0',
                    ['q1']
                ).to_dict(),
                'description': 'NFA that accepts a single a or b'
            }
        ],
        'complex': [
            {
                'id': 'nfa_regex_complex_1',
                'name': 'NFA for (ab)*',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q1'),
                        ('q1', 'b', 'q0')
                    ],
                    'q0',
                    ['q0']
                ).to_dict(),
                'description': 'NFA that accepts strings like ab, abab, ababab, ...'
            },
            {
                'id': 'nfa_regex_complex_2',
                'name': 'NFA for a*b*',
                'nfa': NFABuilder.create_simple_nfa(
                    ['a', 'b'],
                    [
                        ('q0', 'a', 'q0'),
                        ('q0', 'b', 'q1'),
                        ('q1', 'b', 'q1')
                    ],
                    'q0',
                    ['q1']
                ).to_dict(),
                'description': 'NFA that accepts zero or more a followed by zero or more b (a*b*)'
            }
        ]
    }

def get_dfa_to_nfa_examples():
    """Get DFA to NFA examples"""
    from algorithms.automata_structures import DFA, State, Transition
    return {
        'simple': [
            {
                'id': 'dfa_simple_1',
                'name': 'Simple DFA for a*',
                'dfa': DFA(
                    [State('q0', 'q0', True, True)],
                    [Transition('q0', 'q0', 'a')],
                    ['a'],
                    'q0',
                    ['q0']
                ).to_dict(),
                'description': 'DFA that accepts any number of a (a*)'
            },
            {
                'id': 'dfa_simple_2',
                'name': 'DFA for (ab)*',
                'dfa': DFA(
                    [State('q0', 'q0', True, False), State('q1', 'q1', False, True)],
                    [Transition('q0', 'q1', 'a'), Transition('q1', 'q0', 'b')],
                    ['a', 'b'],
                    'q0',
                    ['q1']
                ).to_dict(),
                'description': 'DFA that accepts strings like ab, abab, ababab, ...'
            },
            {
                'id': 'dfa_simple_3',
                'name': 'DFA for even number of 0s',
                'dfa': DFA(
                    [State('q0', 'q0', True, True), State('q1', 'q1', False, False)],
                    [Transition('q0', 'q1', '0'), Transition('q1', 'q0', '0')],
                    ['0'],
                    'q0',
                    ['q0']
                ).to_dict(),
                'description': 'DFA that accepts binary strings with even number of 0s'
            },
            {
                'id': 'dfa_simple_4',
                'name': 'DFA for a|b',
                'dfa': DFA(
                    [State('q0', 'q0', True, False), State('q1', 'q1', False, True)],
                    [Transition('q0', 'q1', 'a'), Transition('q0', 'q1', 'b')],
                    ['a', 'b'],
                    'q0',
                    ['q1']
                ).to_dict(),
                'description': 'DFA that accepts a single a or b'
            },
            {
                'id': 'dfa_simple_5',
                'name': 'DFA for strings ending with 1',
                'dfa': DFA(
                    [State('q0', 'q0', True, False), State('q1', 'q1', False, True)],
                    [Transition('q0', 'q0', '0'), Transition('q0', 'q1', '1'), Transition('q1', 'q0', '0'), Transition('q1', 'q1', '1')],
                    ['0', '1'],
                    'q0',
                    ['q1']
                ).to_dict(),
                'description': 'DFA that accepts binary strings ending with 1'
            }
        ],
        'complex': [
            {
                'id': 'dfa_complex_1',
                'name': 'DFA for binary strings ending with 01',
                'dfa': DFA(
                    [State('q0', 'q0', True, False), State('q1', 'q1', False, False), State('q2', 'q2', False, True)],
                    [Transition('q0', 'q0', '0'), Transition('q0', 'q1', '1'), Transition('q1', 'q2', '0'), Transition('q2', 'q1', '1')],
                    ['0', '1'],
                    'q0',
                    ['q2']
                ).to_dict(),
                'description': 'DFA that accepts binary strings ending with 01'
            },
            {
                'id': 'dfa_complex_2',
                'name': 'DFA for strings containing "ab" as a substring',
                'dfa': DFA(
                    [State('q0', 'q0', True, False), State('q1', 'q1', False, False), State('q2', 'q2', False, True)],
                    [Transition('q0', 'q0', 'a'), Transition('q0', 'q0', 'b'), Transition('q0', 'q1', 'a'), Transition('q1', 'q2', 'b'), Transition('q2', 'q2', 'a'), Transition('q2', 'q2', 'b')],
                    ['a', 'b'],
                    'q0',
                    ['q2']
                ).to_dict(),
                'description': 'DFA that accepts strings containing "ab" as a substring'
            },
            {
                'id': 'dfa_complex_3',
                'name': 'DFA for strings with at least two 1s',
                'dfa': DFA(
                    [State('q0', 'q0', True, False), State('q1', 'q1', False, False), State('q2', 'q2', False, True)],
                    [Transition('q0', 'q0', '0'), Transition('q0', 'q1', '1'), Transition('q1', 'q1', '0'), Transition('q1', 'q2', '1'), Transition('q2', 'q2', '0'), Transition('q2', 'q2', '1')],
                    ['0', '1'],
                    'q0',
                    ['q2']
                ).to_dict(),
                'description': 'DFA that accepts binary strings with at least two 1s'
            },
            {
                'id': 'dfa_complex_4',
                'name': 'DFA for strings of even length',
                'dfa': DFA(
                    [State('q0', 'q0', True, True), State('q1', 'q1', False, False)],
                    [Transition('q0', 'q1', 'a'), Transition('q1', 'q0', 'a'), Transition('q0', 'q1', 'b'), Transition('q1', 'q0', 'b')],
                    ['a', 'b'],
                    'q0',
                    ['q0']
                ).to_dict(),
                'description': 'DFA that accepts strings of even length over {a, b}'
            },
            {
                'id': 'dfa_complex_5',
                'name': 'DFA for strings that do not contain "11"',
                'dfa': DFA(
                    [State('q0', 'q0', True, True), State('q1', 'q1', False, False), State('q2', 'q2', False, False)],
                    [Transition('q0', 'q0', '0'), Transition('q0', 'q1', '1'), Transition('q1', 'q2', '1'), Transition('q1', 'q0', '0'), Transition('q2', 'q2', '0'), Transition('q2', 'q2', '1')],
                    ['0', '1'],
                    'q0',
                    ['q0']
                ).to_dict(),
                'description': 'DFA that accepts binary strings that do not contain "11" as a substring'
            }
        ]
    }
