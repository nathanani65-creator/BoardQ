// client/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const TABS = [
  { key: 'bookings', label: '📋 การจองทั้งหมด' },
  { key: 'games',    label: '🎲 จัดการเกม' },
  { key: 'users',    label: '👥 ผู้ใช้' },
]

export default function AdminDashboard() {
  const [tab, setTab]           = useState('bookings')
  const navigate                = useNavigate()

  const logout = () => { localStorage.clear(); navigate('/login') }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Top Nav */}
      <div style={{ background: '#3C3489', color: '#fff', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
        <span style={{ fontWeight: 700, fontSize: '1rem' }}>🎲 BoardQueue — Admin</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/games')} style={navBtn}>ดูหน้าหลัก</button>
          <button onClick={logout} style={{ ...navBtn, background: '#fee2e2', color: '#991b1b' }}>ออกจากระบบ</button>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                borderColor: tab === t.key ? '#3C3489' : '#ddd',
                background:  tab === t.key ? '#3C3489' : '#fff',
                color:       tab === t.key ? '#fff' : '#444' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'bookings' && <BookingsTab />}
        {tab === 'games'    && <GamesTab />}
        {tab === 'users'    && <UsersTab />}
      </div>
    </div>
  )
}

// ===== Tab: การจองทั้งหมด =====
function BookingsTab() {
  const [bookings, setBookings] = useState([])
  const [date, setDate]         = useState('')
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => { fetchBookings() }, [date, search])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (date)   params.append('date',   date)
      if (search) params.append('search', search)
      const res = await api.get(`/bookings/all?${params}`)
      setBookings(res.data.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const cancel = async (id) => {
    if (!confirm('ยืนยันการยกเลิก?')) return
    try {
      await api.delete(`/bookings/${id}`)
      fetchBookings()
    } catch(e) { alert(e.response?.data?.message || 'เกิดข้อผิดพลาด') }
  }

  const STATUS = {
    confirmed: { label: 'ยืนยันแล้ว', bg: '#d1fae5', color: '#065f46' },
    cancelled: { label: 'ยกเลิก',     bg: '#fee2e2', color: '#991b1b' },
  }

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputSt} />
        <input placeholder="ค้นหาชื่อ / อีเมล..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputSt, width: '220px' }} />
        <button onClick={() => { setDate(''); setSearch('') }} style={{ padding: '8px 14px', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>ล้าง</button>
      </div>

      {loading ? <p style={{ color: '#888' }}>กำลังโหลด...</p> : (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8f8f8', borderBottom: '1px solid #eee' }}>
                {['#', 'ผู้ใช้', 'เกม', 'วันที่', 'เวลา', 'คน', 'สถานะ', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: '13px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>ไม่พบการจอง</td></tr>
              ) : bookings.map(b => {
                const st = STATUS[b.status] || STATUS.confirmed
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={td}>{b.id}</td>
                    <td style={td}>
                      <p style={{ fontWeight: 500, margin: 0 }}>{b.user_name}</p>
                      <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>{b.user_email}</p>
                    </td>
                    <td style={td}>{b.game_name}</td>
                    <td style={td}>{b.date}</td>
                    <td style={td}>{b.start_time}–{b.end_time}</td>
                    <td style={td}>{b.people_count}</td>
                    <td style={td}>
                      <span style={{ fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: st.bg, color: st.color }}>{st.label}</span>
                    </td>
                    <td style={td}>
                      {b.status === 'confirmed' && (
                        <button onClick={() => cancel(b.id)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>ยกเลิก</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ===== Tab: จัดการเกม =====
function GamesTab() {
  const [games, setGames]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editGame, setEditGame] = useState(null)

  useEffect(() => { fetchGames() }, [])

  const fetchGames = async () => {
    setLoading(true)
    try {
      const res = await api.get('/boardgames')
      setGames(res.data.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const deleteGame = async (id, name) => {
    if (!confirm(`ลบเกม "${name}" ?`)) return
    try {
      await api.delete(`/boardgames/${id}`)
      fetchGames()
    } catch(e) { alert('เกิดข้อผิดพลาด') }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button onClick={() => { setEditGame(null); setShowForm(true) }}
          style={{ background: '#3C3489', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
          + เพิ่มเกมใหม่
        </button>
      </div>

      {showForm && (
        <GameForm
          game={editGame}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchGames() }}
        />
      )}

      {loading ? <p style={{ color: '#888' }}>กำลังโหลด...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '12px' }}>
          {games.map(g => (
            <div key={g.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: '#f0f0f0' }}>
                <img src={g.image} alt={g.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => e.target.style.display = 'none'} />
              </div>
              <div style={{ padding: '10px 12px' }}>
                <p style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a2e', marginBottom: '2px' }}>{g.name}</p>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px', textTransform: 'capitalize' }}>{g.category} · {g.max_players} คน</p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => { setEditGame(g); setShowForm(true) }}
                    style={{ flex: 1, padding: '6px', background: '#f0eeff', color: '#3C3489', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    แก้ไข
                  </button>
                  <button onClick={() => deleteGame(g.id, g.name)}
                    style={{ flex: 1, padding: '6px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ===== Form เพิ่ม/แก้ไขเกม =====
function GameForm({ game, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: game?.name || '', description: game?.description || '',
    category: game?.category || 'strategy', max_players: game?.max_players || 10,
    min_players: game?.min_players || 2, play_time: game?.play_time || 60,
    min_age: game?.min_age || 8, image: game?.image || '',
    rules: game?.rules ? game.rules.join('\n') : '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const save = async () => {
    if (!form.name || !form.category) return setError('กรุณากรอกชื่อและหมวดหมู่')
    setLoading(true)
    try {
      const payload = {
        ...form,
        max_players: Number(form.max_players),
        min_players: Number(form.min_players),
        play_time:   Number(form.play_time),
        min_age:     Number(form.min_age),
        rules: form.rules ? form.rules.split('\n').filter(r => r.trim()) : [],
      }
      if (game?.id) await api.put(`/boardgames/${game.id}`, payload)
      else          await api.post('/boardgames', payload)
      onSaved()
    } catch(e) {
      setError(e.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const F = ({ label, children }) => (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '4px' }}>{label}</label>
      {children}
    </div>
  )

  return (
    <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: '1rem' }}>{game ? 'แก้ไขเกม' : 'เพิ่มเกมใหม่'}</h3>
      {error && <p style={{ color: '#dc2626', background: '#fee2e2', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <F label="ชื่อเกม *"><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputSt} /></F>
        <F label="หมวดหมู่ *">
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inputSt}>
            <option value="strategy">กลยุทธ์</option>
            <option value="party">ปาร์ตี้</option>
            <option value="coop">ร่วมมือ</option>
          </select>
        </F>
        <F label="ผู้เล่นสูงสุด"><input type="number" value={form.max_players} onChange={e => setForm({...form, max_players: e.target.value})} style={inputSt} /></F>
        <F label="ผู้เล่นขั้นต่ำ"><input type="number" value={form.min_players} onChange={e => setForm({...form, min_players: e.target.value})} style={inputSt} /></F>
        <F label="เวลาเล่น (นาที)"><input type="number" value={form.play_time} onChange={e => setForm({...form, play_time: e.target.value})} style={inputSt} /></F>
        <F label="อายุขั้นต่ำ"><input type="number" value={form.min_age} onChange={e => setForm({...form, min_age: e.target.value})} style={inputSt} /></F>
      </div>
      <F label="URL รูปภาพ (BoardGameGeek)"><input value={form.image} onChange={e => setForm({...form, image: e.target.value})} style={inputSt} placeholder="https://cf.geekdo-images.com/..." /></F>
      <F label="คำอธิบาย"><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ ...inputSt, height: '70px', resize: 'vertical' }} /></F>
      <F label="กติกา (1 บรรทัด = 1 กติกา)"><textarea value={form.rules} onChange={e => setForm({...form, rules: e.target.value})} style={{ ...inputSt, height: '90px', resize: 'vertical' }} placeholder="ผู้เล่น 3-4 คนต่อโต๊ะ&#10;ต้องรวม 10 คะแนนชนะ" /></F>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ padding: '9px 18px', background: '#eee', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>ยกเลิก</button>
        <button onClick={save} disabled={loading} style={{ padding: '9px 18px', background: '#3C3489', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
          {loading ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </div>
  )
}

// ===== Tab: ผู้ใช้ =====
function UsersTab() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/users')
      .then(r => setUsers(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {loading ? <p style={{ color: '#888' }}>กำลังโหลด...</p> : (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8f8f8', borderBottom: '1px solid #eee' }}>
                {['#', 'ชื่อ', 'อีเมล', 'Role', 'สมัครเมื่อ'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: '13px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>ไม่พบผู้ใช้</td></tr>
              ) : users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={td}>{u.id}</td>
                  <td style={td}><p style={{ fontWeight: 500, margin: 0 }}>{u.name}</p></td>
                  <td style={td}>{u.email}</td>
                  <td style={td}>
                    <span style={{ fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px',
                      background: u.role === 'admin' ? '#f0eeff' : '#f5f5f5',
                      color:      u.role === 'admin' ? '#3C3489' : '#666' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ ...td, color: '#999', fontSize: '13px' }}>{u.created_at?.slice(0, 10) || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const navBtn  = { padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }
const inputSt = { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }
const td      = { padding: '10px 14px', verticalAlign: 'middle' }
