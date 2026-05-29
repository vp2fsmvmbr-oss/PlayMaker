import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function TrainerSetup({ session, onComplete }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    sport: 'football',
    position: '',
    location: '',
    bio: '',
    years_experience: '',
    price_per_hour: '',
  })

  async function handleSave() {
    setLoading(true)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        sport: form.sport,
        position: form.position,
        location: form.location,
        bio: form.bio,
      })
      .eq('id', session.user.id)

    const { error: trainerError } = await supabase
      .from('trainers')
      .upsert({
        id: session.user.id,
        years_experience: parseInt(form.years_experience) || 0,
        price_per_hour: parseInt(form.price_per_hour) || 0,
        rating: 5.0,
        review_count: 0,
        athletes_trained: 0,
      })

    setLoading(false)
    if (!profileError && !trainerError) onComplete()
  }

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{background:'#1A1A1A',padding:'28px 20px 24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-40px',right:'-40px',width:'180px',height:'180px',background:'radial-gradient(circle,rgba(227,41,26,0.4) 0%,transparent 65%)'}} />
        <div style={{fontSize:'11px',fontWeight:'700',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px',position:'relative'}}>Welcome to PlayMaker</div>
        <div style={{fontFamily:'serif',fontSize:'28px',fontWeight:'900',color:'white',lineHeight:1.1,position:'relative',marginBottom:'6px'}}>
          SET UP YOUR<br/><span style={{color:'#E3291A'}}>COACH PROFILE.</span>
        </div>
        <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',position:'relative'}}>Athletes want to see who they're training with</div>
      </div>

      <div style={{padding:'20px 18px',display:'flex',flexDirection:'column',gap:'14px'}}>
        {[
          {key:'full_name',label:'Full Name',placeholder:'Your full name'},
          {key:'position',label:'Specialty',placeholder:'e.g. QB Coach, Speed Trainer, Guard Skills'},
          {key:'location',label:'Location',placeholder:'e.g. Scottsdale, AZ'},
          {key:'years_experience',label:'Years of Experience',placeholder:'e.g. 8'},
          {key:'price_per_hour',label:'Price Per Hour ($)',placeholder:'e.g. 65'},
        ].map(field => (
          <div key={field.key}>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>{field.label}</div>
            <input
              value={form[field.key]}
              onChange={e => setForm({...form,[field.key]:e.target.value})}
              placeholder={field.placeholder}
              style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A'}}
            />
          </div>
        ))}

        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Sport</div>
          <div style={{display:'flex',gap:'8px'}}>
            {['football','basketball'].map(s => (
              <button key={s} onClick={() => setForm({...form,sport:s})} style={{flex:1,padding:'12px',borderRadius:'10px',border:form.sport===s?'2px solid #E3291A':'2px solid #EBEBEB',background:form.sport===s?'rgba(227,41,26,0.06)':'white',color:form.sport===s?'#E3291A':'#8A8A8A',fontWeight:'700',fontSize:'13px',cursor:'pointer',textTransform:'capitalize'}}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Bio / Coaching Philosophy</div>
          <textarea
            value={form.bio}
            onChange={e => setForm({...form,bio:e.target.value})}
            placeholder='Tell athletes about your coaching style and what you specialize in...'
            rows={4}
            style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A',resize:'none',fontFamily:"'DM Sans', sans-serif"}}
          />
        </div>

        <button onClick={handleSave} disabled={loading || !form.full_name || !form.position} style={{background:loading||!form.full_name||!form.position?'rgba(227,41,26,0.4)':'#E3291A',color:'white',border:'none',borderRadius:'12px',padding:'15px',fontFamily:'serif',fontSize:'18px',fontWeight:'900',letterSpacing:'1px',cursor:'pointer',marginTop:'4px',marginBottom:'20px'}}>
          {loading ? 'Saving...' : 'Launch My Profile'}
        </button>
      </div>
    </div>
  )
}
