import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function HomeTrainer({ profile, session, onNavigate }) {
  const [bookings, setBookings] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const [bookingsRes, messagesRes] = await Promise.all([
      supabase.from('bookings').select('*, athlete:profiles!bookings_athlete_id_fkey(id,full_name)').eq('trainer_id', session.user.id).gte('date', new Date().toISOString().split('T')[0]).order('date', {ascending:true}).limit(3),
      supabase.from('messages').select('*, sender:profiles!messages_sender_id_fkey(id,full_name,role)').eq('receiver_id', session.user.id).order('created_at', {ascending:false}).limit(5)
    ])
    if (bookingsRes.data) setBookings(bookingsRes.data)
    if (messagesRes.data) {
      const seen = new Set()
      const convos = []
      messagesRes.data.forEach(msg => {
        if (!seen.has(msg.sender_id)) {
          seen.add(msg.sender_id)
          convos.push(msg)
        }
      })
      setMessages(convos)
    }
    setLoading(false)
  }

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'16px 20px 14px',background:'white',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{fontSize:'11px',color:'#8A8A8A',fontWeight:'500',marginBottom:'2px'}}>
          {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
        </div>
        <div style={{fontFamily:'serif',fontSize:'26px',fontWeight:'900',color:'#1A1A1A',lineHeight:1.1,marginBottom:'4px'}}>
          READY TO<br/><span style={{color:'#E3291A'}}>COACH,</span> {profile?.full_name?.split(' ')[0]?.toUpperCase() || 'COACH'}.
        </div>
        <div style={{fontSize:'12px',color:'#8A8A8A'}}>{profile?.position} · {profile?.location}</div>
      </div>

      <div style={{padding:'18px 20px 0'}}>

        <div style={{background:'#1A1A1A',borderRadius:'16px',padding:'18px',marginBottom:'20px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:'-40px',right:'-40px',width:'180px',height:'180px',background:'radial-gradient(circle,rgba(227,41,26,0.35) 0%,transparent 65%)'}} />
          <div style={{position:'relative',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
            {[
              {label:'Upcoming',value:bookings.length},
              {label:'Rating',value:profile?.trainers?.rating || '5.0'},
              {label:'Athletes',value:profile?.trainers?.athletes_trained || '0'},
            ].map((s,i) => (
              <div key={i} style={{textAlign:'center'}}>
                <div style={{fontFamily:'serif',fontSize:'28px',color:'#E3291A',fontWeight:'900',lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px',marginTop:'3px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{marginBottom:'20px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
            <div style={{fontFamily:'serif',fontSize:'18px',fontWeight:'900',color:'#1A1A1A',letterSpacing:'0.3px'}}>UPCOMING SESSIONS</div>
            <div onClick={() => onNavigate('calendar')} style={{fontSize:'12px',fontWeight:'700',color:'#E3291A',cursor:'pointer'}}>See all</div>
          </div>
          {loading ? (
            <div style={{textAlign:'center',padding:'20px',color:'#8A8A8A',fontSize:'13px'}}>Loading...</div>
          ) : bookings.length === 0 ? (
            <div style={{background:'white',borderRadius:'14px',padding:'20px',border:'1.5px solid #EBEBEB',textAlign:'center'}}>
              <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>No upcoming sessions</div>
              <div style={{fontSize:'12px',color:'#8A8A8A'}}>Athletes will book sessions through your profile</div>
            </div>
          ) : bookings.map(booking => (
            <div key={booking.id} style={{background:'white',borderRadius:'14px',padding:'14px',border:'1.5px solid #EBEBEB',display:'flex',gap:'12px',alignItems:'center',marginBottom:'8px'}}>
              <div style={{background:'rgba(227,41,26,0.08)',borderRadius:'10px',padding:'8px 10px',textAlign:'center',minWidth:'50px'}}>
                <div style={{fontFamily:'serif',fontSize:'20px',color:'#E3291A',fontWeight:'900',lineHeight:1}}>{new Date(booking.date).getDate()}</div>
                <div style={{fontSize:'9px',color:'#E3291A',fontWeight:'700',textTransform:'uppercase'}}>{new Date(booking.date).toLocaleDateString('en-US',{month:'short'})}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'2px'}}>{booking.athlete?.full_name}</div>
                <div style={{fontSize:'11px',color:'#8A8A8A'}}>{booking.time} · {booking.duration} min · ${booking.total_price}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginBottom:'20px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
            <div style={{fontFamily:'serif',fontSize:'18px',fontWeight:'900',color:'#1A1A1A',letterSpacing:'0.3px'}}>RECENT MESSAGES</div>
            <div onClick={() => onNavigate('messages')} style={{fontSize:'12px',fontWeight:'700',color:'#E3291A',cursor:'pointer'}}>See all</div>
          </div>
          {messages.length === 0 ? (
            <div style={{background:'white',borderRadius:'14px',padding:'20px',border:'1.5px solid #EBEBEB',textAlign:'center'}}>
              <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>No messages yet</div>
              <div style={{fontSize:'12px',color:'#8A8A8A'}}>Athletes will reach out through your profile</div>
            </div>
          ) : messages.map((msg,i) => (
            <div key={i} onClick={() => onNavigate('messages')} style={{background:'white',borderRadius:'14px',padding:'14px',border:'1.5px solid #EBEBEB',display:'flex',gap:'12px',alignItems:'center',marginBottom:'8px',cursor:'pointer'}}>
              <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'linear-gradient(135deg,#1a4a8a,#0a2d5e)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'serif',fontSize:'16px',color:'white',fontWeight:'900',flexShrink:0}}>
                {msg.sender?.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'2px'}}>{msg.sender?.full_name}</div>
                <div style={{fontSize:'12px',color:'#8A8A8A',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{msg.content}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginBottom:'30px'}}>
          <button onClick={() => onNavigate('profile')} style={{width:'100%',background:'#1A1A1A',color:'white',border:'none',borderRadius:'14px',padding:'16px',fontFamily:'serif',fontSize:'18px',fontWeight:'900',letterSpacing:'1px',cursor:'pointer'}}>
            Edit My Coach Profile
          </button>
        </div>
      </div>
    </div>
  )
}
