# Project Overview: NewSystem (IAM-Integrated Agreement Management System)

## 1. Project Overview
`NewSystem` คือระบบบริหารจัดการข้อตกลง (Agreement Management System) ที่ผสานการทำงานกับระบบยืนยันและบริหารจัดการสิทธิ์ส่วนกลาง (IAM) ของมหาวิทยาลัย แบ่งการทำงานเป็น 2 ส่วนหลักคือ **Backend (Node.js)** ทำหน้าที่เป็น API สำหรับจัดการข้อมูล, ตรรกะทางธุรกิจ และเป็น Proxy สำหรับสื่อสารกับ IAM Service และ **Frontend (Vue.js)** ทำหน้าที่เป็นหน้า Dashboard สำหรับผู้ใช้งานในการจัดการข้อมูลต่างๆ, ตั้งค่าระบบ, และบริหารจัดการสิทธิ์

## 2. Tech Stack & Libraries
**Frontend:**
- **Framework:** Vue.js 2.x (อ้างอิงจาก `frontend-vue/CHANGELOG.md`)
- **UI:** CoreUI for Vue.js, BootstrapVue
- **Integration:** เชื่อมต่อ Backend ผ่าน `VUE_APP_API_BASE_URL`
- **Routing:** Vue Router

**Backend:**
- **Framework:** Node.js, Express.js
- **Database:** MongoDB (ผ่าน Mongoose)
- **Caching:** Redis
- **Authentication:** Google Auth Library, B2B Token
- **Integration:** Axios (สำหรับเชื่อมต่อ IAM Service)

**Infrastructure / Deployment:**
- **Containerization:** Docker, Docker Compose
- **CI/CD:** GitLab CI, Harbor
- **Web Server:** Nginx (ทำหน้าที่เป็น Reverse Proxy สำหรับ Frontend)

## 3. Folder Structure
โครงสร้างโปรเจกต์แบ่งออกเป็น 2 ฝั่งอย่างชัดเจน ดังนี้:
```text
/
├── backend-node/              # Backend API (Node.js)
│   ├── server/                # Core server, routes, integrations (IAM SDK)
│   ├── security/              # Authorization, Account Access, IAM Client
│   ├── accounts/              # Authentication, Account Lifecycle
│   └── docs/                  # เอกสารสถาปัตยกรรมและข้อกำหนดของ IAM
│
├── frontend-vue/              # Frontend Web Application (Vue.js)
│   ├── src/
│   │   ├── components/        # CoreUI Components
│   │   ├── views/             # หน้า Page ต่างๆ (Dashboard, Accounts, Settings)
│   │   ├── router/            # การจัดการ Routes
│   │   └── store/             # State management (รวมไฟล์แปลภาษา)
│   └── CHANGELOG.md           # ประวัติการอัปเดต Dependencies
│
├── DEPLOY-UBUNTU.md           # คู่มือการ Deploy บน Server
└── README.md                  # ภาพรวมและวิธีการรันโปรเจกต์
```

## 4. AI Models & Computer Vision
ระบบประมวลผลภาพผ่านท่อ (Pipelines) แยกกัน 3 ส่วนหลัก โดยใช้สตรีมแบบ **MJPEG (Motion JPEG)**:
1. **Helmet Detection (`helmet_train1(3).pt`):** ตรวจจับผู้ขับขี่รถจักรยานยนต์ว่าสวมหมวกกันน็อกหรือไม่ ทำการวาด Bounding Box ทับลงบนเฟรมวิดีโอ
2. **Motorcycle Tracking (`yolov8n.pt`):** ตรวจจับและติดตาม (Track) รถมอเตอร์ไซค์ที่เคลื่อนผ่านกล้อง 
3. **License Plate & OCR (`licenseplate_train.pt` & `readingthai_train.pt`):**
   - ใช้ YOLO ตรวจจับหาตำแหน่งของป้ายทะเบียนในภาพ
   - ทำการ Crop รูปภาพป้ายทะเบียนออกมา
   - ใช้ OpenCV ในการขยาย (Scale) และปรับความคมชัด (Sharpen) ของภาพป้ายทะเบียน
   - นำภาพเข้ากระบวนการ OCR (อ่านตัวอักษรไทย/เลข) และแปลงรหัสผลลัพธ์เป็นข้อความ
   - บันทึกผลลัพธ์ลง Database

## 5. Backend API Endpoints
- `GET /video_helmet`: Endpoint สำหรับดึงภาพสตรีมการตรวจจับหมวกกันน็อก
- `GET /video_moto`: Endpoint สำหรับดึงภาพสตรีมการตรวจจับรถมอเตอร์ไซค์
- `GET /video_plate`: Endpoint สำหรับดึงภาพสตรีมการจับภาพและอ่านป้ายทะเบียน
- `GET /api/records`: ดึงข้อมูลประวัติการทำผิดกฎ (10 รายการล่าสุด) เพื่อนำไปแสดงในตาราง
- `GET /health`: สำหรับเช็คสถานะการทำงานของ Server และการเชื่อมต่อ Database

## 6. Database Schema
ใช้ **SQLite** เป็นหลักสำหรับการทำ Prototype โดยมี Table หลักคือ `records` 
(โครงสร้าง Schema พื้นฐานที่ระบบใช้งานและวางแผนไว้):
- `id` (Primary Key)
- `plate_number` (ข้อความป้ายทะเบียนที่อ่านได้จาก OCR)
- `timestamp` (เวลาที่ตรวจพบ)
- `location` (สถานที่/จุดที่ติดตั้งกล้อง)
- `image_url` / `snapshot` (ภาพหลักฐานตอนกระทำผิด)
- `confidence` (ค่าความแม่นยำของ AI)

## 7. Frontend Components
ระบบจัดการ UI โดยเน้นความทันสมัย ใช้ TailwindCSS และมีการแบ่ง Component ชัดเจน:
- **`MainLayout.vue`**: Layout หลักของแอปพลิเคชัน ประกอบด้วย Sidebar Navigation และ Top Header
- **`HomeView.vue`**: หน้า Dashboard แสดงสถิติภาพรวม เช่น จำนวน Violation วันนี้, เทรนด์การทำผิด (กราฟแบบแท่ง 24h/7d) และ Feed แจ้งเตือนล่าสุดแบบ Mock data 
- **`RealtimeView.vue`**: หน้าสำหรับดูสตรีมกล้อง AI แบบ Real-time ดึงภาพจาก API (`/video_...`) มาแสดงผ่านแท็ก `<img>` พร้อมระบบจำลอง FPS/Latency และมีปุ่มเพิ่ม/ลด การแสดงผลสตรีมกล้องได้แบบไดนามิก
- **`RecordsView.vue`**: หน้าประวัติการตรวจจับ (มี Data Table, Filter, Pagination) ปัจจุบันรองรับ Mock Data และเตรียมเชื่อมกับ `/api/records`
- **`RecordDetailView.vue` / `AnalyticsView.vue`**: หน้าสำหรับดูรายละเอียดการกระทำผิดเชิงลึกและสถิติเพิ่มเติม