# 💬 MERN Real-Time Chat Application

##  Project Overview

This project is a **production-ready real-time chat application** built using the **MERN stack** (MongoDB, Express.js, React, Node.js) with **WebSockets (Socket.IO)** for instant communication.

The application enables users to communicate in real time through **private one-to-one chats** and **group chat rooms**, similar to real-world applications like **Slack, WhatsApp, and Microsoft Teams**. Messages are persisted in the database, ensuring full chat history even after page refresh or user re-login.

### Core Focus
- Real-time communication using WebSockets  
- Secure authentication  
- Message persistence  
- Responsive UI  

---

## ✨ Features

- 🔐 User authentication using JWT  
- 💬 Real-time one-to-one chat  
- 👥 Group chats with admin controls  
- ⌨️ Typing indicators  
- 🟢 Real-time online/offline user presence  
- 📎 File and image sharing  
- 🖼 Image preview support  
- 🕒 Persistent chat history  
- 📱 Fully responsive UI (mobile & desktop)  
- 👤 User profiles (private & public)  

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Redux Toolkit
- React Router
- Tailwind CSS
- Socket.IO Client
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.IO
- JSON Web Tokens (JWT)
- Multer (file handling)
- Cloudinary (media storage)

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Media Storage: Cloudinary

---

## 🧩 System Architecture

The application follows a **client-server architecture** with a clear separation between **REST APIs** and **WebSocket communication**.



## 🔁 REST + WebSocket Separation

### REST APIs (HTTP)

Used for:
- Authentication (login / register)
- Fetching users and chats
- Loading chat history
- Uploading files
- Profile management

### WebSockets (Socket.IO)

Used for:
- Sending & receiving messages instantly
- Typing indicators
- Online/offline presence
- Live updates to chat sidebar

This separation ensures **scalability, performance, and clean code structure**.

---

## 🔐 Authentication Flow

1. User registers or logs in using email & password  
2. Backend generates a **JWT access token**  
3. Token is returned to the client  
4. Token is stored in `localStorage`  
5. Token is sent with every protected request:

       Authorization: Bearer <token> 


6. Backend middleware validates the token  
7. Logout is handled client-side by clearing token and Redux state  

---

## ⚡ Real-Time Messaging Flow (Socket.IO)

1. User connects to the Socket.IO server after authentication  
2. Socket connection is established using the JWT token  
3. User joins their personal and group chat rooms  
4. When a message is sent:
 - Message is saved to MongoDB  
 - Message is emitted via Socket.IO  
5. All connected users in the chat receive the message instantly  
6. Typing indicators and presence events are broadcast in real time  

---

---

## 🗃 Database Schema Overview

The application uses **MongoDB with Mongoose** for data persistence.  
Three core collections are used: **User**, **Chat**, and **Message**.



### 👤 User Schema

Stores user authentication details, profile information, and presence status.

**Fields:**
- `name` — User’s display name  
- `email` — Unique user email  
- `password` — Hashed password (bcrypt)  
- `bio` — Optional user bio  
- `avatar` — Profile picture URL (Cloudinary)  
- `isOnline` — Real-time online status  
- `lastSeen` — Last active timestamp  
- `createdAt`, `updatedAt` — Auto-generated timestamps  

**Security:**
- Passwords are hashed using **bcrypt**
- Password field is excluded from queries by default
- JWT-based authentication is used



### 💬 Chat Schema

Represents both **one-to-one chats** and **group chats**.

**Fields:**
- `chatName` — Name of the chat (group chats)
- `isGroupChat` — Indicates group or private chat
- `users` — List of participating users
- `admin` — Group admin (only for group chats)
- `latestMessage` — Reference to the most recent message
- `lastReadAt` — Map tracking last read timestamp per user
- `createdAt`, `updatedAt` — Auto-generated timestamps  



### 📨 Message Schema

Stores individual messages exchanged within chats.

**Fields:**
- `sender` — User who sent the message
- `chat` — Chat to which the message belongs
- `content` — Text content of the message
- `messageType` — `text`, `image`, or `file`
- `mediaUrl` — Cloudinary URL for images/files
- `createdAt`, `updatedAt` — Auto-generated timestamps  



### 📌 Relationships Overview

- **User ↔ Chat**
  - A user can participate in multiple chats
- **Chat ↔ Message**
  - A chat contains multiple messages
- **Message ↔ User**
  - Each message is sent by a single user

This schema design ensures **efficient querying**, **scalable real-time updates**, and **persistent chat history**.

---



# ⚙️ Local Setup Instructions

Follow the steps below to set up and run the project locally.



### 📌 Prerequisites

Ensure the following are installed on your system:

- **Node.js** v18 or higher  
- **npm** v9 or higher  
- **MongoDB**
  - Local MongoDB instance **or**
  - MongoDB Atlas account  

Check versions using:
```shell
node -v
npm -v
```

### Clone the  repository:

Clone the project repository to your local machine:

```shell
git clone https://github.com/RapuruHitheshReddy/mern-realtime-chat-app.git
```

Move into the project directory:

```shell
cd mern-realtime-chat-app
```
---

**🔧 Backend Setup**

Navigate to the backend folder:

```shell
cd backend
```


*Install backend dependencies:*

```shell
npm install
```


### Backend Environment Configuration (.env) 

Create a `.env` file in the **backend root directory** and add the following:


```shell
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

CLIENT_URL=http://localhost:5173
```

---

Start the backend server:
```shell
npm run dev
```


The backend server will run on:
```shell
http://localhost:5000
```
---
### 🎨 Frontend Setup
Open a new terminal window and navigate back to the project root:
```shell
cd ..
```

Move into the frontend folder:

```shell
cd frontend
```

*Install frontend dependencies:*

```shell
npm install
```
### 🌍 Frontend Environment Configuration

Create a `.env` file in the frontend root directory and add:

```shell
VITE_API_BASE_URL=http://localhost:5000/api
```

**Start Frontend Server**
Run the frontend development server:

```shell
npm run dev
```

The application will be accessible at:
```shell
http://localhost:5173
```

### ✅ Local Setup Complete
