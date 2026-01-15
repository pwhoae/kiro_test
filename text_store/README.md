# Keyword Context Manager

A simple, elegant web application for storing, searching, and managing text snippets with associated keywords.

## Features

✅ **Add Entries** - Input text directly through the textarea
✅ **Search & Filter** - Search by keywords or context, filter by time and keywords
✅ **Card View** - Browse entries in a responsive 4-column grid
✅ **Expand/Edit** - Click cards to expand and edit details
✅ **Copy to Clipboard** - One-click copy functionality
✅ **Local Storage** - All data persists in your browser
✅ **Responsive Design** - Works on desktop, tablet, and mobile

## Getting Started

### Option 1: Open Directly
Simply open `index.html` in your web browser:
- Double-click the `index.html` file
- Or right-click and select "Open with" → your browser

### Option 2: Use a Local Server (Recommended)
For better performance and to avoid CORS issues:

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

Then open: http://localhost:8000

## How to Use

### Adding Entries
1. Type or paste text into the textarea in the header
2. Press Enter or click the "Add" button
3. Keywords are automatically extracted from your text

### Searching
- Type in the search box to filter entries by keywords or context
- Results update in real-time

### Filtering
- **Time Filter**: Select start and/or end dates to filter by creation time
- **Keyword Filter**: Filter entries by specific keywords
- **Clear Filters**: Reset all filters to show all entries

### Managing Cards
- **Click a card** to expand and see full details
- **Edit fields** when expanded (label, function, keywords, context)
- **Click Save** to persist changes
- **Click Cancel** or the card again to collapse
- **Click Copy** button to copy the full context to clipboard

## File Structure

```
keyword-context-manager/
├── index.html          # Main HTML structure
├── styles.css          # All styling and responsive design
├── app.js             # Application logic and data management
└── README.md          # This file
```

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Data Storage

All data is stored in your browser's LocalStorage:
- Data persists between sessions
- Data is stored locally (not sent to any server)
- Clear browser data will delete all entries
- Export/backup functionality can be added if needed

## Keyboard Shortcuts

- **Enter** in search box: Apply search
- **Enter** in textarea: Add new entry
- **Shift+Enter** in textarea: New line (without adding)

## Responsive Breakpoints

- **Desktop**: 4 cards per row (1200px+)
- **Tablet**: 3 cards per row (900px - 1200px)
- **Mobile**: 2 cards per row (600px - 900px)
- **Small Mobile**: 1 card per row (< 600px)

## Limitations

- File path input is not functional in browsers (security restriction)
- Use the text input instead to add content
- Storage limited by browser's LocalStorage quota (~5-10MB)

## Future Enhancements

Potential features to add:
- Export/Import functionality (JSON, CSV)
- Drag and drop file upload
- Advanced keyword management
- Tags and categories
- Dark mode
- Search history
- Bulk operations

## Troubleshooting

**Cards not showing?**
- Check browser console for errors
- Try clearing LocalStorage and refreshing

**Copy not working?**
- Ensure you're using HTTPS or localhost
- Some browsers require user interaction first

**Styles not loading?**
- Ensure all files are in the same directory
- Check file names match exactly (case-sensitive)

## License

Free to use and modify for personal or commercial projects.

---

Built with vanilla HTML, CSS, and JavaScript - no frameworks required!
