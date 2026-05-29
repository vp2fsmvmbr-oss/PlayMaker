import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('athlete')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setError('')
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message) }
      else if (data.user) {
        await supabase.from('profiles').insert({ id: data.user.id, full_name: fullName, role: role })
      }
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#1A1A1A',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{fontFamily:'serif',fontSize:'42px',fontWeight:'900',color:'white',letterSpacing:'2px',marginBottom:'8px'}}>
        PLAY<span style={{color:'#E3291A'}}>MAKER</span>
      </div>
      <div style={{fontSize:'12px',color:'rgba(255,255,255,0.35)',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'40px'}}>
        Connect · Train · Dominate
      </div>
      <div style={{background:'#222',borderRadius:'20px',padding:'28px 24px',width:'100%',maxWidth:'380px',border:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{display:'flex',background:'#1A1A1A',borderRadius:'12px',padding:'4px',marginBottom:'24px'}}>
          <button onClick={() => setMode('login')} style={{flex:1,padding:'10px',borderRadius:'9px',border:'none',background:mode==='login'?'#E3291A':'transparent',color:mode==='login'?'white':'rgba(255,255,255,0.4)',fontWeight:'700',fontSize:'13px',cursor:'pointer'}}>Sign In</button>
          <button onClick={() => setMode('signup')} style={{flex:1,padding:'10px',borderRadius:'9px',border:'none',background:mode==='signup'?'#E3291A':'transparent',color:mode==='signup'?'white':'rgba(255,255,255,0.4)',fontWeight:'700',fontSize:'13px',cursor:'pointer'}}>Sign Up</button>
        </div>
        {mode === 'signup' && (
          <div style={{marginBottom:'16px'}}>
            <div style={{fontSize:'11px',fontWeight:'700',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>I am a...</div>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={() => setRole('athlete')} style={{flex:1,padding:'12px',borderRadius:'12px',border:role==='athlete'?'2px solid #E3291A':'2px solid rgba(255,255,255,0.1)',background:role==='athlete'?'rgba(227,41,26,0.1)':'transparent',color:role==='athlete'?'#E3291A':'rgba(255,255,255,0.5)',fontWeight:'700',fontSize:'13px',cursor:'pointer'}}>Athlete</button>
              <button onClick={() => setRole('trainer')} style={{flex:1,padding:'12px',borderRadius:'12px',border:role==='trainer'?'2px solid #E3291A':'2px solid rgba(255,255,255,0.1)',background:role==='trainer'?'rgba(227,41,26,0.1)':'transparent',color:role==='trainer'?'#E3291A':'rgba(255,255,255,0.5)',fontWeight:'700',fontSize:'13px',cursor:'pointer'}}>Trainer / Coach</button>
            </div>
          </div>
        )}
        {mode === 'signup' && (
          <input placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} style={{width:'100%',padding:'13px 16px',borderRadius:'12px',background:'#1A1A1A',border:'1.5px solid rgba(255,255,255,0.1)',color:'white',fontSize:'14px',marginBottom:'10px',outline:'none',boxSizing:'border-box'}} />
        )}
        <input placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} style={{width:'100%',padding:'13px 16px',borderRadius:'12px',background:'#1A1A1A',border:'1.5px solid rgba(255,255,255,0.1)',color:'white',fontSize:'14px',marginBottom:'10px',outline:'none',boxSizing:'border-box'}} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{width:'100%',padding:'13px 16px',borderRadius:'12px',background:'#1A1A1A',border:'1.5px solid rgba(255,255,255,0.1)',color:'white',fontSize:'14px',marginBottom:'16px',outline:'none',boxSizing:'border-box'}} />
        {error && <div style={{color:'#E3291A',fontSize:'12px',marginBottom:'12px',textAlign:'center'}}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{width:'100%',padding:'14px',background:loading?'rgba(227,41,26,0.5)':'#E3291A',color:'white',border:'none',borderRadius:'12px',fontSize:'18px',fontWeight:'900',letterSpacing:'1px',cursor:'pointer'}}>
          {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </div>
    </div>
  )
}
