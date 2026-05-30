import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function HomeAthlete({ profile, onNavigate }) {
  const [trainers, setTrainers] = useState([])
  const [sport, setSport] = useState('all')

  useEffect(() => { fetchTrainers() }, [])

  async function fetchTrainers() {
    const { data } = await supabase
      .from('profiles')
      .select('*, trainers(*)')
      .eq('role', 'trainer')
      .limit(6)
    if (data) setTrainers(data)
  }

  const filtered = sport === 'all' ? trainers : trainers.filter(t => t.sport === sport)
  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'16px 20px 14px',background:'white',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{fontSize:'11px',color:'#8A8A8A',fontWeight:'500',marginBottom:'2px'}}>
          {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
        </div>
        <div style={{fontFamily:'serif',fontSize:'26px',fontWeight:'900',color:'#1A1A1A',lineHeight:1.1,marginBottom:'4px'}}>
          LET'S GET TO<br/><span style={{color:'#E3291A'}}>WORK,</span> {profile?.full_name?.split(' ')[0]?.toUpperCase() || 'ATHLETE'}.
        </div>
        <div style={{fontSize:'12px',color:'#8A8A8A'}}>Phoenix, AZ · Football & Basketball</div>
      </div>

      <div style={{padding:'12px 20px',display:'flex',gap:'8px',overflow:'auto',background:'white',borderBottom:'1px solid #EBEBEB'}}>
        {['all','football','basketball'].map(s => (
          <button key={s} onClick={() => setSport(s)} style={{padding:'7px 14px',borderRadius:'100px',fontSize:'12px',fontWeight:'600',border:'none',background:sport===s?'#E3291A':'#F7F7F5',color:sport===s?'white':'#8A8A8A',cursor:'pointer',whiteSpace:'nowrap',textTransform:'capitalize'}}>
            {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
      </div>

      <div style={{padding:'18px 20px 0'}}>
        {featured && (
          <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
              <div style={{fontFamily:'serif',fontSize:'18px',fontWeight:'900',color:'#1A1A1A',letterSpacing:'0.3px'}}>TOP TRAINER NEAR YOU</div>
              <div onClick={() => onNavigate('find')} style={{fontSize:'12px',fontWeight:'700',color:'#E3291A',cursor:'pointer'}}>See all</div>
            </div>
            <div onClick={() => onNavigate('find', featured)} style={{background:'#1A1A1A',borderRadius:'16px',overflow:'hidden',position:'relative',height:'180px',cursor:'pointer',marginBottom:'20px'}}>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#1a1a1a 0%,#2d0a07 60%,#1a1a1a 100%)'}} />
              <div style={{position:'absolute',top:'-40px',right:'-40px',width:'180px',height:'180px',background:'radial-gradient(circle,rgba(227,41,26,0.4) 0%,transparent 65%)'}} />
              <div style={{position:'absolute',inset:0,padding:'18px',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                <div style={{background:'#E3291A',borderRadius:'100px',padding:'4px 10px',fontSize:'9px',fontWeight:'700',color:'white',letterSpacing:'1px',textTransform:'uppercase',width:'fit-content'}}>Featured</div>
                <div>
                  <div style={{fontFamily:'serif',fontSize:'22px',color:'white',fontWeight:'900',letterSpacing:'0.5px',lineHeight:1,marginBottom:'3px'}}>{featured.full_name?.toUpperCase()}</div>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,0.5)',marginBottom:'10px'}}>{featured.sport} · {featured.position} · {featured.location}</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{display:'flex',gap:'6px'}}>
                      {featured.sport && <div style={{background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.8)',fontSize:'9px',fontWeight:'600',padding:'4px 8px',borderRadius:'100px',border:'1px solid rgba(255,255,255,0.1)'}}>{featured.sport}</div>}
                      {featured.position && <div style={{background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.8)',fontSize:'9px',fontWeight:'600',padding:'4px 8px',borderRadius:'100px',border:'1px solid rgba(255,255,255,0.1)'}}>{featured.position}</div>}
                    </div>
                    <button style={{background:'white',color:'#1A1A1A',fontSize:'11px',fontWeight:'700',padding:'7px 14px',borderRadius:'100px',border:'none',cursor:'pointer'}}>View</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {rest.length > 0 && (
          <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
              <div style={{fontFamily:'serif',fontSize:'18px',fontWeight:'900',color:'#1A1A1A',letterSpacing:'0.3px'}}>COACHES & TRAINERS</div>
              <div onClick={() => onNavigate('find')} style={{fontSize:'12px',fontWeight:'700',color:'#E3291A',cursor:'pointer'}}>See all</div>
            </div>
            <div style={{display:'flex',gap:'10px',overflowX:'auto',paddingBottom:'4px',marginBottom:'20px'}}>
              {rest.map(trainer => (
                <div key={trainer.id} onClick={() => onNavigate('find', trainer)} style={{background:'white',borderRadius:'14px',padding:'12px',minWidth:'140px',cursor:'pointer',border:'1.5px solid #EBEBEB',flexShrink:0}}>
                  <div style={{width:'48px',height:'48px',borderRadius:'12px',background:'linear-gradient(135deg,#E3291A,#9a1c10)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'serif',fontSize:'18px',color:'white',fontWeight:'900',marginBottom:'10px'}}>
                    {trainer.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
                  </div>
                  <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A',marginBottom:'2px'}}>{trainer.full_name}</div>
                  <div style={{fontSize:'10px',color:'#8A8A8A',marginBottom:'6px'}}>{trainer.sport} · {trainer.position}</div>
                  <div style={{fontSize:'11px',color:'#E3291A',fontWeight:'700'}}>${trainer.trainers?.price_per_hour || '—'}/hr</div>
                </div>
              ))}
            </div>
          </>
        )}

        {trainers.length === 0 && (
          <div style={{textAlign:'center',padding:'40px 0',color:'#8A8A8A'}}>
            <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>No coaches yet</div>
            <div style={{fontSize:'12px'}}>Be the first trainer to join PlayMaker</div>
          </div>
        )}

        <div style={{marginBottom:'20px'}}>
          <div style={{fontFamily:'serif',fontSize:'18px',fontWeight:'900',color:'#1A1A1A',letterSpacing:'0.3px',marginBottom:'12px'}}>UPCOMING EVENTS</div>
          {[
            {month:'Jun',day:'06',title:'Summer Hoops Classic',meta:'Mesa, AZ · U16',tag:'Tournament'},
            {month:'Jul',day:'12',title:'Elite Speed & Agility Camp',meta:'Scottsdale, AZ · 3 Days',tag:'Camp'},
            {month:'Aug',day:'01',title:'Fall Flag Football Registration',meta:'Phoenix, AZ · Ages 13–18',tag:'Season'},
          ].map((event,i) => (
            <div key={i} style={{background:'white',borderRadius:'12px',padding:'12px 14px',display:'flex',gap:'12px',alignItems:'center',border:'1.5px solid #EBEBEB',marginBottom:'8px',cursor:'pointer'}}>
              <div style={{background:'rgba(227,41,26,0.08)',borderRadius:'8px',padding:'6px 8px',textAlign:'center',minWidth:'44px'}}>
                <div style={{fontSize:'8px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',color:'#E3291A'}}>{event.month}</div>
                <div style={{fontFamily:'serif',fontSize:'22px',color:'#E3291A',lineHeight:1}}>{event.day}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A',marginBottom:'2px'}}>{event.title}</div>
                <div style={{fontSize:'10px',color:'#8A8A8A'}}>{event.meta}</div>
                <div style={{background:'rgba(227,41,26,0.08)',color:'#E3291A',fontSize:'9px',fontWeight:'700',padding:'2px 7px',borderRadius:'100px',textTransform:'uppercase',letterSpacing:'0.5px',marginTop:'5px',display:'inline-block'}}>{event.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
