# Alpha-WorldQuant

ระบบหา **alpha** (สัญญาณเทรด) อัตโนมัติบน [WorldQuant BRAIN](https://platform.worldquantbrain.com) — ประกอบด้วย
MCP server ที่เชื่อมกับ BRAIN API + ชุด skills/agents สำหรับใช้งานผ่าน **Claude Code**
(ค้นไอเดีย → แปลงเป็น FASTEXPR → simulate → เช็คเกณฑ์/correlation → เข้าคิวรอ submit)

---

## สิ่งที่ต้องมีก่อน

- [Node.js](https://nodejs.org) (เวอร์ชัน 18 ขึ้นไป)
- [Claude Code](https://claude.com/claude-code)
- **บัญชี WorldQuant BRAIN ของตัวเอง** (อีเมล + พาสเวิร์ดที่ใช้ login)

---

## ติดตั้ง

```bash
# 1. clone repo (ต้องเป็น collaborator เพราะ repo เป็น Private)
git clone https://github.com/<username>/<repo>.git
cd <repo>

# 2. ลง dependencies
npm install

# 3. ตั้งค่า credential ของตัวเอง — เลือกทำอย่างใดอย่างหนึ่ง
#    (ก) สำหรับใช้ใน Claude Code: ก๊อป template แล้วแก้ใส่ user/pass ของตัวเอง
cp .mcp.json.example .mcp.json
#    (ข) สำหรับรัน server ตรง ๆ ด้วย npm start: ใช้ .env
cp .env.example .env
```

จากนั้นเปิดไฟล์ `.mcp.json` (หรือ `.env`) แล้วใส่ **อีเมลและพาสเวิร์ด WorldQuant ของคุณเอง**

> ⚠️ ไฟล์ `.mcp.json` และ `.env` ถูกใส่ไว้ใน `.gitignore` แล้ว — **ห้าม commit ขึ้น GitHub** เพราะมี credential

---

## วิธีใช้งาน

เปิดโฟลเดอร์โปรเจกต์ใน **Claude Code** → MCP server ชื่อ `worldquant` จะถูกลงทะเบียนจาก `.mcp.json` อัตโนมัติ
แล้วเรียก skills ได้เลย:

| คำสั่ง | ทำอะไร |
|--------|--------|
| `/find-alphas` | รัน pipeline หา alpha ครบวงจร (ค้นไอเดีย → แปลง → simulate → ประเมิน → เข้าคิว) |
| `/auto-alpha <N>` | หา alpha แบบ autonomous จนได้ N ตัวที่ submit ได้ |
| `/tune-alpha <id หรือ expression>` | ปรับแต่งตัวที่เกือบผ่านเกณฑ์ให้ผ่าน |
| `/review-candidates` | ดู alpha ที่รอ submit + เช็ค correlation ก่อนอนุมัติ |
| `/improve-system` | ตรวจสุขภาพ + พัฒนาตัวระบบ |
| `/os-monitor` | เช็คสถานะ out-of-sample ของ alpha ที่ submit แล้ว |

รัน MCP server ตรง ๆ (ไม่ผ่าน Claude Code) ก็ได้ด้วย:

```bash
npm start
```

---

## โครงสร้างโปรเจกต์

```
.
├── src/                 # MCP server (เชื่อม WorldQuant BRAIN API)
├── .claude/             # skills + agents + settings สำหรับ Claude Code
├── knowledge/           # playbook, framework, lessons-learned, dataset/operator reference
├── data/                # state: ไอเดีย, คิว submit, registry, รายงานแต่ละรอบ
├── workflows/           # batch scripts
├── .mcp.json.example    # template credential (ก๊อปเป็น .mcp.json)
└── .env.example         # template credential (ก๊อปเป็น .env)
```

> หมายเหตุ: โฟลเดอร์ `data/` และ `knowledge/` มีสถานะ/บันทึกการหา alpha ของเจ้าของเดิมติดมาด้วย
> ถ้าอยากเริ่มสด ลบไฟล์ใน `data/*.jsonl` ออกได้ตามต้องการ
