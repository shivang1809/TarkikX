# TarkikX

A modern, responsive chat interface with a clean design and smooth user experience.

## Features

- 🎨 **Modern UI** with ShadCN-inspired design system
- 🌓 **Dark/Light mode** with system preference detection
- 📱 **Fully responsive** design that works on all devices
- ✨ **Smooth animations** and transitions
- 🚀 **Fast and lightweight** with minimal dependencies
- 🔄 **Real-time** chat updates
- 🎯 **Accessible** with proper ARIA labels and keyboard navigation

## Project Structure

```
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
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/TarkikX.git
   cd TarkikX
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the Flask development server:
   ```bash
   python app.py
   ```

2. Open your browser and navigate to `http://localhost:5000`

## Customization

### Colors and Theming

The application uses CSS custom properties for theming. You can easily customize the color scheme by modifying the `:root` and `.dark` selectors in `static/css/styles.css`.

### Styling

All styles are written in vanilla CSS with a focus on maintainability and performance. The styling follows the BEM (Block Element Modifier) methodology.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [ShadCN UI](https://ui.shadcn.com/) for the design inspiration
- [Inter font](https://rsms.me/inter/) for the beautiful typography
- [Feather Icons](https://feathericons.com/) for the clean icon set
