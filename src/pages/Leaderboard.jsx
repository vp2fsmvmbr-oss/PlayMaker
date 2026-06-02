import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Leaderboard({ session, onBack }) {
  const [tab, setTab] = useState('trainers')
  const [topTrainers, setTopTrainers] = useState([])
  const [topAthletes, setTopAthletes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchLeaderboards() }, [])

  async function fetchLeaderboards() {
    setLoading(true)
    const [trainersRes, athletesRes] = await Promise.all([
      supabase.from('profiles').select('*, trainers(*)').eq('role', 'trainer').not('trainers', 'is', null),
      supabase.from('bookings').select('athlete_id, athlete:profiles!bookings_athlete_id_fkey(id,full_name,sport,position,school)').eq('status', 'confirmed')
    ])

    if (trainersRes.data) {
      const sorted = trainersRes.data
        .filter(t => t.trainers?.review_count > 0)
        .sort((a,b) => (b.trainers?.rating||0) - (a.trainers?.rating||0) || (b.trainers?.review_count||0) - (a.trainers?.review_count||0))
        .slice(0, 10)
      setTopTrainers(sorted)
    }

    if (athletesRes.data) {
      const counts = {}
      const profiles = {}
      athletesRes.data.forEach(b => {
        counts[b.athlete_id] = (counts[b.athlete_id] || 0) + 1
        if (b.athlete) profiles[b.athlete_id] = b.athlete
      })
      const sorted = Object.entries(counts)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id, count]) => ({ ...profiles[id], session_count: count }))
      setTopAthletes(sorted)
    }

    setLoading(false)
  }

  const medals = ['🥇','🥈','🥉']

  return (
    <div style={{minHeight:'100%',background:'#F7F7F5'}}>
      <div style={{background:'#1A1A1A',padding:'20px 18px 0',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-40px',right:'-40px',width:'180px',height:'180px',background:'radial-gradient(circle,rgba(227,41,26,0.35) 0%,transparent 65%)'}} />
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px',position:'relative'}}>
          <button onClick={onBack} style={{width:'34px',height:'34px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',border:'none',fontSize:'20px',cursor:'pointer',color:'white',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'24px',color:'white',letterSpacing:'1px'}}>LEADERBOARD</div>
        </div>
        <div style={{display:'flex',position:'relative'}}>
          {['trainers','athletes'].map(t => (
            <div key={t} onClick={() => setTab(t)} style={{flex:1,padding:'12px',textAlign:'center',fontSize:'12px',fontWeight:'700',color:tab===t?'white':'rgba(255,255,255,0.4)',cursor:'pointer',borderBottom:tab===t?'2px solid #E3291A':'2px solid transparent',textTransform:'uppercase',letterSpacing:'0.5px'}}>
              {t === 'trainers' ? 'Top Trainers' : 'Top Athletes'}
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:'16px 18px 80px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'#8A8A8A'}}>Loading...</div>
        ) : tab === 'trainers' ? (
          topTrainers.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 20px',background:'white',borderRadius:'14px',border:'1.5px solid #EBEBEB'}}>
              <div style={{fontSize:'32px',marginBottom:'12px'}}>🏆</div>
              <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'6px'}}>No Rankings Yet</div>
              <div style={{fontSize:'12px',color:'#8A8A8A'}}>Rankings appear once trainers receive reviews</div>
            </div>
          ) : topTrainers.map((trainer, i) => (
            <div key={trainer.id} style={{background:'white',borderRadius:'14px',border:i===0?'1.5px solid rgba(227,41,26,0.2)':'1.5px solid #EBEBEB',padding:'14px 16px',display:'flex',gap:'12px',alignItems:'center',marginBottom:'8px',boxShadow:i===0?'0 4px 16px rgba(227,41,26,0.1)':'none'}}>
              <div style={{fontSize:'24px',flexShrink:0,width:'32px',textAlign:'center'}}>{medals[i] || `${i+1}`}</div>
              <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'linear-gradient(135deg,#E3291A,#9a1c10)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'white',flexShrink:0}}>
                {trainer.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'2px'}}>
                  <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'#1A1A1A',letterSpacing:'0.3px'}}>{trainer.full_name}</div>
                  {trainer.trainers?.verified && <div style={{background:'#3b82f6',borderRadius:'50%',width:'14px',height:'14px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'8px',color:'white',flexShrink:0}}>✓</div>}
                </div>
                <div style={{fontSize:'11px',color:'#8A8A8A'}}>{trainer.sport} · {trainer.position}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#E3291A',lineHeight:1}}>⭐ {trainer.trainers?.rating?.toFixed(1)}</div>
                <div style={{fontSize:'10px',color:'#8A8A8A'}}>{trainer.trainers?.review_count} reviews</div>
              </div>
            </div>
          ))
        ) : (
          topAthletes.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 20px',background:'white',borderRadius:'14px',border:'1.5px solid #EBEBEB'}}>
              <div style={{fontSize:'32px',marginBottom:'12px'}}>🏆</div>
              <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'6px'}}>No Rankings Yet</div>
              <div style={{fontSize:'12px',color:'#8A8A8A'}}>Rankings appear once athletes complete sessions</div>
            </div>
          ) : topAthletes.map((athlete, i) => (
            <div key={athlete.id} style={{background:'white',borderRadius:'14px',border:i===0?'1.5px solid rgba(227,41,26,0.2)':'1.5px solid #EBEBEB',padding:'14px 16px',display:'flex',gap:'12px',alignItems:'center',marginBottom:'8px',boxShadow:i===0?'0 4px 16px rgba(227,41,26,0.1)':'none'}}>
              <div style={{fontSize:'24px',flexShrink:0,width:'32px',textAlign:'center'}}>{medals[i] || `${i+1}`}</div>
              <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'linear-gradient(135deg,#1a4a8a,#0a2d5e)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'white',flexShrink:0}}>
                {athlete.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'#1A1A1A',letterSpacing:'0.3px',marginBottom:'2px'}}>{athlete.full_name}</div>
                <div style={{fontSize:'11px',color:'#8A8A8A'}}>{athlete.sport} · {athlete.position} {athlete.school ? `· ${athlete.school}` : ''}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#E3291A',lineHeight:1}}>{athlete.session_count}</div>
                <div style={{fontSize:'10px',color:'#8A8A8A'}}>sessions</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
