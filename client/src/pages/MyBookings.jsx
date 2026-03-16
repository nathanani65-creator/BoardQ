// client/src/pages/MyBookings.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const STATUS_MAP = {
  confirmed:  { label:'ยืนยันแล้ว', bg:'#d1fae5', color:'#065f46' },
  cancelled:  { label:'ยกเลิกแล้ว', bg:'#fee2e2', color:'#991b1b' },
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my')
      setBookings(res.data.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const cancel = async (id) => {
    if (!confirm('ยืนยันการยกเลิกการจอง?')) return
    try {
      await api.delete(`/bookings/${id}`)
      fetchBookings()
    } catch(e) {
      alert(e.response?.data?.message || 'เกิดข้อผิดพลาด')
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ maxWidth:'700px', margin:'0 auto', padding:'1.5rem 1rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.4rem', fontWeight:700, color:'#1a1a2e' }}>การจองของฉัน</h2>
        <button onClick={() => navigate('/games')} style={{ background:'#3C3489', color:'#fff', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'14px', cursor:'pointer' }}>
          + จองเพิ่ม
        </button>
      </div>

      {loading ? <p style={{ color:'#888', textAlign:'center' }}>กำลังโหลด...</p> :
        bookings.length === 0 ? <p style={{ color:'#aaa', textAlign:'center', padding:'3rem' }}>ยังไม่มีการจอง</p> :
        bookings.map(b => {
          const st = STATUS_MAP[b.status] || STATUS_MAP.confirmed
          const canCancel = b.status === 'confirmed' && b.date >= today
          return (
            <div key={b.id} style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', padding:'1rem 1.25rem', marginBottom:'12px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
              <img src={b.game_image} alt="" style={{ width:60, height:60, borderRadius:'8px', objectFit:'cover', flexShrink:0, background:'#f0f0f0' }}
                onError={e => e.target.style.display='none'} />
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <p style={{ fontWeight:600, fontSize:'15px', color:'#1a1a2e' }}>{b.game_name}</p>
                  <span style={{ fontSize:'12px', fontWeight:600, padding:'2px 8px', borderRadius:'6px', background:st.bg, color:st.color }}>{st.label}</span>
                </div>
                <p style={{ fontSize:'13px', color:'#666', margin:'2px 0' }}>
                  📅 {b.date} &nbsp; ⏰ {b.start_time}–{b.end_time} &nbsp; 👥 {b.people_count} คน
                </p>
                <p style={{ fontSize:'12px', color:'#aaa' }}>Booking #{b.id}</p>
              </div>
              {canCancel && (
                <button onClick={() => cancel(b.id)}
                  style={{ background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:'8px', padding:'6px 12px', fontSize:'13px', cursor:'pointer', flexShrink:0 }}>
                  ยกเลิก
                </button>
              )}
            </div>
          )
        })
      }
    </div>
  )
}
