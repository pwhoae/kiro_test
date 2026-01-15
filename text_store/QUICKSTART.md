# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Open the Application
Double-click `index.html` to open it in your default browser.

Or for the demo version with sample data:
Double-click `demo.html`

### Step 2: Add Your First Entry
1. Type or paste text into the textarea (the large input box)
2. Press **Enter** or click the **➕ Add** button
3. Your entry appears as a card below!

### Step 3: Explore Features
- **Search**: Type in the search box to filter entries
- **Click a card**: Expand to see full details and edit
- **Copy button**: Click 📋 to copy content to clipboard
- **Filters**: Use date range and keyword filters

## 📝 Example Entries to Try

Copy and paste these into the textarea:

```
React is a JavaScript library for building user interfaces. It uses a component-based architecture and virtual DOM for efficient rendering.
```

```
CSS Flexbox is a one-dimensional layout method for arranging items in rows or columns. Items flex to fill additional space or shrink to fit into smaller spaces.
```

```
Git branching allows you to diverge from the main line of development and continue to work without affecting the main branch. Useful for feature development.
```

## 🎨 What You'll See

### Header (Fixed at Top)
- 🔍 Search box - Filter entries
- 📝 File input - (Not functional in browser)
- 📝 Text input - Add new entries
- ➕ Add button - Save entry

### Body (Scrollable)
- Filter controls (time + keyword)
- Card grid (4 columns on desktop)
- Each card shows:
  - Keywords as colored tags
  - Truncated context (25 chars)
  - Copy button in top-right

### Card Interactions
- **Collapsed**: Click to expand
- **Expanded**: Shows editable fields
  - Label
  - Function/Category
  - Keywords
  - Full context
  - Save/Cancel buttons

## 💡 Tips

1. **Keywords are auto-generated** from your text (words > 3 characters)
2. **Edit keywords** by expanding a card and modifying the keywords field
3. **Use filters** to organize large collections
4. **Data persists** - your entries are saved in browser storage
5. **Mobile friendly** - works on phones and tablets

## 🔧 Troubleshooting

**Nothing happens when I click Add?**
- Make sure you've entered text in the textarea
- Check that the text isn't just whitespace

**Cards not showing?**
- Open browser console (F12) to check for errors
- Try refreshing the page

**Want to start fresh?**
- Open browser console (F12)
- Type: `localStorage.clear()`
- Refresh the page

## 📱 Responsive Design

The layout automatically adjusts:
- **Desktop**: 4 cards per row
- **Tablet**: 2-3 cards per row  
- **Mobile**: 1 card per row

## 🎯 Next Steps

1. Add several entries to test the search
2. Try the time filter with different date ranges
3. Expand a card and edit its details
4. Use the keyword filter to find specific topics
5. Test the copy functionality

---

**Need help?** Check the full README.md for detailed documentation.

**Want sample data?** Open demo.html and click "Load Demo Data"
