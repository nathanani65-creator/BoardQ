// client/src/pages/GameDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/boardgames/${id}`)
      .then(r => setGame(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p style={{ textAlign:'center', padding:'3rem', color:'#888' }}>กำลังโหลด...</p>
  if (!game)   return <p style={{ textAlign:'center', padding:'3rem', color:'#888' }}>ไม่พบเกม</p>

  const cur = game.current_players ?? 0
  const r   = cur / game.max_players
  const barColor = r >= 1 ? '#ef4444' : r >= 0.7 ? '#f59e0b' : '#10b981'
  const badgeBg  = r >= 1 ? '#fee2e2' : r >= 0.7 ? '#fef3c7' : '#d1fae5'
  const badgeTx  = r >= 1 ? '#991b1b' : r >= 0.7 ? '#92400e' : '#065f46'
  const badgeLb  = r >= 1 ? 'เต็มแล้ว' : r >= 0.7 ? 'ใกล้เต็ม' : 'มีที่ว่าง'

  return (
    <div style={{ maxWidth:'600px', margin:'0 auto', padding:'1.5rem 1rem 3rem' }}>
      <button onClick={() => navigate('/games')} style={{ background:'none', border:'none', color:'#3C3489', fontWeight:500, fontSize:'14px', cursor:'pointer', padding:0, marginBottom:'1rem' }}>
        ← กลับ
      </button>

      {/* Hero image */}
      <div style={{ borderRadius:'14px', overflow:'hidden', aspectRatio:'16/9', background:'#f0f0f0', position:'relative', marginBottom:'1.25rem' }}>
        <img src={game.image} alt={game.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
          onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
        <div style={{ display:'none', width:'100%', height:'100%', alignItems:'center', justifyContent:'center', fontSize:'64px' }}>🎲</div>
        <span style={{ position:'absolute', bottom:10, left:12, fontSize:'12px', fontWeight:600, padding:'3px 10px', borderRadius:'6px', background:badgeBg, color:badgeTx }}>{badgeLb}</span>
      </div>

      <h2 style={{ fontSize:'1.5rem', fontWeight:700, color:'#1a1a2e', marginBottom:'4px' }}>{game.name}</h2>
      <p style={{ fontSize:'13px', color:'#999', marginBottom:'1rem', textTransform:'capitalize' }}>{game.category}</p>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'1.25rem' }}>
        {[
          { val:`${game.min_players}–${game.max_players}`, lbl:'ผู้เล่น' },
          { val:game.play_time,                             lbl:'นาที' },
          { val:`${game.min_age}+`,                        lbl:'อายุ' },
        ].map(s => (
          <div key={s.lbl} style={{ background:'#f8f8f8', borderRadius:'10px', padding:'12px', textAlign:'center' }}>
            <span style={{ display:'block', fontSize:'20px', fontWeight:700, color:'#1a1a2e' }}>{s.val}</span>
            <span style={{ display:'block', fontSize:'11px', color:'#999', marginTop:'2px' }}>{s.lbl}</span>
          </div>
        ))}
      </div>

      {/* Capacity */}
      <div style={{ marginBottom:'1.25rem' }}>
        <p style={labelStyle}>ที่นั่งคงเหลือ</p>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#555', marginBottom:'5px' }}>
          <span>ผู้เล่นปัจจุบัน {cur}/{game.max_players} คน</span>
          <span>{Math.min(Math.round(r*100),100)}%</span>
        </div>
        <div style={{ height:'6px', background:'#eee', borderRadius:'3px', overflow:'hidden' }}>
          <div style={{ height:'100%', borderRadius:'3px', width:`${Math.min(r*100,100)}%`, background:barColor }} />
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom:'1.25rem' }}>
        <p style={labelStyle}>เกี่ยวกับเกม</p>
        <p style={{ fontSize:'15px', color:'#444', lineHeight:1.7 }}>{game.description}</p>
      </div>

      {/* Rules */}
      {game.rules?.length > 0 && (
        <div style={{ marginBottom:'1.5rem' }}>
          <p style={labelStyle}>กติกาสำคัญ</p>
          <ul style={{ listStyle:'none', padding:0 }}>
            {game.rules.map((r, i) => (
              <li key={i} style={{ fontSize:'14px', color:'#555', padding:'5px 0 5px 16px', position:'relative', lineHeight:1.6, borderBottom:'1px solid #f5f5f5' }}>
                <span style={{ position:'absolute', left:4, top:12, width:5, height:5, borderRadius:'50%', background:'#3C3489', display:'block' }} />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        disabled={r >= 1}
        onClick={() => navigate(`/booking?gameId=${game.id}`)}
        style={{ width:'100%', padding:'14px', background: r>=1?'#ccc':'#3C3489', color:'#fff', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:600, cursor: r>=1?'not-allowed':'pointer' }}>
        {r >= 1 ? 'เต็มแล้ว' : 'จองตอนนี้'}
      </button>
    </div>
  )
}

const labelStyle = { fontSize:'11px', fontWeight:600, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px' }
