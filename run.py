from app import app

if __name__ == '__main__':
    # Debugging: Print all registered routes
    print("\n--- Flask Routes ---")
    for rule in app.url_map.iter_rules():
        print(f"Endpoint: {rule.endpoint}, Methods: {rule.methods}, Rule: {rule.rule}")
    print("--------------------\n")
    app.run(debug=True) 