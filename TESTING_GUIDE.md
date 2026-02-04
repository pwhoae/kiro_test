# Shopping Assistant Chatbot - Testing Guide

This guide will help you test the complete shopping assistant chatbot integration.

## Prerequisites

Before testing, ensure you have:

1. ✅ AWS account with Bedrock access
2. ✅ AWS credentials configured in `chatbot-service/.env`
3. ✅ Access to AWS Bedrock Nova Pro model
4. ✅ All dependencies installed (backend, frontend, chatbot service)

## Quick Start Testing

### Step 1: Start All Services

Open three terminal windows:

**Terminal 1 - E-commerce Backend:**
```bash
cd ecommerce-app/backend
npm start
```
Expected output: `Server running on port 5000`

**Terminal 2 - Chatbot Service:**
```bash
cd chatbot-service
# Windows
start-chatbot.bat

# Linux/Mac
./start-chatbot.sh
```
Expected output: `Chatbot service ready on http://localhost:5001`

**Terminal 3 - Frontend:**
```bash
cd ecommerce-app/frontend
npm start
```
Expected output: Browser opens to `http://localhost:3000`

### Step 2: Verify Services are Running

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/api/products
   ```
   Should return JSON array of products

2. **Chatbot Health Check:**
   ```bash
   curl http://localhost:5001/api/health
   ```
   Should return: `{"status": "healthy", ...}`

3. **Frontend:**
   Open http://localhost:3000 - should see the e-commerce homepage

## Manual Test Scenarios

### Test 1: Basic Chat Interaction

1. Click the purple chat button (💬) in the bottom-right corner
2. Chat window should open with welcome message
3. Type: "Hello"
4. Press Enter or click send button
5. ✅ **Expected**: Bot responds with a greeting

### Test 2: Product Listing

1. In the chat, type: "Show me all products"
2. ✅ **Expected**: Bot lists products with:
   - Product names with emojis
   - Product IDs
   - Prices
   - Categories
   - Descriptions

### Test 3: Category Filtering

1. Type: "Show me electronics"
2. ✅ **Expected**: Bot lists only electronics products

### Test 4: Price Filtering

1. Type: "Show me products under $500"
2. ✅ **Expected**: Bot lists only products under $500

### Test 5: Add to Cart

1. Type: "Add product 1 to my cart"
2. ✅ **Expected**: Bot confirms addition with:
   - Product name
   - Price
   - Quantity
   - Subtotal

### Test 6: View Cart

1. Type: "Show me my cart"
2. ✅ **Expected**: Bot displays:
   - All cart items
   - Quantities
   - Prices
   - Total amount

### Test 7: Remove from Cart

1. Type: "Remove product 1 from cart"
2. ✅ **Expected**: Bot confirms removal

### Test 8: Product Recommendations

1. Type: "Recommend some products for gaming"
2. ✅ **Expected**: Bot suggests relevant products

### Test 9: Session Persistence

1. Close the chat popup (click X)
2. Refresh the page
3. Open chat again
4. Type: "What did we talk about?"
5. ✅ **Expected**: Bot remembers previous conversation

### Test 10: Error Handling

1. Stop the backend service (Ctrl+C in Terminal 1)
2. In chat, type: "Show me products"
3. ✅ **Expected**: Bot shows friendly error message
4. Restart backend service
5. Try again - should work

## Automated Testing

### Backend Service Test

```bash
cd chatbot-service
python test_setup.py
```

Expected output: All tests should pass ✓

### API Integration Test

```bash
# Test chat endpoint
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "sessionId": "test-123"}'
```

Expected: JSON response with `reply` and `sessionId`

## Common Issues and Solutions

### Issue 1: Chatbot service won't start

**Error:** `Missing required environment variables`

**Solution:**
1. Check `.env` file exists in `chatbot-service/`
2. Verify all required variables are set:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - ECOMMERCE_API_URL

### Issue 2: AWS Bedrock access denied

**Error:** `Access denied` or `Model not found`

**Solution:**
1. Go to AWS Console → Bedrock
2. Request access to Nova Pro model
3. Wait for approval (usually instant)
4. Restart chatbot service

### Issue 3: Chat button not visible

**Solution:**
1. Check browser console for errors
2. Verify frontend is running on port 3000
3. Clear browser cache and refresh

### Issue 4: CORS errors in browser console

**Solution:**
1. Verify chatbot service is running on port 5001
2. Check CORS configuration in `chatbot-service/server.py`
3. Ensure frontend origin is allowed

### Issue 5: Bot responses are slow

**Expected:** Responses should arrive within 10 seconds

**If slower:**
1. Check AWS region (use us-west-2 for best performance)
2. Verify internet connection
3. Check AWS Bedrock service status

## Performance Benchmarks

- **Chat response time**: < 10 seconds (95th percentile)
- **Product listing**: < 2 seconds
- **Cart operations**: < 1 second
- **Session creation**: < 100ms

## Test Completion Checklist

- [ ] All three services start successfully
- [ ] Chat popup opens and closes
- [ ] Bot responds to messages
- [ ] Product listing works
- [ ] Category filtering works
- [ ] Price filtering works
- [ ] Add to cart works
- [ ] View cart works
- [ ] Remove from cart works
- [ ] Recommendations work
- [ ] Session persists across page refreshes
- [ ] Error messages are user-friendly
- [ ] Chat UI is responsive
- [ ] No console errors in browser

## Next Steps

Once all tests pass:

1. ✅ The shopping assistant chatbot is fully functional
2. 🎉 Users can now shop using natural language
3. 📊 Monitor logs for any issues
4. 🔧 Customize system prompt for your needs
5. 🚀 Deploy to production when ready

## Support

If you encounter issues:

1. Check logs in all three terminals
2. Review the README files in each directory
3. Verify AWS credentials and permissions
4. Ensure all dependencies are installed
5. Check that ports 3000, 5000, and 5001 are available

## Logging

To see detailed logs:

1. **Backend logs**: Check Terminal 1
2. **Chatbot logs**: Check Terminal 2 (includes AWS API calls, tool invocations)
3. **Frontend logs**: Check browser console (F12)

Set `LOG_LEVEL=DEBUG` in `.env` for more detailed chatbot logs.
