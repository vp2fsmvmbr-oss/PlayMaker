import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function GroupSessions({ session, onBack }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(null)
  const [joined, setJoined] = useState([])

  useEffect(() => { fetchSessions(); fetchJoined() }, [])

  async function fetchSessions() {
    setLoading(true)
    const { data } = await supabase
      .from('group_sessions')
      .select('*, trainer:profiles!group_sessions_trainer_id_fkey(id,full_name,sport,position,location)')
      .eq('status', 'open')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
    if (data) setSessions(data)
    setLoading(false)
    return data
  }

  async function fetchJoined() {
    const { data } = await supabase
      .from('group_session_athletes')
      .select('session_id')
      .eq('athlete_id', session.user.id)
    if (data) setJoined(data.map(d => d.session_id))
  }

  async function joinSession(groupSession) {
    if (groupSession.current_athletes >= groupSession.max_athletes) return
    setJoining(groupSession.id)
    await supabase.from('group_session_athletes').insert({
      session_id: groupSession.id,
      athlete_id: session.user.id
    })
    await supabase.rpc('increment_group_session', { session_id: groupSession.id })

    await supabase.from('notifications').insert({
      user_id: groupSession.trainer_id,
      title: 'New Athlete Joined',
      body: `An athlete joined your group session "${groupSession.title}" on ${new Date(groupSession.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}.`
    })

    setJoining(null)
    await fetchSessions()
    await fetchJoined()
  }

  async function leaveSession(groupSession) {
    setJoining(groupSession.id)
    await supabase.from('group_session_athletes').delete()
      .eq('session_id', groupSession.id)
      .eq('athlete_id', session.user.id)
    await supabase.rpc('decrement_group_session', { session_id: groupSession.id })
    setJoining(null)
    await fetchSessions()
    await fetchJoined()
  }

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{background:'white',padding:'14px 18px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #EBEBEB'}}>
        <button onClick={onBack} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px'}}>Group Sessions</div>
      </div>

      <div style={{padding:'16px 18px 80px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'#8A8A8A'}}>Loading...</div>
        ) : sessions.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 20px',background:'white',borderRadius:'14px',border:'1.5px solid #EBEBEB'}}>
            <div style={{fontSize:'32px',marginBottom:'12px'}}>👥</div>
            <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'6px'}}>No Group Sessions Yet</div>
            <div style={{fontSize:'12px',color:'#8A8A8A'}}>Coaches will post group training sessions here</div>
          </div>
        ) : sessions.map(gs => {
          const isJoined = joined.includes(gs.id)
          const isFull = gs.current_athletes >= gs.max_athletes
          const spotsLeft = gs.max_athletes - gs.current_athletes
          return (
            <div key={gs.id} style={{background:'white',borderRadius:'16px',border:'1.5px solid #EBEBEB',overflow:'hidden',marginBottom:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{background:'#1A1A1A',padding:'16px 18px',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:'-30px',right:'-30px',width:'120px',height:'120px',background:'radial-gradient(circle,rgba(227,41,26,0.35) 0%,transparent 65%)'}} />
                <div style={{position:'relative'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'6px'}}>
                    <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'white',letterSpacing:'0.5px',lineHeight:1}}>{gs.title.toUpperCase()}</div>
                    <div style={{background:isFull?'rgba(255,255,255,0.1)':'rgba(34,197,94,0.2)',color:isFull?'rgba(255,255,255,0.4)':'#22c55e',fontSize:'10px',fontWeight:'700',padding:'4px 8px',borderRadius:'100px',border:isFull?'1px solid rgba(255,255,255,0.1)':'1px solid rgba(34,197,94,0.3)',flexShrink:0,marginLeft:'8px'}}>
                      {isFull ? 'FULL' : `${spotsLeft} spots left`}
                    </div>
                  </div>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,0.5)'}}>with {gs.trainer?.full_name} · {gs.sport}</div>
                </div>
              </div>

              <div style={{padding:'14px 18px'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                  {[
                    {label:'Date',value:new Date(gs.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})},
                    {label:'Time',value:gs.time},
                    {label:'Duration',value:`${gs.duration} min`},
                    {label:'Price',value:`$${gs.price_per_athlete}/athlete`},
                  ].map((item,i) => (
                    <div key={i} style={{background:'#F7F7F5',borderRadius:'8px',padding:'8px 10px'}}>
                      <div style={{fontSize:'9px',fontWeight:'700',textTransform:'uppercase',color:'#8A8A8A',marginBottom:'2px'}}>{item.label}</div>
                      <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A'}}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {gs.location && (
                  <div style={{fontSize:'12px',color:'#8A8A8A',marginBottom:'10px'}}>📍 {gs.location}</div>
                )}

                {gs.description && (
                  <div style={{fontSize:'12px',color:'#1A1A1A',lineHeight:1.5,marginBottom:'12px'}}>{gs.description}</div>
                )}

                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
                  <div style={{flex:1,background:'#EBEBEB',borderRadius:'100px',height:'6px',overflow:'hidden'}}>
                    <div style={{background:'#E3291A',height:'100%',width:`${(gs.current_athletes/gs.max_athletes)*100}%`,borderRadius:'100px',transition:'width 0.3s'}} />
                  </div>
                  <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A'}}>{gs.current_athletes}/{gs.max_athletes}</div>
                </div>

                <button
                  onClick={() => isJoined ? leaveSession(gs) : joinSession(gs)}
                  disabled={joining===gs.id || (isFull && !isJoined)}
                  style={{width:'100%',background:isJoined?'#F7F7F5':isFull?'#F7F7F5':'#E3291A',color:isJoined?'#E3291A':isFull?'#8A8A8A':'white',border:isJoined?'1.5px solid #E3291A':'none',borderRadius:'10px',padding:'12px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',letterSpacing:'0.5px',cursor:isFull&&!isJoined?'not-allowed':'pointer'}}
                >
                  {joining===gs.id ? 'Loading...' : isJoined ? 'Leave Session' : isFull ? 'Session Full' : 'Join Session'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
