📑 Expense Tracker & Group Splitter — API Documentation

Base URL: http://localhost:5000
Authentication Type: Bearer Token (JWT)
Standard Header for Protected Routes:

http
Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Type: application/json

1. 🔐 Authentication APIs
   🔹 Register User
   Method: POST
   Endpoint: /api/auth/register
   Access: Public
   Request Body:
   json
   {
   "name": "Viswa",
   "email": "viswa@example.com",
   "password": "password123",
   "defaultCurrency": "INR" // Optional, default: "INR" (enum: 'INR', 'USD', 'EUR', 'GBP')
   }
   Success Response (201 Created):
   json
   {
   "success": true,
   "message": "User registered successfully! 🎉",
   "token": "eyJhbGciOiJIUzI1NiIs...",
   "data": {
   "\_id": "6abcf6efacc0a783f3bc4d43",
   "name": "Viswa",
   "email": "viswa@example.com",
   "defaultCurrency": "INR"
   }
   }
   🔹 Login User
   Method: POST
   Endpoint: /api/auth/login
   Access: Public
   Request Body:
   json
   {
   "email": "viswa@example.com",
   "password": "password123"
   }
   Success Response (200 OK):
   json
   {
   "success": true,
   "message": "Login successful! 🚀",
   "token": "eyJhbGciOiJIUzI1NiIs...",
   "data": {
   "\_id": "6abcf6efacc0a783f3bc4d43",
   "name": "Viswa",
   "email": "viswa@example.com",
   "defaultCurrency": "INR",
   "avatar": ""
   }
   }
   🔹 Get Logged-in User Profile
   Method: GET
   Endpoint: /api/auth/me
   Access: Protected (Token Required)
   Success Response (200 OK):
   json
   {
   "success": true,
   "data": {
   "\_id": "6abcf6efacc0a783f3bc4d43",
   "name": "Viswa",
   "email": "viswa@example.com",
   "avatar": "",
   "defaultCurrency": "INR",
   "createdAt": "2026-09-30T10:00:00.000Z"
   }
   }
2. 🏷️ Category APIs
   🔹 Create Category
   Method: POST
   Endpoint: /api/categories
   Access: Protected
   Request Body:
   json
   {
   "name": "Food & Dining",
   "icon": "🍕",
   "color": "#f59e0b"
   }
   Success Response (201 Created):
   json
   {
   "success": true,
   "data": {
   "\_id": "6abd00112233445566778899",
   "name": "Food & Dining",
   "icon": "🍕",
   "color": "#f59e0b",
   "user": "6abcf6efacc0a783f3bc4d43",
   "createdAt": "2026-09-30T10:15:00.000Z"
   }
   }
   🔹 Get All Categories
   Method: GET
   Endpoint: /api/categories
   Access: Protected
   Success Response (200 OK):
   json
   {
   "success": true,
   "count": 1,
   "data": [
   {
   "_id": "6abd00112233445566778899",
   "name": "Food & Dining",
   "icon": "🍕",
   "color": "#f59e0b"
   }
   ]
   }
3. 💸 Personal Expense APIs
   🔹 Create Personal Expense
   Method: POST
   Endpoint: /api/expenses
   Access: Protected
   Request Body:
   json
   {
   "title": "Pizza Party",
   "amount": 650,
   "category": "6abd00112233445566778899", // Category ObjectId
   "paymentMethod": "UPI", // 'Cash' | 'UPI' | 'Card' | 'Net Banking'
   "date": "2026-09-30", // Optional, defaults to now
   "notes": "With team" // Optional
   }
   Success Response (201 Created):
   json
   {
   "success": true,
   "message": "Expense added successfully! 💸",
   "data": {
   "\_id": "6abd01234567890abcdef123",
   "title": "Pizza Party",
   "amount": 650,
   "category": "6abd00112233445566778899",
   "user": "6abcf6efacc0a783f3bc4d43",
   "paymentMethod": "UPI",
   "notes": "With team",
   "date": "2026-09-30T10:30:00.000Z"
   }
   }
   🔹 Get All My Expenses (With Populated Category)
   Method: GET
   Endpoint: /api/expenses
   Access: Protected
   Success Response (200 OK):
   json
   {
   "success": true,
   "count": 1,
   "data": [
   {
   "_id": "6abd01234567890abcdef123",
   "title": "Pizza Party",
   "amount": 650,
   "paymentMethod": "UPI",
   "date": "2026-09-30T10:30:00.000Z",
   "category": {
   "_id": "6abd00112233445566778899",
   "name": "Food & Dining",
   "icon": "🍕",
   "color": "#f59e0b"
   }
   }
   ]
   }
