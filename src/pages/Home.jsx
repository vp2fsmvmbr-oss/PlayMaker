import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Find from './Find'
import TrainerProfile from './TrainerProfile'
import Messages from './Messages'
import AthleteProfile from './AthleteProfile'
import TrainerSetup from './TrainerSetup'

export default function Home({ session }) {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedTrainer, setSelectedTrainer] = useState(null)
  const [openConvoWith, setOpenConvoWith] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    setProfile(data)
    setProfileLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (profileLoading) return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#1A1A1A'}}>
      <div style={{color:'#E3291A',fontSize:'28px',fontWeight:'900',fontFamily:'serif',letterSpacing:'2px'}}>PLAYMAKER</div>
    </div>
  )

  if (profile?.role === "trainer" && !profile?.position) {
    return (
      <div style={{maxWidth:'430px',margin:'0 auto',height:'100vh',display:'flex',flexDirection:'column',background:'#F7F7F5'}}>
        <TrainerSetup session={session} onComplete={fetchProfile} />
      </div>
    )
  }

  function renderContent() {
    if (activeTab === 'find' && selectedTrainer) {
      return <TrainerProfile trainer={selectedTrainer} onBack={() => setSelectedTrainer(null)} onMessage={(trainer) => { setOpenConvoWith(trainer); setSelectedTrainer(null); setActiveTab('messages') }} session={session} />
    }
    if (activeTab === 'find') return <Find onSelectTrainer={(t) => setSelectedTrainer(t)} />
    if (activeTab === 'messages') return <Messages session={session} openConvoWith={openConvoWith} onConvoOpened={() => setOpenConvoWith(null)} />
    if (activeTab === 'profile') return <AthleteProfile session={session} />
    return (
      <div style={{flex:1,overflowY:'auto',padding:'20px'}}>
        <div style={{background:'#1A1A1A',borderRadius:'16px',padding:'24px',marginBottom:'20px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:'-40px',right:'-40px',width:'180px',height:'180px',background:'radial-gradient(circle,rgba(227,41,26,0.4) 0%,transparent 65%)'}} />
          <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px',position:'relative'}}>Welcome Back</div>
          <div style={{fontFamily:'serif',fontSize:'26px',fontWeight:'900',color:'white',lineHeight:'1.1',position:'relative',marginBottom:'8px'}}>
            LET'S GET TO<br/><span style={{color:'#E3291A'}}>WORK.</span>
          </div>
          <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',position:'relative'}}>{profile?.full_name || session.user.email}</div>
        </div>
        {[
          {title:'Find Coaches & Trainers',desc:'Browse football and basketball coaches near Phoenix',tab:'find'},
          {title:'Messages',desc:'Connect directly with coaches before booking',tab:'messages'},
          {title:'Book a Session',desc:'See live availability and lock in your training',tab:'calendar'},
          {title:'Your Profile',desc:'Build your athlete resume for coaches to see',tab:'profile'},
        ].map((item,i) => (
          <div key={i} onClick={() => setActiveTab(item.tab)} style={{background:'white',borderRadius:'14px',padding:'16px',marginBottom:'10px',border:'1.5px solid #EBEBEB',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}>
            <div>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'3px'}}>{item.title}</div>
              <div style={{fontSize:'12px',color:'#8A8A8A'}}>{item.desc}</div>
            </div>
            <div style={{color:'#E3291A',fontSize:'18px'}}>›</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{maxWidth:'430px',margin:'0 auto',height:'100vh',display:'flex',flexDirection:'column',background:'#F7F7F5'}}>
      <div style={{background:'white',padding:'14px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{fontFamily:'serif',fontSize:'26px',fontWeight:'900',letterSpacing:'1px'}}>
          PLAY<span style={{color:'#E3291A'}}>MAKER</span>
        </div>
        <button onClick={handleSignOut} style={{background:'#1A1A1A',color:'white',border:'none',borderRadius:'100px',padding:'7px 14px',fontSize:'11px',fontWeight:'700',cursor:'pointer'}}>
          Sign Out
        </button>
      </div>
      {renderContent()}
      <div style={{background:'white',borderTop:'1px solid #EBEBEB',display:'flex',padding:'8px 0 20px'}}>
        {[
          {id:'home',icon:'🏠',label:'Home'},
          {id:'find',icon:'🔍',label:'Find'},
          {id:'messages',icon:'💬',label:'Messages'},
          {id:'calendar',icon:'📅',label:'Calendar'},
          {id:'profile',icon:'👤',label:'Profile'},
        ].map(tab => (
          <div key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedTrainer(null) }} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',cursor:'pointer',padding:'4px 0'}}>
            <div style={{fontSize:'20px'}}>{tab.icon}</div>
            <div style={{fontSize:'10px',fontWeight:'600',color:activeTab===tab.id?'#E3291A':'#8A8A8A'}}>{tab.label}</div>
            {activeTab===tab.id && <div style={{width:'4px',height:'4px',background:'#E3291A',borderRadius:'50%'}} />}
          </div>
        ))}
      </div>
    </div>
  )
}
