# E-Commerce Web Application

A full-stack e-commerce application built with React, Node.js, and SQLite, featuring an AI-powered shopping assistant chatbot.

## Architecture

This application follows a 3-tier architecture with an AI assistant service:

1. **Frontend (Presentation Layer)**: React-based UI with chat popup
2. **Backend (Application Layer)**: Node.js/Express API server
3. **Database (Data Layer)**: SQLite database
4. **AI Assistant Service**: Python-based chatbot using Strands Agents SDK and AWS Bedrock Nova Pro

## Features

- **Home Page**: Browse 20 sample products with emoji icons
- **Product Page**: View product details, reviews, and add items to cart
- **Shopping Cart**: Manage cart items, update quantities, and view total cost
- **AI Shopping Assistant**: Chat with an AI assistant to browse products, manage cart, and get recommendations

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd ecommerce-app/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

   The backend server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd ecommerce-app/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

   The frontend will run on http://localhost:3000

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/:id/reviews` - Get product reviews
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart

## Database Schema

### Products Table
- id (PRIMARY KEY)
- name
- emoji
- price
- description
- category

### Reviews Table
- id (PRIMARY KEY)
- product_id (FOREIGN KEY)
- author
- rating
- comment

### Cart Items Table
- id (PRIMARY KEY)
- product_id (FOREIGN KEY)
- quantity

## Chatbot Service Setup

The AI shopping assistant requires additional setup:

1. Navigate to the chatbot service directory:
   ```
   cd ../chatbot-service
   ```

2. Create a virtual environment and install dependencies:
   ```
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

3. Configure AWS credentials:
   - Copy `.env.example` to `.env`
   - Add your AWS credentials:
     ```
     AWS_ACCESS_KEY_ID=your_access_key
     AWS_SECRET_ACCESS_KEY=your_secret_key
     AWS_SESSION_TOKEN=your_session_token  # Optional
     AWS_REGION=us-west-2
     ECOMMERCE_API_URL=http://localhost:5000
     CHATBOT_PORT=5001
     ```

4. Request access to AWS Bedrock Nova Pro model:
   - Sign in to AWS Console
   - Navigate to Amazon Bedrock
   - Request model access for Nova Pro

5. Start the chatbot service:
   ```
   # Windows
   start-chatbot.bat
   
   # Linux/Mac
   chmod +x start-chatbot.sh
   ./start-chatbot.sh
   
   # Or directly
   python main.py
   ```

   The chatbot service will run on http://localhost:5001

## Running the Complete Application

To run the full application with the chatbot:

1. **Terminal 1** - Start the backend:
   ```
   cd ecommerce-app/backend
   npm start
   ```

2. **Terminal 2** - Start the chatbot service:
   ```
   cd chatbot-service
   python main.py
   ```

3. **Terminal 3** - Start the frontend:
   ```
   cd ecommerce-app/frontend
   npm start
   ```

4. Open http://localhost:3000 in your browser
5. Click the chat button (💬) in the bottom-right corner to start chatting!

## Technologies Used

- **Frontend**: React, React Router, CSS
- **Backend**: Node.js, Express, CORS
- **Database**: SQLite3
- **AI Assistant**: Python, Strands Agents SDK, AWS Bedrock Nova Pro, Flask
