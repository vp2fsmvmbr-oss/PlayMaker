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
import Athletes from './Athletes'
import AthleteView from './AthleteView'
import Notifications from './Notifications'
import TrainerProfileEdit from './TrainerProfileEdit'
import LeaveReview from './LeaveReview'
import AthleteOnboarding from './AthleteOnboarding'
import ReportUser from './ReportUser'
import RescheduleSession from './RescheduleSession'
import CreateGroupSession from './CreateGroupSession'
import StatsTracker from './StatsTracker'
import Leaderboard from './Leaderboard'
import GroupSessions from './GroupSessions'
import ClipsManager from './ClipsManager'
import SetAvailability from './SetAvailability'
import BlockedUsers from './BlockedUsers'

export default function Home({ session }) {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedTrainer, setSelectedTrainer] = useState(null)
  const [selectedAthlete, setSelectedAthlete] = useState(null)
  const [openConvoWith, setOpenConvoWith] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [booking, setBooking] = useState(null)
  const [booked, setBooked] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showBlocked, setShowBlocked] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [reviewBooking, setReviewBooking] = useState(null)
  const [reportUser, setReportUser] = useState(null)
  const [reschedulingBooking, setReschedulingBooking] = useState(null)
  const [creatingGroupSession, setCreatingGroupSession] = useState(false)
  const [viewingStats, setViewingStats] = useState(false)
  const [viewingLeaderboard, setViewingLeaderboard] = useState(false)
  const [viewingGroupSessions, setViewingGroupSessions] = useState(false)
  const [settingAvailability, setSettingAvailability] = useState(false)
  const [managingClips, setManagingClips] = useState(false)
  const [viewProfileUser, setViewProfileUser] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => { fetchProfile(); fetchUnread() }, [])

  useEffect(() => {
    const interval = setInterval(fetchUnread, 15000)
    return () => clearInterval(interval)
  }, [])

  async function fetchProfile() {
    const { data } = await supabase.from('profiles').select('*, trainers(*)').eq('id', session.user.id).single()
    setProfile(data)
    setProfileLoading(false)
  }

  async function fetchUnread() {
    const { count } = await supabase.from('notifications').select('*', {count:'exact',head:true}).eq('user_id', session.user.id).eq('read', false)
    setUnreadCount(count || 0)
  }

  async function handleSignOut() { await supabase.auth.signOut() }

  function handleNavigate(tab, item) {
    if (item) {
      if (tab === 'find') setSelectedTrainer(item)
      if (tab === 'athletes') setSelectedAthlete(item)
    }
    setActiveTab(tab)
  }

  if (profileLoading) return (
    <div style={{height:'100%',minHeight:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'#1A1A1A'}}>
      <div style={{color:'#E3291A',fontSize:'28px',fontWeight:'900',fontFamily:"'Bebas Neue', sans-serif",letterSpacing:'2px'}}>PLAYMAKER</div>
    </div>
  )

  if (profile?.role === 'trainer' && !profile?.position) {
    return <TrainerSetup session={session} onComplete={fetchProfile} />
  }

  if (profile?.role === 'athlete' && !profile?.full_name) {
    return <AthleteOnboarding session={session} onComplete={fetchProfile} />
  }

  if (booked) {
    return (
      <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:'#F7F7F5',alignItems:'center',justifyContent:'center',padding:'24px',textAlign:'center'}}>
        <div style={{width:'80px',height:'80px',background:'rgba(34,197,94,0.1)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',border:'2px solid rgba(34,197,94,0.2)'}}>
          <div style={{fontSize:'36px'}}>✓</div>
        </div>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'32px',color:'#1A1A1A',marginBottom:'8px',letterSpacing:'0.5px'}}>SESSION REQUESTED.</div>
        <div style={{fontSize:'14px',color:'#8A8A8A',marginBottom:'8px',lineHeight:1.6}}>Your booking request has been sent. The coach will confirm shortly.</div>
        <div style={{fontSize:'12px',color:'#8A8A8A',marginBottom:'28px'}}>You'll get a notification when they respond.</div>
        <button onClick={() => { setBooked(false); setBooking(null); setActiveTab('calendar') }} style={{background:'#1A1A1A',color:'white',border:'none',borderRadius:'12px',padding:'14px 32px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer',width:'100%'}}>
          View My Calendar
        </button>
      </div>
    )
  }

  if (booking) {
    return <BookSession trainer={booking} session={session} onBack={() => setBooking(null)} onBooked={() => setBooked(true)} />
  }

  if (showBlocked) {
    return <BlockedUsers session={session} onClose={() => setShowBlocked(false)} />
  }

  if (showNotifications) {
    return (
      <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#F7F7F5'}}>
        <div style={{background:'white',padding:'14px 20px 12px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #EBEBEB'}}>
          <button onClick={() => { setShowNotifications(false); fetchUnread() }} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'22px',color:'#1A1A1A',letterSpacing:'0.5px'}}>Notifications</div>
        </div>
        <Notifications session={session} />
      </div>
    )
  }

  if (managingClips) {
    return (
      <div style={{display:"flex",flexDirection:"column",height:"100%",background:"#F7F7F5"}}>
        <ClipsManager session={session} onBack={() => setManagingClips(false)} />
      </div>
    )
  }

  if (settingAvailability) {
    return <SetAvailability session={session} onBack={() => setSettingAvailability(false)} />
  }

  if (viewingLeaderboard) {
    return (
      <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#F7F7F5'}}>
        <Leaderboard session={session} onBack={() => setViewingLeaderboard(false)} />
      </div>
    )
  }

  if (viewingStats) {
    return (
      <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#F7F7F5'}}>
        <StatsTracker session={session} onBack={() => setViewingStats(false)} />
      </div>
    )
  }

  if (creatingGroupSession) {
    return (
      <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#F7F7F5'}}>
        <CreateGroupSession session={session} profile={profile} onBack={() => setCreatingGroupSession(false)} onCreated={() => { setCreatingGroupSession(false); setActiveTab('calendar') }} />
      </div>
    )
  }

  if (viewingGroupSessions) {
    return (
      <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#F7F7F5'}}>
        <GroupSessions session={session} onBack={() => setViewingGroupSessions(false)} />
      </div>
    )
  }

  if (reschedulingBooking) {
    return (
      <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#F7F7F5'}}>
        <RescheduleSession booking={reschedulingBooking} session={session} onBack={() => setReschedulingBooking(null)} onRescheduled={() => { setReschedulingBooking(null); setActiveTab('calendar') }} />
      </div>
    )
  }

  if (reportUser) {
    return <ReportUser session={session} reportedId={reportUser.id} reportedName={reportUser.full_name} onBack={() => setReportUser(null)} />
  }

  if (reviewBooking) {
    return <LeaveReview booking={reviewBooking} session={session} onBack={() => setReviewBooking(null)} onSubmitted={() => { setReviewBooking(null); setActiveTab('calendar') }} />
  }

  if (editingProfile) {
    return <TrainerProfileEdit session={session} profile={profile} onBack={() => setEditingProfile(false)} onSave={() => { setEditingProfile(false); fetchProfile() }} />
  }

  if (viewProfileUser) {
    if (viewProfileUser.role === 'trainer') {
      return <TrainerProfile trainer={viewProfileUser} onBack={() => setViewProfileUser(null)} onMessage={(t) => { setOpenConvoWith(t); setViewProfileUser(null); setActiveTab('messages') }} onBook={(t) => { setBooking(t); setViewProfileUser(null) }} session={session} />
    } else {
      return <AthleteView athlete={viewProfileUser} onBack={() => setViewProfileUser(null)} onMessage={(a) => { setOpenConvoWith(a); setViewProfileUser(null); setActiveTab('messages') }} />
    }
  }

  const isTrainer = profile?.role === 'trainer'

  function renderContent() {
    if (activeTab === 'find' && selectedTrainer) {
      return <TrainerProfile trainer={selectedTrainer} onBack={() => setSelectedTrainer(null)} onMessage={(trainer) => { setOpenConvoWith(trainer); setSelectedTrainer(null); setActiveTab('messages') }} onBook={(trainer) => { setBooking(trainer); setSelectedTrainer(null) }} session={session} />
    }
    if (activeTab === 'athletes' && selectedAthlete) {
      return <AthleteView athlete={selectedAthlete} onBack={() => setSelectedAthlete(null)} onMessage={(athlete) => { setOpenConvoWith(athlete); setSelectedAthlete(null); setActiveTab('messages') }} />
    }
    if (activeTab === "find") return <Find onSelectTrainer={(t) => setSelectedTrainer(t)} session={session} />
    if (activeTab === 'athletes') return <Athletes onSelectAthlete={(a) => setSelectedAthlete(a)} />
    if (activeTab === 'messages') return <Messages session={session} openConvoWith={openConvoWith} onConvoOpened={() => setOpenConvoWith(null)} onViewProfile={(user) => setViewProfileUser(user)} onReport={(user) => setReportUser(user)} />
    if (activeTab === 'calendar') return <Calendar session={session} profile={profile} onReview={(b) => setReviewBooking(b)} onSetAvailability={() => setSettingAvailability(true)} onReschedule={(b) => setReschedulingBooking(b)} />
    if (activeTab === 'profile' && isTrainer) {
      return (
        <div style={{flex:1,overflowY:'auto',padding:'20px'}}>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'22px',color:'#1A1A1A',marginBottom:'16px',letterSpacing:'0.5px'}}>My Coach Profile</div>
          <div style={{background:'#1A1A1A',borderRadius:'16px',padding:'20px',marginBottom:'14px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:'-30px',right:'-30px',width:'140px',height:'140px',background:'radial-gradient(circle,rgba(227,41,26,0.35) 0%,transparent 65%)'}} />
            <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'24px',color:'white',letterSpacing:'0.5px',position:'relative',marginBottom:'4px'}}>{profile?.full_name}</div>
            <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',position:'relative',marginBottom:'16px'}}>{profile?.sport} · {profile?.position} · {profile?.location}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',position:'relative'}}>
              {[
                {label:'Price',value:'$'+profile?.trainers?.price_per_hour+'/hr'},
                {label:'Experience',value:(profile?.trainers?.years_experience||'—')+' years'},
              ].map((s,i) => (
                <div key={i} style={{background:'rgba(255,255,255,0.05)',borderRadius:'8px',padding:'10px 12px',border:'1px solid rgba(255,255,255,0.07)'}}>
                  <div style={{fontSize:'8px',color:'rgba(255,255,255,0.35)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'4px'}}>{s.label}</div>
                  <div style={{fontSize:'15px',fontWeight:'700',color:'white'}}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
          {profile?.bio && (
            <div style={{background:'white',borderRadius:'14px',padding:'16px',border:'1.5px solid #EBEBEB',marginBottom:'14px'}}>
              <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Philosophy</div>
              <div style={{fontSize:'13px',color:'#1A1A1A',lineHeight:1.6}}>{profile?.bio}</div>
            </div>
          )}
          <button onClick={() => setShowBlocked(true)} style={{width:'100%',background:'#F7F7F5',color:'#8A8A8A',border:'1.5px solid #EBEBEB',borderRadius:'12px',padding:'13px',fontSize:'13px',fontWeight:'700',cursor:'pointer',marginTop:'8px'}}>Blocked Users</button>
          <button onClick={() => setEditingProfile(true)} style={{width:'100%',background:'#1A1A1A',color:'white',border:'none',borderRadius:'12px',padding:'15px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer',marginTop:'8px'}}>Edit Profile</button>
          <button onClick={() => setManagingClips(true)} style={{width:'100%',background:'#F7F7F5',color:'#1A1A1A',border:'1.5px solid #EBEBEB',borderRadius:'12px',padding:'15px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer',marginTop:'8px'}}>My Clips</button>
          <button onClick={handleSignOut} style={{width:'100%',background:'#F7F7F5',color:'#8A8A8A',border:'1.5px solid #EBEBEB',borderRadius:'12px',padding:'13px',fontSize:'13px',fontWeight:'700',cursor:'pointer',marginTop:'8px'}}>Sign Out</button>
        </div>
      )
    }
    if (activeTab === 'profile') return <AthleteProfile session={session} onSignOut={handleSignOut} onManageClips={() => setManagingClips(true)} onViewStats={() => setViewingStats(true)} />
    if (activeTab === 'home' && isTrainer) return <HomeTrainer profile={profile} session={session} onNavigate={handleNavigate} onCreateGroup={() => setCreatingGroupSession(true)} onViewAthlete={(a) => { setSelectedAthlete(a); setActiveTab('athletes') }} />
    return <HomeAthlete profile={profile} onNavigate={handleNavigate} onViewGroupSessions={() => setViewingGroupSessions(true)} onViewLeaderboard={() => setViewingLeaderboard(true)} />
  }

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:'#F7F7F5'}}>
      <div style={{background:'white',padding:'14px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'26px',letterSpacing:'1px',color:'#1A1A1A'}}>
          PLAY<span style={{color:'#E3291A'}}>MAKER</span>
        </div>
        <button onClick={() => setShowNotifications(true)} style={{width:'36px',height:'36px',borderRadius:'50%',background:'#F7F7F5',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative',fontSize:'18px'}}>
            🔔
            {unreadCount > 0 && (
              <div style={{position:'absolute',top:'4px',right:'4px',width:'16px',height:'16px',background:'#E3291A',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:'700',color:'white',border:'2px solid white'}}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
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
          <div key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedTrainer(null); setSelectedAthlete(null) }} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',cursor:'pointer',padding:'4px 0'}}>
            <div style={{fontSize:'20px'}}>{tab.icon}</div>
            <div style={{fontSize:'10px',fontWeight:'600',color:activeTab===tab.id?'#E3291A':'#8A8A8A'}}>{tab.label}</div>
            {activeTab===tab.id && <div style={{width:'4px',height:'4px',background:'#E3291A',borderRadius:'50%'}} />}
          </div>
        ))}
      </div>
    </div>
  )
}
