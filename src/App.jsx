import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Home from './pages/Home'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#1A1A1A'}}>
      <div style={{color:'#E3291A',fontSize:'32px',fontWeight:'900',letterSpacing:'2px'}}>PLAYMAKER</div>
    </div>
  )

  const isMobile = window.innerWidth < 500

  if (isMobile) {
    return session ? <Home session={session} /> : <Auth />
  }

  return (
    <div style={{width:'100%',height:'100vh',overflow:'hidden',background:'linear-gradient(135deg,#0f0f0f 0%,#1a0505 50%,#0f0f0f 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 20px',gap:'60px'}}>
      <div style={{color:'white',maxWidth:'360px',flexShrink:0}}>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'56px',color:'white',letterSpacing:'2px',lineHeight:1,marginBottom:'8px'}}>
          PLAY<span style={{color:'#E3291A'}}>MAKER</span>
        </div>
        <div style={{fontSize:'14px',color:'rgba(255,255,255,0.4)',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'28px'}}>Connect · Train · Dominate</div>
        <div style={{fontSize:'16px',color:'rgba(255,255,255,0.7)',lineHeight:1.7,marginBottom:'28px'}}>
          The app that connects <strong style={{color:'white'}}>teen athletes</strong> with the right <strong style={{color:'white'}}>coaches and trainers</strong> in Phoenix.
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {[
            'Find coaches by sport and position',
            'Message before you book',
            'Real availability — no guessing',
            'Leave reviews after sessions',
          ].map((item,i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',fontSize:'14px',color:'rgba(255,255,255,0.6)'}}>
              <div style={{width:'6px',height:'6px',background:'#E3291A',borderRadius:'50%',flexShrink:0}} />
              {item}
            </div>
          ))}
        </div>
        <div style={{marginTop:'28px',fontSize:'13px',color:'rgba(255,255,255,0.3)'}}>Best experienced on mobile. Open on your phone for the full app.</div>
      </div>
      <div style={{width:'390px',height:'100vh',maxHeight:'844px',background:'#F7F7F5',borderRadius:'50px',boxShadow:'0 40px 100px rgba(0,0,0,0.5), 0 0 0 10px #1a1a1a, 0 0 0 11px #333',overflow:'hidden',flexShrink:0,display:'flex',flexDirection:'column'}}>
        {session ? <Home session={session} /> : <Auth />}
      </div>
    </div>
  )
}

export default App
