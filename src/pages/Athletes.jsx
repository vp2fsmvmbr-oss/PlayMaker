import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Athletes({ onSelectAthlete }) {
  const [athletes, setAthletes] = useState([])
  const [loading, setLoading] = useState(true)
  const [sport, setSport] = useState('all')

  useEffect(() => { fetchAthletes() }, [])

  async function fetchAthletes() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').eq('role', 'athlete')
    if (data) setAthletes(data)
    setLoading(false)
  }

  const filtered = sport === 'all' ? athletes : athletes.filter(a => a.sport === sport)

  return (
    <div style={{flex:1,overflowY:'auto',background:'#F7F7F5'}}>
      <div style={{padding:'16px 20px 12px',background:'white',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'26px',color:'#1A1A1A',letterSpacing:'1px',marginBottom:'12px'}}>Find Athletes</div>
        <div style={{display:'flex',gap:'8px'}}>
          {['all','football','basketball'].map(s => (
            <button key={s} onClick={() => setSport(s)} style={{padding:'8px 16px',borderRadius:'100px',fontSize:'12px',fontWeight:'700',border:'none',background:sport===s?'#E3291A':'#F7F7F5',color:sport===s?'white':'#8A8A8A',cursor:'pointer',textTransform:'capitalize'}}>
              {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:'12px 16px 80px',display:'flex',flexDirection:'column',gap:'10px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'#8A8A8A'}}>Loading athletes...</div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>No athletes yet</div>
            <div style={{fontSize:'12px',color:'#8A8A8A'}}>Athletes will appear here as they join PlayMaker</div>
          </div>
        ) : filtered.map(athlete => (
          <div key={athlete.id} onClick={() => onSelectAthlete(athlete)} style={{background:'white',borderRadius:'16px',border:'1.5px solid #EBEBEB',overflow:'hidden',cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <div style={{background:'#1A1A1A',padding:'16px 18px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:'-30px',right:'-30px',width:'120px',height:'120px',background:'radial-gradient(circle,rgba(227,41,26,0.35) 0%,transparent 65%)'}} />
              <div style={{display:'flex',alignItems:'center',gap:'12px',position:'relative'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'13px',background:'linear-gradient(135deg,#E3291A,#9a1c10)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'white',flexShrink:0}}>
                  {athlete.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase() || '?'}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'white',letterSpacing:'0.5px',lineHeight:1,marginBottom:'3px'}}>
                    {athlete.full_name?.toUpperCase() || 'ATHLETE'}
                  </div>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,0.5)'}}>
                    {athlete.position || 'Position not set'} · {athlete.sport || 'Sport not set'}
                  </div>
                </div>
                <div style={{color:'rgba(255,255,255,0.3)',fontSize:'20px'}}>›</div>
              </div>
            </div>
            {(athlete.height || athlete.weight || athlete.forty_time || athlete.vertical) && (
              <div style={{padding:'12px 18px',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px'}}>
                {[
                  {label:'Height',value:athlete.height||'—'},
                  {label:'Weight',value:athlete.weight||'—'},
                  {label:'40 Yard',value:athlete.forty_time||'—'},
                  {label:'Vertical',value:athlete.vertical||'—'},
                ].map((s,i) => (
                  <div key={i} style={{textAlign:'center',background:'#F7F7F5',borderRadius:'8px',padding:'8px 4px'}}>
                    <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A',marginBottom:'2px'}}>{s.value}</div>
                    <div style={{fontSize:'9px',color:'#8A8A8A',fontWeight:'600',textTransform:'uppercase'}}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
            {!athlete.height && !athlete.weight && (
              <div style={{padding:'12px 18px'}}>
                <div style={{fontSize:'12px',color:'#8A8A8A'}}>Profile stats not added yet</div>
              </div>
            )}
            {(athlete.sport || athlete.school) && (
              <div style={{padding:'0 18px 12px',display:'flex',gap:'6px',flexWrap:'wrap'}}>
                {athlete.sport && <div style={{background:'rgba(227,41,26,0.08)',color:'#E3291A',fontSize:'10px',fontWeight:'600',padding:'4px 10px',borderRadius:'100px',border:'1px solid rgba(227,41,26,0.15)'}}>{athlete.sport}</div>}
                {athlete.school && <div style={{background:'#F7F7F5',color:'#1A1A1A',fontSize:'10px',fontWeight:'600',padding:'4px 10px',borderRadius:'100px',border:'1.5px solid #EBEBEB'}}>{athlete.school}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
