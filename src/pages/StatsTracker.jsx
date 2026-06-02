import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function StatsTracker({ session, onBack }) {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    forty_time: '',
    vertical: '',
    weight: '',
    height: '',
    bench_press: '',
    squat: '',
    notes: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    const { data } = await supabase
      .from('athlete_stats')
      .select('*')
      .eq('athlete_id', session.user.id)
      .order('date', { ascending: true })
    if (data) setStats(data)
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    await supabase.from('athlete_stats').insert({
      athlete_id: session.user.id,
      date: form.date,
      forty_time: parseFloat(form.forty_time) || null,
      vertical: parseInt(form.vertical) || null,
      weight: parseInt(form.weight) || null,
      height: form.height || null,
      bench_press: parseInt(form.bench_press) || null,
      squat: parseInt(form.squat) || null,
      notes: form.notes || null
    })
    setForm({ date: new Date().toISOString().split('T')[0], forty_time: '', vertical: '', weight: '', height: '', bench_press: '', squat: '', notes: '' })
    setShowForm(false)
    setSaving(false)
    fetchStats()
  }

  async function deleteEntry(id) {
    if (!window.confirm('Delete this entry?')) return
    await supabase.from('athlete_stats').delete().eq('id', id)
    fetchStats()
  }

  function getImprovement(key) {
    const validStats = stats.filter(s => s[key] !== null)
    if (validStats.length < 2) return null
    const latest = validStats[validStats.length - 1][key]
    const first = validStats[0][key]
    const diff = latest - first
    const improved = key === 'forty_time' ? diff < 0 : diff > 0
    return { diff: Math.abs(diff).toFixed(key === 'forty_time' ? 2 : 0), improved, direction: diff > 0 ? '+' : '-' }
  }

  const metrics = [
    { key: 'forty_time', label: '40 Yard', unit: 's' },
    { key: 'height', label: 'Height', unit: '' },
    { key: 'vertical', label: 'Vertical', unit: '"' },
    { key: 'weight', label: 'Weight', unit: 'lbs' },
    { key: 'bench_press', label: 'Bench', unit: 'lbs' },
    { key: 'squat', label: 'Squat', unit: 'lbs' },
  ]

  const latestStats = stats.length > 0 ? stats[stats.length - 1] : null

  return (
    <div style={{minHeight:'100%',background:'#F7F7F5'}}>
      <div style={{background:'white',padding:'14px 18px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #EBEBEB',position:'sticky',top:0,zIndex:10}}>
        <button onClick={onBack} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
        <div style={{flex:1,fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px'}}>Stats Tracker</div>
        <button onClick={() => setShowForm(!showForm)} style={{background:'#E3291A',color:'white',border:'none',borderRadius:'100px',padding:'8px 16px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>
          {showForm ? 'Cancel' : '+ Log Stats'}
        </button>
      </div>

      {showForm && (
        <div style={{background:'white',padding:'16px 18px',borderBottom:'1px solid #EBEBEB'}}>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'12px'}}>Log Today's Stats</div>
          <div style={{marginBottom:'10px'}}>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Date</div>
            <input type='date' value={form.date} onChange={e => setForm({...form,date:e.target.value})} style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'13px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A'}} />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'10px'}}>
            {[
              {key:'forty_time',label:'40 Yard (s)',placeholder:'4.5'},
              {key:'vertical',label:'Vertical (in)',placeholder:'32'},
              {key:'weight',label:'Weight (lbs)',placeholder:'185'},
              {key:'height',label:'Height',placeholder:"6'2\""},
              {key:'bench_press',label:'Bench (lbs)',placeholder:'185'},
              {key:'squat',label:'Squat (lbs)',placeholder:'225'},
            ].map(field => (
              <div key={field.key}>
                <div style={{fontSize:'10px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'4px'}}>{field.label}</div>
                <input value={form[field.key]} onChange={e => setForm({...form,[field.key]:e.target.value})} placeholder={field.placeholder} style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1.5px solid #EBEBEB',fontSize:'13px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A'}} />
              </div>
            ))}
          </div>
          <div style={{marginBottom:'12px'}}>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Notes</div>
            <input value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} placeholder='e.g. After 4 weeks of speed training' style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'13px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A'}} />
          </div>
          <button onClick={handleSave} disabled={saving} style={{width:'100%',background:saving?'rgba(227,41,26,0.5)':'#E3291A',color:'white',border:'none',borderRadius:'10px',padding:'12px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',letterSpacing:'0.5px',cursor:'pointer'}}>
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      )}

      <div style={{padding:'16px 18px 80px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'#8A8A8A'}}>Loading...</div>
        ) : stats.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 20px',background:'white',borderRadius:'14px',border:'1.5px solid #EBEBEB'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>📊</div>
            <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'6px'}}>No Stats Yet</div>
            <div style={{fontSize:'12px',color:'#8A8A8A',marginBottom:'16px'}}>Start logging your stats to track your progress over time</div>
            <button onClick={() => setShowForm(true)} style={{background:'#E3291A',color:'white',border:'none',borderRadius:'100px',padding:'10px 24px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>Log First Entry</button>
          </div>
        ) : (
          <>
            <div style={{background:'#1A1A1A',borderRadius:'16px',padding:'18px',marginBottom:'16px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:'-40px',right:'-40px',width:'160px',height:'160px',background:'radial-gradient(circle,rgba(227,41,26,0.35) 0%,transparent 65%)'}} />
              <div style={{position:'relative'}}>
                <div style={{fontSize:'9px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1.5px',color:'rgba(255,255,255,0.35)',marginBottom:'10px'}}>Current Stats</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px'}}>
                  {metrics.map(m => {
                    const imp = getImprovement(m.key)
                    return (
                      <div key={m.key} style={{textAlign:'center'}}>
                        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'22px',color:'white',lineHeight:1,marginBottom:'2px'}}>
                          {latestStats?.[m.key] ? `${latestStats[m.key]}${m.unit}` : '—'}
                        </div>
                        <div style={{fontSize:'9px',color:'rgba(255,255,255,0.4)',fontWeight:'600',textTransform:'uppercase',marginBottom:'3px'}}>{m.label}</div>
                        {imp && (
                          <div style={{fontSize:'10px',fontWeight:'700',color:imp.improved?'#22c55e':'#E3291A'}}>
                            {imp.improved?'▲':'▼'} {imp.diff}{m.unit}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'#1A1A1A',letterSpacing:'0.3px',marginBottom:'12px'}}>HISTORY</div>
            {[...stats].reverse().map(entry => (
              <div key={entry.id} style={{background:'white',borderRadius:'14px',border:'1.5px solid #EBEBEB',padding:'14px',marginBottom:'8px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                  <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'#1A1A1A',letterSpacing:'0.5px'}}>
                    {new Date(entry.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}
                  </div>
                  <button onClick={() => deleteEntry(entry.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'16px',color:'#8A8A8A',padding:'4px'}}>🗑</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'6px'}}>
                  {metrics.filter(m => entry[m.key]).map(m => (
                    <div key={m.key} style={{background:'#F7F7F5',borderRadius:'8px',padding:'8px 10px',textAlign:'center'}}>
                      <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A'}}>{entry[m.key]}{m.unit}</div>
                      <div style={{fontSize:'9px',color:'#8A8A8A',fontWeight:'600',textTransform:'uppercase'}}>{m.label}</div>
                    </div>
                  ))}
                </div>
                {entry.notes && <div style={{fontSize:'12px',color:'#8A8A8A',marginTop:'8px',fontStyle:'italic'}}>"{entry.notes}"</div>}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
