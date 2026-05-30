import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Find({ onSelectTrainer, session }) {
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sport, setSport] = useState('all')

  useEffect(() => { fetchTrainers() }, [])

  async function fetchTrainers() {
    setLoading(true)
    const { data: blocksData } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', session.user.id)
    const blockedIds = (blocksData || []).map(b => b.blocked_id)

    const { data } = await supabase
      .from('profiles')
      .select('*, trainers(*)')
      .eq('role', 'trainer')
    if (data) setTrainers(data.filter(t => !blockedIds.includes(t.id)))
    setLoading(false)
  }

  const filtered = sport === 'all' ? trainers : trainers.filter(t => t.sport === sport)

  return (
    <div style={{flex:1,overflowY:'auto',background:'#F7F7F5'}}>
      <div style={{padding:'16px 20px 12px',background:'white',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'26px',color:'#1A1A1A',letterSpacing:'1px',marginBottom:'12px'}}>Find Your Coach</div>
        <div style={{display:'flex',gap:'8px'}}>
          {['all','football','basketball'].map(s => (
            <button key={s} onClick={() => setSport(s)} style={{padding:'8px 16px',borderRadius:'100px',fontSize:'12px',fontWeight:'700',border:'none',background:sport===s?'#E3291A':'#F7F7F5',color:sport===s?'white':'#8A8A8A',cursor:'pointer',textTransform:'capitalize',letterSpacing:'0.3px'}}>
              {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:'6px 16px 4px',display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'10px'}}>
        <div style={{fontSize:'12px',color:'#8A8A8A',fontWeight:'500'}}>{filtered.length} coaches near Phoenix, AZ</div>
        <div style={{fontSize:'12px',fontWeight:'600',color:'#1A1A1A'}}>Sort: Nearest ▾</div>
      </div>
      <div style={{padding:'8px 16px 80px',display:'flex',flexDirection:'column',gap:'12px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'#8A8A8A',fontSize:'14px'}}>Loading coaches...</div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>No coaches yet</div>
            <div style={{fontSize:'12px',color:'#8A8A8A'}}>Be the first trainer to join PlayMaker in Phoenix</div>
          </div>
        ) : filtered.map(trainer => (
          <div key={trainer.id} onClick={() => onSelectTrainer(trainer)} style={{background:'#1A1A1A',borderRadius:'20px',overflow:'hidden',position:'relative',cursor:'pointer',boxShadow:'0 4px 20px rgba(0,0,0,0.15)'}}>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#1a1a1a 0%,#2d0a07 60%,#1a1a1a 100%)'}} />
            <div style={{position:'absolute',top:'-50px',right:'-50px',width:'200px',height:'200px',background:'radial-gradient(circle,rgba(227,41,26,0.4) 0%,transparent 65%)'}} />
            <div style={{position:'absolute',inset:0,opacity:0.03,backgroundImage:'repeating-linear-gradient(45deg,#fff 0px,#fff 1px,transparent 1px,transparent 14px)'}} />
            <div style={{position:'relative',padding:'20px',display:'flex',flexDirection:'column',gap:'14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'26px',color:'white',letterSpacing:'1px',lineHeight:1,marginBottom:'4px'}}>
                    {trainer.full_name?.toUpperCase() || 'TRAINER'}
                  </div>
                  <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',marginBottom:'8px'}}>
                    {trainer.sport?.charAt(0).toUpperCase()+trainer.sport?.slice(1) || 'Sport'} · {trainer.position || 'Coach'}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'13px',fontWeight:'700',color:'white'}}>
                      <span style={{color:'#f59e0b'}}>★★★★★</span> {trainer.trainers?.rating || '5.0'}
                    </div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.35)'}}>New on PlayMaker</div>
                  </div>
                </div>
                <div style={{width:'52px',height:'52px',borderRadius:'14px',background:'linear-gradient(135deg,#E3291A,#9a1c10)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'white',border:'2px solid rgba(255,255,255,0.1)',flexShrink:0}}>
                  {trainer.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase() || 'T'}
                </div>
              </div>
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                {trainer.sport && <div style={{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.8)',fontSize:'10px',fontWeight:'600',padding:'5px 10px',borderRadius:'100px',border:'1px solid rgba(255,255,255,0.1)'}}>{trainer.sport}</div>}
                {trainer.position && <div style={{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.8)',fontSize:'10px',fontWeight:'600',padding:'5px 10px',borderRadius:'100px',border:'1px solid rgba(255,255,255,0.1)'}}>{trainer.position}</div>}
                {trainer.location && <div style={{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.8)',fontSize:'10px',fontWeight:'600',padding:'5px 10px',borderRadius:'100px',border:'1px solid rgba(255,255,255,0.1)'}}>{trainer.location}</div>}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'4px',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
                <div style={{display:'flex',gap:'16px'}}>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>Exp: <strong style={{color:'rgba(255,255,255,0.85)',fontSize:'12px'}}>{trainer.trainers?.years_experience || '—'} yrs</strong></div>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>Rate: <strong style={{color:'rgba(255,255,255,0.85)',fontSize:'12px'}}>${trainer.trainers?.price_per_hour || '—'}/hr</strong></div>
                </div>
                <button style={{background:'#E3291A',color:'white',fontSize:'12px',fontWeight:'700',padding:'9px 18px',borderRadius:'100px',border:'none',cursor:'pointer',letterSpacing:'0.3px'}}>
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
