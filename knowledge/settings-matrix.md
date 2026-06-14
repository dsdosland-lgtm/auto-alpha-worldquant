# Settings Matrix — ตัวเลือก simulation

ค่าที่ใส่ใน 6 field หลักของ settings (ใช้กับ MCP `simulate`)

## region
`USA`, `EUR`, `ASI`, `CHN`, `GLB`, `JPN`, `KOR`, `TWN`, `HKG` ...
(แต่ละ region มี data field ไม่เท่ากัน — เช็คด้วย `get_data_fields`)

## universe (ขนาดกลุ่มหุ้น)
| region | universe ที่ใช้ได้บ่อย |
|--------|----------------------|
| USA | TOP3000, TOP1000, TOP500, TOP200 |
| อื่นๆ | ต่างกันไป เช็คจริง |

## delay
- `1` = ใช้ข้อมูลถึงเมื่อวาน (มาตรฐาน, เริ่มที่นี่)
- `0` = ใช้ข้อมูลวันนี้ (เข้มงวดกว่า, field น้อยกว่า)

## neutralization
`NONE` < `MARKET` < `SECTOR` < `INDUSTRY` < `SUBINDUSTRY`
- ยิ่งละเอียด ยิ่งหักอิทธิพลกลุ่ม → มักช่วย sharpe แต่ลด exposure
- เริ่มที่ `SUBINDUSTRY` หรือ `INDUSTRY` สำหรับ equity

## decay (วัน)
`0` (ไม่ decay) → `4` → `8` → `16`
ยิ่งสูง turnover ยิ่งต่ำ แต่สัญญาณช้าลง

## truncation
`0.08` (default) → ลดเป็น `0.05`, `0.02` เพื่อจำกัดน้ำหนักสูงสุดต่อหุ้น (แก้ weight concentration)

## ค่าตั้งต้นแนะนำ (มือใหม่ USA)
```json
{
  "region": "USA",
  "universe": "TOP3000",
  "delay": 1,
  "neutralization": "SUBINDUSTRY",
  "decay": 0,
  "truncation": 0.08
}
```

## ชุด sweep มาตรฐาน (ลอง setting หลายค่ากับ expression เดียว)
- neutralization: [INDUSTRY, SUBINDUSTRY, MARKET]
- decay: [0, 4, 8]
- universe: [TOP3000, TOP1000]
→ จำกัดจำนวน combination ต่อรอบ (≤6) เคารพ concurrency ~3
