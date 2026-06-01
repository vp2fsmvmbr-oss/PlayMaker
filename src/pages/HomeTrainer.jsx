import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function HomeTrainer({ profile, session, onNavigate, onCreateGroup, onViewAthlete }) {
  const [bookings, setBookings] = useState([])
  const [pending, setPending] = useState([])
  const [messages, setMessages] = useState([])
  const [groupSessions, setGroupSessions] = useState([])
  const [gsAthletes, setGsAthletes] = useState({})
  const [cancellingGs, setCancellingGs] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function cancelGroupSession(gs) {
    setCancellingGs(gs.id)
    console.log('cancelling session', gs.id)

    // Get all athletes who joined
    const { data: athletes } = await supabase
      .from('group_session_athletes')
      .select('athlete_id')
      .eq('session_id', gs.id)

    // Notify each athlete
    if (athletes && athletes.length > 0) {
      const notifications = athletes.map(a => ({
        user_id: a.athlete_id,
        title: 'Group Session Cancelled',
        body: `"${gs.title}" on ${new Date(gs.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} has been cancelled by the coach.`
      }))
      await supabase.from('notifications').insert(notifications)
    }

    // Cancel the session
    const { error } = await supabase.from('group_sessions').update({ status: 'cancelled' }).eq('id', gs.id)
    console.log('cancel result:', error)
    setCancellingGs(null)
    console.log('refreshing data')
    await fetchData()
  }

  async function fetchData() {
    const gsRes = await supabase.from('group_sessions').select('*').eq('trainer_id', session.user.id).neq('status', 'cancelled').gte('date', new Date().toISOString().split('T')[0]).order('date', {ascending:true})
    if (gsRes.data) {
      setGroupSessions(gsRes.data)
      for (const gs of gsRes.data) {
        const { data: athletes } = await supabase
          .from('group_session_athletes')
          .select('*, athlete:profiles!group_session_athletes_athlete_id_fkey(id,full_name)')
          .eq('session_id', gs.id)
        if (athletes) setGsAthletes(prev => ({...prev, [gs.id]: athletes}))
      }
    }
    const [bookingsRes, pendingRes, messagesRes] = await Promise.all([
      supabase.from('bookings').select('*, athlete:profiles!bookings_athlete_id_fkey(id,full_name,sport,position)').eq('trainer_id', session.user.id).eq('status', 'confirmed').gte('date', new Date().toISOString().split('T')[0]).order('date', {ascending:true}).limit(3),
      supabase.from('bookings').select('*, athlete:profiles!bookings_athlete_id_fkey(id,full_name,sport,position)').eq('trainer_id', session.user.id).eq('status', 'pending').order('created_at', {ascending:false}),
      supabase.from('messages').select('*, sender:profiles!messages_sender_id_fkey(id,full_name,role)').eq('receiver_id', session.user.id).order('created_at', {ascending:false}).limit(5)
    ])
    if (bookingsRes.data) setBookings(bookingsRes.data)
    if (pendingRes.data) setPending(pendingRes.data)
    if (messagesRes.data) {
      const seen = new Set()
      const convos = []
      messagesRes.data.forEach(msg => {
        if (!seen.has(msg.sender_id)) { seen.add(msg.sender_id); convos.push(msg) }
      })
      setMessages(convos)
    }
    setLoading(false)
  }

  async function handleBooking(id, status) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    fetchData()
  }

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'16px 20px 14px',background:'white',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{fontSize:'11px',color:'#8A8A8A',fontWeight:'500',marginBottom:'2px'}}>
          {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
        </div>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'28px',color:'#1A1A1A',lineHeight:1.1,marginBottom:'4px',letterSpacing:'0.5px'}}>
          READY TO COACH,<br/><span style={{color:'#E3291A'}}>{profile?.full_name?.split(' ')[0]?.toUpperCase() || 'COACH'}.</span>
        </div>
        <div style={{fontSize:'12px',color:'#8A8A8A'}}>{profile?.position} · {profile?.location}</div>
      </div>

      <div style={{padding:'18px 20px 0'}}>

        <div style={{background:'#1A1A1A',borderRadius:'16px',padding:'18px',marginBottom:'20px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:'-40px',right:'-40px',width:'180px',height:'180px',background:'radial-gradient(circle,rgba(227,41,26,0.35) 0%,transparent 65%)'}} />
          <div style={{position:'relative',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}}>
            {[
              {label:'Upcoming',value:bookings.length},
              {label:'Pending',value:pending.length},
              {label:'Rating',value:profile?.trainers?.rating||'5.0'},
            ].map((s,i) => (
              <div key={i} style={{textAlign:'center'}}>
                <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'32px',color:i===1&&pending.length>0?'#f59e0b':'#E3291A',lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px',marginTop:'3px'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {pending.length > 0 && (
          <div style={{marginBottom:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
              <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'#1A1A1A',letterSpacing:'0.3px'}}>BOOKING REQUESTS</div>
              <div style={{background:'#f59e0b',color:'white',fontSize:'10px',fontWeight:'700',padding:'2px 8px',borderRadius:'100px'}}>{pending.length} new</div>
            </div>
            {pending.map(booking => (
              <div key={booking.id} style={{background:'white',borderRadius:'14px',border:'1.5px solid #f59e0b',padding:'14px',marginBottom:'10px',boxShadow:'0 2px 12px rgba(245,158,11,0.1)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'#1A1A1A',letterSpacing:'0.5px'}}>{booking.athlete?.full_name?.toUpperCase()}</div>
                    <div style={{fontSize:'11px',color:'#8A8A8A'}}>{booking.athlete?.sport} · {booking.athlete?.position}</div>
                  </div>
                  <div style={{background:'rgba(245,158,11,0.1)',color:'#f59e0b',fontSize:'9px',fontWeight:'700',padding:'4px 8px',borderRadius:'100px',border:'1px solid rgba(245,158,11,0.2)'}}>Pending</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginBottom:'12px'}}>
                  {[
                    {label:'Date',value:new Date(booking.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})},
                    {label:'Time',value:booking.time},
                    {label:'Duration',value:`${booking.duration} min`},
                    {label:'Total',value:`$${booking.total_price}`},
                  ].map((item,i) => (
                    <div key={i} style={{background:'#F7F7F5',borderRadius:'8px',padding:'8px 10px'}}>
                      <div style={{fontSize:'9px',fontWeight:'700',textTransform:'uppercase',color:'#8A8A8A',marginBottom:'2px'}}>{item.label}</div>
                      <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A'}}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {booking.note && (
                  <div style={{fontSize:'12px',color:'#8A8A8A',marginBottom:'10px',fontStyle:'italic'}}>"{booking.note}"</div>
                )}
                <div style={{display:'flex',gap:'8px'}}>
                  <button onClick={() => handleBooking(booking.id,'confirmed')} style={{flex:1,background:'#22c55e',color:'white',border:'none',borderRadius:'10px',padding:'11px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',letterSpacing:'0.5px',cursor:'pointer'}}>Accept</button>
                  <button onClick={() => handleBooking(booking.id,'declined')} style={{flex:1,background:'#F7F7F5',color:'#E3291A',border:'1.5px solid #E3291A',borderRadius:'10px',padding:'11px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',letterSpacing:'0.5px',cursor:'pointer'}}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{marginBottom:'20px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
            <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'#1A1A1A',letterSpacing:'0.3px'}}>UPCOMING SESSIONS</div>
            <div onClick={() => onNavigate('calendar')} style={{fontSize:'12px',fontWeight:'700',color:'#E3291A',cursor:'pointer'}}>See all</div>
          </div>
          {loading ? (
            <div style={{textAlign:'center',padding:'20px',color:'#8A8A8A',fontSize:'13px'}}>Loading...</div>
          ) : bookings.length === 0 ? (
            <div style={{background:'white',borderRadius:'14px',padding:'20px',border:'1.5px solid #EBEBEB',textAlign:'center'}}>
              <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>No upcoming sessions</div>
              <div style={{fontSize:'12px',color:'#8A8A8A'}}>Accept pending requests to see them here</div>
            </div>
          ) : bookings.map(booking => (
            <div key={booking.id} style={{background:'white',borderRadius:'14px',padding:'14px',border:'1.5px solid #EBEBEB',display:'flex',gap:'12px',alignItems:'center',marginBottom:'8px'}}>
              <div style={{background:'rgba(227,41,26,0.08)',borderRadius:'10px',padding:'8px 10px',textAlign:'center',minWidth:'50px'}}>
                <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'22px',color:'#E3291A',lineHeight:1}}>{new Date(booking.date).getDate()}</div>
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
            <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'#1A1A1A',letterSpacing:'0.3px'}}>RECENT MESSAGES</div>
            <div onClick={() => onNavigate('messages')} style={{fontSize:'12px',fontWeight:'700',color:'#E3291A',cursor:'pointer'}}>See all</div>
          </div>
          {messages.length === 0 ? (
            <div style={{background:'white',borderRadius:'14px',padding:'20px',border:'1.5px solid #EBEBEB',textAlign:'center'}}>
              <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>No messages yet</div>
              <div style={{fontSize:'12px',color:'#8A8A8A'}}>Athletes will reach out through your profile</div>
            </div>
          ) : messages.map((msg,i) => (
            <div key={i} onClick={() => onNavigate('messages')} style={{background:'white',borderRadius:'14px',padding:'14px',border:'1.5px solid #EBEBEB',display:'flex',gap:'12px',alignItems:'center',marginBottom:'8px',cursor:'pointer'}}>
              <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'linear-gradient(135deg,#1a4a8a,#0a2d5e)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'white',flexShrink:0}}>
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
          <button onClick={() => onNavigate('profile')} style={{width:'100%',background:'#1A1A1A',color:'white',border:'none',borderRadius:'14px',padding:'16px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer'}}>
            Edit My Coach Profile
          </button>
          <button onClick={onCreateGroup} style={{width:'100%',background:'rgba(227,41,26,0.08)',color:'#E3291A',border:'1.5px solid rgba(227,41,26,0.2)',borderRadius:'14px',padding:'16px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer',marginTop:'8px'}}>
            + Create Group Session
          </button>
        </div>

        {groupSessions.length > 0 && (
          <div style={{marginBottom:'20px',paddingLeft:'20px',paddingRight:'20px'}}>
            <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'#1A1A1A',letterSpacing:'0.3px',marginBottom:'12px'}}>MY GROUP SESSIONS</div>
            {groupSessions.map(gs => (
              <div key={gs.id} style={{background:'white',borderRadius:'14px',border:'1.5px solid #EBEBEB',padding:'14px',marginBottom:'8px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'#1A1A1A',letterSpacing:'0.5px'}}>{gs.title}</div>
                    <div style={{fontSize:'11px',color:'#8A8A8A'}}>{new Date(gs.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} · {gs.time}</div>
                  </div>
                  <div style={{background:gs.current_athletes>=gs.max_athletes?'rgba(227,41,26,0.08)':'rgba(34,197,94,0.1)',color:gs.current_athletes>=gs.max_athletes?'#E3291A':'#22c55e',fontSize:'10px',fontWeight:'700',padding:'4px 8px',borderRadius:'100px'}}>
                    {gs.current_athletes}/{gs.max_athletes} athletes
                  </div>
                </div>
                <div style={{background:'#EBEBEB',borderRadius:'100px',height:'4px',overflow:'hidden',marginBottom:'8px'}}>
                  <div style={{background:'#E3291A',height:'100%',width:`${(gs.current_athletes/gs.max_athletes)*100}%`,borderRadius:'100px'}} />
                </div>
                {gsAthletes[gs.id]?.length > 0 && (
                  <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
                    {gsAthletes[gs.id].map(a => (
                      <div key={a.id} onClick={() => onViewAthlete && onViewAthlete(a.athlete)} style={{background:'rgba(227,41,26,0.08)',color:'#E3291A',fontSize:'10px',fontWeight:'600',padding:'3px 8px',borderRadius:'100px',border:'1px solid rgba(227,41,26,0.15)',cursor:'pointer'}}>
                        {a.athlete?.full_name?.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => cancelGroupSession(gs)}
                  disabled={cancellingGs === gs.id}
                  style={{width:'100%',background:'#F7F7F5',color:'#E3291A',border:'1.5px solid #E3291A',borderRadius:'8px',padding:'8px',fontSize:'12px',fontWeight:'700',cursor:'pointer',marginTop:'8px'}}
                >
                  {cancellingGs === gs.id ? 'Cancelling...' : 'Cancel Session'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
