from flask import Flask, render_template, request, jsonify, redirect, url_for
from . import app
from .algorithms.regex_to_dfa import RegexToDFAConverter
from .algorithms.nfa_to_dfa import NFAToDFAConverter
from .algorithms.dfa_to_regex import DFAToRegexConverter
from .algorithms.automata_structures import NFA, DFA, State, Transition
from .data.examples import get_examples
from .algorithms.nfa_to_regex import NFAToRegexConverter
import json
import logging
import io
import sys
import subprocess
import tempfile
import os

logger = logging.getLogger(__name__)

# Define the order of topics for navigation
TOPIC_ORDER = [
    'toa_home',
    'course_intro',
    'recursive_def',
    'languages_regex',
    'finite_automata',
    'nfa_dfa_graphs',
    'kleene_closure',
    'mealy_moore',
    'cfg',
    'pda',
    'parse_trees',
    'pumping_lemma',
    'turing_machines',
    'decidability',
    'context_sensitive',
    'conversion'
]

@app.route('/')
def index():
    return redirect(url_for('toa_home'))

@app.route('/toa-home')
def toa_home():
    previous_url, next_url = get_nav_links('toa_home')
    return render_template('toa_home.html', previous_page=previous_url, next_page=next_url, active_page='toa_home')

@app.route('/theory-of-computation')
def theory_of_computation():
    # This page is supplementary, not part of sequential topic flow, so no previous/next links
    return render_template('theory_of_computation.html', active_page='theory_of_computation')

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

def get_nav_links(current_topic_endpoint):
    try:
        current_index = TOPIC_ORDER.index(current_topic_endpoint)
        previous_topic = None
        next_topic = None

        if current_index > 0:
            previous_topic = TOPIC_ORDER[current_index - 1]

        if current_index < len(TOPIC_ORDER) - 1:
            next_topic = TOPIC_ORDER[current_index + 1]
        
        previous_url = url_for(previous_topic) if previous_topic else None
        next_url = url_for(next_topic) if next_topic else None

        return previous_url, next_url
    except ValueError:
        # Handle case where current_topic_endpoint is not found in TOPIC_ORDER
        return None, None

@app.route('/course-intro')
def course_intro():
    previous_url, next_url = get_nav_links('course_intro')
    return render_template('course_intro.html', previous_page=previous_url, next_page=next_url, active_page='course_intro')

@app.route('/recursive-def')
def recursive_def():
    previous_url, next_url = get_nav_links('recursive_def')
    return render_template('recursive_def.html', previous_page=previous_url, next_page=next_url, active_page='recursive_def')

@app.route('/languages-regex')
def languages_regex():
    previous_url, next_url = get_nav_links('languages_regex')
    return render_template('languages_regex.html', previous_page=previous_url, next_page=next_url, active_page='languages_regex')

@app.route('/finite-automata')
def finite_automata():
    previous_url, next_url = get_nav_links('finite_automata')
    return render_template('finite_automata.html', previous_page=previous_url, next_page=next_url, active_page='finite_automata')

@app.route('/nfa-dfa-graphs')
def nfa_dfa_graphs():
    previous_url, next_url = get_nav_links('nfa_dfa_graphs')
    return render_template('nfa_dfa_graphs.html', previous_page=previous_url, next_page=next_url, active_page='nfa_dfa_graphs')

@app.route('/kleene-closure')
def kleene_closure():
    previous_url, next_url = get_nav_links('kleene_closure')
    return render_template('kleene_closure.html', previous_page=previous_url, next_page=next_url, active_page='kleene_closure')

@app.route('/mealy-moore')
def mealy_moore():
    previous_url, next_url = get_nav_links('mealy_moore')
    return render_template('mealy_moore.html', previous_page=previous_url, next_page=next_url, active_page='mealy_moore')

@app.route('/cfg')
def cfg():
    previous_url, next_url = get_nav_links('cfg')
    return render_template('cfg.html', previous_page=previous_url, next_page=next_url, active_page='cfg')

@app.route('/pda')
def pda():
    previous_url, next_url = get_nav_links('pda')
    return render_template('pda.html', previous_page=previous_url, next_page=next_url, active_page='pda')

@app.route('/parse-trees')
def parse_trees():
    previous_url, next_url = get_nav_links('parse_trees')
    return render_template('parse_trees.html', previous_page=previous_url, next_page=next_url, active_page='parse_trees')

@app.route('/pumping-lemma')
def pumping_lemma():
    previous_url, next_url = get_nav_links('pumping_lemma')
    return render_template('pumping_lemma.html', previous_page=previous_url, next_page=next_url, active_page='pumping_lemma')

@app.route('/turing-machines')
def turing_machines():
    previous_url, next_url = get_nav_links('turing_machines')
    return render_template('turing_machines.html', previous_page=previous_url, next_page=next_url, active_page='turing_machines')

@app.route('/decidability')
def decidability():
    previous_url, next_url = get_nav_links('decidability')
    return render_template('decidability.html', previous_page=previous_url, next_page=next_url, active_page='decidability')

@app.route('/context-sensitive')
def context_sensitive():
    previous_page, next_page = get_nav_links('context_sensitive')
    return render_template('context_sensitive.html', active_page='context_sensitive', previous_page=previous_page, next_page=next_page)

@app.route('/conversion')
def conversion():
    previous_page, next_page = get_nav_links('conversion')
    examples = get_examples()
    return render_template('conversion.html', active_page='conversion', previous_page=previous_page, next_page=next_page, examples=examples)

@app.route('/run_python_code', methods=['POST'])
def run_python_code():
    code = request.json.get('code', '')

    # Create a temporary file to write the Python code
    fd, path = tempfile.mkstemp(suffix='.py')
    os.close(fd) # Close the file descriptor immediately

    try:
        with open(path, 'w') as f:
            f.write(code)
        
        # Execute the Python code using subprocess
        result = subprocess.run(
            ['python', path],
            capture_output=True,
            text=True,
            encoding='utf-8',
            check=False  # Do not raise an exception for non-zero exit codes
        )

        if result.returncode == 0:
            output = result.stdout
            return jsonify({'output': output})
        else:
            error_output = result.stderr if result.stderr else result.stdout
            return jsonify({'error': error_output})

    except Exception as e:
        return jsonify({'error': str(e)})
    finally:
        # Clean up the temporary file
        if os.path.exists(path):
            os.remove(path)
