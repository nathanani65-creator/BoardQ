// server/models/db.js
const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, '..', 'boardqueue.db'))

// เปิด WAL mode เพื่อประสิทธิภาพดีขึ้น
db.pragma('journal_mode = WAL')

// ===== สร้างตารางทั้งหมด =====
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT    NOT NULL,
    email    TEXT    NOT NULL UNIQUE,
    password TEXT    NOT NULL,
    role     TEXT    NOT NULL DEFAULT 'user',
    created_at TEXT  DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS boardgames (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT,
    category    TEXT    NOT NULL DEFAULT 'strategy',
    max_players INTEGER NOT NULL DEFAULT 10,
    min_players INTEGER NOT NULL DEFAULT 2,
    play_time   INTEGER NOT NULL DEFAULT 60,
    min_age     INTEGER NOT NULL DEFAULT 8,
    image       TEXT,
    rules       TEXT
  );

  CREATE TABLE IF NOT EXISTS timeslots (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    start_time  TEXT    NOT NULL,
    end_time    TEXT    NOT NULL,
    max_booking INTEGER NOT NULL DEFAULT 20,
    is_active   INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL,
    boardgame_id INTEGER NOT NULL,
    timeslot_id  INTEGER NOT NULL,
    date         TEXT    NOT NULL,
    people_count INTEGER NOT NULL DEFAULT 1,
    status       TEXT    NOT NULL DEFAULT 'confirmed',
    created_at   TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id)      REFERENCES users(id),
    FOREIGN KEY (boardgame_id) REFERENCES boardgames(id),
    FOREIGN KEY (timeslot_id)  REFERENCES timeslots(id)
  );
