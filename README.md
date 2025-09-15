# TarkikX

A smart, non-generative AI chatbot that fetches and summarizes information from DuckDuckGo and Wikipedia. Unlike LLM-based AIs, TarkikX provides direct, fact-based responses by searching and summarizing web content.

## ⚠️ Disclaimer

TarkikX is not a generative AI. It's a smart information retrieval system that:

- Fetches and summarizes information from DuckDuckGo and Wikipedia
- Doesn't generate original content
- Works best with direct, factual queries
- Is designed to be independent and self-contained

## Features

- 🔍 **Web Search** - Fetches information from DuckDuckGo and Wikipedia
- 📚 **Direct Answers** - Provides concise, fact-based responses
- 🎨 **Clean UI** - Modern interface with dark/light mode
- 📱 **Responsive** - Works on all device sizes
- ⚡ **Fast** - Quick response times with minimal processing
- 🔄 **Session-based** - Maintains conversation history during your session
- 🌐 **No External AI** - Doesn't rely on third-party AI models

## Project Structure

```text
TarkikX/
├── static/
│   ├── css/
│   │   └── styles.css       # All styles with ShadCN color system
│   └── js/
│       └── app.js           # Client-side JavaScript
├── templates/
│   └── template.html        # Main HTML template
├── app.py                   # Flask application
├── requirements.txt          # Python dependencies
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Python 3.7+
- UV (Rust-based Python package installer)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/TarkikX.git
   cd TarkikX
   ```
2. Install UV if you haven't already:

   ```bash
   curl -sSf https://astral.sh/uv/install.sh | sh
   ```

   Or using pip:

   ```bash
   pip install uv
   ```
3. Install the required packages using UV:

   ```bash
   uv pip install -r requirements.txt
   ```

### Running the Application

1. Start the Flask development server:

   ```bash
   uv run app.py
   ```
2. Open your browser and navigate to `http://localhost:5000`

## Usage Tips

- Ask direct, factual questions (e.g., "ethanol" instead of "What is ethanol?")
- The system works best with specific queries rather than open-ended questions
- For best results, use simple, clear language
- Try different phrasings if you don't get the expected result

## Limitations

- Cannot generate original content or code
- May not understand complex or conversational queries
- Responses are limited to available web content
- Lacks contextual understanding of multi-turn conversations

## Customization

### Colors and Theming

The application uses CSS custom properties for theming. You can easily customize the color scheme by modifying the `:root` and `.dark` selectors in `static/css/styles.css`.

### Styling

All styles are written in vanilla CSS with a focus on maintainability and performance. The styling follows the BEM (Block Element Modifier) methodology.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
