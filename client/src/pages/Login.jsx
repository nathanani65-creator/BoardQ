// client/src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

export default function Login() {
  const [form, setForm]   = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user',  JSON.stringify(res.data.user))
      navigate(res.data.user.role === 'admin' ? '/admin' : '/games')
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.logo}>🎲 BoardQueue</h1>
        <h2 style={styles.title}>เข้าสู่ระบบ</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="email"    placeholder="อีเมล"    value={form.email}    onChange={e => setForm({...form, email: e.target.value})}    required />
          <input style={styles.input} type="password" placeholder="รหัสผ่าน" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        <p style={styles.link}>ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link></p>
      </div>
    </div>
  )
}

const styles = {
  wrapper: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f5' },
  card:    { background:'#fff', padding:'2.5rem 2rem', borderRadius:'16px', width:'100%', maxWidth:'400px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)' },
  logo:    { textAlign:'center', fontSize:'1.8rem', marginBottom:'0.5rem' },
  title:   { textAlign:'center', fontSize:'1.2rem', fontWeight:600, color:'#1a1a2e', marginBottom:'1.5rem' },
  input:   { display:'block', width:'100%', padding:'10px 14px', margin:'0 0 12px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'15px', boxSizing:'border-box' },
  btn:     { width:'100%', padding:'12px', background:'#3C3489', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:600, cursor:'pointer', marginTop:'4px' },
  error:   { color:'#dc2626', background:'#fee2e2', padding:'8px 12px', borderRadius:'6px', marginBottom:'12px', fontSize:'14px' },
  link:    { textAlign:'center', marginTop:'1rem', fontSize:'14px', color:'#666' },
}
