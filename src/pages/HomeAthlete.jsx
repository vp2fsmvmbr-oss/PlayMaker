import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function HomeAthlete({ profile, onNavigate, onViewGroupSessions, onViewLeaderboard }) {
  const [trainers, setTrainers] = useState([])
  const [groupSessions, setGroupSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [sport, setSport] = useState('all')

  useEffect(() => { fetchTrainers(); fetchGroupSessions() }, [])

  async function fetchGroupSessions() {
    const { data } = await supabase
      .from('group_sessions')
      .select('*, trainer:profiles!group_sessions_trainer_id_fkey(id,full_name)')
      .eq('status', 'open')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(5)
    if (data) setGroupSessions(data)
  }

  async function fetchTrainers() {
    const { data } = await supabase
      .from('profiles')
      .select('*, trainers(*)')
      .eq('role', 'trainer')
    if (data) {
      const sorted = data.sort((a,b) => (b.trainers?.rating||0) - (a.trainers?.rating||0))
      setTrainers(sorted.slice(0,6))
    }
  }

  const filtered = sport === 'all' ? trainers : trainers.filter(t => t.sport === sport)
  const featured = filtered[0]
  const rest = filtered.slice(1)

  const firstName = profile?.full_name?.split(' ')[0]?.toUpperCase() || 'ATHLETE'

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'16px 20px 14px',background:'white',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{fontSize:'11px',color:'#8A8A8A',fontWeight:'500',marginBottom:'2px'}}>
          {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
        </div>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'26px',fontWeight:'900',color:'#1A1A1A',lineHeight:1.1,marginBottom:'4px'}}>
          LET'S GET TO WORK,<br/><span style={{color:'#E3291A'}}>{firstName}.</span>
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
              <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',fontWeight:'900',color:'#1A1A1A',letterSpacing:'0.3px'}}>TOP TRAINER NEAR YOU</div>
              <div onClick={() => onNavigate('find')} style={{fontSize:'12px',fontWeight:'700',color:'#E3291A',cursor:'pointer'}}>See all</div>
            </div>
            <div onClick={() => onNavigate('find', featured)} style={{background:'#1A1A1A',borderRadius:'16px',overflow:'hidden',position:'relative',height:'180px',cursor:'pointer',marginBottom:'20px'}}>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#1a1a1a 0%,#2d0a07 60%,#1a1a1a 100%)'}} />
              <div style={{position:'absolute',top:'-40px',right:'-40px',width:'180px',height:'180px',background:'radial-gradient(circle,rgba(227,41,26,0.4) 0%,transparent 65%)'}} />
              <div style={{position:'absolute',inset:0,padding:'18px',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                <div style={{background:'#E3291A',borderRadius:'100px',padding:'4px 10px',fontSize:'9px',fontWeight:'700',color:'white',letterSpacing:'1px',textTransform:'uppercase',width:'fit-content'}}>Featured</div>
                <div>
                  <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'22px',color:'white',fontWeight:'900',letterSpacing:'0.5px',lineHeight:1,marginBottom:'3px'}}>{featured.full_name?.toUpperCase()}</div>
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
              <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',fontWeight:'900',color:'#1A1A1A',letterSpacing:'0.3px'}}>COACHES & TRAINERS</div>
              <div onClick={() => onNavigate('find')} style={{fontSize:'12px',fontWeight:'700',color:'#E3291A',cursor:'pointer'}}>See all</div>
            </div>
            <div style={{display:'flex',gap:'10px',overflowX:'auto',paddingBottom:'4px',marginBottom:'20px'}}>
              {rest.map(trainer => (
                <div key={trainer.id} onClick={() => onNavigate('find', trainer)} style={{background:'white',borderRadius:'14px',padding:'12px',minWidth:'140px',cursor:'pointer',border:'1.5px solid #EBEBEB',flexShrink:0}}>
                  <div style={{width:'48px',height:'48px',borderRadius:'12px',background:'linear-gradient(135deg,#E3291A,#9a1c10)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'white',fontWeight:'900',marginBottom:'10px'}}>
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

        <div style={{marginBottom:'20px',display:'flex',gap:'10px'}}>
          <div onClick={onViewLeaderboard} style={{flex:1,background:'#1A1A1A',borderRadius:'14px',padding:'16px',cursor:'pointer',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:'-20px',right:'-20px',width:'80px',height:'80px',background:'radial-gradient(circle,rgba(227,41,26,0.4) 0%,transparent 65%)'}} />
            <div style={{fontSize:'24px',marginBottom:'6px',position:'relative'}}>🏆</div>
            <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'white',letterSpacing:'0.5px',position:'relative'}}>Leaderboard</div>
            <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',position:'relative'}}>Top trainers & athletes</div>
          </div>
          <div onClick={onViewGroupSessions} style={{flex:1,background:'white',borderRadius:'14px',padding:'16px',cursor:'pointer',border:'1.5px solid #EBEBEB'}}>
            <div style={{fontSize:'24px',marginBottom:'6px'}}>👥</div>
            <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'#1A1A1A',letterSpacing:'0.5px'}}>Group Sessions</div>
            <div style={{fontSize:'11px',color:'#8A8A8A'}}>Join group training</div>
          </div>
        </div>

        <div style={{marginBottom:'20px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
            <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'#1A1A1A',letterSpacing:'0.3px'}}>LOCAL EVENTS</div>
            <div onClick={onViewGroupSessions} style={{fontSize:'12px',fontWeight:'700',color:'#E3291A',cursor:'pointer'}}>See all</div>
          </div>
          {groupSessions.length === 0 ? (
            <div style={{background:'white',borderRadius:'14px',border:'1.5px solid #EBEBEB',padding:'20px',textAlign:'center'}}>
              <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'6px'}}>No Events Yet</div>
              <div style={{fontSize:'12px',color:'#8A8A8A',lineHeight:1.5}}>Group training sessions and local events will appear here.</div>
            </div>
          ) : groupSessions.map(gs => (
            <div key={gs.id} onClick={onViewGroupSessions} style={{background:'white',borderRadius:'12px',padding:'12px 14px',display:'flex',gap:'12px',alignItems:'center',border:'1.5px solid #EBEBEB',marginBottom:'8px',cursor:'pointer'}}>
              <div style={{background:'rgba(227,41,26,0.08)',borderRadius:'8px',padding:'6px 8px',textAlign:'center',minWidth:'44px',flexShrink:0}}>
                <div style={{fontSize:'8px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',color:'#E3291A'}}>{new Date(gs.date).toLocaleDateString('en-US',{month:'short'})}</div>
                <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'22px',color:'#E3291A',lineHeight:1}}>{new Date(gs.date).getDate()}</div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A',marginBottom:'2px'}}>{gs.title}</div>
                <div style={{fontSize:'10px',color:'#8A8A8A'}}>with {gs.trainer?.full_name} · {gs.time}</div>
                <div style={{display:'flex',gap:'6px',marginTop:'4px'}}>
                  <div style={{background:'rgba(227,41,26,0.08)',color:'#E3291A',fontSize:'9px',fontWeight:'700',padding:'2px 7px',borderRadius:'100px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Group</div>
                  <div style={{background:'#F7F7F5',color:'#8A8A8A',fontSize:'9px',fontWeight:'700',padding:'2px 7px',borderRadius:'100px'}}>${gs.price_per_athlete}/athlete · {gs.max_athletes - gs.current_athletes} spots left</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
