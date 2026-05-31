import { useState, useEffect } from 'react'
import LeaveReview from './LeaveReview'
import { supabase } from '../lib/supabase'

export default function Calendar({ session, profile, onReview, onSetAvailability, onReschedule }) {
  const [view, setView] = useState('upcoming')
  const [bookings, setBookings] = useState([])
  const [groupSessions, setGroupSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const isTrainer = profile?.role === 'trainer'

  useEffect(() => { fetchBookings(); fetchGroupSessions() }, [])

  async function fetchGroupSessions() {
    if (isTrainer) {
      const { data } = await supabase
        .from('group_sessions')
        .select('*')
        .eq('trainer_id', session.user.id)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', {ascending:true})
      if (data) setGroupSessions(data)
    } else {
      const { data: joined } = await supabase
        .from('group_session_athletes')
        .select('session_id')
        .eq('athlete_id', session.user.id)
      if (joined && joined.length > 0) {
        const ids = joined.map(j => j.session_id)
        const { data } = await supabase
          .from('group_sessions')
          .select('*, trainer:profiles!group_sessions_trainer_id_fkey(id,full_name,sport)')
          .in('id', ids)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', {ascending:true})
        if (data) setGroupSessions(data)
      }
    }
  }

  async function fetchBookings() {
    setLoading(true)
    const query = isTrainer
      ? supabase.from('bookings').select('*, athlete:profiles!bookings_athlete_id_fkey(id,full_name,sport,position)').eq('trainer_id', session.user.id)
      : supabase.from('bookings').select('*, trainer:profiles!bookings_trainer_id_fkey(id,full_name,sport,position)').eq('athlete_id', session.user.id)
    const { data } = await query.order('date', { ascending: true })
    if (data) setBookings(data)
    setLoading(false)
  }

  async function updateBooking(booking, status) {
    await supabase.from('bookings').update({ status }).eq('id', booking.id)

    if (isTrainer) {
      const recipientId = booking.athlete_id
      const trainerName = profile?.full_name
      const date = new Date(booking.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})
      if (status === 'confirmed') {
        await supabase.from('notifications').insert({
          user_id: recipientId,
          title: 'Session Confirmed',
          body: `${trainerName} accepted your booking for ${date} at ${booking.time}. You're locked in!`
        })
      } else if (status === 'declined') {
        await supabase.from('notifications').insert({
          user_id: recipientId,
          title: 'Session Declined',
          body: `${trainerName} was unable to accept your booking for ${date}. Try booking a different time.`
        })
      }
    } else {
      const recipientId = booking.trainer_id
      const date = new Date(booking.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})
      await supabase.from('notifications').insert({
        user_id: recipientId,
        title: 'Booking Cancelled',
        body: `An athlete cancelled their session for ${date} at ${booking.time}.`
      })
    }
    fetchBookings()
  }

  const pending = bookings.filter(b => b.status === 'pending')
  const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.date) >= new Date())
  const past = bookings.filter(b => new Date(b.date) < new Date() || b.status === 'declined')

  function BookingCard({ booking }) {
    const other = isTrainer ? booking.athlete : booking.trainer
    const statusColor = booking.status === 'confirmed' ? '#22c55e' : booking.status === 'declined' ? '#E3291A' : '#f59e0b'
    const statusLabel = booking.status === 'confirmed' ? 'Confirmed' : booking.status === 'declined' ? 'Declined' : 'Pending'

    return (
      <div style={{background:'white',borderRadius:'16px',border:'1.5px solid #EBEBEB',overflow:'hidden',marginBottom:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
        <div style={{background:'#1A1A1A',padding:'16px 18px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:'-30px',right:'-30px',width:'120px',height:'120px',background:'radial-gradient(circle,rgba(227,41,26,0.35) 0%,transparent 65%)'}} />
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative'}}>
            <div>
              <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'white',letterSpacing:'0.5px',lineHeight:1,marginBottom:'3px'}}>
                {other?.full_name?.toUpperCase()}
              </div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.5)'}}>{other?.sport} · {other?.position}</div>
            </div>
            <div style={{background:statusColor,borderRadius:'100px',padding:'4px 10px',fontSize:'9px',fontWeight:'700',color:'white',letterSpacing:'0.5px',textTransform:'uppercase'}}>
              {statusLabel}
            </div>
          </div>
        </div>
        <div style={{padding:'14px 18px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
          {[
            {label:'Date',value:new Date(booking.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})},
            {label:'Time',value:booking.time},
            {label:'Duration',value:`${booking.duration} min`},
            {label:'Total',value:`$${booking.total_price}`},
          ].map((item,i) => (
            <div key={i} style={{background:'#F7F7F5',borderRadius:'8px',padding:'10px 12px'}}>
              <div style={{fontSize:'9px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.5px',color:'#8A8A8A',marginBottom:'3px'}}>{item.label}</div>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A'}}>{item.value}</div>
            </div>
          ))}
        </div>
        {booking.note && (
          <div style={{padding:'0 18px 12px'}}>
            <div style={{fontSize:'9px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.5px',color:'#8A8A8A',marginBottom:'4px'}}>Note</div>
            <div style={{fontSize:'12px',color:'#1A1A1A'}}>{booking.note}</div>
          </div>
        )}
        {isTrainer && booking.status === 'pending' && (
          <div style={{padding:'0 18px 16px',display:'flex',gap:'8px'}}>
            <button onClick={() => updateBooking(booking,'confirmed')} style={{flex:1,background:'#22c55e',color:'white',border:'none',borderRadius:'10px',padding:'12px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',letterSpacing:'0.5px',cursor:'pointer'}}>Accept</button>
            <button onClick={() => updateBooking(booking,'declined')} style={{flex:1,background:'#F7F7F5',color:'#E3291A',border:'1.5px solid #E3291A',borderRadius:'10px',padding:'12px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',letterSpacing:'0.5px',cursor:'pointer'}}>Decline</button>
          </div>
        )}
        {!isTrainer && booking.status === 'pending' && (
          <div style={{padding:'0 18px 16px',display:'flex',gap:'8px'}}>
            <button onClick={() => onReschedule && onReschedule(booking)} style={{flex:1,background:'#1A1A1A',color:'white',border:'none',borderRadius:'10px',padding:'12px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',letterSpacing:'0.5px',cursor:'pointer'}}>Reschedule</button>
            <button onClick={() => updateBooking(booking,'declined')} style={{flex:1,background:'#F7F7F5',color:'#E3291A',border:'1.5px solid #E3291A',borderRadius:'10px',padding:'12px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',letterSpacing:'0.5px',cursor:'pointer'}}>Cancel</button>
          </div>
        )}
        {!isTrainer && booking.status === 'confirmed' && new Date(booking.date) >= new Date() && (
          <div style={{padding:'0 18px 16px',display:'flex',gap:'8px'}}>
            <button onClick={() => onReschedule && onReschedule(booking)} style={{flex:1,background:'#1A1A1A',color:'white',border:'none',borderRadius:'10px',padding:'12px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',letterSpacing:'0.5px',cursor:'pointer'}}>Reschedule</button>
            <button onClick={() => updateBooking(booking,'declined')} style={{flex:1,background:'#F7F7F5',color:'#E3291A',border:'1.5px solid #E3291A',borderRadius:'10px',padding:'12px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',letterSpacing:'0.5px',cursor:'pointer'}}>Cancel</button>
          </div>
        )}
        {!isTrainer && booking.status === 'confirmed' && new Date(booking.date) < new Date() && (
          <div style={{padding:'0 18px 16px'}}>
            <button onClick={() => onReview && onReview(booking)} style={{width:'100%',background:'#1A1A1A',color:'white',border:'none',borderRadius:'10px',padding:'12px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',letterSpacing:'0.5px',cursor:'pointer'}}>Leave a Review</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'16px 20px 12px',background:'white',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'26px',color:'#1A1A1A',letterSpacing:'1px'}}>Calendar</div>
          {isTrainer && <button onClick={onSetAvailability} style={{background:'#1A1A1A',color:'white',border:'none',borderRadius:'100px',padding:'7px 14px',fontSize:'11px',fontWeight:'700',cursor:'pointer'}}>Set Availability</button>}
        </div>
        <div style={{display:'flex',background:'#F7F7F5',borderRadius:'10px',padding:'3px',gap:'3px'}}>
          {['upcoming','pending','past'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',background:view===v?'white':'transparent',color:view===v?'#1A1A1A':'#8A8A8A',fontWeight:'700',fontSize:'11px',cursor:'pointer',textTransform:'capitalize',boxShadow:view===v?'0 1px 4px rgba(0,0,0,0.08)':'none'}}>
              {v.charAt(0).toUpperCase()+v.slice(1)}
              {v === 'pending' && pending.length > 0 && <span style={{background:'#E3291A',color:'white',fontSize:'9px',fontWeight:'700',borderRadius:'100px',padding:'1px 5px',marginLeft:'4px'}}>{pending.length}</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:'16px 18px 80px'}}>
        {view === 'upcoming' && groupSessions.length > 0 && (
          <div style={{marginBottom:'16px'}}>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'10px'}}>{isTrainer ? 'My Group Sessions' : 'Group Sessions'}</div>
            {groupSessions.map(gs => (
              <div key={gs.id} style={{background:'white',borderRadius:'14px',border:'1.5px solid rgba(227,41,26,0.2)',overflow:'hidden',marginBottom:'10px'}}>
                <div style={{background:'#1A1A1A',padding:'12px 16px',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:'-20px',right:'-20px',width:'100px',height:'100px',background:'radial-gradient(circle,rgba(227,41,26,0.3) 0%,transparent 65%)'}} />
                  <div style={{position:'relative'}}>
                    <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'white',letterSpacing:'0.5px'}}>{gs.title.toUpperCase()}</div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)'}}>with {gs.trainer?.full_name}</div>
                  </div>
                </div>
                <div style={{padding:'12px 16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                  {[
                    {label:'Date',value:new Date(gs.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})},
                    {label:'Time',value:gs.time},
                    {label:'Duration',value:`${gs.duration} min`},
                    {label:isTrainer?'Athletes':'Spots',value:`${gs.current_athletes}/${gs.max_athletes}`},
                  ].map((item,i) => (
                    <div key={i} style={{background:'#F7F7F5',borderRadius:'8px',padding:'8px 10px'}}>
                      <div style={{fontSize:'9px',fontWeight:'700',textTransform:'uppercase',color:'#8A8A8A',marginBottom:'2px'}}>{item.label}</div>
                      <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A'}}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'#8A8A8A'}}>Loading...</div>
        ) : view === 'pending' ? (
          pending.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 20px'}}>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>No pending requests</div>
              <div style={{fontSize:'12px',color:'#8A8A8A'}}>New booking requests will appear here</div>
            </div>
          ) : pending.map(b => <BookingCard key={b.id} booking={b} />)
        ) : view === 'upcoming' ? (
          upcoming.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 20px'}}>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>No upcoming sessions</div>
              <div style={{fontSize:'12px',color:'#8A8A8A'}}>{isTrainer ? 'Accept pending requests to see them here' : 'Find a coach and book your first session'}</div>
            </div>
          ) : upcoming.map(b => <BookingCard key={b.id} booking={b} />)
        ) : (
          past.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 20px'}}>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>No past sessions</div>
              <div style={{fontSize:'12px',color:'#8A8A8A'}}>Completed sessions will appear here</div>
            </div>
          ) : past.map(b => <BookingCard key={b.id} booking={b} />)
        )}
      </div>
    </div>
  )
}