4. 👥 Group APIs (Splitwise Core)
   🔹 Create Group
   Method: POST
   Endpoint: /api/groups
   Access: Protected
   Request Body:
   json
   {
   "name": "Goa Trip 🏖️",
   "description": "Weekend getaway expenses" // Optional
   }
   Success Response (201 Created):
   json
   {
   "success": true,
   "message": "Group created successfully! 👥",
   "data": {
   "\_id": "6abd084cea39bbf970981f04",
   "name": "Goa Trip 🏖️",
   "description": "Weekend getaway expenses",
   "createdBy": "6abcf6efacc0a783f3bc4d43",
   "members": [
   "6abcf6efacc0a783f3bc4d43" // Creator automatically added as member
   ]
   }
   }
   🔹 Get My Groups (With Populated Members)
   Method: GET
   Endpoint: /api/groups
   Access: Protected
   Success Response (200 OK):
   json
   {
   "success": true,
   "count": 1,
   "data": [
   {
   "\_id": "6abd084cea39bbf970981f04",
   "name": "Goa Trip 🏖️",
   "createdBy": {
   "\_id": "6abcf6efacc0a783f3bc4d43",
   "name": "Viswa",
   "email": "viswa@example.com"
   },
   "members": [
   {
   "_id": "6abcf6efacc0a783f3bc4d43",
   "name": "Viswa",
   "email": "viswa@example.com",
   "avatar": ""
   },
   {
   "_id": "6abd07a05d71488c0ab4ea54",
   "name": "Rahul",
   "email": "rahul@example.com",
   "avatar": ""
   }
   ]
   }
   ]
   }
   🔹 Get Single Group Details
   Method: GET
   Endpoint: /api/groups/:id
   Access: Protected (Caller must be a member of the group)
   Success Response (200 OK):
   json
   {
   "success": true,
   "data": {
   "\_id": "6abd084cea39bbf970981f04",
   "name": "Goa Trip 🏖️",
   "description": "Weekend getaway expenses",
   "createdBy": {
   "\_id": "6abcf6efacc0a783f3bc4d43",
   "name": "Viswa",
   "email": "viswa@example.com"
   },
   "members": [
   {
   "_id": "6abcf6efacc0a783f3bc4d43",
   "name": "Viswa",
   "email": "viswa@example.com",
   "avatar": ""
   },
   {
   "_id": "6abd07a05d71488c0ab4ea54",
   "name": "Rahul",
   "email": "rahul@example.com",
   "avatar": ""
   }
   ]
   }
   }
   🔹 Add Friend / Member to Group (By Email)
   Method: POST
   Endpoint: /api/groups/:id/members
   Access: Protected (Caller must be a member of the group)
   Request Body:
   json
   {
   "email": "rahul@example.com"
   }
   Success Response (200 OK):
   json
   {
   "success": true,
   "message": "Rahul ko group mein add kar diya! 🎉",
   "data": {
   "\_id": "6abd084cea39bbf970981f04",
   "name": "Goa Trip 🏖️",
   "members": [
   { "_id": "6abcf6efacc0a783f3bc4d43", "name": "Viswa", "email": "viswa@example.com" },
   { "_id": "6abd07a05d71488c0ab4ea54", "name": "Rahul", "email": "rahul@example.com" }
   ]
   }
   }
5. 🍕 Group Expense Splitting APIs
   🔹 Add Group Expense (Auto Equal Split)
   Method: POST
   Endpoint: /api/group-expenses
   Access: Protected
   Request Body:
   json
   {
   "title": "Dinner at BBQ Nation",
   "amount": 1200,
   "groupId": "6abd084cea39bbf970981f04", // Group ObjectId
   "categoryId": "6abd00112233445566778899" // Optional Category ObjectId
   }
   Success Response (201 Created):
   json
   {
   "success": true,
   "message": "Group expense added & split equally! 🎉",
   "data": {
   "\_id": "6abd09998877665544332211",
   "title": "Dinner at BBQ Nation",
   "amount": 1200,
   "group": "6abd084cea39bbf970981f04",
   "paidBy": {
   "\_id": "6abcf6efacc0a783f3bc4d43",
   "name": "Viswa",
   "email": "viswa@example.com"
   },
   "splitType": "EQUAL",
   "splits": [
   {
   "user": {
   "_id": "6abcf6efacc0a783f3bc4d43",
   "name": "Viswa",
   "email": "viswa@example.com"
   },
   "amount": 600
   },
   {
   "user": {
   "_id": "6abd07a05d71488c0ab4ea54",
   "name": "Rahul",
   "email": "rahul@example.com"
   },
   "amount": 600
   }
   ]
   }
   }
   🔹 Get All Expenses for a Group
   Method: GET
   Endpoint: /api/group-expenses/group/:groupId
   Access: Protected (Must be a group member)
   Success Response (200 OK):
   json
   {
   "success": true,
   "count": 1,
   "data": [
   {
   "\_id": "6abd09998877665544332211",
   "title": "Dinner at BBQ Nation",
   "amount": 1200,
   "paidBy": {
   "\_id": "6abcf6efacc0a783f3bc4d43",
   "name": "Viswa",
   "email": "viswa@example.com"
   },
   "splits": [
   {
   "user": { "_id": "6abcf6efacc0a783f3bc4d43", "name": "Viswa" },
   "amount": 600
   },
   {
   "user": { "_id": "6abd07a05d71488c0ab4ea54", "name": "Rahul" },
   "amount": 600
   }
   ],
   "createdAt": "2026-09-30T12:00:00.000Z"
   }
   ]
   }
6. 🚨 Standard Error Responses
   🔹 400 Bad Request (Missing fields / Already a member)
   json
   {
   "success": false,
   "message": "Title, amount aur groupId sab zaroori hain!"
   }
   🔹 401 Unauthorized (Token missing or expired)
   json
   {
   "success": false,
   "message": "Access Denied! Token nahi mila ya galat format hai."
   }
   🔹 404 Not Found (Resource not found or unauthorized access)
   json
   {
   "success": false,
   "message": "Group nahi mila ya aap is group ke member nahi ho!"
   }
   🔹 500 Internal Server Error
   json
   {
   "status": "error",
   "message": "Internal Server Error"
   }
