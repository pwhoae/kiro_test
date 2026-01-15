# Keyword Features Guide

## 🎨 Clickable Keywords with Custom Colors

### Visual Overview

```
┌─────────────────────────────────────────────────────┐
│ Active Keyword Filter: [react] [✕ Clear]           │
└─────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│ [🎨●react] [🎨●hooks]│  │ [🎨●css] [🎨●grid]  │
│                      │  │                      │
│ React Hooks allow... │  │ CSS Grid Layout...   │
└──────────────────────┘  └──────────────────────┘
     ↑         ↑
     │         └─ Click keyword to filter
     └─ Click circle to change color
```

## 🖱️ Interactions

### 1. Click Keyword to Filter

**Action:**
```
Click → [react]
```

**Result:**
```
┌─────────────────────────────────────────────────────┐
│ Active Keyword Filter: [react] [✕ Clear]           │
└─────────────────────────────────────────────────────┘

Shows only entries with "react" keyword
```

### 2. Click Color Circle to Customize

**Action:**
```
Click → [🎨●react]
         ↑
    Color picker opens
```

**Color Picker:**
```
┌─────────────────┐
│  🎨 Pick Color  │
│                 │
│  [Color Wheel]  │
│                 │
│  #FF5722        │
│                 │
│  [OK] [Cancel]  │
└─────────────────┘
```

**Result:**
```
All "react" keywords change to selected color
Text color adjusts automatically (black or white)
```

### 3. Clear Filter

**Action:**
```
Click → [✕ Clear]
```

**Result:**
```
┌─────────────────────────────────────────────────────┐
│ Active Keyword Filter: None                        │
└─────────────────────────────────────────────────────┘

Shows all entries again
```

## 🎨 Color Customization

### How Colors Work

**Each Keyword = One Color**
```
"react" → Red (#ff5722)
"javascript" → Green (#4caf50)
"css" → Purple (#9c27b0)
```

**Color Applies Everywhere**
```
Card 1: [react] ← Red
Card 2: [react] ← Red (same color)
Card 3: [react] ← Red (same color)
```

**Smart Text Color**
```
Light background → Black text
Dark background → White text

Example:
Yellow background (#ffeb3b) → Black text ✓
Blue background (#1976d2) → White text ✓
```

### Color Examples

**Default (Light Blue):**
```
[react] [javascript] [css]
Background: #e3f2fd
Text: #1976d2
```

**Custom Colors:**
```
[react]      Background: #ff5722 (red)
             Text: #ffffff (white)

[javascript] Background: #4caf50 (green)
             Text: #000000 (black)

[css]        Background: #9c27b0 (purple)
             Text: #ffffff (white)
```

## 🎯 Usage Scenarios

### Scenario 1: Organize by Technology

**Setup:**
```
Frontend keywords → Blue
Backend keywords → Green
Database keywords → Orange
Testing keywords → Red
```

**Usage:**
```
1. Click [frontend] → See all frontend entries
2. Click [backend] → See all backend entries
3. Click [database] → See all database entries
```

### Scenario 2: Priority System

**Setup:**
```
High priority → Red
Medium priority → Yellow
Low priority → Green
Completed → Gray
```

**Usage:**
```
1. Click [high] → See urgent items
2. Click [medium] → See normal items
3. Click [low] → See backlog items
```

### Scenario 3: Subject Categories

**Setup:**
```
Math → Blue
Science → Green
History → Orange
English → Purple
```

**Usage:**
```
1. Click [math] → Study math notes
2. Click [science] → Review science
3. Click [history] → Read history
```

## 💡 Pro Tips

### Tip 1: Consistent Naming
```
✅ Good: "react", "react", "react"
❌ Bad: "react", "React", "REACT"

Use lowercase for consistency
```

### Tip 2: Color Coding System
```
Create a color legend:
- Red: Urgent/Important
- Yellow: In Progress
- Green: Complete
- Blue: Reference
- Purple: Ideas
```

### Tip 3: Quick Navigation
```
Workflow:
1. Color-code all keywords
2. Click keyword to filter
3. Review filtered entries
4. Clear and move to next topic
```

### Tip 4: Visual Scanning
```
Use bright colors for important topics
Use muted colors for reference material
Use similar colors for related topics
```

## 🎨 Color Palette Suggestions

### Tech Stack
```
HTML: #e34c26 (orange-red)
CSS: #264de4 (blue)
JavaScript: #f7df1e (yellow)
React: #61dafb (cyan)
Node.js: #339933 (green)
Python: #3776ab (blue)
```

### Priority Levels
```
Critical: #f44336 (red)
High: #ff9800 (orange)
Medium: #ffeb3b (yellow)
Low: #4caf50 (green)
Done: #9e9e9e (gray)
```

### Categories
```
Work: #2196f3 (blue)
Personal: #9c27b0 (purple)
Learning: #ff9800 (orange)
Ideas: #4caf50 (green)
Archive: #757575 (gray)
```

## 🔧 Technical Details

### Color Storage
```javascript
// Stored in localStorage
{
  "react": "#ff5722",
  "javascript": "#4caf50",
  "css": "#9c27b0"
}
```

### Color Picker
```html
<input type="color" value="#e3f2fd">
```

### Text Color Algorithm
```javascript
// Calculate luminance
luminance = (0.299 * R + 0.587 * G + 0.114 * B) / 255

// Choose text color
if (luminance > 0.5) {
  textColor = "#000000" // Black
} else {
  textColor = "#ffffff" // White
}
```

## 📱 Mobile Experience

### Touch Targets
```
Keyword tag: 44px min height
Color circle: 16px diameter
Clear button: 44px min height
```

### Gestures
```
Tap keyword → Filter
Tap color circle → Open picker
Tap clear → Remove filter
```

### Visual Feedback
```
Tap → Highlight
Hold → No action
Swipe → Scroll
```

## 🎉 Benefits Summary

### Organization
- ✅ Visual color coding
- ✅ Quick categorization
- ✅ Easy identification
- ✅ Consistent system

### Navigation
- ✅ One-click filtering
- ✅ Instant results
- ✅ Clear active state
- ✅ Easy to clear

### Customization
- ✅ Personal color scheme
- ✅ Persistent colors
- ✅ Smart text color
- ✅ Unlimited keywords

### Workflow
- ✅ Faster discovery
- ✅ Better organization
- ✅ Visual scanning
- ✅ Topic exploration

## 🚀 Getting Started

### Step 1: Add Entries
```
Add 5-10 entries with different keywords
```

### Step 2: Color Code
```
Click color circles to customize
Choose colors that make sense to you
```

### Step 3: Filter
```
Click any keyword to filter
See only related entries
```

### Step 4: Explore
```
Try different keywords
Clear and try others
Find connections
```

## 📊 Quick Reference

| Action | Result |
|--------|--------|
| Click keyword | Filter by keyword |
| Click color circle | Change keyword color |
| Click ✕ Clear | Remove filter |
| Search box | Search all fields |
| Expand card | Edit keywords |

---

**Master keyword filtering and color coding!** 🎨
