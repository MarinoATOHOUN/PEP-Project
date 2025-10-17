"""Application runner for the package.

This file intentionally keeps the process simple: import the app factory
and socketio object from the package root and run the server. Avoids
manipulating sys.path here.
"""

try:
    # Preferred when running as package: python -m src.main
    from . import create_app, socketio
except Exception:
    # Fallback when running as script: python src/main.py
    # Ensure the package parent directory is on sys.path so `import src` works
    import os, sys
    package_parent = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    if package_parent not in sys.path:
        sys.path.insert(0, package_parent)
    try:
        from src import create_app, socketio
    except ModuleNotFoundError as e:
        missing = str(e)
        # Helpful message when dependencies (like Flask) are missing in system Python
        if 'flask' in missing.lower() or 'flask' in missing:
            print('\nERROR: Required Python packages (Flask, etc.) are not installed in this interpreter.')
            print('Run the app using the project virtualenv, for example:')
            print(f'  "{os.path.join(package_parent, "venv/bin/python")}" -m src.main')
            print('or activate the venv:')
            print(f'  source "{os.path.join(package_parent, "venv/bin/activate")}"')
            sys.exit(2)
        raise


if __name__ == '__main__':
    app = create_app()
    # Allow Werkzeug in this development environment. In production, use a proper WSGI server.
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)