import { useState } from 'react'
import { supabase } from '../lib/supabase'

const TIME_SLOTS = ['7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM']
const DURATIONS = [{label:'60 min',value:60,multiplier:1},{label:'90 min',value:90,multiplier:1.5},{label:'120 min',value:120,multiplier:2}]

export default function BookSession({ trainer, session, onBack, onBooked }) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0])
  const [note, setNote] = useState('')
  const [step, setStep] = useState('select')
  const [loading, setLoading] = useState(false)

  const pricePerHour = trainer.trainers?.price_per_hour || 0
  const total = Math.round(pricePerHour * selectedDuration.multiplier)

  async function handleConfirm() {
    setLoading(true)
    const { error } = await supabase.from('bookings').insert({
      athlete_id: session.user.id,
      trainer_id: trainer.id,
      date: selectedDate,
      time: selectedTime,
      duration: selectedDuration.value,
      total_price: total,
      note: note,
      status: 'confirmed'
    })
    setLoading(false)
    if (!error) onBooked()
  }

  if (step === 'confirm') {
    return (
      <div style={{flex:1,overflowY:'auto'}}>
        <div style={{background:'white',padding:'12px 18px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #EBEBEB'}}>
          <button onClick={() => setStep('select')} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
          <div style={{fontFamily:'serif',fontSize:'18px',fontWeight:'900',color:'#1A1A1A',letterSpacing:'0.5px'}}>Review Booking</div>
        </div>
        <div style={{padding:'20px 18px',display:'flex',flexDirection:'column',gap:'14px'}}>
          <div style={{background:'#1A1A1A',borderRadius:'18px',overflow:'hidden',position:'relative'}}>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#1a1a1a 0%,#2d0a07 60%,#1a1a1a 100%)'}} />
            <div style={{position:'absolute',top:'-40px',right:'-40px',width:'160px',height:'160px',background:'radial-gradient(circle,rgba(227,41,26,0.4) 0%,transparent 65%)'}} />
            <div style={{position:'relative',padding:'20px'}}>
              <div style={{fontSize:'9px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1.5px',color:'rgba(255,255,255,0.35)',marginBottom:'10px'}}>Session Summary</div>
              <div style={{fontFamily:'serif',fontSize:'24px',color:'white',fontWeight:'900',letterSpacing:'0.5px',lineHeight:1,marginBottom:'3px'}}>{trainer.full_name?.toUpperCase()}</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.45)',marginBottom:'16px'}}>{trainer.sport} · {trainer.position}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                {[
                  {label:'Date',value:new Date(selectedDate).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})},
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
            <div style={{display:'flex',justifyContent:'space-between',padding:'12px 14px',borderBottom:'1px solid #EBEBEB'}}>
              <div style={{fontSize:'13px',color:'#8A8A8A'}}>Session fee</div>
              <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A'}}>${total}</div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'12px 14px',borderBottom:'1px solid #EBEBEB'}}>
              <div style={{fontSize:'13px',color:'#8A8A8A'}}>Platform fee</div>
              <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A'}}>$4.85</div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'12px 14px',borderBottom:'1px solid #EBEBEB'}}>
              <div style={{fontSize:'13px',color:'#8A8A8A'}}>First session discount</div>
              <div style={{fontSize:'13px',fontWeight:'700',color:'#22c55e'}}>-$10.00</div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'12px 14px',background:'#F7F7F5'}}>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A'}}>Total due today</div>
              <div style={{fontSize:'17px',fontWeight:'700',color:'#1A1A1A'}}>${Math.max(0, total + 4.85 - 10).toFixed(2)}</div>
            </div>
          </div>
          <div style={{background:'white',borderRadius:'12px',border:'1.5px solid #EBEBEB',padding:'12px 14px'}}>
            <div style={{fontSize:'12px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>Note to Coach</div>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder='Tell the coach what you want to work on...' rows={3} style={{width:'100%',border:'none',outline:'none',fontSize:'12px',color:'#1A1A1A',resize:'none',fontFamily:"'DM Sans', sans-serif",background:'transparent'}} />
          </div>
          <div style={{background:'rgba(227,41,26,0.06)',borderRadius:'10px',padding:'10px 12px',border:'1px solid rgba(227,41,26,0.12)'}}>
            <div style={{fontSize:'11px',color:'#E3291A',lineHeight:1.5}}>Free cancellation up to 24 hours before your session.</div>
          </div>
          <button onClick={handleConfirm} disabled={loading} style={{background:loading?'rgba(227,41,26,0.5)':'#E3291A',color:'white',border:'none',borderRadius:'12px',padding:'15px',fontFamily:'serif',fontSize:'18px',fontWeight:'900',letterSpacing:'1px',cursor:'pointer',marginBottom:'20px'}}>
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
        <div style={{fontFamily:'serif',fontSize:'18px',fontWeight:'900',color:'#1A1A1A',letterSpacing:'0.5px'}}>Book a Session</div>
      </div>
      <div style={{background:'#1A1A1A',margin:'16px 18px',borderRadius:'14px',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#1a1a1a 0%,#2d0a07 60%,#1a1a1a 100%)'}} />
        <div style={{position:'absolute',top:'-30px',right:'-30px',width:'130px',height:'130px',background:'radial-gradient(circle,rgba(227,41,26,0.35) 0%,transparent 65%)'}} />
        <div style={{position:'relative',padding:'14px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'44px',height:'44px',borderRadius:'11px',background:'linear-gradient(135deg,#E3291A,#9a1c10)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'serif',fontSize:'16px',color:'white',fontWeight:'900',flexShrink:0}}>
            {trainer.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:'serif',fontSize:'16px',color:'white',fontWeight:'900',letterSpacing:'0.5px',lineHeight:1,marginBottom:'2px'}}>{trainer.full_name}</div>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.45)',display:'flex',gap:'8px'}}>
              <span>{trainer.sport}</span>
              <span>${trainer.trainers?.price_per_hour}/hr</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{padding:'0 18px',display:'flex',flexDirection:'column',gap:'20px'}}>
        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Select Date</div>
          <input type='date' value={selectedDate} min={new Date().toISOString().split('T')[0]} onChange={e => setSelectedDate(e.target.value)} style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A'}} />
        </div>
        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Select Time</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'6px'}}>
            {TIME_SLOTS.map(time => (
              <button key={time} onClick={() => setSelectedTime(time)} style={{padding:'10px 6px',borderRadius:'10px',border:selectedTime===time?'2px solid #E3291A':'1.5px solid #EBEBEB',background:selectedTime===time?'#E3291A':'white',color:selectedTime===time?'white':'#1A1A1A',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>
                {time}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Session Length</div>
          <div style={{display:'flex',gap:'8px'}}>
            {DURATIONS.map(d => (
              <button key={d.value} onClick={() => setSelectedDuration(d)} style={{flex:1,padding:'12px 8px',borderRadius:'10px',border:selectedDuration.value===d.value?'2px solid #E3291A':'1.5px solid #EBEBEB',background:selectedDuration.value===d.value?'rgba(227,41,26,0.06)':'white',cursor:'pointer',textAlign:'center'}}>
                <div style={{fontSize:'13px',fontWeight:'700',color:selectedDuration.value===d.value?'#E3291A':'#1A1A1A',marginBottom:'2px'}}>{d.label}</div>
                <div style={{fontSize:'11px',color:'#8A8A8A'}}>${Math.round(pricePerHour * d.multiplier)}</div>
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setStep('confirm')} disabled={!selectedDate||!selectedTime} style={{background:!selectedDate||!selectedTime?'rgba(227,41,26,0.4)':'#E3291A',color:'white',border:'none',borderRadius:'12px',padding:'15px',fontFamily:'serif',fontSize:'18px',fontWeight:'900',letterSpacing:'1px',cursor:'pointer',marginBottom:'20px'}}>
          Review Booking
        </button>
      </div>
    </div>
  )
}
