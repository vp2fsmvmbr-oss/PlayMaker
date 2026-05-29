import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TrainerProfile({ trainer, onBack, onMessage, session }) {
  const [activeTab, setActiveTab] = useState('reviews')

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{background:'#1A1A1A',height:'200px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#1a1a1a 0%,#2d0a07 60%,#1a1a1a 100%)'}} />
        <div style={{position:'absolute',top:'-50px',right:'-50px',width:'220px',height:'220px',background:'radial-gradient(circle,rgba(227,41,26,0.4) 0%,transparent 65%)'}} />
        <div style={{position:'absolute',inset:0,opacity:0.03,backgroundImage:'repeating-linear-gradient(45deg,#fff 0px,#fff 1px,transparent 1px,transparent 14px)'}} />
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 30%,rgba(26,26,26,0.98) 100%)'}} />
        <button onClick={onBack} style={{position:'absolute',top:'14px',left:'14px',width:'34px',height:'34px',background:'rgba(0,0,0,0.4)',borderRadius:'50%',border:'none',color:'white',fontSize:'20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)',zIndex:2}}>‹</button>
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'14px 18px',zIndex:2}}>
          <div style={{fontSize:'10px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1.5px',color:'#E3291A',marginBottom:'3px'}}>
            {trainer.sport || 'Coach'}
          </div>
          <div style={{fontFamily:'serif',fontSize:'28px',color:'white',fontWeight:'900',letterSpacing:'0.5px',lineHeight:1}}>
            {trainer.full_name?.toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{background:'white',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{width:'56px',height:'56px',borderRadius:'14px',background:'linear-gradient(135deg,#E3291A,#9a1c10)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'serif',fontSize:'20px',color:'white',fontWeight:'900',marginTop:'-28px',border:'3px solid white',boxShadow:'0 2px 12px rgba(0,0,0,0.15)'}}>
          {trainer.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={onMessage} style={{background:'#1A1A1A',color:'white',fontSize:'12px',fontWeight:'700',padding:'9px 16px',borderRadius:'100px',border:'none',cursor:'pointer'}}>Message</button>
          <button style={{background:'#E3291A',color:'white',fontSize:'12px',fontWeight:'700',padding:'9px 16px',borderRadius:'100px',border:'none',cursor:'pointer'}}>Book</button>
        </div>
      </div>

      <div style={{padding:'14px 18px 12px',background:'white',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{fontFamily:'serif',fontSize:'22px',color:'#1A1A1A',fontWeight:'900',letterSpacing:'0.5px',marginBottom:'3px'}}>{trainer.full_name}</div>
        <div style={{fontSize:'12px',color:'#8A8A8A',marginBottom:'12px'}}>{trainer.sport} · {trainer.position} · {trainer.location}</div>
        <div style={{display:'flex',background:'#F7F7F5',borderRadius:'12px',overflow:'hidden',border:'1px solid #EBEBEB',marginBottom:'12px'}}>
          {[
            {label:'Yrs Exp',value:trainer.trainers?.years_experience || '—'},
            {label:'Athletes',value:'New'},
            {label:'Rating',value:trainer.trainers?.rating || '5.0'},
            {label:'Per Hour',value:'$' + (trainer.trainers?.price_per_hour || '—')},
          ].map((s,i) => (
            <div key={i} style={{flex:1,padding:'10px 8px',textAlign:'center',borderRight:i<3?'1px solid #EBEBEB':'none'}}>
              <div style={{fontFamily:'serif',fontSize:'17px',color:'#E3291A',fontWeight:'900',lineHeight:1}}>{s.value}</div>
              <div style={{fontSize:'9px',color:'#8A8A8A',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px',marginTop:'2px'}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
          {trainer.sport && <div style={{background:'rgba(227,41,26,0.08)',color:'#E3291A',fontSize:'10px',fontWeight:'600',padding:'5px 10px',borderRadius:'100px',border:'1px solid rgba(227,41,26,0.15)'}}>{trainer.sport}</div>}
          {trainer.position && <div style={{background:'rgba(227,41,26,0.08)',color:'#E3291A',fontSize:'10px',fontWeight:'600',padding:'5px 10px',borderRadius:'100px',border:'1px solid rgba(227,41,26,0.15)'}}>{trainer.position}</div>}
          {trainer.location && <div style={{background:'rgba(227,41,26,0.08)',color:'#E3291A',fontSize:'10px',fontWeight:'600',padding:'5px 10px',borderRadius:'100px',border:'1px solid rgba(227,41,26,0.15)'}}>{trainer.location}</div>}
        </div>
      </div>

      <div style={{display:'flex',borderBottom:'1px solid #EBEBEB',background:'white'}}>
        {['reviews','philosophy','clips','availability'].map(tab => (
          <div key={tab} onClick={() => setActiveTab(tab)} style={{flex:1,padding:'12px 6px',textAlign:'center',fontSize:'11px',fontWeight:'700',color:activeTab===tab?'#E3291A':'#8A8A8A',cursor:'pointer',borderBottom:activeTab===tab?'2px solid #E3291A':'2px solid transparent',textTransform:'uppercase',letterSpacing:'0.5px'}}>
            {tab}
          </div>
        ))}
      </div>

      <div style={{padding:'14px 18px 80px'}}>
        {activeTab === 'reviews' && (
          <div>
            <div style={{textAlign:'center',padding:'30px 0',color:'#8A8A8A'}}>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>No reviews yet</div>
              <div style={{fontSize:'12px'}}>Be the first to train with {trainer.full_name?.split(' ')[0]} and leave a review</div>
            </div>
          </div>
        )}
        {activeTab === 'philosophy' && (
          <div>
            <div style={{background:'#1A1A1A',borderRadius:'14px',padding:'16px',marginBottom:'12px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:'-30px',right:'-30px',width:'120px',height:'120px',background:'radial-gradient(circle,rgba(227,41,26,0.3) 0%,transparent 65%)'}} />
              <div style={{fontSize:'9px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1.5px',color:'#E3291A',marginBottom:'8px'}}>Coaching Philosophy</div>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,0.7)',lineHeight:1.6,position:'relative'}}>
                {trainer.bio || 'This coach has not added their philosophy yet.'}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'clips' && (
          <div style={{textAlign:'center',padding:'30px 0',color:'#8A8A8A'}}>
            <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>No clips yet</div>
            <div style={{fontSize:'12px'}}>Highlight videos coming soon</div>
          </div>
        )}
        {activeTab === 'availability' && (
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'8px'}}>Ready to Book?</div>
            <div style={{fontSize:'12px',color:'#8A8A8A',marginBottom:'16px'}}>Booking system coming soon</div>
            <button onClick={onMessage} style={{background:'#E3291A',color:'white',fontFamily:'serif',fontSize:'16px',fontWeight:'900',letterSpacing:'1px',padding:'14px 32px',borderRadius:'12px',border:'none',cursor:'pointer',width:'100%'}}>
              Message First
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
