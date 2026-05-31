import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function RescheduleSession({ booking, session, onBack, onRescheduled }) {
  const [availableSlots, setAvailableSlots] = useState([])
  const [bookedSlots, setBookedSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)

  useEffect(() => { fetchAvailability() }, [])
  useEffect(() => { if (selectedDate) fetchBookedSlots() }, [selectedDate])

  async function fetchAvailability() {
    const { data } = await supabase.from('availability').select('*').eq('trainer_id', booking.trainer_id)
    if (data) setAvailableSlots(data)
  }

  async function fetchBookedSlots() {
    const dateStr = formatDate(selectedDate)
    const { data } = await supabase.from('bookings').select('time').eq('trainer_id', booking.trainer_id).eq('date', dateStr).neq('status', 'declined').neq('id', booking.id)
    if (data) setBookedSlots(data.map(b => b.time))
  }

  function formatDate(date) {
    if (!date) return ''
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
  }

  function getWeekDays() {
    const today = new Date()
    today.setHours(0,0,0,0)
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + weekOffset * 7 + i)
      days.push(d)
    }
    return days
  }

  function dayHasAvailability(day) {
    const dStr = formatDate(day)
    const dow = day.getDay()
    return availableSlots.some(s => s.specific_date === dStr || (!s.specific_date && s.day_of_week === dow))
  }

  const weekDays = getWeekDays()
  const today = new Date()
  today.setHours(0,0,0,0)

  const dayOfWeek = selectedDate ? selectedDate.getDay() : null
  const dateStr = selectedDate ? formatDate(selectedDate) : null
  const slotsForDay = selectedDate ? [
    ...availableSlots.filter(s => s.specific_date === dateStr).map(s => s.start_time),
    ...availableSlots.filter(s => !s.specific_date && s.day_of_week === dayOfWeek).map(s => s.start_time)
  ].filter((v,i,a) => a.indexOf(v) === i).sort() : []

  async function handleReschedule() {
    if (!selectedDate || !selectedTime) return
    setLoading(true)
    await supabase.from('bookings').update({
      date: formatDate(selectedDate),
      time: selectedTime,
      status: 'pending'
    }).eq('id', booking.id)

    await supabase.from('notifications').insert({
      user_id: booking.trainer_id,
      title: 'Session Rescheduled',
      body: `An athlete has requested to reschedule their session to ${selectedDate.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} at ${selectedTime}. Please review and accept or decline.`
    })

    setLoading(false)
    onRescheduled()
  }

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{background:'white',padding:'14px 18px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #EBEBEB'}}>
        <button onClick={onBack} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px'}}>Reschedule Session</div>
          <div style={{fontSize:'11px',color:'#8A8A8A'}}>Pick a new date and time</div>
        </div>
      </div>

      <div style={{background:'#1A1A1A',margin:'16px 18px',borderRadius:'14px',padding:'14px 16px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-30px',right:'-30px',width:'130px',height:'130px',background:'radial-gradient(circle,rgba(227,41,26,0.35) 0%,transparent 65%)'}} />
        <div style={{position:'relative'}}>
          <div style={{fontSize:'9px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1.5px',color:'rgba(255,255,255,0.35)',marginBottom:'4px'}}>Current Session</div>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'white',letterSpacing:'0.5px',marginBottom:'2px'}}>{booking.trainer?.full_name?.toUpperCase()}</div>
          <div style={{fontSize:'11px',color:'rgba(255,255,255,0.45)'}}>{new Date(booking.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} · {booking.time}</div>
        </div>
      </div>

      <div style={{padding:'0 18px',display:'flex',flexDirection:'column',gap:'20px'}}>
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px'}}>New Date</div>
            <div style={{display:'flex',gap:'6px'}}>
              <button onClick={() => { setWeekOffset(w => Math.max(0,w-1)); setSelectedDate(null); setSelectedTime('') }} disabled={weekOffset===0} style={{width:'28px',height:'28px',borderRadius:'50%',background:weekOffset===0?'#F7F7F5':'#1A1A1A',color:weekOffset===0?'#EBEBEB':'white',border:'none',cursor:weekOffset===0?'not-allowed':'pointer',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
              <button onClick={() => { setWeekOffset(w => w+1); setSelectedDate(null); setSelectedTime('') }} style={{width:'28px',height:'28px',borderRadius:'50%',background:'#1A1A1A',color:'white',border:'none',cursor:'pointer',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'6px'}}>
            {weekDays.map((day, i) => {
              const isPast = day < today
              const isSelected = selectedDate && formatDate(day) === formatDate(selectedDate)
              const hasAvailability = dayHasAvailability(day)
              return (
                <div key={i} onClick={() => { if (!isPast && hasAvailability) { setSelectedDate(day); setSelectedTime('') }}} style={{textAlign:'center',cursor:isPast||!hasAvailability?'not-allowed':'pointer'}}>
                  <div style={{fontSize:'10px',fontWeight:'700',color:'#8A8A8A',marginBottom:'4px'}}>{DAYS[day.getDay()]}</div>
                  <div style={{width:'36px',height:'36px',borderRadius:'10px',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:'600',background:isSelected?'#E3291A':isPast?'#F7F7F5':'white',color:isSelected?'white':isPast?'#EBEBEB':hasAvailability?'#1A1A1A':'#EBEBEB',border:isSelected?'none':hasAvailability&&!isPast?'1.5px solid #EBEBEB':'1.5px solid #F7F7F5'}}>
                    {day.getDate()}
                  </div>
                  {hasAvailability && !isPast && !isSelected && <div style={{width:'4px',height:'4px',background:'#22c55e',borderRadius:'50%',margin:'3px auto 0'}} />}
                </div>
              )
            })}
          </div>
        </div>

        {selectedDate && (
          <div>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>
              Available Times — {selectedDate.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}
            </div>
            {slotsForDay.length === 0 ? (
              <div style={{textAlign:'center',padding:'16px',background:'#F7F7F5',borderRadius:'10px',fontSize:'13px',color:'#8A8A8A'}}>No availability on this day</div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'6px'}}>
                {slotsForDay.map(time => {
                  const isBooked = bookedSlots.includes(time)
                  return (
                    <button key={time} onClick={() => !isBooked && setSelectedTime(time)} style={{padding:'10px 6px',borderRadius:'10px',border:selectedTime===time?'2px solid #E3291A':'1.5px solid #EBEBEB',background:selectedTime===time?'#E3291A':isBooked?'#F7F7F5':'white',color:selectedTime===time?'white':isBooked?'#EBEBEB':'#1A1A1A',fontSize:'12px',fontWeight:'600',cursor:isBooked?'not-allowed':'pointer'}}>
                      {time}
                      {isBooked && <div style={{fontSize:'8px',textTransform:'uppercase'}}>Booked</div>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleReschedule}
          disabled={!selectedDate||!selectedTime||loading}
          style={{background:!selectedDate||!selectedTime||loading?'rgba(227,41,26,0.4)':'#E3291A',color:'white',border:'none',borderRadius:'12px',padding:'15px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer',marginBottom:'20px'}}
        >
          {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
        </button>
      </div>
    </div>
  )
}
