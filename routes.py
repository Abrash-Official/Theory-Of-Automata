from flask import Flask, render_template, request, jsonify, redirect, url_for
from app import app
from algorithms.regex_to_dfa import RegexToDFAConverter
from algorithms.nfa_to_dfa import NFAToDFAConverter
from algorithms.dfa_to_regex import DFAToRegexConverter
from algorithms.automata_structures import NFA, DFA, State, Transition
from data.examples import get_examples
from algorithms.nfa_to_regex import NFAToRegexConverter
import json
import logging

logger = logging.getLogger(__name__)

@app.route('/')
def index():
    return redirect(url_for('course_intro'))

@app.route('/api/convert/regex-to-dfa', methods=['POST'])
def convert_regex_to_dfa():
    """Convert regular expression to DFA"""
    try:
        data = request.get_json()
        regex = data.get('regex', '')
        
        if not regex:
            return jsonify({'success': False, 'error': 'Regular expression is required'})
        
        converter = RegexToDFAConverter(regex)
        result = converter.convert()
        
        return jsonify({
            'success': result['success'],
            'dfa': result.get('dfa'),
            'steps': result.get('steps', []),
            'error': result.get('error')
        })
    
    except Exception as e:
        logger.error(f"Error in regex-to-dfa conversion: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/convert/nfa-to-dfa', methods=['POST'])
def convert_nfa_to_dfa():
    """Convert NFA to DFA"""
    try:
        data = request.get_json()
        nfa_data = data.get('nfa', {})
        
        if not nfa_data:
            return jsonify({'success': False, 'error': 'NFA data is required'})
        
        # Build NFA from input data
        nfa = build_nfa_from_data(nfa_data)
        converter = NFAToDFAConverter(nfa)
        result = converter.convert()
        
        return jsonify({
            'success': result['success'],
            'originalNfa': nfa.to_dict(),
            'dfa': result.get('dfa'),
            'steps': result.get('steps', []),
            'stateMapping': result.get('stateMapping', {}),
            'error': result.get('error')
        })
    
    except Exception as e:
        logger.error(f"Error in nfa-to-dfa conversion: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/convert/dfa-to-regex', methods=['POST'])
def convert_dfa_to_regex():
    """Convert DFA to regular expression"""
    try:
        data = request.get_json()
        dfa_data = data.get('dfa', {})
        
        if not dfa_data:
            return jsonify({'success': False, 'error': 'DFA data is required'})

        # Build DFA from input data
        dfa = build_dfa_from_data(dfa_data)
        converter = DFAToRegexConverter(dfa)
        result = converter.convert()
        
        return jsonify({
            'success': result['success'],
            'regex': result.get('regex'),
            'originalDfa': dfa.to_dict(),
            'steps': result.get('steps', []),
            'error': result.get('error')
        })
    
    except Exception as e:
        logger.error(f"Error in dfa-to-regex conversion: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/convert/nfa-to-regex', methods=['POST'])
def convert_nfa_to_regex():
    """Convert NFA to regular expression"""
    try:
        data = request.get_json()
        nfa_data = data.get('nfa', {})
        if not nfa_data:
            return jsonify({'success': False, 'error': 'NFA data is required'})
        nfa = build_nfa_from_data(nfa_data)
        converter = NFAToRegexConverter(nfa)
        result = converter.convert()
        return jsonify({
            'success': result['success'],
            'regex': result.get('regex'),
            'originalNfa': nfa.to_dict(),
            'steps': result.get('steps', []),
            'error': result.get('error')
        })
    except Exception as e:
        logger.error(f"Error in nfa-to-regex conversion: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/examples/<conversion_type>')
def get_conversion_examples(conversion_type):
    """Get examples for a specific conversion type"""
    try:
        examples = get_examples()
        if conversion_type in examples:
            return jsonify({'success': True, 'examples': examples[conversion_type]})
        else:
            return jsonify({'success': False, 'error': 'Invalid conversion type'})
    
    except Exception as e:
        logger.error(f"Error getting examples: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

def build_nfa_from_data(nfa_data):
    """Build NFA object from JSON data"""
    states = []
    transitions = []
    
    # Create states
    for state_data in nfa_data.get('states', []):
        state = State(
            state_data['id'],
            state_data.get('label', state_data['id']),
            state_data.get('isStart', False),
            state_data.get('isFinal', False)
        )
        states.append(state)
    
    # Create transitions
    for trans_data in nfa_data.get('transitions', []):
        transition = Transition(
            trans_data['from'],
            trans_data['to'],
            trans_data['symbol']
        )
        transitions.append(transition)
    
    alphabet = nfa_data.get('alphabet', [])
    start_states = nfa_data.get('startStates', [])
    final_states = nfa_data.get('finalStates', [])
    
    return NFA(states, transitions, alphabet, start_states, final_states)

def build_dfa_from_data(dfa_data):
    """Build DFA object from JSON data"""
    states = []
    transitions = []
    
    # Create states
    for state_data in dfa_data.get('states', []):
        state = State(
            state_data['id'],
            state_data.get('label', state_data['id']),
            state_data.get('isStart', False),
            state_data.get('isFinal', False)
        )
        states.append(state)

    start_state_id = dfa_data.get('startState')
    if not start_state_id:
        raise ValueError("DFA data must contain a start state.")

    # Ensure the designated start state actually exists in the provided states
    if not any(s.id == start_state_id for s in states):
        raise ValueError(f"Start state '{start_state_id}' not found in provided states.")

    # Create transitions
    for trans_data in dfa_data.get('transitions', []):
        transition = Transition(
            trans_data['from'],
            trans_data['to'],
            trans_data['symbol']
        )
        transitions.append(transition)
    
    alphabet = dfa_data.get('alphabet', [])
    final_states = dfa_data.get('finalStates', [])

    # Debugging print statements
    print(f"DEBUG: dfa_data in build_dfa_from_data: {dfa_data}")
    print(f"DEBUG: start_state_id extracted: {start_state_id}")

    return DFA(states, transitions, alphabet, start_state_id, final_states)

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

@app.route('/course-intro')
def course_intro():
    return render_template('course_intro.html', active_page='course_intro')

@app.route('/recursive-def')
def recursive_def():
    return render_template('recursive_def.html', active_page='recursive_def')

@app.route('/languages-regex')
def languages_regex():
    return render_template('languages_regex.html', active_page='languages_regex')

@app.route('/finite-automata')
def finite_automata():
    return render_template('finite_automata.html', active_page='finite_automata')

@app.route('/nfa-dfa-graphs')
def nfa_dfa_graphs():
    return render_template('nfa_dfa_graphs.html', active_page='nfa_dfa_graphs')

@app.route('/kleene-closure')
def kleene_closure():
    return render_template('kleene_closure.html', active_page='kleene_closure')

@app.route('/mealy-moore')
def mealy_moore():
    return render_template('mealy_moore.html', active_page='mealy_moore')

@app.route('/cfg')
def cfg():
    return render_template('cfg.html', active_page='cfg')

@app.route('/pda')
def pda():
    return render_template('pda.html', active_page='pda')

@app.route('/parse-trees')
def parse_trees():
    return render_template('parse_trees.html', active_page='parse_trees')

@app.route('/pumping-lemma')
def pumping_lemma():
    return render_template('pumping_lemma.html', active_page='pumping_lemma')

@app.route('/turing-machines')
def turing_machines():
    return render_template('turing_machines.html', active_page='turing_machines')

@app.route('/decidability')
def decidability():
    return render_template('decidability.html', active_page='decidability')

@app.route('/context-sensitive')
def context_sensitive():
    return render_template('context_sensitive.html', active_page='context_sensitive')

@app.route('/conversion')
def conversion():
    examples = get_examples()
    return render_template('conversion.html', active_page='conversion', examples=examples)
