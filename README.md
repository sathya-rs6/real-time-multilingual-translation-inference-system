# Real-Time Multilingual Translation System

A production-oriented **real-time multilingual message translation system** designed for low-latency inference in chat applications.  
The system enables users to communicate across languages seamlessly using **WebSockets** and **ML-powered translation inference**.

Built with **FastAPI**, **React (Vite)**, **PostgreSQL**, and a **local LLM-based translation pipeline**.

---

## run
```
back : uvicorn main:app --reload

fron : npm run dev

```
## Overview

Real-time chat translation introduces unique challenges that go beyond standard web applications:

- Low-latency inference requirements
- Concurrent message handling
- Real-time message streaming
- Fault-tolerant ML inference
- Language preservation across users

This project focuses on **ML inference integration in a real-time system**, rather than only UI features.

---

## Problem Statement

In multilingual chat systems, messages must be:
- Translated instantly to avoid breaking conversation flow
- Delivered reliably to multiple users
- Preserved in their original form for auditing and reprocessing
- Processed under concurrency without blocking the system

This project addresses these challenges by combining:
- WebSocket-based real-time communication
- Database-backed message persistence
- Isolated translation inference logic
- Production-aware backend architecture

---

## System Architecture

- **Frontend**: React (Vite) — real-time UI using WebSockets  
- **Backend**: FastAPI — API, authentication, and message orchestration  
- **Database**: PostgreSQL — persistent storage for users, rooms, messages, and translations  
- **ML Inference**: Local LLM-based translation (Meta NLLB-200-600M implementation)  
- **Communication**: REST APIs + WebSockets  

---

## ML Translation Pipeline

```text
User Message
 → Language Detection
 → Text Normalization
 → Translation Model Inference
 → Post-processing
 → Store Original + Translated Text
 → Broadcast via WebSocket
```

### Working sample images/gif



The GIF below demonstrates:
- Messages sent in different languages
- Real-time translation during chat
- Live WebSocket communication

![Real-Time Chat Demo](./docs/demo_chat.gif)

![Real-Time Chat Demo](./docs/Exp.png)

![Real-Time Chat Demo](./docs/chat.png)

![Real-Time Chat Demo](./docs/db.png)

## Run locally

### ✅ Prerequisites

- Python **3.10+**
- Node.js **18+**
- PostgreSQL **15**
- Git

---

## 1️⃣ Clone the repository

```bash
git clone https://github.com/Athulponnu/real-time-multilingual-translation-inference-system.git
cd real-time-multilingual-translation-inference-system

```
```
cd backend
python -m venv venv
source venv/bin/activate 
pip install -r requirements.txt
```

```
Set environment variables

Create a .env file in backend/:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatdb
SECRET_KEY=super-secret-key
```


### Make sure PostgreSQL is running and create DB:
```
CREATE DATABASE chatdb;
```

### run backend

```
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

```
cd frontend
npm install
```

```
npm run dev
```



### 🐳 Docker Setup (Recommended)
-Prerequisites
-Docker Desktop
-Docker Compose

### Git

```
git clone https://github.com/Athulponnu/real-time-multilingual-translation-inference-system.git
cd real-time-multilingual-translation-inference-system

```


▶ Start all services
```
docker compose up --build
```
🛑 Stop services
```
docker compose down
```

