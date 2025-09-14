from setuptools import setup, find_packages

setup(
    name="tarkikx",
    version="0.0.1",
    packages=find_packages(),
    install_requires=[
        "flask>=2.0.0",
        "gunicorn>=20.0.0",
        "pandas>=1.3.0",
        "wikipedia>=1.4.0",
        "requests>=2.26.0",
        "fuzzywuzzy>=0.18.0",
        "python-levenshtein>=0.12.0",
        "textblob>=0.17.1",
        "python-dotenv>=0.19.0",
    ],
    entry_points={
        'console_scripts': [
            'tarkikx=app:app',
        ],
    },
)
