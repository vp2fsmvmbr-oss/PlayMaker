import { useState } from 'react'
import { supabase } from '../lib/supabase'

const REASONS = [
  'Inappropriate behavior',
  'Fake profile',
  'Harassment or threats',
  'Spam or scam',
  'Inappropriate content',
  'Other'
]

export default function ReportUser({ session, reportedId, reportedName, onBack }) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!reason) return
    setLoading(true)
    await supabase.from('reports').insert({
      reporter_id: session.user.id,
      reported_id: reportedId,
      reason,
      details
    })
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 24px',textAlign:'center'}}>
        <div style={{width:'70px',height:'70px',background:'rgba(34,197,94,0.1)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',border:'2px solid rgba(34,197,94,0.2)',fontSize:'30px'}}>✓</div>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'26px',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'8px'}}>Report Submitted</div>
        <div style={{fontSize:'13px',color:'#8A8A8A',lineHeight:1.6,marginBottom:'24px'}}>Thank you for helping keep PlayMaker safe. We'll review your report within 24 hours.</div>
        <button onClick={onBack} style={{background:'#1A1A1A',color:'white',border:'none',borderRadius:'12px',padding:'14px 32px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer',width:'100%'}}>Done</button>
      </div>
    )
  }

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{background:'white',padding:'14px 18px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #EBEBEB'}}>
        <button onClick={onBack} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px'}}>Report {reportedName?.split(' ')[0]}</div>
      </div>

      <div style={{padding:'20px 18px',display:'flex',flexDirection:'column',gap:'16px'}}>
        <div style={{fontSize:'13px',color:'#8A8A8A',lineHeight:1.6}}>
          Help us understand what's happening. Your report is anonymous.
        </div>

        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'10px'}}>Reason for Report</div>
          {REASONS.map(r => (
            <div key={r} onClick={() => setReason(r)} style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px',borderRadius:'10px',border:reason===r?'2px solid #E3291A':'1.5px solid #EBEBEB',background:reason===r?'rgba(227,41,26,0.04)':'white',cursor:'pointer',marginBottom:'6px'}}>
              <div style={{width:'18px',height:'18px',borderRadius:'50%',border:reason===r?'5px solid #E3291A':'2px solid #EBEBEB',flexShrink:0}} />
              <div style={{fontSize:'13px',fontWeight:reason===r?'700':'500',color:reason===r?'#E3291A':'#1A1A1A'}}>{r}</div>
            </div>
          ))}
        </div>

        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Additional Details (optional)</div>
          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            placeholder='Any additional context that might help our review...'
            rows={4}
            style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A',resize:'none'}}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!reason||loading}
          style={{background:!reason||loading?'rgba(227,41,26,0.4)':'#E3291A',color:'white',border:'none',borderRadius:'12px',padding:'15px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer',marginBottom:'20px'}}
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </div>
  )
}
