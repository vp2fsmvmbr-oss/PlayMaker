import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Find from './Find'
import TrainerProfile from './TrainerProfile'
import Messages from './Messages'
import AthleteProfile from './AthleteProfile'
import TrainerSetup from './TrainerSetup'
import Calendar from './Calendar'
import BookSession from './BookSession'
import HomeAthlete from './HomeAthlete'
import HomeTrainer from './HomeTrainer'

export default function Home({ session }) {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedTrainer, setSelectedTrainer] = useState(null)
  const [openConvoWith, setOpenConvoWith] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [booking, setBooking] = useState(null)
  const [booked, setBooked] = useState(false)

  useEffect(() => { fetchProfile() }, [])

  async function fetchProfile() {
    const { data } = await supabase.from('profiles').select('*, trainers(*)').eq('id', session.user.id).single()
    setProfile(data)
    setProfileLoading(false)
  }

  async function handleSignOut() { await supabase.auth.signOut() }

  function handleNavigate(tab, trainer) {
    if (trainer) setSelectedTrainer(trainer)
    setActiveTab(tab)
  }

  if (profileLoading) return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#1A1A1A'}}>
      <div style={{color:'#E3291A',fontSize:'28px',fontWeight:'900',fontFamily:'serif',letterSpacing:'2px'}}>PLAYMAKER</div>
    </div>
  )

  if (profile?.role === 'trainer' && !profile?.position) {
    return (
      <div style={{maxWidth:'430px',margin:'0 auto',height:'100vh',display:'flex',flexDirection:'column',background:'#F7F7F5'}}>
        <TrainerSetup session={session} onComplete={fetchProfile} />
      </div>
    )
  }

  if (booked) {
    return (
      <div style={{maxWidth:'430px',margin:'0 auto',height:'100vh',display:'flex',flexDirection:'column',background:'#F7F7F5',alignItems:'center',justifyContent:'center',padding:'24px',textAlign:'center'}}>
        <div style={{width:'80px',height:'80px',background:'rgba(34,197,94,0.1)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',border:'2px solid rgba(34,197,94,0.2)'}}>
          <div style={{fontSize:'36px'}}>✓</div>
        </div>
        <div style={{fontFamily:'serif',fontSize:'32px',fontWeight:'900',color:'#1A1A1A',marginBottom:'8px'}}>YOU ARE BOOKED.</div>
        <div style={{fontSize:'14px',color:'#8A8A8A',marginBottom:'28px',lineHeight:1.6}}>Your session is confirmed. Get ready to work.</div>
        <button onClick={() => { setBooked(false); setBooking(null); setActiveTab('calendar') }} style={{background:'#1A1A1A',color:'white',border:'none',borderRadius:'12px',padding:'14px 32px',fontFamily:'serif',fontSize:'18px',fontWeight:'900',letterSpacing:'1px',cursor:'pointer',width:'100%'}}>
          View My Calendar
        </button>
      </div>
    )
  }

  if (booking) {
    return (
      <div style={{maxWidth:'430px',margin:'0 auto',height:'100vh',display:'flex',flexDirection:'column',background:'#F7F7F5'}}>
        <BookSession trainer={booking} session={session} onBack={() => setBooking(null)} onBooked={() => setBooked(true)} />
      </div>
    )
  }

  function renderContent() {
    if (activeTab === 'find' && selectedTrainer) {
      return <TrainerProfile trainer={selectedTrainer} onBack={() => setSelectedTrainer(null)} onMessage={(trainer) => { setOpenConvoWith(trainer); setSelectedTrainer(null); setActiveTab('messages') }} onBook={(trainer) => { setBooking(trainer); setSelectedTrainer(null) }} session={session} />
    }
    if (activeTab === 'find') return <Find onSelectTrainer={(t) => setSelectedTrainer(t)} />
    if (activeTab === 'messages') return <Messages session={session} openConvoWith={openConvoWith} onConvoOpened={() => setOpenConvoWith(null)} />
    if (activeTab === 'calendar') return <Calendar session={session} />
    if (activeTab === 'profile') return <AthleteProfile session={session} />
    if (activeTab === 'home' && profile?.role === 'trainer') return <HomeTrainer profile={profile} session={session} onNavigate={handleNavigate} />
    return <HomeAthlete profile={profile} onNavigate={handleNavigate} />
  }

  const isTrainer = profile?.role === 'trainer'

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
        {(isTrainer ? [
          {id:'home',icon:'🏠',label:'Home'},
          {id:'messages',icon:'💬',label:'Messages'},
          {id:'calendar',icon:'📅',label:'Calendar'},
          {id:'athletes',icon:'🔍',label:'Athletes'},
          {id:'profile',icon:'👤',label:'Profile'},
        ] : [
          {id:'home',icon:'🏠',label:'Home'},
          {id:'find',icon:'🔍',label:'Find'},
          {id:'messages',icon:'💬',label:'Messages'},
          {id:'calendar',icon:'📅',label:'Calendar'},
          {id:'profile',icon:'👤',label:'Profile'},
        ]).map(tab => (
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
