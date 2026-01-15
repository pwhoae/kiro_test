# Visual Guide - Keyword Context Manager

## 🎨 What You'll See

### 1. Header (Fixed at Top)
```
┌─────────────────────────────────────────────────────────────────┐
│  [🔍 Search...]  [📝 File...]  [📝 Text...]  [➕ Add]          │
└─────────────────────────────────────────────────────────────────┘
```
- **Purple gradient background** behind everything
- **White header bar** that stays fixed when scrolling
- **Four input elements** in a row

### 2. Filter Controls
```
┌─────────────────────────────────────────────────────────────────┐
│  Time Filter: [Start Date] to [End Date]                        │
│  Keyword Filter: [Filter by keyword...]  [Clear Filters]        │
└─────────────────────────────────────────────────────────────────┘
```
- **White card** with filter options
- **Date pickers** for time filtering
- **Text input** for keyword filtering

### 3. Card Grid (4 Columns)
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ [📋 Copy]│  │ [📋 Copy]│  │ [📋 Copy]│  │ [📋 Copy]│
│          │  │          │  │          │  │          │
│ react    │  │ css grid │  │ testing  │  │ api rest │
│ hooks    │  │ layout   │  │ quality  │  │ backend  │
│          │  │          │  │          │  │          │
│ React    │  │ CSS Grid │  │ Unit     │  │ REST     │
│ Hooks... │  │ Layout...│  │ tests... │  │ APIs...  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```
- **White cards** with shadow
- **Copy button** in top-right corner
- **Colored keyword tags** (blue)
- **Truncated text** (25 characters)
- **Hover effect** (card lifts up)

### 4. Expanded Card
```
┌─────────────────────────────────────────────────────┐
│                                      [📋 Copy]      │
│                                                     │
│  Label: [React Hooks Guide________________]        │
│                                                     │
│  Function/Category: [Frontend Development_____]    │
│                                                     │
│  Keywords: [react, hooks, usestate, frontend__]    │
│                                                     │
│  Context:                                          │
│  ┌───────────────────────────────────────────┐    │
│  │ React Hooks allow you to use state and   │    │
│  │ other React features without writing a   │    │
│  │ class. useState is the most commonly...  │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  Created: 1/10/2025 | Updated: 1/10/2025          │
│                                                     │
│  [💾 Save]                    [✕ Cancel]           │
└─────────────────────────────────────────────────────┘
```
- **Editable fields** for all properties
- **Larger card** taking more space
- **Save and Cancel buttons** at bottom
- **Metadata** showing dates

### 5. Empty State
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                                     │
│         No entries yet.                            │
│         Add your first entry above!                │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- Shows when no entries exist
- Friendly message

### 6. No Results State
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                                     │
│         No results found.                          │
│         Try adjusting your search or filters.      │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```
- Shows when filters return no results
- Helpful suggestion

### 7. Toast Notification
```
                                    ┌──────────────────┐
                                    │ ✓ Entry added!   │
                                    └──────────────────┘
```
- **Bottom-right corner**
- **Green for success**, red for errors
- **Auto-disappears** after 3 seconds

## 🎨 Color Palette

### Background
- **Gradient**: Purple (#667eea) → Purple (#764ba2)

### Cards
- **Background**: White (#ffffff)
- **Shadow**: Subtle gray shadow
- **Border**: None (clean look)

### Keywords
- **Background**: Light blue (#e3f2fd)
- **Text**: Dark blue (#1976d2)
- **Shape**: Rounded pills

### Buttons
- **Primary (Add)**: Purple (#667eea)
- **Success (Save)**: Green (#4caf50)
- **Copy**: Purple (#667eea)
- **Cancel**: Light gray (#f5f5f5)

### Text
- **Headings**: Dark gray (#333)
- **Body**: Medium gray (#666)
- **Metadata**: Light gray (#999)

## 📐 Layout Dimensions

### Header
- **Height**: ~80px
- **Padding**: 20px
- **Position**: Fixed at top

### Cards
- **Width**: 25% (4 columns) - auto adjusts
- **Padding**: 20px
- **Gap**: 20px between cards
- **Border Radius**: 12px

### Inputs
- **Height**: 44px (touch-friendly)
- **Border**: 2px solid
- **Border Radius**: 8px
- **Focus**: Purple border

## 🎭 Animations

### Card Hover
```
Normal → Hover
  ↓       ↓
  0px   -4px  (moves up)
  
Shadow increases
```

### Card Expand
```
Click → Smooth expansion
Content fades in
```

### Toast
```
Hidden → Visible
  ↓        ↓
Slides up from bottom
Fades in
```

### Button Hover
```
Normal → Hover
  ↓       ↓
Background darkens slightly
```

## 📱 Responsive Behavior

### Desktop (1200px+)
```
[Card] [Card] [Card] [Card]
[Card] [Card] [Card] [Card]
```
4 columns

### Tablet (900-1200px)
```
[Card] [Card] [Card]
[Card] [Card] [Card]
```
3 columns

### Mobile (600-900px)
```
[Card] [Card]
[Card] [Card]
```
2 columns

### Small Mobile (<600px)
```
[Card]
[Card]
[Card]
```
1 column

Header stacks vertically:
```
[Search box (full width)]
[File input (full width)]
[Text input (full width)]
[Add button (full width)]
```

## 🎯 Interactive Elements

### Clickable
- ✅ Cards (to expand)
- ✅ Copy button
- ✅ Add button
- ✅ Save button
- ✅ Cancel button
- ✅ Clear filters button

### Hoverable
- ✅ All buttons (color change)
- ✅ Cards (lift effect)
- ✅ Inputs (border color change)

### Focusable
- ✅ All input fields (purple border)
- ✅ Textarea (purple border)
- ✅ Buttons (outline)

## 💫 Visual Feedback

### On Copy
```
[📋 Copy] → [✓ Copied]
Purple → Green (2 seconds)
+ Toast notification
```

### On Add
```
Inputs clear
New card appears at top
Toast: "Entry added!"
```

### On Save
```
Card collapses
Toast: "Changes saved!"
```

### On Error
```
Red toast notification
Error message displayed
```

## 🎨 Typography

### Fonts
- **Family**: System fonts (San Francisco, Segoe UI, Roboto)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold)

### Sizes
- **Headers**: 18px
- **Body**: 14px
- **Small**: 12px
- **Metadata**: 12px

## 🌈 Visual Hierarchy

1. **Header** (highest) - Always visible
2. **Toast** (high) - Temporary notifications
3. **Cards** (medium) - Main content
4. **Background** (lowest) - Gradient

## 🎪 Special Effects

### Shadows
- **Cards**: `0 4px 12px rgba(0,0,0,0.1)`
- **Hover**: `0 8px 20px rgba(0,0,0,0.15)`
- **Header**: `0 2px 10px rgba(0,0,0,0.1)`

### Transitions
- **Duration**: 0.2-0.3 seconds
- **Easing**: Ease-in-out
- **Properties**: transform, box-shadow, background

### Border Radius
- **Cards**: 12px (rounded)
- **Buttons**: 6-8px (slightly rounded)
- **Inputs**: 6-8px (slightly rounded)
- **Tags**: 12px (pill shape)

---

This visual guide helps you understand what the application looks like and how it behaves!
