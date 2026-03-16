// client/src/pages/Booking.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'

export default function Booking() {
  const [params]  = useSearchParams()
  const gameId    = params.get('gameId')
  const navigate  = useNavigate()

  const [game, setGame]       = useState(null)
  const [slots, setSlots]     = useState([])
  const [date, setDate]       = useState('')
  const [slotId, setSlotId]   = useState('')
  const [people, setPeople]   = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // get min date = today
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (gameId) api.get(`/boardgames/${gameId}`).then(r => setGame(r.data.data))
  }, [gameId])

  useEffect(() => {
    if (date && gameId) {
      api.get(`/timeslots?date=${date}&gameId=${gameId}`)
        .then(r => setSlots(r.data.data))
    }
  }, [date, gameId])

  const handleBook = async () => {
    if (!date || !slotId || !people) return setError('กรุณากรอกข้อมูลให้ครบ')
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/bookings', {
        boardgame_id: Number(gameId),
        timeslot_id:  Number(slotId),
        date, people_count: Number(people)
      })
      alert(`✅ จองสำเร็จ! Booking ID: ${res.data.bookingId}`)
      navigate('/my-bookings')
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth:'500px', margin:'0 auto', padding:'1.5rem 1rem' }}>
      <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'#3C3489', fontWeight:500, fontSize:'14px', cursor:'pointer', padding:0, marginBottom:'1rem' }}>
        ← กลับ
      </button>

      <h2 style={{ fontSize:'1.4rem', fontWeight:700, color:'#1a1a2e', marginBottom:'0.25rem' }}>จองคิว</h2>
      {game && <p style={{ color:'#666', fontSize:'14px', marginBottom:'1.5rem' }}>เกม: {game.name}</p>}

      {error && <p style={{ color:'#dc2626', background:'#fee2e2', padding:'8px 12px', borderRadius:'6px', marginBottom:'12px', fontSize:'14px' }}>{error}</p>}

      <div style={fieldWrap}>
        <label style={labelSt}>เลือกวันที่</label>
        <input type="date" min={today} value={date} onChange={e => { setDate(e.target.value); setSlotId('') }}
          style={inputSt} />
      </div>

      {date && (
        <div style={fieldWrap}>
          <label style={labelSt}>เลือกช่วงเวลา</label>
          {slots.length === 0 ? <p style={{ color:'#aaa', fontSize:'14px' }}>กำลังโหลด...</p> : slots.map(s => (
            <div key={s.id} onClick={() => !s.is_full && setSlotId(String(s.id))}
              style={{ padding:'12px 14px', border:`1.5px solid ${slotId===String(s.id)?'#3C3489':s.is_full?'#eee':'#ddd'}`,
                borderRadius:'8px', marginBottom:'8px', cursor: s.is_full?'not-allowed':'pointer',
                background: slotId===String(s.id)?'#f0eeff': s.is_full?'#fafafa':'#fff',
                opacity: s.is_full ? 0.5 : 1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:500, fontSize:'15px' }}>{s.start_time} – {s.end_time}</span>
                <span style={{ fontSize:'12px', color: s.is_full?'#991b1b':'#065f46', background: s.is_full?'#fee2e2':'#d1fae5', padding:'2px 8px', borderRadius:'6px' }}>
                  {s.is_full ? 'เต็ม' : `ว่าง ${s.available}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {slotId && (
        <div style={fieldWrap}>
          <label style={labelSt}>จำนวนคน</label>
          <input type="number" min={1} max={game?.max_players || 10} value={people}
            onChange={e => setPeople(e.target.value)} style={inputSt} />
        </div>
      )}

      <button onClick={handleBook} disabled={loading || !date || !slotId}
        style={{ width:'100%', padding:'13px', background: (!date||!slotId)?'#ccc':'#3C3489', color:'#fff', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:600, cursor: (!date||!slotId)?'not-allowed':'pointer', marginTop:'1rem' }}>
        {loading ? 'กำลังจอง...' : 'ยืนยันการจอง'}
      </button>
    </div>
  )
}

const fieldWrap = { marginBottom:'1.25rem' }
const labelSt   = { display:'block', fontSize:'13px', fontWeight:600, color:'#555', marginBottom:'6px' }
const inputSt   = { width:'100%', padding:'10px 14px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'15px', boxSizing:'border-box' }

