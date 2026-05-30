import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const TIMES = ['6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM']

export default function SetAvailability({ session, onBack }) {
  const [recurring, setRecurring] = useState({})
  const [oneTime, setOneTime] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(1)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [tab, setTab] = useState('weekly')

  useEffect(() => { fetchAvailability() }, [])

  async function fetchAvailability() {
    setLoading(true)
    const { data } = await supabase
      .from('availability')
      .select('*')
      .eq('trainer_id', session.user.id)

    if (data) {
      const rec = {}
      const one = []
      data.forEach(slot => {
        if (slot.specific_date) {
          one.push(slot)
        } else {
          if (!rec[slot.day_of_week]) rec[slot.day_of_week] = { active: true, times: [] }
          rec[slot.day_of_week].times.push(slot.start_time)
        }
      })
      setRecurring(rec)
      setOneTime(one)
    }
    setLoading(false)
  }

  async function toggleDayActive(day) {
    const current = recurring[day]
    if (current?.active) {
      await supabase.from('availability').delete()
        .eq('trainer_id', session.user.id)
        .eq('day_of_week', day)
        .is('specific_date', null)
      setRecurring(prev => { const n = {...prev}; delete n[day]; return n })
    } else {
      setRecurring(prev => ({...prev, [day]: { active: true, times: [] }}))
    }
  }

  async function toggleTimeSlot(day, time) {
    const dayData = recurring[day] || { active: true, times: [] }
    const hasTime = dayData.times.includes(time)

    if (hasTime) {
      await supabase.from('availability').delete()
        .eq('trainer_id', session.user.id)
        .eq('day_of_week', day)
        .eq('start_time', time)
        .is('specific_date', null)
      setRecurring(prev => ({
        ...prev,
        [day]: { ...prev[day], times: prev[day].times.filter(t => t !== time) }
      }))
    } else {
      await supabase.from('availability').insert({
        trainer_id: session.user.id,
        day_of_week: day,
        start_time: time,
        end_time: time,
        specific_date: null
      })
      setRecurring(prev => ({
        ...prev,
        [day]: { active: true, times: [...(prev[day]?.times || []), time] }
      }))
    }
  }

  async function addOneTimeSlot() {
    if (!newDate || !newTime) return
    const { data, error } = await supabase.from('availability').insert({
      trainer_id: session.user.id,
      day_of_week: new Date(newDate + 'T12:00:00').getDay(),
      start_time: newTime,
      end_time: newTime,
      specific_date: newDate
    }).select().single()
    if (!error && data) {
      setOneTime(prev => [...prev, data])
      setNewDate('')
      setNewTime('')
    }
  }

  async function deleteOneTimeSlot(id) {
    await supabase.from('availability').delete().eq('id', id)
    setOneTime(prev => prev.filter(s => s.id !== id))
  }

  const totalSlots = Object.values(recurring).reduce((sum, d) => sum + (d.times?.length || 0), 0) + oneTime.length

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:'white',padding:'14px 18px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #EBEBEB',flexShrink:0}}>
        <button onClick={onBack} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px'}}>Set Availability</div>
          <div style={{fontSize:'11px',color:'#8A8A8A'}}>{totalSlots} total slots open</div>
        </div>
      </div>

      <div style={{display:'flex',background:'white',borderBottom:'1px solid #EBEBEB',flexShrink:0}}>
        {['weekly','onetime'].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{flex:1,padding:'12px',textAlign:'center',fontSize:'12px',fontWeight:'700',color:tab===t?'#E3291A':'#8A8A8A',cursor:'pointer',borderBottom:tab===t?'2px solid #E3291A':'2px solid transparent',textTransform:'uppercase',letterSpacing:'0.5px'}}>
            {t === 'weekly' ? 'Weekly Schedule' : 'One-Time Slots'}
          </div>
        ))}
      </div>

      {tab === 'weekly' && (
        <>
          <div style={{background:'white',borderBottom:'1px solid #EBEBEB',flexShrink:0}}>
            <div style={{display:'flex',overflowX:'auto',padding:'12px 16px',gap:'8px'}}>
              {DAYS.map((day, i) => {
                const dayData = recurring[i]
                const isActive = !!dayData?.active
                const count = dayData?.times?.length || 0
                return (
                  <button key={i} onClick={() => { if (!isActive) toggleDayActive(i); setSelectedDay(i) }} style={{flexShrink:0,padding:'8px 14px',borderRadius:'100px',border:selectedDay===i?'2px solid #E3291A':isActive?'1.5px solid #1A1A1A':'1.5px solid #EBEBEB',background:selectedDay===i?'#E3291A':isActive?'#1A1A1A':'white',color:selectedDay===i||isActive?'white':'#8A8A8A',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>
                    {day.slice(0,3)}
                    {count > 0 && <span style={{marginLeft:'4px',background:'rgba(255,255,255,0.2)',fontSize:'10px',padding:'1px 5px',borderRadius:'100px'}}>{count}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{flex:1,overflowY:'auto',padding:'16px 18px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <div>
                <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'#1A1A1A',letterSpacing:'0.5px'}}>{DAYS[selectedDay]}</div>
                <div style={{fontSize:'11px',color:'#8A8A8A'}}>Repeats every week</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <div style={{fontSize:'12px',fontWeight:'700',color:'#8A8A8A'}}>{recurring[selectedDay]?.active ? 'Active' : 'Off'}</div>
                <div onClick={() => toggleDayActive(selectedDay)} style={{width:'44px',height:'24px',borderRadius:'12px',background:recurring[selectedDay]?.active?'#E3291A':'#EBEBEB',position:'relative',cursor:'pointer',transition:'background 0.2s'}}>
                  <div style={{position:'absolute',top:'2px',left:recurring[selectedDay]?.active?'22px':'2px',width:'20px',height:'20px',borderRadius:'50%',background:'white',boxShadow:'0 1px 4px rgba(0,0,0,0.2)',transition:'left 0.2s'}} />
                </div>
              </div>
            </div>

            {recurring[selectedDay]?.active ? (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}}>
                {TIMES.map(time => {
                  const isSelected = recurring[selectedDay]?.times?.includes(time)
                  return (
                    <button key={time} onClick={() => toggleTimeSlot(selectedDay, time)} style={{padding:'12px 8px',borderRadius:'10px',border:isSelected?'2px solid #E3291A':'1.5px solid #EBEBEB',background:isSelected?'#E3291A':'white',color:isSelected?'white':'#1A1A1A',fontSize:'12px',fontWeight:'600',cursor:'pointer',transition:'all 0.15s'}}>
                      {time}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div style={{textAlign:'center',padding:'40px 20px',background:'#F7F7F5',borderRadius:'12px'}}>
                <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>{DAYS[selectedDay]} is off</div>
                <div style={{fontSize:'12px',color:'#8A8A8A',marginBottom:'14px'}}>Toggle it on to set available times</div>
                <button onClick={() => toggleDayActive(selectedDay)} style={{background:'#1A1A1A',color:'white',border:'none',borderRadius:'100px',padding:'10px 20px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>Turn On</button>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'onetime' && (
        <div style={{flex:1,overflowY:'auto',padding:'16px 18px'}}>
          <div style={{background:'white',borderRadius:'14px',border:'1.5px solid #EBEBEB',padding:'16px',marginBottom:'16px'}}>
            <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'12px'}}>Add One-Time Slot</div>
            <div style={{marginBottom:'10px'}}>
              <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Date</div>
              <input type='date' value={newDate} min={new Date().toISOString().split('T')[0]} onChange={e => setNewDate(e.target.value)} style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A'}} />
            </div>
            <div style={{marginBottom:'12px'}}>
              <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Time</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'6px'}}>
                {TIMES.map(time => (
                  <button key={time} onClick={() => setNewTime(time)} style={{padding:'8px 4px',borderRadius:'8px',border:newTime===time?'2px solid #E3291A':'1.5px solid #EBEBEB',background:newTime===time?'#E3291A':'white',color:newTime===time?'white':'#1A1A1A',fontSize:'11px',fontWeight:'600',cursor:'pointer'}}>
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={addOneTimeSlot} disabled={!newDate||!newTime} style={{width:'100%',background:!newDate||!newTime?'rgba(227,41,26,0.4)':'#E3291A',color:'white',border:'none',borderRadius:'10px',padding:'12px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',letterSpacing:'0.5px',cursor:'pointer'}}>
              Add Slot
            </button>
          </div>

          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'10px'}}>Upcoming One-Time Slots</div>
          {oneTime.length === 0 ? (
            <div style={{textAlign:'center',padding:'30px',background:'#F7F7F5',borderRadius:'12px',fontSize:'13px',color:'#8A8A8A'}}>No one-time slots added yet</div>
          ) : oneTime.sort((a,b) => a.specific_date > b.specific_date ? 1 : -1).map(slot => (
            <div key={slot.id} style={{background:'white',borderRadius:'12px',border:'1.5px solid #EBEBEB',padding:'12px 14px',display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'}}>
              <div style={{background:'rgba(227,41,26,0.08)',borderRadius:'8px',padding:'6px 10px',textAlign:'center',minWidth:'48px'}}>
                <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'#E3291A',lineHeight:1}}>{new Date(slot.specific_date+'T12:00:00').getDate()}</div>
                <div style={{fontSize:'9px',color:'#E3291A',fontWeight:'700',textTransform:'uppercase'}}>{new Date(slot.specific_date+'T12:00:00').toLocaleDateString('en-US',{month:'short'})}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A'}}>{slot.start_time}</div>
                <div style={{fontSize:'11px',color:'#8A8A8A'}}>{DAYS[slot.day_of_week]}, {new Date(slot.specific_date+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
              </div>
              <button onClick={() => deleteOneTimeSlot(slot.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'18px',color:'#8A8A8A',padding:'4px'}}>🗑</button>
            </div>
          ))}
        </div>
      )}

      <div style={{padding:'12px 18px 28px',background:'white',borderTop:'1px solid #EBEBEB',flexShrink:0}}>
        <div style={{fontSize:'12px',color:'#8A8A8A',textAlign:'center'}}>Changes save automatically</div>
      </div>
    </div>
  )
}
