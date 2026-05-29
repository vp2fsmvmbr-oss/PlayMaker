import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const TIME_SLOTS = [
  '7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'
]

export default function Calendar({ session }) {
  const [view, setView] = useState('upcoming')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .select('*, trainer:profiles!bookings_trainer_id_fkey(id,full_name,sport,position), athlete:profiles!bookings_athlete_id_fkey(id,full_name)')
      .or(`athlete_id.eq.${session.user.id},trainer_id.eq.${session.user.id}`)
      .order('date', { ascending: true })
    if (!error) setBookings(data || [])
    setLoading(false)
  }

  const upcoming = bookings.filter(b => new Date(b.date) >= new Date())
  const past = bookings.filter(b => new Date(b.date) < new Date())

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'16px 20px 12px',background:'white',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{fontFamily:'serif',fontSize:'24px',fontWeight:'900',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'12px'}}>Calendar</div>
        <div style={{display:'flex',background:'#F7F7F5',borderRadius:'10px',padding:'3px'}}>
          {['upcoming','past'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',background:view===v?'white':'transparent',color:view===v?'#1A1A1A':'#8A8A8A',fontWeight:'700',fontSize:'12px',cursor:'pointer',textTransform:'capitalize',boxShadow:view===v?'0 1px 4px rgba(0,0,0,0.08)':'none'}}>
              {v === 'upcoming' ? 'Upcoming' : 'Past'}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:'16px 18px 80px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'#8A8A8A'}}>Loading...</div>
        ) : (view === 'upcoming' ? upcoming : past).length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'8px'}}>
              {view === 'upcoming' ? 'No upcoming sessions' : 'No past sessions'}
            </div>
            <div style={{fontSize:'12px',color:'#8A8A8A'}}>
              {view === 'upcoming' ? 'Find a coach and book your first session' : 'Your completed sessions will appear here'}
            </div>
          </div>
        ) : (view === 'upcoming' ? upcoming : past).map(booking => (
          <div key={booking.id} style={{background:'white',borderRadius:'16px',border:'1.5px solid #EBEBEB',overflow:'hidden',marginBottom:'12px'}}>
            <div style={{background:'#1A1A1A',padding:'16px 18px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:'-30px',right:'-30px',width:'120px',height:'120px',background:'radial-gradient(circle,rgba(227,41,26,0.35) 0%,transparent 65%)'}} />
              <div style={{fontSize:'10px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',color:'rgba(255,255,255,0.4)',marginBottom:'4px',position:'relative'}}>
                {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
              </div>
              <div style={{fontFamily:'serif',fontSize:'20px',color:'white',fontWeight:'900',letterSpacing:'0.5px',position:'relative'}}>
                {booking.trainer?.full_name}
              </div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.5)',position:'relative'}}>
                {booking.trainer?.sport} · {booking.trainer?.position}
              </div>
            </div>
            <div style={{padding:'14px 18px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
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
              <div style={{padding:'0 18px 14px'}}>
                <div style={{fontSize:'9px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.5px',color:'#8A8A8A',marginBottom:'4px'}}>Note</div>
                <div style={{fontSize:'12px',color:'#1A1A1A'}}>{booking.note}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
