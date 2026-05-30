import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DURATIONS = [{label:'60 min',value:60,multiplier:1},{label:'90 min',value:90,multiplier:1.5},{label:'120 min',value:120,multiplier:2}]
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function BookSession({ trainer, session, onBack, onBooked }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0])
  const [note, setNote] = useState('')
  const [step, setStep] = useState('select')
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [trainerInfo, setTrainerInfo] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [weekOffset, setWeekOffset] = useState(0)

  useEffect(() => { fetchAvailability() }, [])
  useEffect(() => { if (selectedDate) fetchBookedSlots() }, [selectedDate])

  async function fetchAvailability() {
    const [availData, trainerData] = await Promise.all([
      supabase.from('availability').select('*').eq('trainer_id', trainer.id),
      supabase.from('trainers').select('*').eq('id', trainer.id).single()
    ])
    if (availData.data) setAvailableSlots(availData.data)
    if (trainerData.data) setTrainerInfo(trainerData.data)
  }

  async function fetchBookedSlots() {
    const dateStr = formatDate(selectedDate)
    const { data } = await supabase.from('bookings').select('time').eq('trainer_id', trainer.id).eq('date', dateStr).neq('status', 'declined')
    if (data) setBookedSlots(data.map(b => b.time))
  }

  function formatDate(date) {
    if (!date) return ''
    const y = date.getFullYear()
    const m = String(date.getMonth()+1).padStart(2,'0')
    const d = String(date.getDate()).padStart(2,'0')
    return `${y}-${m}-${d}`
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
  const dayOfWeek = selectedDate ? selectedDate.getDay() : null
  const dateStr = selectedDate ? formatDate(selectedDate) : null
  const slotsForDay = selectedDate ? [
    ...availableSlots.filter(s => s.specific_date === dateStr).map(s => s.start_time),
    ...availableSlots.filter(s => !s.specific_date && s.day_of_week === dayOfWeek).map(s => s.start_time)
  ].filter((v,i,a) => a.indexOf(v) === i).sort() : []
  const pricePerHour = trainerInfo?.price_per_hour || trainer.trainers?.price_per_hour || 0
  const hasDiscount = trainerInfo?.first_session_discount || trainer.trainers?.first_session_discount || false
  const discountAmount = hasDiscount ? 10 : 0
  const total = Math.round(pricePerHour * selectedDuration.multiplier)

  const today = new Date()
  today.setHours(0,0,0,0)

  async function handleConfirm() {
    setLoading(true)
    const { error } = await supabase.from('bookings').insert({
      athlete_id: session.user.id,
      trainer_id: trainer.id,
      date: formatDate(selectedDate),
      time: selectedTime,
      duration: selectedDuration.value,
      total_price: total,
      note,
      status: 'pending'
    })
    setLoading(false)
    if (!error) onBooked()
  }

  if (step === 'confirm') {
    return (
      <div style={{flex:1,overflowY:'auto'}}>
        <div style={{background:'white',padding:'12px 18px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #EBEBEB'}}>
          <button onClick={() => setStep('select')} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'#1A1A1A',letterSpacing:'0.5px'}}>Review Booking</div>
        </div>
        <div style={{padding:'20px 18px',display:'flex',flexDirection:'column',gap:'14px'}}>
          <div style={{background:'#1A1A1A',borderRadius:'18px',overflow:'hidden',position:'relative'}}>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#1a1a1a 0%,#2d0a07 60%,#1a1a1a 100%)'}} />
            <div style={{position:'absolute',top:'-40px',right:'-40px',width:'160px',height:'160px',background:'radial-gradient(circle,rgba(227,41,26,0.4) 0%,transparent 65%)'}} />
            <div style={{position:'relative',padding:'20px'}}>
              <div style={{fontSize:'9px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1.5px',color:'rgba(255,255,255,0.35)',marginBottom:'10px'}}>Session Summary</div>
              <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'24px',color:'white',letterSpacing:'0.5px',lineHeight:1,marginBottom:'3px'}}>{trainer.full_name?.toUpperCase()}</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.45)',marginBottom:'16px'}}>{trainer.sport} · {trainer.position}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                {[
                  {label:'Date',value:selectedDate?.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})},
                  {label:'Time',value:selectedTime},
                  {label:'Duration',value:selectedDuration.label},
                  {label:'Total',value:'$'+total},
                ].map((item,i) => (
                  <div key={i} style={{background:'rgba(255,255,255,0.05)',borderRadius:'8px',padding:'8px 10px',border:'1px solid rgba(255,255,255,0.07)'}}>
                    <div style={{fontSize:'8px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',color:'rgba(255,255,255,0.3)',marginBottom:'3px'}}>{item.label}</div>
                    <div style={{fontSize:'13px',fontWeight:'700',color:item.label==='Total'?'#E3291A':'white'}}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{background:'white',borderRadius:'14px',border:'1.5px solid #EBEBEB',overflow:'hidden'}}>
            <div style={{display:'flex',justifyContent:'space-between',padding:'12px 14px',borderBottom:'1px solid #EBEBEB'}}><div style={{fontSize:'13px',color:'#8A8A8A'}}>Session fee</div><div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A'}}>${total}</div></div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'12px 14px',borderBottom:'1px solid #EBEBEB'}}><div style={{fontSize:'13px',color:'#8A8A8A'}}>Platform fee</div><div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A'}}>$4.85</div></div>
            {hasDiscount && <div style={{display:'flex',justifyContent:'space-between',padding:'12px 14px',borderBottom:'1px solid #EBEBEB'}}><div style={{fontSize:'13px',color:'#8A8A8A'}}>First session discount</div><div style={{fontSize:'13px',fontWeight:'700',color:'#22c55e'}}>-$10.00</div></div>}
            <div style={{display:'flex',justifyContent:'space-between',padding:'12px 14px',background:'#F7F7F5'}}><div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A'}}>Total due today</div><div style={{fontSize:'17px',fontWeight:'700',color:'#1A1A1A'}}>${Math.max(0,total+4.85-discountAmount).toFixed(2)}</div></div>
          </div>
          <div style={{background:'white',borderRadius:'12px',border:'1.5px solid #EBEBEB',padding:'12px 14px'}}>
            <div style={{fontSize:'12px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>Note to Coach</div>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder='Tell the coach what you want to work on...' rows={3} style={{width:'100%',border:'none',outline:'none',fontSize:'12px',color:'#1A1A1A',resize:'none',background:'transparent'}} />
          </div>
          <div style={{background:'rgba(227,41,26,0.06)',borderRadius:'10px',padding:'10px 12px',border:'1px solid rgba(227,41,26,0.12)'}}>
            <div style={{fontSize:'11px',color:'#E3291A',lineHeight:1.5}}>Free cancellation up to 24 hours before your session.</div>
          </div>
          <button onClick={handleConfirm} disabled={loading} style={{background:loading?'rgba(227,41,26,0.5)':'#E3291A',color:'white',border:'none',borderRadius:'12px',padding:'15px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer',marginBottom:'20px'}}>
            {loading ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{background:'white',padding:'12px 18px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #EBEBEB'}}>
        <button onClick={onBack} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'#1A1A1A',letterSpacing:'0.5px'}}>Book a Session</div>
      </div>

      <div style={{background:'#1A1A1A',margin:'16px 18px',borderRadius:'14px',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#1a1a1a 0%,#2d0a07 60%,#1a1a1a 100%)'}} />
        <div style={{position:'absolute',top:'-30px',right:'-30px',width:'130px',height:'130px',background:'radial-gradient(circle,rgba(227,41,26,0.35) 0%,transparent 65%)'}} />
        <div style={{position:'relative',padding:'14px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'44px',height:'44px',borderRadius:'11px',background:'linear-gradient(135deg,#E3291A,#9a1c10)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'white',flexShrink:0}}>
            {trainer.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'white',letterSpacing:'0.5px',lineHeight:1,marginBottom:'2px'}}>{trainer.full_name}</div>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.45)',display:'flex',gap:'8px'}}><span>{trainer.sport}</span><span>${trainer.trainers?.price_per_hour}/hr</span></div>
          </div>
        </div>
      </div>

      <div style={{padding:'0 18px',display:'flex',flexDirection:'column',gap:'20px'}}>

        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px'}}>Select Date</div>
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
          {availableSlots.length === 0 && (
            <div style={{textAlign:'center',padding:'16px',background:'#F7F7F5',borderRadius:'10px',marginTop:'10px',fontSize:'13px',color:'#8A8A8A'}}>
              This coach hasn't set their availability yet. Message them to schedule a session.
            </div>
          )}
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
                    <button key={time} onClick={() => !isBooked && setSelectedTime(time)} style={{padding:'10px 6px',borderRadius:'10px',border:selectedTime===time?'2px solid #E3291A':'1.5px solid #EBEBEB',background:selectedTime===time?'#E3291A':isBooked?'#F7F7F5':'white',color:selectedTime===time?'white':isBooked?'#EBEBEB':'#1A1A1A',fontSize:'12px',fontWeight:'600',cursor:isBooked?'not-allowed':'pointer',opacity:isBooked?0.5:1}}>
                      {time}
                      {isBooked && <div style={{fontSize:'8px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Booked</div>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {selectedTime && (
          <div>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Session Length</div>
            <div style={{display:'flex',gap:'8px'}}>
              {DURATIONS.map(d => (
                <button key={d.value} onClick={() => setSelectedDuration(d)} style={{flex:1,padding:'12px 8px',borderRadius:'10px',border:selectedDuration.value===d.value?'2px solid #E3291A':'1.5px solid #EBEBEB',background:selectedDuration.value===d.value?'rgba(227,41,26,0.06)':'white',cursor:'pointer',textAlign:'center'}}>
                  <div style={{fontSize:'13px',fontWeight:'700',color:selectedDuration.value===d.value?'#E3291A':'#1A1A1A',marginBottom:'2px'}}>{d.label}</div>
                  <div style={{fontSize:'11px',color:'#8A8A8A'}}>${Math.round(pricePerHour*d.multiplier)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setStep('confirm')}
          disabled={!selectedDate||!selectedTime}
          style={{background:!selectedDate||!selectedTime?'rgba(227,41,26,0.4)':'#E3291A',color:'white',border:'none',borderRadius:'12px',padding:'15px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer',marginBottom:'20px'}}
        >
          Review Booking
        </button>
      </div>
    </div>
  )
}
