import { useState } from 'react'
import { supabase } from '../lib/supabase'

const TIMES = ['6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM']
const DURATIONS = [{label:'60 min',value:60},{label:'90 min',value:90},{label:'120 min',value:120}]

export default function CreateGroupSession({ session, profile, onBack, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    sport: profile?.sport || 'football',
    date: '',
    time: '',
    duration: 60,
    price_per_athlete: '',
    max_athletes: '8',
    location: profile?.location || '',
    description: ''
  })
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!form.title || !form.date || !form.time || !form.price_per_athlete) {
      alert('Please fill in all required fields')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('group_sessions').insert({
      trainer_id: session.user.id,
      title: form.title,
      sport: form.sport,
      date: form.date,
      time: form.time,
      duration: form.duration,
      price_per_athlete: parseInt(form.price_per_athlete),
      max_athletes: parseInt(form.max_athletes),
      location: form.location,
      description: form.description,
      status: 'open'
    })
    setLoading(false)
    if (!error) onCreated()
    else alert('Error: ' + error.message)
  }

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{background:'white',padding:'14px 18px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #EBEBEB'}}>
        <button onClick={onBack} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
        <div style={{flex:1,fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px'}}>Create Group Session</div>
        <button onClick={handleCreate} disabled={loading} style={{background:'#E3291A',color:'white',border:'none',borderRadius:'100px',padding:'8px 18px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>

      <div style={{padding:'20px 18px',display:'flex',flexDirection:'column',gap:'14px'}}>
        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Session Title <span style={{color:'#E3291A'}}>*</span></div>
          <input value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder='e.g. Saturday Morning Speed Training' style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A'}} />
        </div>

        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Sport</div>
          <div style={{display:'flex',gap:'8px'}}>
            {['football','basketball'].map(s => (
              <button key={s} onClick={() => setForm({...form,sport:s})} style={{flex:1,padding:'12px',borderRadius:'10px',border:form.sport===s?'2px solid #E3291A':'2px solid #EBEBEB',background:form.sport===s?'rgba(227,41,26,0.06)':'white',color:form.sport===s?'#E3291A':'#8A8A8A',fontWeight:'700',fontSize:'13px',cursor:'pointer',textTransform:'capitalize'}}>
                {s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Date <span style={{color:'#E3291A'}}>*</span></div>
          <input type='date' value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e => setForm({...form,date:e.target.value})} style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A'}} />
        </div>

        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Time <span style={{color:'#E3291A'}}>*</span></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'6px'}}>
            {TIMES.map(time => (
              <button key={time} onClick={() => setForm({...form,time})} style={{padding:'10px 6px',borderRadius:'10px',border:form.time===time?'2px solid #E3291A':'1.5px solid #EBEBEB',background:form.time===time?'#E3291A':'white',color:form.time===time?'white':'#1A1A1A',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>
                {time}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Duration</div>
          <div style={{display:'flex',gap:'8px'}}>
            {DURATIONS.map(d => (
              <button key={d.value} onClick={() => setForm({...form,duration:d.value})} style={{flex:1,padding:'12px',borderRadius:'10px',border:form.duration===d.value?'2px solid #E3291A':'2px solid #EBEBEB',background:form.duration===d.value?'rgba(227,41,26,0.06)':'white',color:form.duration===d.value?'#E3291A':'#8A8A8A',fontWeight:'700',fontSize:'13px',cursor:'pointer'}}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {[
          {key:'price_per_athlete',label:'Price Per Athlete ($)',placeholder:'e.g. 25'},
          {key:'max_athletes',label:'Max Athletes',placeholder:'e.g. 8'},
          {key:'location',label:'Location',placeholder:'e.g. Desert Ridge Sports Complex'},
        ].map(field => (
          <div key={field.key}>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>{field.label}</div>
            <input value={form[field.key]} onChange={e => setForm({...form,[field.key]:e.target.value})} placeholder={field.placeholder} style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A'}} />
          </div>
        ))}

        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Description</div>
          <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder='What will athletes work on in this session?' rows={3} style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A',resize:'none'}} />
        </div>

        <button onClick={handleCreate} disabled={loading} style={{background:loading?'rgba(227,41,26,0.5)':'#E3291A',color:'white',border:'none',borderRadius:'12px',padding:'15px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer',marginBottom:'20px'}}>
          {loading ? 'Creating...' : 'Create Group Session'}
        </button>
      </div>
    </div>
  )
}
