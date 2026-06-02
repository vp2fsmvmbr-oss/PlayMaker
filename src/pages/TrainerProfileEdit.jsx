import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import VerificationRequest from './VerificationRequest'

export default function TrainerProfileEdit({ session, profile, onBack, onSave }) {
  const [form, setForm] = useState({
    full_name: '',
    sport: 'football',
    position: '',
    location: '',
    bio: '',
    years_experience: '',
    price_per_hour: '',
    first_session_discount: false,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        sport: profile.sport || 'football',
        position: profile.position || '',
        location: profile.location || '',
        bio: profile.bio || '',
        years_experience: profile.trainers?.years_experience?.toString() || '',
        price_per_hour: profile.trainers?.price_per_hour?.toString() || '',
        first_session_discount: profile.trainers?.first_session_discount || false,
      })
    }
  }, [profile])

  async function handleSave() {
    setLoading(true)
    await supabase.from('profiles').update({
      full_name: form.full_name,
      sport: form.sport,
      position: form.position,
      location: form.location,
      bio: form.bio,
    }).eq('id', session.user.id)

    await supabase.from('trainers').upsert({
      id: session.user.id,
      years_experience: parseInt(form.years_experience) || 0,
      price_per_hour: parseInt(form.price_per_hour) || 0,
      first_session_discount: form.first_session_discount,
    })

    setLoading(false)
    onSave()
  }

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{background:'white',padding:'14px 18px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #EBEBEB'}}>
        <button onClick={onBack} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
        <div style={{flex:1,fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px'}}>Edit Profile</div>
        <button onClick={handleSave} disabled={loading} style={{background:'#E3291A',color:'white',border:'none',borderRadius:'100px',padding:'8px 18px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div style={{padding:'20px 18px',display:'flex',flexDirection:'column',gap:'14px'}}>
        {[
          {key:'full_name',label:'Full Name',placeholder:'Your full name'},
          {key:'position',label:'Specialty',placeholder:'e.g. QB Coach, Speed Trainer'},
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
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Bio / Coaching Philosophy</div>
          <textarea
            value={form.bio}
            onChange={e => setForm({...form,bio:e.target.value})}
            placeholder='Tell athletes about your coaching style...'
            rows={4}
            style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A',resize:'none'}}
          />
        </div>

        <div style={{background:'white',borderRadius:'12px',border:'1.5px solid #EBEBEB',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'2px'}}>First Session Discount</div>
            <div style={{fontSize:'12px',color:'#8A8A8A'}}>Offer $10 off to new athletes</div>
          </div>
          <div onClick={() => setForm({...form,first_session_discount:!form.first_session_discount})} style={{width:'44px',height:'24px',borderRadius:'12px',background:form.first_session_discount?'#E3291A':'#EBEBEB',position:'relative',cursor:'pointer',transition:'background 0.2s',flexShrink:0}}>
            <div style={{position:'absolute',top:'2px',left:form.first_session_discount?'22px':'2px',width:'20px',height:'20px',borderRadius:'50%',background:'white',boxShadow:'0 1px 4px rgba(0,0,0,0.2)',transition:'left 0.2s'}} />
          </div>
        </div>

        <VerificationRequest profile={profile} />

        <button onClick={handleSave} disabled={loading} style={{background:loading?'rgba(227,41,26,0.5)':'#E3291A',color:'white',border:'none',borderRadius:'12px',padding:'15px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer',marginBottom:'20px'}}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}