`)

// ===== Seed ข้อมูลเริ่มต้น (ถ้ายังไม่มี) =====

// Timeslots
const slotCount = db.prepare('SELECT COUNT(*) as c FROM timeslots').get()
if (slotCount.c === 0) {
  const insertSlot = db.prepare(
    'INSERT INTO timeslots (start_time, end_time, max_booking) VALUES (?, ?, ?)'
  )
  insertSlot.run('10:00', '12:00', 20)
  insertSlot.run('13:00', '15:00', 20)
  insertSlot.run('16:00', '18:00', 20)
  console.log('✅ Seeded timeslots')
}

// Boardgames
const gameCount = db.prepare('SELECT COUNT(*) as c FROM boardgames').get()
if (gameCount.c === 0) {
  const insertGame = db.prepare(`
    INSERT INTO boardgames (name, description, category, max_players, min_players, play_time, min_age, image, rules)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const games = [
    // strategy
    ['Catan','สร้างอาณานิคม แลกเปลี่ยนทรัพยากร และเจรจาเพื่อชนะ','strategy',10,3,90,10,
     'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__itemrep/img/IzYEUm_gWFuRFOL8gQYqGHRauBk=/fit-in/246x300/filters:strip_icc()/pic2419375.jpg',
     '["ผู้เล่น 3-4 คนต่อโต๊ะ","ต้องรวม 10 คะแนนชนะ","ห้ามแลกด้วยบัตรพิเศษในตาแรก","ผู้สร้างถนนยาวสุดได้โบนัส 2 คะแนน"]'],
    ['Terraforming Mars','ร่วมกันหรือแข่งขันพัฒนาดาวอังคารให้มีชีวิตได้','strategy',10,1,120,12,
     'https://cf.geekdo-images.com/wg9oOLcsKvDesSUdZQ4rxw__itemrep/img/BTxqxgYay5tHJBuPGBFBFyHLFEQ=/fit-in/246x300/filters:strip_icc()/pic3536616.jpg',
     '["แต่ละรอบเล่นตามลำดับ","ต้องเก็บ milestone ให้ครบ","การ์ดสีเขียวเล่นฟรีเมื่อปฏิบัติเงื่อนไข","เกมจบเมื่อค่า 3 ตัวชี้วัดเต็ม"]'],
    ['Ticket to Ride','ต่อเส้นทางรถไฟทั่วอเมริกาให้ครบตามการ์ดปลายทาง','strategy',8,2,75,8,
     'https://cf.geekdo-images.com/ZWJg0dCdrWHxVnc0eFXK8w__itemrep/img/q-ekLwA39o2m4RJHDLuAQGQpaSY=/fit-in/246x300/filters:strip_icc()/pic38668.jpg',
     '["วางรางสูงสุด 45 ท่อน","จบเกมเมื่อใครมีรางเหลือ < 3","เส้นทางยาวสุดได้ 10 คะแนน","ทำ destination ไม่ได้ หักคะแนน"]'],
    ['Pandemic','ทีมผู้เชี่ยวชาญต้องกำจัดโรคระบาด 4 ชนิดทั่วโลก','strategy',8,2,60,10,
     'https://cf.geekdo-images.com/S3gy1KioFEs7EmcIGHkJFA__itemrep/img/I4p8vCbOFcLvHmEFBqXIQ0exWTY=/fit-in/246x300/filters:strip_icc()/pic1534148.jpg',
     '["ผู้เล่นแต่ละคนมีพลังพิเศษ","การ์ด Epidemic เพิ่มความยาก","ต้องหายา 4 ชนิดก่อนหมดเวลา","เกมแพ้ร่วมกัน ชนะร่วมกัน"]'],
    ['Azul','เก็บกระเบื้องสีตกแต่งพระราชวังให้สวยงาม','strategy',10,2,45,8,
     'https://cf.geekdo-images.com/aPSHJO0d0XOpQR5X-wJonQ__itemrep/img/4aMDCAlbJPSXaGjuEH0hT3pRn2c=/fit-in/246x300/filters:strip_icc()/pic6973671.png',
     '["เลือกกระเบื้องสีเดียวต่อตา","กระเบื้องเกินห้ามทิ้ง หักคะแนน","แถวแนวนอนสมบูรณ์ได้โบนัส","จบเมื่อใครสร้างแถวแนวนอนครบ"]'],
    ['Agricola','บริหารฟาร์ม ขยายบ้าน และเลี้ยงดูครอบครัวชาวนา','strategy',6,1,120,12,
     'https://cf.geekdo-images.com/dDDo2SOdgd4qHD1UKxAvEQ__itemrep/img/ZVmJ8ue9y2Y-NeQ5sNqiXaOLaqw=/fit-in/246x300/filters:strip_icc()/pic831744.jpg',
     '["แต่ละรอบเพิ่มไพ่อาชีพ","ต้องเลี้ยงสมาชิกครอบครัวทุกรอบ","คะแนนจาก 6 หมวดรวมกัน","เกมมี 14 รอบ"]'],
    ['Wingspan','สะสมนกหายากและสร้างระบบนิเวศที่สมบูรณ์','strategy',10,1,90,10,
     'https://cf.geekdo-images.com/yLZJCVLlIx4c7eJEWUNJ7w__itemrep/img/klIBDqFBLSMIEPaTVlHKEFGxqAE=/fit-in/246x300/filters:strip_icc()/pic4458123.jpg',
     '["นกแต่ละตัวมีพลังพิเศษ","ไข่ใช้แทนทรัพยากรได้","คะแนนจากเป้าหมายรอบ + นก + บัตรโบนัส","ผู้เล่นคนสุดท้ายวางนกน้อยสุด"]'],
    // party
    ['Codenames','แบ่งทีม ให้คำใบ้คำเดียวเพื่อให้เพื่อนทายการ์ดให้ครบ','party',10,4,30,14,
     'https://cf.geekdo-images.com/F_KDEu0GjdClml8N7c8Imw__itemrep/img/qIKqSu3jFiCjJRtnoHVqnbPSMKE=/fit-in/246x300/filters:strip_icc()/pic2582929.jpg',
     '["แต่ละทีมมี Spymaster 1 คน","คำใบ้ต้องเป็น 1 คำ + ตัวเลข","เปิดผิดทีมตัวเอง = คะแนนให้คู่แข่ง","เปิดนักฆ่า = แพ้ทันที"]'],
    ['Dixit','บรรยายภาพในการ์ดให้คนอื่นเดา แต่ไม่ให้ถูกทุกคน','party',10,3,30,8,
     'https://cf.geekdo-images.com/DE0CLn9IiQOT1VcNNoAGlQ__itemrep/img/x6X8Sg5bm_7f6KHtnhC4VygUy0M=/fit-in/246x300/filters:strip_icc()/pic3483909.jpg',
     '["ผู้เล่าได้คะแนนเมื่อมีคนเดาถูก แต่ไม่ทุกคน","คนเดาถูกได้ 2 คะแนน","ถ้าไม่มีใครหรือทุกคนเดาถูก เล่าเรื่องเสีย","จบที่ 30 คะแนนหรือไพ่หมด"]'],
    ['Just One','ให้คำใบ้ร่วมกันช่วยเพื่อนทายคำ ซ้ำกันลบทิ้งทั้งคู่','party',10,2,20,8,
     'https://cf.geekdo-images.com/eJBCXCGe-AoCGsBJMCwGRA__itemrep/img/igePomGAkMZNcFnEIaExQIa3nNw=/fit-in/246x300/filters:strip_icc()/pic7571765.png',
     '["คำใบ้ที่ซ้ำถูกลบออกก่อนโชว์","เดาได้ 1 ครั้ง","เดาผิด = เสียการ์ดพิเศษเพิ่ม","เป้าหมาย 13/13 การ์ด"]'],
    ['Skull King','ประกาศจำนวน trick ที่จะชนะในแต่ละรอบ','party',8,2,30,8,
     'https://cf.geekdo-images.com/hne1hQBsEkDpEaLPGN06Iw__itemrep/img/J5xFAJAqSUHHi0LFpVsWrIXEkWw=/fit-in/246x300/filters:strip_icc()/pic7497012.jpg',
     '["ประกาศ bid ก่อนเล่น","ชนะ trick ด้วยไพ่สูงกว่า","Skull King ชนะทุกอย่าง ยกเว้น Mermaid","รอบมี 1-10 ใบ"]'],
    ['Wavelength','ให้คำใบ้เพื่อช่วยทีมหมุนหน้าปัดให้ตรงตำแหน่ง','party',10,2,30,14,
     'https://cf.geekdo-images.com/1TF_3JSOVM1GFQGlzcTGjA__itemrep/img/e7Jlm5QDPAnMsFQRIyJSEVaRVlM=/fit-in/246x300/filters:strip_icc()/pic4932369.jpg',
     '["แบ่ง 2 ทีม","ให้คำใบ้แล้วทายตำแหน่ง","คู่แข่งเดาว่าซ้ายหรือขวาก่อนเปิด","คะแนนจากความแม่นยำ"]'],
    ['Coup','โกหกอ้างตัวละครเพื่อกำจัดคู่แข่ง คนสุดท้ายชนะ','party',6,2,20,10,
     'https://cf.geekdo-images.com/MWhSY_GOe2-bmlQ2rntSVg__itemrep/img/YPHQhgvBMRSwMoABPCo7KMGMHFE=/fit-in/246x300/filters:strip_icc()/pic2016054.jpg',
     '["ทุกคนเริ่มด้วย 2 influence card","อ้างใครก็ได้ แต่โดน challenge แล้วโกหก = เสีย influence","มี coin 10 ต้อง coup ทันที","Contessa บล็อค Assassin ได้"]'],
    ['Love Letter','ถือการ์ดแค่ใบเดียว กำจัดคู่แข่ง หรือมีการ์ดสูงสุดจนจบ','party',4,2,15,10,
     'https://cf.geekdo-images.com/cugfEoSRRfBnTSzYEHdXeQ__itemrep/img/0RhyiM5PiDDKJRyNtroYFQblqQ8=/fit-in/246x300/filters:strip_icc()/pic5266974.png',
     '["ถือการ์ดสูงสุด 1 ใบ","จั่วแล้วเลือกทิ้ง 1 ใบ","Guard เดาการ์ดในมือได้","ชนะ 4/7 token ตามจำนวนผู้เล่น"]'],
    // coop
    ['Forbidden Island','ทีมต้องเก็บสมบัติ 4 ชิ้นจากเกาะที่กำลังจม','coop',8,2,30,10,
     'https://cf.geekdo-images.com/rEZCI1GVQdDNPDaqiMlHkg__itemrep/img/R2jRo2p7JJI1KNMlIAIFoerFpbw=/fit-in/246x300/filters:strip_icc()/pic1107790.jpg',
     '["เกาะจมลงทีละไทล์","ต้องเก็บ artifact ก่อนไทล์นั้นจม","ทุกคนต้องโดดขึ้นเฮลิคอปเตอร์","ผู้เล่นแต่ละคนมีทักษะพิเศษ"]'],
    ['Spirit Island','วิญญาณเกาะต้องร่วมกันขับไล่ผู้รุกรานออกจากดินแดน','coop',6,1,120,13,
     'https://cf.geekdo-images.com/kjYMFGnKEJbEJqIiJdHIpA__itemrep/img/j1BBKJGHjFbwLPRnvt5bWX5cTBQ=/fit-in/246x300/filters:strip_icc()/pic7001155.jpg',
     '["เล่นพลังงานและไพ่พลังพร้อมกัน","ผี spirit ต่างกันมีสไตล์ต่างกัน","Fear card เปิดเมื่อสะสม fear ครบ","ชนะเมื่อผู้รุกรานหมด"]'],
    ['Dead of Winter','เอาชีวิตรอดในฤดูหนาวซอมบี้ ระวังสายลับในทีม','coop',8,2,120,13,
     'https://cf.geekdo-images.com/xMTHeEBHlrYO-OIVFvpDpA__itemrep/img/4-lnqXJbXrCNS7s_VJD7JRnRFtY=/fit-in/246x300/filters:strip_icc()/pic1998079.jpg',
     '["ผู้เล่นคนใดคนหนึ่งอาจเป็น Betrayer","ทุกตาต้องโยน Crossroads die","Morale ตกถึง 0 = แพ้","เป้าหมายส่วนตัวต่างกัน"]'],
    ['Arkham Horror','นักสืบปิดมิติสยองขวัญก่อนสิ่งชั่วร้ายโบราณตื่น','coop',6,1,180,14,
     'https://cf.geekdo-images.com/6ZUaJT1Jqf5Y5s8SWOX6kg__itemrep/img/aIhPnuF0BSjzHjL_zBiCHC3BSGU=/fit-in/246x300/filters:strip_icc()/pic3726128.jpg',
     '["แต่ละตาเดิน+ต่อสู้+ทำ action","Doom clock เดินทุกรอบ","ปิด gate ด้วย Elder Sign","เกมชนะเมื่อปิด gate ครบก่อน doom เต็ม"]'],
    ['Mysterium','ผีส่งภาพนิมิตช่วยนักสืบค้นหาฆาตกร','coop',7,2,60,10,
     'https://cf.geekdo-images.com/9RkTjDAYlz3diE0ulXBNqQ__itemrep/img/JOdVPHBOxoJ0s6qEHrFUDKBXHoI=/fit-in/246x300/filters:strip_icc()/pic2411185.jpg',
     '["ผีพูดไม่ได้ ส่งได้แค่ vision card","นักสืบเดาบุคคล+สถานที่+อาวุธ","เกมจบใน 7 รอบ","ลงคะแนนตัดสินในรอบสุดท้าย"]'],
    ['Hanabi','เล่นดอกไม้ไฟให้สมบูรณ์ โดยเห็นไพ่คนอื่นแต่ไม่เห็นของตัวเอง','coop',8,2,25,8,
     'https://cf.geekdo-images.com/picture_ufE3ZVRD6GKPj0ixNJqgTg__itemrep/img/Ys3D9z7u5VTbT3s6v3Xjp3aBQjk=/fit-in/246x300/filters:strip_icc()/pic3306570.jpg',
     '["ถือไพ่หันออกนอก","บอกได้แค่สี หรือ ตัวเลข ต่อตา","วางผิดลำดับไม่ได้","เป้าหมาย 25 คะแนน"]'],
    ['Gloomhaven','RPG board game แบบ campaign บุกดันเจี้ยนพัฒนาตัวละคร','coop',4,1,120,14,
     'https://cf.geekdo-images.com/sZYp_3BTDGjh2unaZfZmuA__itemrep/img/veqFeP4d_3zNgMd7qDMkGfXfCz8=/fit-in/246x300/filters:strip_icc()/pic2437871.jpg',
     '["เลือก action card 2 ใบต่อตา","ลำดับตามค่า initiative","ตัวละคร retire เมื่อจบ goal ส่วนตัว","ผ่านมิชชั่นปลดล็อคเนื้อเรื่องใหม่"]'],
  ]

  for (const g of games) insertGame.run(...g)
  console.log('✅ Seeded boardgames')
}

module.exports = db
