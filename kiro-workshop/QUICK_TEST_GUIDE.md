# Quick Test Guide - Shopping Assistant Chatbot

## ✅ Current Status

All services are running:
- ✅ **Backend** (Node.js) - Port 5000
- ✅ **Frontend** (React) - Port 3000  
- ✅ **Chatbot Test Server** (Python) - Port 5001

## 🧪 Test the Chatbot NOW

### Step 1: Open the Application

Open your browser and go to: **http://localhost:3000**

### Step 2: Find the Chat Button

Look for the **purple chat button (💬)** in the bottom-right corner of the page.

### Step 3: Click to Open Chat

Click the chat button. A chat window should slide up from the bottom.

### Step 4: Try These Test Messages

**Test 1 - Basic Greeting:**
```
Hello
```
Expected: Welcome message explaining test mode

**Test 2 - Browse Products:**
```
Show me products
```
Expected: List of mock products with IDs, prices, and categories

**Test 3 - Add to Cart:**
```
Add product 1 to cart
```
Expected: Confirmation that product was added

**Test 4 - View Cart:**
```
Show my cart
```
Expected: Display of cart contents with total

**Test 5 - Get Recommendations:**
```
Recommend some products
```
Expected: List of recommended products

## 🎯 What You Should See

### Chat Interface Features:
- ✅ Purple gradient chat button in bottom-right
- ✅ Chat window opens smoothly
- ✅ Welcome message when first opened
- ✅ Your messages appear on the right (purple)
- ✅ Bot messages appear on the left (white)
- ✅ Typing indicator (three dots) while bot is "thinking"
- ✅ Timestamps on each message
- ✅ Auto-scroll to latest message
- ✅ Input field at bottom
- ✅ Send button (arrow icon)

### Test Mode Notice:
All bot responses will include a note that this is **TEST MODE** and show mock data. This is normal! The test server doesn't require AWS credentials.

## 🔧 Troubleshooting

### Chat Button Not Visible?
1. Refresh the page (F5)
2. Check browser console (F12) for errors
3. Verify frontend is running on port 3000

### Chat Opens But No Response?
1. Check that chatbot server is running (should see it in terminal)
2. Look for errors in browser console
3. Verify CORS is working (no CORS errors in console)

### Messages Not Sending?
1. Make sure you typed something in the input field
2. Try pressing Enter instead of clicking send button
3. Check browser console for network errors

## 📊 Expected Behavior

| Action | Expected Result | Time |
|--------|----------------|------|
| Click chat button | Window opens | Instant |
| Send message | Typing indicator appears | Instant |
| Receive response | Bot message appears | 1-2 seconds |
| Scroll messages | Auto-scrolls to bottom | Instant |
| Close chat | Window closes, session saved | Instant |
| Reopen chat | Previous messages still there | Instant |

## 🎨 Visual Checklist

When you open the chat, you should see:
- [ ] Purple gradient header with "🛍️ Shopping Assistant"
- [ ] Close button (X) in header
- [ ] Welcome message with bullet points
- [ ] Gray background for message area
- [ ] White input field at bottom
- [ ] Purple send button (arrow)
- [ ] Smooth animations when opening/closing

## 🚀 Next Steps

### To Use Real AI (AWS Bedrock):

1. **Stop the test server:**
   - Go to the terminal running the chatbot
   - Press Ctrl+C

2. **Configure AWS credentials:**
   - Edit `chatbot-service/.env`
   - Add your real AWS credentials:
     ```
     AWS_ACCESS_KEY_ID=your_real_key
     AWS_SECRET_ACCESS_KEY=your_real_secret
     ```

3. **Install dependencies:**
   ```bash
   cd chatbot-service
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

4. **Start real chatbot:**
   ```bash
   python main.py
   ```

5. **Test again** - Now you'll get real AI responses!

## 📝 Test Results Template

Use this to document your testing:

```
Date: ___________
Tester: ___________

✅ Chat button visible
✅ Chat window opens
✅ Welcome message displays
✅ Can send messages
✅ Bot responds (test mode)
✅ Messages have timestamps
✅ Typing indicator works
✅ Auto-scroll works
✅ Can close and reopen
✅ Session persists

Issues found:
_______________________
_______________________

Overall: PASS / FAIL
```

## 💡 Tips

- **Press Enter** to send messages quickly
- **Scroll up** to see message history
- **Close and reopen** to test session persistence
- **Refresh page** to test if session ID is saved
- **Try different pages** (Home, Product, Cart) - chat should work everywhere

## 🎉 Success Criteria

Your test is successful if:
1. ✅ Chat button appears on all pages
2. ✅ Chat opens and closes smoothly
3. ✅ You can send and receive messages
4. ✅ Bot responds with mock data
5. ✅ No errors in browser console
6. ✅ Session persists when closing/reopening

---

**Current Mode:** 🧪 TEST MODE (Mock responses, no AWS required)

**Ready to test?** Open http://localhost:3000 and click the chat button!
