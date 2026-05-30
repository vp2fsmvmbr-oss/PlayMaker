import { useState, useEffect } from "react"
import BlockedUsers from "./BlockedUsers"
import { supabase } from '../lib/supabase'

export default function AthleteProfile({ session, onSignOut }) {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    full_name: '', sport: '', position: '', school: '',
    location: '', age: '', height: '', weight: '', forty_time: '', vertical: '', bio: ''
  })

  useEffect(() => {
    fetchProfile()
    fetchBookings()
  }, [])

  async function fetchBookings() {
    const { data } = await supabase.from('bookings').select('*, trainer:profiles!bookings_trainer_id_fkey(id,full_name,sport,position)').eq('athlete_id', session.user.id).order('date', {ascending:false}).limit(5)
    if (data) setBookings(data)
  }

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    if (data) {
      setProfile(data)
      setForm({
        full_name: data.full_name || '',
        sport: data.sport || '',
        position: data.position || '',
        school: data.school || '',
        location: data.location || '',
        age: data.age || '',
        height: data.height || '',
        weight: data.weight || '',
        forty_time: data.forty_time || '',
        vertical: data.vertical || '',
        bio: data.bio || ''
      })
    }
    setLoading(false)
  }

  async function saveProfile() {
    if (!form.full_name.trim()) { alert('Please enter your full name'); return }
    const { error } = await supabase
      .from('profiles')
      .update(form)
      .eq('id', session.user.id)
    if (!error) {
      setProfile({ ...profile, ...form })
      setEditing(false)
    }
  }

  const [showBlocked, setShowBlocked] = useState(false)
  if (showBlocked) return <BlockedUsers session={session} onClose={() => setShowBlocked(false)} />
  if (loading) return <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'#8A8A8A'}}>Loading...</div>

  if (editing) {
    return (
      <div style={{flex:1,overflowY:'auto'}}>
        <div style={{background:'white',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #EBEBEB'}}>
          <button onClick={() => setEditing(false)} style={{background:'none',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',fontWeight:'900',color:'#1A1A1A',letterSpacing:'0.5px'}}>Edit Profile</div>
          <button onClick={saveProfile} style={{background:'#E3291A',color:'white',border:'none',borderRadius:'100px',padding:'7px 16px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>Save</button>
        </div>
        <div style={{padding:'20px 18px',display:'flex',flexDirection:'column',gap:'12px'}}>
          {[
            {key:'full_name',label:'Full Name',placeholder:'Your full name'},
            {key:'sport',label:'Sport',placeholder:'Football or Basketball'},
            {key:'position',label:'Position',placeholder:'e.g. Wide Receiver, Point Guard'},
            {key:'school',label:'School',placeholder:'Your high school'},
            {key:'location',label:'Location',placeholder:'e.g. Phoenix, AZ'},
            {key:'age',label:'Age',placeholder:'Your age'},
            {key:'height',label:'Height',placeholder:'e.g. 6\'1"'},
            {key:'weight',label:'Weight',placeholder:'e.g. 175 lbs'},
            {key:'forty_time',label:'40 Yard Dash',placeholder:'e.g. 4.6s'},
            {key:'vertical',label:'Vertical Jump',placeholder:'e.g. 34"'},
          ].map(field => (
            <div key={field.key}>
              <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>{field.label}</div>
              <input
                value={form[field.key]}
                onChange={e => setForm({...form,[field.key]:e.target.value})}
                placeholder={field.placeholder}
                style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A'}}
              />
            </div>
          ))}
          <div>
            <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Bio</div>
            <textarea
              value={form.bio}
              onChange={e => setForm({...form,bio:e.target.value})}
              placeholder='Tell coaches about yourself...'
              rows={4}
              style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',resize:'none',fontFamily:"'DM Sans', sans-serif"}}
            />
          </div>
          <button onClick={saveProfile} style={{background:'#E3291A',color:'white',border:'none',borderRadius:'12px',padding:'14px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',fontWeight:'900',letterSpacing:'1px',cursor:'pointer',marginTop:'8px',marginBottom:'20px'}}>
            Save Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{background:'#1A1A1A',height:'180px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#0f0f0f 0%,#1a0505 50%,#0f0f0f 100%)'}} />
        <div style={{position:'absolute',top:'-50px',left:'-30px',width:'220px',height:'220px',background:'radial-gradient(circle,rgba(227,41,26,0.3) 0%,transparent 65%)'}} />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 30%,rgba(26,26,26,0.98) 100%)'}} />
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'14px 18px',zIndex:2}}>
          <div style={{fontSize:'10px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1.5px',color:'#E3291A',marginBottom:'3px'}}>
            {profile?.position || 'Athlete'} · {profile?.sport || 'PlayMaker'}
          </div>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'28px',color:'white',fontWeight:'900',letterSpacing:'0.5px',lineHeight:1}}>
            {profile?.full_name?.toUpperCase() || 'YOUR NAME'}
          </div>
        </div>
      </div>

      <div style={{padding:'0 18px',display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginTop:'-28px',marginBottom:'14px',position:'relative',zIndex:2}}>
        <div style={{width:'64px',height:'64px',borderRadius:'18px',background:'linear-gradient(135deg,#E3291A,#9a1c10)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue', sans-serif",fontSize:'24px',color:'white',fontWeight:'900',border:'3px solid #F7F7F5',boxShadow:'0 2px 14px rgba(0,0,0,0.2)'}}>
          {profile?.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase() || 'ZK'}
        </div>
        <button onClick={() => setEditing(true)} style={{background:'#1A1A1A',color:'white',border:'none',borderRadius:'100px',padding:'8px 16px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>
          Edit Profile
        </button>
      </div>

      <div style={{padding:'0 18px 14px',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'22px',color:'#1A1A1A',fontWeight:'900',letterSpacing:'0.5px',marginBottom:'3px'}}>
          {profile?.full_name || 'Add your name'}
        </div>
        <div style={{fontSize:'12px',color:'#8A8A8A',marginBottom:'14px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
          {profile?.location && <span>{profile.location}</span>}
          {profile?.school && <span>· {profile.school}</span>}
          <span style={{background:'rgba(34,197,94,0.1)',color:'#22c55e',fontSize:'9px',fontWeight:'700',padding:'2px 7px',borderRadius:'100px',border:'1px solid rgba(34,197,94,0.2)'}}>Verified</span>
        </div>

        {(profile?.height || profile?.weight || profile?.forty_time || profile?.vertical) && (
          <div style={{background:'#1A1A1A',borderRadius:'14px',overflow:'hidden',position:'relative',marginBottom:'14px'}}>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#1a1a1a 0%,#2a0808 60%,#1a1a1a 100%)'}} />
            <div style={{position:'absolute',top:'-20px',right:'-20px',width:'120px',height:'120px',background:'radial-gradient(circle,rgba(227,41,26,0.3) 0%,transparent 65%)'}} />
            <div style={{position:'relative',padding:'14px'}}>
              <div style={{fontSize:'9px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1.5px',color:'rgba(255,255,255,0.3)',marginBottom:'12px'}}>Physical Profile</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px'}}>
                {[
                  {label:'Height',value:profile?.height||'—'},
                  {label:'Weight',value:profile?.weight||'—'},
                  {label:'40 Yard',value:profile?.forty_time||'—'},
                  {label:'Vertical',value:profile?.vertical||'—'},
                ].map((s,i) => (
                  <div key={i} style={{textAlign:'center'}}>
                    <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'white',fontWeight:'900',lineHeight:1,marginBottom:'3px'}}>{s.value}</div>
                    <div style={{fontSize:'8px',color:'rgba(255,255,255,0.35)',fontWeight:'600',textTransform:'uppercase'}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
          {profile?.sport && <div style={{background:'rgba(227,41,26,0.08)',color:'#E3291A',fontSize:'10px',fontWeight:'600',padding:'5px 10px',borderRadius:'100px',border:'1px solid rgba(227,41,26,0.15)'}}>{profile.sport}</div>}
          {profile?.position && <div style={{background:'rgba(227,41,26,0.08)',color:'#E3291A',fontSize:'10px',fontWeight:'600',padding:'5px 10px',borderRadius:'100px',border:'1px solid rgba(227,41,26,0.15)'}}>{profile.position}</div>}
          {profile?.school && <div style={{background:'#F7F7F5',color:'#1A1A1A',fontSize:'10px',fontWeight:'600',padding:'5px 10px',borderRadius:'100px',border:'1.5px solid #EBEBEB'}}>{profile.school}</div>}
        </div>
      </div>

      {!profile?.full_name && (
        <div style={{margin:'16px 18px',background:'rgba(227,41,26,0.06)',borderRadius:'12px',padding:'16px',border:'1px solid rgba(227,41,26,0.12)',textAlign:'center'}}>
          <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>Complete your profile</div>
          <div style={{fontSize:'12px',color:'#8A8A8A',marginBottom:'12px'}}>Coaches want to see your stats before they take you seriously</div>
          <button onClick={() => setEditing(true)} style={{background:'#E3291A',color:'white',border:'none',borderRadius:'100px',padding:'9px 20px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>
            Build My Profile
          </button>
        </div>
      )}

      {profile?.bio && (
        <div style={{padding:'14px 18px',borderBottom:'1px solid #EBEBEB'}}>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>About</div>
          <div style={{fontSize:'13px',color:'#1A1A1A',lineHeight:1.6}}>{profile.bio}</div>
        </div>
      )}

      <div style={{padding:'14px 18px 80px'}}>
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
        <div style={{marginTop:'16px',paddingBottom:'20px'}}>
          <button onClick={onSignOut} style={{width:'100%',background:'#F7F7F5',color:'#8A8A8A',border:'1.5px solid #EBEBEB',borderRadius:'12px',padding:'13px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>Sign Out</button>
        </div>
      </div>
    </div>
  )
}
