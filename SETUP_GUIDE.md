# 🎲 BoardQueue — คู่มือตั้งต้นโปรเจกต์ใหม่

## โครงสร้างโฟลเดอร์สุดท้ายที่จะได้
```
boardqueue/
├── client/                  ← React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── GameMenu.jsx
│   │   │   ├── GameDetail.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   └── App.jsx
│   └── package.json
│
├── server/                  ← Node.js backend
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── boardgameController.js
│   │   ├── bookingController.js
│   │   └── timeslotController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   └── db.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── boardgame.js
│   │   ├── booking.js
│   │   └── timeslot.js
│   ├── boardqueue.db        ← SQLite database
│   └── index.js
│
└── README.md
```

---

## STEP 1 — ติดตั้งเครื่องมือที่ต้องมี

ตรวจสอบก่อนว่ามีครบ:
```bash
node -v      # ต้องได้ v18 ขึ้นไป
npm -v       # ต้องได้ v9 ขึ้นไป
git -v       # ต้องได้ version อะไรก็ได้
```

ถ้ายังไม่มี Node.js → ดาวน์โหลดที่ https://nodejs.org

---

## STEP 2 — สร้าง GitHub Repo

1. เข้า https://github.com → New repository
2. ตั้งชื่อ: `boardqueue`
3. เลือก **Public** หรือ Private ตามชอบ
4. ✅ เลือก "Add a README file"
5. กด **Create repository**
6. กด **Code → Copy URL** (https://github.com/yourname/boardqueue.git)

---

## STEP 3 — Clone และตั้งโครงสร้าง

เปิด Terminal แล้วรันทีละบรรทัด:

```bash
# Clone repo
git clone https://github.com/YOUR_USERNAME/boardqueue.git
cd boardqueue

# สร้างโฟลเดอร์ backend
mkdir server
cd server
npm init -y

# ติดตั้ง packages backend
npm install express cors bcryptjs jsonwebtoken better-sqlite3 dotenv
npm install --save-dev nodemon

# กลับมาที่ root
cd ..

# สร้าง React frontend
npm create vite@latest client -- --template react
cd client
npm install
npm install axios react-router-dom

# กลับมาที่ root
cd ..
```

---

## STEP 4 — สร้างไฟล์ .gitignore

สร้างไฟล์ `.gitignore` ที่ root:
```
node_modules/
client/node_modules/
server/node_modules/
.env
*.db
dist/
```

---

## STEP 5 — ตั้งค่า server/package.json

แก้ไข `server/package.json` ส่วน scripts:
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

---

## STEP 6 — สร้าง .env

สร้างไฟล์ `server/.env`:
```
PORT=5000
JWT_SECRET=boardqueue_secret_key_2024
```

---

## STEP 7 — รัน dev server

เปิด Terminal 2 อัน:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

เข้าดูที่:
- Frontend → http://localhost:5173
- Backend  → http://localhost:5000

---

## ลำดับการสร้างไฟล์ (ทำตามลำดับนี้)

| ลำดับ | ไฟล์ | หมายเหตุ |
|-------|------|----------|
| 1 | `server/models/db.js` | เชื่อม SQLite + สร้างตาราง |
| 2 | `server/index.js` | ตั้ง Express server |
| 3 | `server/middleware/authMiddleware.js` | JWT verify |
| 4 | `server/controllers/authController.js` | register/login |
| 5 | `server/routes/auth.js` | auth routes |
| 6 | `server/controllers/boardgameController.js` | CRUD เกม |
| 7 | `server/routes/boardgame.js` | boardgame routes |
| 8 | `server/controllers/timeslotController.js` | จัดการช่วงเวลา |
| 9 | `server/routes/timeslot.js` | timeslot routes |
| 10 | `server/controllers/bookingController.js` | จองคิว |
| 11 | `server/routes/booking.js` | booking routes |
| 12 | `client/src/services/api.js` | axios instance |
| 13 | `client/src/pages/Login.jsx` | หน้า login |
| 14 | `client/src/pages/Register.jsx` | หน้าสมัคร |
| 15 | `client/src/pages/GameMenu.jsx` | หน้าเลือกเกม |
| 16 | `client/src/pages/GameDetail.jsx` | รายละเอียดเกม |
| 17 | `client/src/pages/Booking.jsx` | หน้าจอง |
| 18 | `client/src/pages/MyBookings.jsx` | ประวัติการจอง |
| 19 | `client/src/pages/AdminDashboard.jsx` | admin panel |
| 20 | `client/src/App.jsx` | routes ทั้งหมด |
