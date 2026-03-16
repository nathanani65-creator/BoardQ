// client/src/pages/GameMenu.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const CATS = [
  { key:'all',      label:'ทั้งหมด' },
  { key:'strategy', label:'กลยุทธ์' },
  { key:'party',    label:'ปาร์ตี้' },
  { key:'coop',     label:'ร่วมมือ' },
]

function statusInfo(cur, max) {
  const r = cur / max
  if (r >= 1)   return { cls:'full', label:'เต็มแล้ว', color:'#fee2e2', text:'#991b1b' }
  if (r >= 0.7) return { cls:'busy', label:'ใกล้เต็ม', color:'#fef3c7', text:'#92400e' }
  return               { cls:'open', label:'มีที่ว่าง', color:'#d1fae5', text:'#065f46' }
}

export default function GameMenu() {
  const [games, setGames]     = useState([])
  const [cat, setCat]         = useState('all')
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  useEffect(() => { fetchGames() }, [])

  const fetchGames = async () => {
    try {
      const res = await api.get('/boardgames')
      setGames(res.data.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const filtered = games
    .filter(g => cat === 'all' || g.category === cat)
    .filter(g => g.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'1.5rem 1rem' }}>
      {/* Navbar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'8px' }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:700, color:'#1a1a2e' }}>🎲 BoardQueue</h1>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <span style={{ fontSize:'14px', color:'#666' }}>สวัสดี, {user.name}</span>
          <button onClick={() => navigate('/my-bookings')} style={btnStyle('#f0f0f0','#333')}>การจองของฉัน</button>
          {user.role === 'admin' && <button onClick={() => navigate('/admin')} style={btnStyle('#3C3489','#fff')}>Admin</button>}
          <button onClick={logout} style={btnStyle('#fee2e2','#991b1b')}>ออกจากระบบ</button>
        </div>
      </div>

      {/* Search + Tabs */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'1rem', flexWrap:'wrap' }}>
        <input
          placeholder="ค้นหาเกม..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding:'8px 14px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', width:'220px' }}
        />
      </div>
      <div style={{ display:'flex', gap:'8px', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        {CATS.map(c => (
          <button key={c.key} onClick={() => setCat(c.key)}
            style={{ padding:'7px 18px', borderRadius:'8px', border:'1px solid', fontSize:'14px', fontWeight:500, cursor:'pointer',
              borderColor: cat===c.key ? '#3C3489':'#ddd',
              background:  cat===c.key ? '#3C3489':'transparent',
              color:       cat===c.key ? '#fff':'#666' }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? <p style={{ textAlign:'center', color:'#888' }}>กำลังโหลด...</p> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))', gap:'14px' }}>
          {filtered.map(game => {
            const cur  = game.current_players ?? 0
            const st   = statusInfo(cur, game.max_players)
            const pct  = Math.min(Math.round(cur/game.max_players*100), 100)
            return (
              <div key={game.id} onClick={() => navigate(`/games/${game.id}`)}
                style={{ background:'#fff', border:'1px solid #eee', borderRadius:'12px', overflow:'hidden', cursor:'pointer', transition:'transform 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform='none'}>
                <div style={{ position:'relative', aspectRatio:'1/1', background:'#f5f5f5', overflow:'hidden' }}>
                  <img src={game.image} alt={game.name} loading="lazy"
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                  <div style={{ display:'none', width:'100%', height:'100%', alignItems:'center', justifyContent:'center', fontSize:'36px' }}>🎲</div>
                  <span style={{ position:'absolute', top:8, right:8, fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'6px', background:st.color, color:st.text }}>{st.label}</span>
                </div>
                <div style={{ padding:'10px 12px' }}>
                  <p style={{ fontWeight:600, fontSize:'14px', color:'#1a1a2e', marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{game.name}</p>
                  <p style={{ fontSize:'11px', color:'#999', marginBottom:'8px', textTransform:'capitalize' }}>{game.category}</p>
                  <div style={{ height:'4px', background:'#eee', borderRadius:'2px', overflow:'hidden', marginBottom:'4px' }}>
                    <div style={{ height:'100%', borderRadius:'2px', width:`${pct}%`, background: st.cls==='full'?'#ef4444':st.cls==='busy'?'#f59e0b':'#10b981' }} />
                  </div>
                  <p style={{ fontSize:'11px', color:'#666' }}>ผู้เล่น {cur}/{game.max_players}</p>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && <p style={{ gridColumn:'1/-1', textAlign:'center', color:'#aaa', padding:'3rem' }}>ไม่พบเกม</p>}
        </div>
      )}
    </div>
  )
}

function btnStyle(bg, color) {
  return { padding:'7px 14px', background:bg, color, border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor:'pointer' }
}
