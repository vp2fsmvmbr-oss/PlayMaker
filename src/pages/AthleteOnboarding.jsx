import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AthleteOnboarding({ session, onComplete }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    full_name: '',
    sport: 'football',
    position: '',
    school: '',
    location: '',
    age: '',
  })
  const [loading, setLoading] = useState(false)

  async function handleFinish() {
    if (!form.full_name.trim()) { alert('Please enter your name'); return }
    setLoading(true)
    await supabase.from('profiles').update({
      full_name: form.full_name,
      sport: form.sport,
      position: form.position,
      school: form.school,
      location: form.location,
      age: parseInt(form.age) || null,
    }).eq('id', session.user.id)
    setLoading(false)
    onComplete()
  }

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:'#F7F7F5'}}>
      <div style={{background:'#1A1A1A',padding:'40px 24px 32px',position:'relative',overflow:'hidden',flexShrink:0}}>
        <div style={{position:'absolute',top:'-60px',right:'-60px',width:'260px',height:'260px',background:'radial-gradient(circle,rgba(227,41,26,0.35) 0%,transparent 65%)'}} />
        <div style={{position:'relative'}}>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'14px',color:'#E3291A',letterSpacing:'2px',marginBottom:'8px'}}>PLAYMAKER · WELCOME</div>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'32px',color:'white',letterSpacing:'0.5px',lineHeight:1.1,marginBottom:'8px'}}>
            {step === 1 ? "LET'S BUILD YOUR PROFILE." : step === 2 ? 'YOUR SPORT.' : 'ALMOST THERE.'}
          </div>
          <div style={{fontSize:'13px',color:'rgba(255,255,255,0.45)'}}>
            {step === 1 ? 'Coaches want to know who they are working with' : step === 2 ? 'Tell coaches what sport and position you play' : 'Just a couple more things'}
          </div>
        </div>
        <div style={{display:'flex',gap:'6px',marginTop:'20px'}}>
          {[1,2,3].map(s => (
            <div key={s} style={{flex:1,height:'3px',borderRadius:'2px',background:s<=step?'#E3291A':'rgba(255,255,255,0.15)'}} />
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'24px 20px'}}>
        {step === 1 && (
          <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
            {[
              {key:'full_name',label:'Full Name',placeholder:'Your full name',required:true},
              {key:'age',label:'Age',placeholder:'Your age'},
              {key:'school',label:'School',placeholder:'Your high school or college'},
              {key:'location',label:'Location',placeholder:'e.g. Phoenix, AZ'},
            ].map(field => (
              <div key={field.key}>
                <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>
                  {field.label}{field.required && <span style={{color:'#E3291A'}}> *</span>}
                </div>
                <input
                  value={form[field.key]}
                  onChange={e => setForm({...form,[field.key]:e.target.value})}
                  placeholder={field.placeholder}
                  style={{width:'100%',padding:'13px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'white',color:'#1A1A1A'}}
                />
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
            <div>
              <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'10px'}}>Sport</div>
              <div style={{display:'flex',gap:'8px'}}>
                {['football','basketball'].map(s => (
                  <button key={s} onClick={() => setForm({...form,sport:s})} style={{flex:1,padding:'16px',borderRadius:'12px',border:form.sport===s?'2px solid #E3291A':'2px solid #EBEBEB',background:form.sport===s?'rgba(227,41,26,0.06)':'white',color:form.sport===s?'#E3291A':'#8A8A8A',fontWeight:'700',fontSize:'14px',cursor:'pointer',textTransform:'capitalize',fontFamily:"'Bebas Neue', sans-serif",letterSpacing:'0.5px',fontSize:'18px'}}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Position</div>
              <input
                value={form.position}
                onChange={e => setForm({...form,position:e.target.value})}
                placeholder={form.sport === 'football' ? 'e.g. Wide Receiver, Quarterback, DB' : 'e.g. Point Guard, Shooting Guard, Center'}
                style={{width:'100%',padding:'13px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'white',color:'#1A1A1A'}}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div style={{background:'white',borderRadius:'14px',border:'1.5px solid #EBEBEB',padding:'16px'}}>
              <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'12px'}}>YOUR PROFILE</div>
              {[
                {label:'Name',value:form.full_name},
                {label:'Sport',value:form.sport},
                {label:'Position',value:form.position||'Not set'},
                {label:'School',value:form.school||'Not set'},
                {label:'Location',value:form.location||'Not set'},
              ].map((item,i) => (
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:i<4?'1px solid #EBEBEB':'none'}}>
                  <div style={{fontSize:'12px',color:'#8A8A8A'}}>{item.label}</div>
                  <div style={{fontSize:'12px',fontWeight:'700',color:'#1A1A1A',textTransform:'capitalize'}}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{background:'rgba(227,41,26,0.06)',borderRadius:'12px',padding:'14px',border:'1px solid rgba(227,41,26,0.12)'}}>
              <div style={{fontSize:'12px',color:'#E3291A',lineHeight:1.5}}>You can always update your profile later including your physical stats, bio, and training goals.</div>
            </div>
          </div>
        )}
      </div>

      <div style={{padding:'16px 20px 32px',background:'white',borderTop:'1px solid #EBEBEB'}}>
        <div style={{display:'flex',gap:'10px'}}>
          {step > 1 && (
            <button onClick={() => setStep(step-1)} style={{flex:1,background:'#F7F7F5',color:'#1A1A1A',border:'1.5px solid #EBEBEB',borderRadius:'12px',padding:'14px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'0.5px',cursor:'pointer'}}>
              Back
            </button>
          )}
          <button
            onClick={() => step < 3 ? setStep(step+1) : handleFinish()}
            disabled={loading}
            style={{flex:2,background:loading?'rgba(227,41,26,0.5)':'#E3291A',color:'white',border:'none',borderRadius:'12px',padding:'14px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer'}}
          >
            {loading ? 'Saving...' : step < 3 ? 'Continue' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  )
}
