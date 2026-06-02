import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BlockedUsers from './BlockedUsers'
import ClipsViewer from './ClipsViewer'

export default function AthleteProfile({ session, onSignOut, onManageClips, onViewStats }) {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBlocked, setShowBlocked] = useState(false)
  const [activeTab, setActiveTab] = useState('sessions')
  const [form, setForm] = useState({
    full_name: '', sport: 'football', position: '', school: '',
    location: '', age: '', height: '', weight: '', forty_time: '', vertical: '', bio: ''
  })

  useEffect(() => { fetchProfile(); fetchBookings() }, [])

  async function fetchProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    if (data) { setProfile(data); setForm({ full_name: data.full_name||'', sport: data.sport||'football', position: data.position||'', school: data.school||'', location: data.location||'', age: data.age||'', height: data.height||'', weight: data.weight||'', forty_time: data.forty_time||'', vertical: data.vertical||'', bio: data.bio||'' }) }
    setLoading(false)
  }

  async function fetchBookings() {
    const { data } = await supabase.from('bookings').select('*, trainer:profiles!bookings_trainer_id_fkey(id,full_name,sport,position)').eq('athlete_id', session.user.id).order('date', {ascending:false}).limit(5)
    if (data) setBookings(data)
  }

  async function saveProfile() {
    if (!form.full_name.trim()) { alert('Please enter your full name'); return }
    const { error } = await supabase.from('profiles').update(form).eq('id', session.user.id)
    if (!error) { setProfile({ ...profile, ...form }); setEditing(false) }
  }

  if (showBlocked) return <BlockedUsers session={session} onClose={() => setShowBlocked(false)} />

  if (loading) return <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'#8A8A8A'}}>Loading...</div>

  if (editing) {
    return (
      <div style={{flex:1,overflowY:'auto'}}>
        <div style={{background:'white',padding:'14px 18px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #EBEBEB'}}>
          <button onClick={() => setEditing(false)} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
          <div style={{flex:1,fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px'}}>Edit Profile</div>
          <button onClick={saveProfile} style={{background:'#E3291A',color:'white',border:'none',borderRadius:'100px',padding:'8px 18px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>Save</button>
        </div>
        <div style={{padding:'20px 18px',display:'flex',flexDirection:'column',gap:'12px'}}>
          {[
            {key:'full_name',label:'Full Name',placeholder:'Your full name'},
            {key:'position',label:'Position',placeholder:'e.g. Wide Receiver'},
            {key:'school',label:'School',placeholder:'Your school'},
            {key:'location',label:'Location',placeholder:'e.g. Phoenix, AZ'},
            {key:'age',label:'Age',placeholder:'Your age'},
            {key:'height',label:'Height',placeholder:"e.g. 6'2\""},
            {key:'weight',label:'Weight (lbs)',placeholder:'e.g. 185'},
            {key:'forty_time',label:'40 Yard Dash',placeholder:'e.g. 4.5'},
            {key:'vertical',label:'Vertical (inches)',placeholder:'e.g. 32'},
          ].map(field => (
            <div key={field.key}>
              <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>{field.label}</div>
              <input value={form[field.key]} onChange={e => setForm({...form,[field.key]:e.target.value})} placeholder={field.placeholder} style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A'}} />
            </div>
          ))}
          <div>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Sport</div>
            <div style={{display:'flex',gap:'8px'}}>
              {['football','basketball'].map(s => (
                <button key={s} onClick={() => setForm({...form,sport:s})} style={{flex:1,padding:'12px',borderRadius:'10px',border:form.sport===s?'2px solid #E3291A':'2px solid #EBEBEB',background:form.sport===s?'rgba(227,41,26,0.06)':'white',color:form.sport===s?'#E3291A':'#8A8A8A',fontWeight:'700',fontSize:'13px',cursor:'pointer',textTransform:'capitalize'}}>
                  {s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Bio</div>
            <textarea value={form.bio} onChange={e => setForm({...form,bio:e.target.value})} placeholder='Tell coaches about yourself...' rows={4} style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A',resize:'none'}} />
          </div>
          <button onClick={saveProfile} style={{background:'#E3291A',color:'white',border:'none',borderRadius:'12px',padding:'15px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer',marginBottom:'20px'}}>Save Profile</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{background:'#1A1A1A',height:'160px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#0f0f0f 0%,#1a0505 50%,#0f0f0f 100%)'}} />
        <div style={{position:'absolute',top:'-40px',right:'-40px',width:'180px',height:'180px',background:'radial-gradient(circle,rgba(227,41,26,0.3) 0%,transparent 65%)'}} />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 30%,rgba(26,26,26,0.98) 100%)'}} />
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'14px 18px'}}>
          <div style={{fontSize:'10px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1.5px',color:'#E3291A',marginBottom:'2px'}}>{profile?.position} · {profile?.sport}</div>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'26px',color:'white',letterSpacing:'0.5px',lineHeight:1}}>{profile?.full_name?.toUpperCase() || 'YOUR NAME'}</div>
        </div>
      </div>

      <div style={{padding:'0 18px',display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginTop:'-24px',marginBottom:'12px',position:'relative',zIndex:2}}>
        <div style={{width:'56px',height:'56px',borderRadius:'16px',background:'linear-gradient(135deg,#E3291A,#9a1c10)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'white',border:'3px solid #F7F7F5'}}>
          {profile?.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase() || '?'}
        </div>
        <button onClick={() => setEditing(true)} style={{background:'#1A1A1A',color:'white',border:'none',borderRadius:'100px',padding:'9px 18px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>Edit Profile</button>
      </div>

      <div style={{padding:'0 18px 14px',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'3px'}}>{profile?.full_name || 'Add your name'}</div>
        <div style={{fontSize:'12px',color:'#8A8A8A',marginBottom:'12px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
          {profile?.location && <span>{profile.location}</span>}
          {profile?.school && <span>· {profile.school}</span>}
          {profile?.age && <span>· Age {profile.age}</span>}
        </div>
        {(profile?.height || profile?.weight || profile?.forty_time || profile?.vertical) && (
          <div style={{background:'#1A1A1A',borderRadius:'12px',padding:'12px',position:'relative',overflow:'hidden',marginBottom:'12px'}}>
            <div style={{position:'absolute',top:'-20px',right:'-20px',width:'100px',height:'100px',background:'radial-gradient(circle,rgba(227,41,26,0.3) 0%,transparent 65%)'}} />
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px',position:'relative'}}>
              {[{label:'Height',value:profile?.height||'—'},{label:'Weight',value:profile?.weight||'—'},{label:'40 Yard',value:profile?.forty_time||'—'},{label:'Vertical',value:profile?.vertical||'—'}].map((s,i) => (
                <div key={i} style={{textAlign:'center'}}>
                  <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',color:'white',lineHeight:1,marginBottom:'2px'}}>{s.value}</div>
                  <div style={{fontSize:'8px',color:'rgba(255,255,255,0.4)',fontWeight:'600',textTransform:'uppercase'}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
          {profile?.sport && <div style={{background:'rgba(227,41,26,0.08)',color:'#E3291A',fontSize:'10px',fontWeight:'600',padding:'4px 10px',borderRadius:'100px',border:'1px solid rgba(227,41,26,0.15)'}}>{profile.sport}</div>}
          {profile?.position && <div style={{background:'rgba(227,41,26,0.08)',color:'#E3291A',fontSize:'10px',fontWeight:'600',padding:'4px 10px',borderRadius:'100px',border:'1px solid rgba(227,41,26,0.15)'}}>{profile.position}</div>}
        </div>
      </div>

      {profile?.bio && (
        <div style={{padding:'14px 18px',borderBottom:'1px solid #EBEBEB'}}>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>About</div>
          <div style={{fontSize:'13px',color:'#1A1A1A',lineHeight:1.6}}>{profile.bio}</div>
        </div>
      )}

      <div style={{display:'flex',borderBottom:'1px solid #EBEBEB',background:'white'}}>
        {['sessions','clips'].map(tab => (
          <div key={tab} onClick={() => setActiveTab(tab)} style={{flex:1,padding:'12px 6px',textAlign:'center',fontSize:'11px',fontWeight:'700',color:activeTab===tab?'#E3291A':'#8A8A8A',cursor:'pointer',borderBottom:activeTab===tab?'2px solid #E3291A':'2px solid transparent',textTransform:'uppercase',letterSpacing:'0.5px'}}>
            {tab}
          </div>
        ))}
      </div>

      <div style={{padding:'14px 18px 80px'}}>
        {activeTab === 'clips' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
              <div style={{fontSize:'12px',color:'#8A8A8A'}}>Your highlight clips</div>
              <button onClick={onManageClips} style={{background:'#E3291A',color:'white',border:'none',borderRadius:'100px',padding:'6px 14px',fontSize:'11px',fontWeight:'700',cursor:'pointer'}}>Manage</button>
            </div>
            <ClipsViewer userId={session.user.id} onManageClips={onManageClips} />
          </div>
        )}

        {activeTab === 'sessions' && (
          <>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'12px'}}>Recent Sessions</div>
            {bookings.length === 0 ? (
              <div style={{textAlign:'center',padding:'20px 0',color:'#8A8A8A'}}>
                <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>No sessions yet</div>
                <div style={{fontSize:'12px'}}>Find a coach and book your first session</div>
              </div>
            ) : bookings.map(b => (
              <div key={b.id} style={{background:'white',borderRadius:'12px',border:'1.5px solid #EBEBEB',padding:'12px 14px',display:'flex',gap:'10px',alignItems:'center',marginBottom:'8px'}}>
                <div style={{background:'rgba(227,41,26,0.08)',borderRadius:'8px',padding:'6px 8px',textAlign:'center',minWidth:'44px'}}>
                  <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'#E3291A',lineHeight:1}}>{new Date(b.date).getDate()}</div>
                  <div style={{fontSize:'8px',color:'#E3291A',fontWeight:'700',textTransform:'uppercase'}}>{new Date(b.date).toLocaleDateString('en-US',{month:'short'})}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A',marginBottom:'2px'}}>{b.trainer?.full_name}</div>
                  <div style={{fontSize:'11px',color:'#8A8A8A'}}>{b.time} · {b.duration} min</div>
                </div>
                <div style={{background:b.status==='confirmed'?'rgba(34,197,94,0.1)':b.status==='declined'?'rgba(227,41,26,0.08)':'rgba(245,158,11,0.1)',color:b.status==='confirmed'?'#22c55e':b.status==='declined'?'#E3291A':'#f59e0b',fontSize:'9px',fontWeight:'700',padding:'3px 8px',borderRadius:'100px',textTransform:'uppercase'}}>
                  {b.status}
                </div>
              </div>
            ))}
            <div style={{marginTop:'16px',paddingBottom:'20px',display:'flex',flexDirection:'column',gap:'8px'}}>
              <button onClick={() => setShowBlocked(true)} style={{width:'100%',background:'#F7F7F5',color:'#8A8A8A',border:'1.5px solid #EBEBEB',borderRadius:'12px',padding:'13px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>Blocked Users</button>
              <button onClick={onViewStats} style={{width:'100%',background:'#1A1A1A',color:'white',border:'none',borderRadius:'12px',padding:'13px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'16px',letterSpacing:'0.5px',cursor:'pointer'}}>📊 Stats Tracker</button>
              <button onClick={onSignOut} style={{width:'100%',background:'#F7F7F5',color:'#8A8A8A',border:'1.5px solid #EBEBEB',borderRadius:'12px',padding:'13px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>Sign Out</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
