import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Notifications({ session, onClose }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchNotifications() }, [])

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    if (data) setNotifications(data)
    setLoading(false)
  }

  async function markRead(id) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    fetchNotifications()
  }

  async function markAllRead() {
    await supabase.from('notifications').update({ read: true }).eq('user_id', session.user.id)
    fetchNotifications()
  }

  const unread = notifications.filter(n => !n.read).length

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'16px 20px 12px',background:'white',borderBottom:'1px solid #EBEBEB',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'26px',color:'#1A1A1A',letterSpacing:'1px'}}>Notifications</div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{background:'none',border:'none',fontSize:'12px',fontWeight:'700',color:'#E3291A',cursor:'pointer'}}>
            Mark all read
          </button>
        )}
      </div>
      <div style={{padding:'12px 16px 80px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'#8A8A8A'}}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>No notifications</div>
            <div style={{fontSize:'12px',color:'#8A8A8A'}}>You're all caught up</div>
          </div>
        ) : notifications.map(notif => (
          <div key={notif.id} onClick={() => markRead(notif.id)} style={{background:notif.read?'white':'rgba(227,41,26,0.04)',borderRadius:'14px',border:notif.read?'1.5px solid #EBEBEB':'1.5px solid rgba(227,41,26,0.15)',padding:'14px 16px',marginBottom:'8px',cursor:'pointer',position:'relative'}}>
            {!notif.read && <div style={{position:'absolute',top:'16px',right:'16px',width:'8px',height:'8px',background:'#E3291A',borderRadius:'50%'}} />}
            <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'4px',paddingRight:'16px'}}>{notif.title}</div>
            <div style={{fontSize:'12px',color:'#8A8A8A',lineHeight:1.5}}>{notif.body}</div>
            <div style={{fontSize:'10px',color:'#8A8A8A',marginTop:'6px'}}>{new Date(notif.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
