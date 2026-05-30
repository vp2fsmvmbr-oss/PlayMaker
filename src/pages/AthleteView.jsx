import { useState } from 'react'
import ClipsViewer from './ClipsViewer'

export default function AthleteView({ athlete, onBack, onMessage }) {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{background:'#1A1A1A',height:'180px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#0f0f0f 0%,#1a0505 50%,#0f0f0f 100%)'}} />
        <div style={{position:'absolute',top:'-50px',left:'-30px',width:'220px',height:'220px',background:'radial-gradient(circle,rgba(227,41,26,0.3) 0%,transparent 65%)'}} />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 30%,rgba(26,26,26,0.98) 100%)'}} />
        <button onClick={onBack} style={{position:'absolute',top:'14px',left:'14px',width:'34px',height:'34px',background:'rgba(0,0,0,0.4)',borderRadius:'50%',border:'none',color:'white',fontSize:'20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}>‹</button>
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'14px 18px',zIndex:2}}>
          <div style={{fontSize:'10px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1.5px',color:'#E3291A',marginBottom:'3px'}}>
            {athlete.position || 'Athlete'} · {athlete.sport || 'PlayMaker'}
          </div>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'28px',color:'white',letterSpacing:'0.5px',lineHeight:1}}>
            {athlete.full_name?.toUpperCase() || 'ATHLETE'}
          </div>
        </div>
      </div>

      <div style={{padding:'0 18px',display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginTop:'-28px',marginBottom:'14px',position:'relative',zIndex:2}}>
        <div style={{width:'64px',height:'64px',borderRadius:'18px',background:'linear-gradient(135deg,#E3291A,#9a1c10)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Bebas Neue', sans-serif",fontSize:'24px',color:'white',border:'3px solid #F7F7F5',boxShadow:'0 2px 14px rgba(0,0,0,0.2)'}}>
          {athlete.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase() || '?'}
        </div>
        <button onClick={() => onMessage(athlete)} style={{background:'#E3291A',color:'white',border:'none',borderRadius:'100px',padding:'10px 20px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>
          Message Athlete
        </button>
      </div>

      <div style={{padding:'0 18px 14px',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'22px',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'3px'}}>{athlete.full_name}</div>
        <div style={{fontSize:'12px',color:'#8A8A8A',marginBottom:'14px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
          {athlete.location && <span>{athlete.location}</span>}
          {athlete.school && <span>· {athlete.school}</span>}
          {athlete.age && <span>· Age {athlete.age}</span>}
        </div>
        {(athlete.height || athlete.weight || athlete.forty_time || athlete.vertical) && (
          <div style={{background:'#1A1A1A',borderRadius:'14px',overflow:'hidden',position:'relative',marginBottom:'14px'}}>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#1a1a1a 0%,#2a0808 60%,#1a1a1a 100%)'}} />
            <div style={{position:'absolute',top:'-20px',right:'-20px',width:'120px',height:'120px',background:'radial-gradient(circle,rgba(227,41,26,0.3) 0%,transparent 65%)'}} />
            <div style={{position:'relative',padding:'14px'}}>
              <div style={{fontSize:'9px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1.5px',color:'rgba(255,255,255,0.3)',marginBottom:'12px'}}>Physical Profile</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px'}}>
                {[
                  {label:'Height',value:athlete.height||'—'},
                  {label:'Weight',value:athlete.weight||'—'},
                  {label:'40 Yard',value:athlete.forty_time||'—'},
                  {label:'Vertical',value:athlete.vertical||'—'},
                ].map((s,i) => (
                  <div key={i} style={{textAlign:'center'}}>
                    <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'white',lineHeight:1,marginBottom:'3px'}}>{s.value}</div>
                    <div style={{fontSize:'8px',color:'rgba(255,255,255,0.35)',fontWeight:'600',textTransform:'uppercase'}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
          {athlete.sport && <div style={{background:'rgba(227,41,26,0.08)',color:'#E3291A',fontSize:'10px',fontWeight:'600',padding:'5px 10px',borderRadius:'100px',border:'1px solid rgba(227,41,26,0.15)'}}>{athlete.sport}</div>}
          {athlete.position && <div style={{background:'rgba(227,41,26,0.08)',color:'#E3291A',fontSize:'10px',fontWeight:'600',padding:'5px 10px',borderRadius:'100px',border:'1px solid rgba(227,41,26,0.15)'}}>{athlete.position}</div>}
          {athlete.school && <div style={{background:'#F7F7F5',color:'#1A1A1A',fontSize:'10px',fontWeight:'600',padding:'5px 10px',borderRadius:'100px',border:'1.5px solid #EBEBEB'}}>{athlete.school}</div>}
        </div>
      </div>

      <div style={{display:'flex',borderBottom:'1px solid #EBEBEB',background:'white'}}>
        {['profile','clips'].map(tab => (
          <div key={tab} onClick={() => setActiveTab(tab)} style={{flex:1,padding:'12px 6px',textAlign:'center',fontSize:'11px',fontWeight:'700',color:activeTab===tab?'#E3291A':'#8A8A8A',cursor:'pointer',borderBottom:activeTab===tab?'2px solid #E3291A':'2px solid transparent',textTransform:'uppercase',letterSpacing:'0.5px'}}>
            {tab}
          </div>
        ))}
      </div>

      <div style={{padding:'14px 18px 80px'}}>
        {activeTab === 'profile' && (
          <>
            {athlete.bio && (
              <div style={{marginBottom:'16px'}}>
                <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>About</div>
                <div style={{fontSize:'13px',color:'#1A1A1A',lineHeight:1.6}}>{athlete.bio}</div>
              </div>
            )}
            <button onClick={() => onMessage(athlete)} style={{width:'100%',background:'#1A1A1A',color:'white',border:'none',borderRadius:'12px',padding:'15px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer'}}>
              Message {athlete.full_name?.split(' ')[0]}
            </button>
          </>
        )}
        {activeTab === 'clips' && (
          <ClipsViewer userId={athlete.id} />
        )}
      </div>
    </div>
  )
}
