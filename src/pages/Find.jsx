import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Find({ onSelectTrainer }) {
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sport, setSport] = useState('all')

  useEffect(() => {
    fetchTrainers()
  }, [])

  async function fetchTrainers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*, trainers(*)')
      .eq('role', 'trainer')
    if (!error) setTrainers(data || [])
    setLoading(false)
  }

  const sports = ['all', 'football', 'basketball']
  const filtered = sport === 'all' ? trainers : trainers.filter(t => t.sport === sport)

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'16px 20px 12px',background:'white',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{fontFamily:'serif',fontSize:'24px',fontWeight:'900',color:'#1A1A1A',marginBottom:'12px',letterSpacing:'0.5px'}}>
          Find Your Coach
        </div>
        <div style={{display:'flex',gap:'6px'}}>
          {sports.map(s => (
            <button key={s} onClick={() => setSport(s)} style={{padding:'7px 14px',borderRadius:'100px',fontSize:'12px',fontWeight:'600',border:'none',background:sport===s?'#E3291A':'#F7F7F5',color:sport===s?'white':'#8A8A8A',cursor:'pointer',textTransform:'capitalize'}}>
              {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:'12px 16px 20px',display:'flex',flexDirection:'column',gap:'12px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'#8A8A8A',fontSize:'14px'}}>Loading coaches...</div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'40px'}}>
            <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'8px'}}>No coaches yet</div>
            <div style={{fontSize:'12px',color:'#8A8A8A'}}>Be the first trainer to join PlayMaker in Phoenix</div>
          </div>
        ) : (
          filtered.map(trainer => (
            <div key={trainer.id} onClick={() => onSelectTrainer(trainer)} style={{background:'#1A1A1A',borderRadius:'18px',overflow:'hidden',position:'relative',cursor:'pointer'}}>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#1a1a1a 0%,#2d0a07 60%,#1a1a1a 100%)'}} />
              <div style={{position:'absolute',top:'-40px',right:'-40px',width:'170px',height:'170px',background:'radial-gradient(circle,rgba(227,41,26,0.4) 0%,transparent 65%)'}} />
              <div style={{position:'relative',padding:'18px',display:'flex',flexDirection:'column',gap:'12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:'serif',fontSize:'22px',color:'white',fontWeight:'900',letterSpacing:'0.5px',lineHeight:1,marginBottom:'3px'}}>
                      {trainer.full_name?.toUpperCase() || 'TRAINER'}
                    </div>
                    <div style={{fontSize:'11px',color:'rgba(255,255,255,0.5)',marginBottom:'6px'}}>
                      {trainer.sport?.charAt(0).toUpperCase() + trainer.sport?.slice(1) || 'Sport'} · {trainer.position || 'Coach'}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'3px',fontSize:'12px',fontWeight:'700',color:'white'}}>
                        <span style={{color:'#f59e0b'}}>★★★★★</span> {trainer.trainers?.rating || '5.0'}
                      </div>
                      <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)'}}>New</div>
                    </div>
                  </div>
                  <div style={{width:'48px',height:'48px',borderRadius:'12px',background:'linear-gradient(135deg,#E3291A,#9a1c10)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'serif',fontSize:'18px',color:'white',fontWeight:'900',border:'2px solid rgba(255,255,255,0.1)'}}>
                    {trainer.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'T'}
                  </div>
                </div>
                <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                  {trainer.sport && <div style={{background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.75)',fontSize:'9px',fontWeight:'600',padding:'4px 8px',borderRadius:'100px',border:'1px solid rgba(255,255,255,0.1)'}}>{trainer.sport}</div>}
                  {trainer.position && <div style={{background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.75)',fontSize:'9px',fontWeight:'600',padding:'4px 8px',borderRadius:'100px',border:'1px solid rgba(255,255,255,0.1)'}}>{trainer.position}</div>}
                  {trainer.location && <div style={{background:'rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.75)',fontSize:'9px',fontWeight:'600',padding:'4px 8px',borderRadius:'100px',border:'1px solid rgba(255,255,255,0.1)'}}>{trainer.location}</div>}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'4px',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
                  <div style={{display:'flex',gap:'12px'}}>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.45)'}}>Exp: <strong style={{color:'rgba(255,255,255,0.8)'}}>{trainer.trainers?.years_experience || '—'} yrs</strong></div>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.45)'}}>Rate: <strong style={{color:'rgba(255,255,255,0.8)'}}>{'$' + (trainer.trainers?.price_per_hour || '—') + '/hr'}</strong></div>
                  </div>
                  <button style={{background:'#E3291A',color:'white',fontSize:'11px',fontWeight:'700',padding:'8px 16px',borderRadius:'100px',border:'none',cursor:'pointer'}}>
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
