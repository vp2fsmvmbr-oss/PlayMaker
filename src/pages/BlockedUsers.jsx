import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function BlockedUsers({ session, onClose }) {
  const [blocked, setBlocked] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBlocked() }, [])

  async function fetchBlocked() {
    setLoading(true)
    const { data } = await supabase
      .from('blocks')
      .select('*, blocked:profiles!blocks_blocked_id_fkey(id,full_name,role,sport,position)')
      .eq('blocker_id', session.user.id)
    if (data) setBlocked(data)
    setLoading(false)
  }

  async function unblock(blockedId) {
    await supabase.from('blocks').delete().eq('blocker_id', session.user.id).eq('blocked_id', blockedId)
    fetchBlocked()
  }

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'16px 20px 12px',background:'white',borderBottom:'1px solid #EBEBEB',display:'flex',alignItems:'center',gap:'12px'}}>
        <button onClick={onClose} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'22px',color:'#1A1A1A',letterSpacing:'0.5px'}}>Blocked Users</div>
      </div>
      <div style={{padding:'16px 18px 80px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'#8A8A8A'}}>Loading...</div>
        ) : blocked.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>No blocked users</div>
            <div style={{fontSize:'12px',color:'#8A8A8A'}}>Anyone you block will appear here</div>
          </div>
        ) : blocked.map(b => (
          <div key={b.id} style={{background:'white',borderRadius:'14px',border:'1.5px solid #EBEBEB',padding:'14px 16px',display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'}}>
            <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'linear-gradient(135deg,#1A1A1A,#444)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'white',flexShrink:0}}>
              {b.blocked?.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'2px'}}>{b.blocked?.full_name}</div>
              <div style={{fontSize:'11px',color:'#8A8A8A'}}>{b.blocked?.role} · {b.blocked?.sport}</div>
            </div>
            <button onClick={() => unblock(b.blocked_id)} style={{background:'rgba(34,197,94,0.1)',color:'#22c55e',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'100px',padding:'7px 14px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>
              Unblock
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
