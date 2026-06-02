import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function VerificationRequest({ profile }) {
  const isVerified = profile?.trainers?.verified
  const rating = profile?.trainers?.rating || 0
  const reviewCount = profile?.trainers?.review_count || 0
  const athletesTrained = profile?.trainers?.athletes_trained || 0

  const criteria = [
    { label: 'Rating 4.5+', met: rating >= 4.5, value: `${rating} / 4.5` },
    { label: '5+ Reviews', met: reviewCount >= 5, value: `${reviewCount} / 5` },
    { label: '10+ Sessions', met: athletesTrained >= 10, value: `${athletesTrained} / 10` },
  ]

  const allMet = criteria.every(c => c.met)

  if (isVerified) {
    return (
      <div style={{background:'rgba(59,130,246,0.06)',borderRadius:'12px',border:'1.5px solid rgba(59,130,246,0.2)',padding:'14px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
        <div style={{width:'36px',height:'36px',background:'#3b82f6',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',color:'white',flexShrink:0}}>✓</div>
        <div>
          <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'2px'}}>Verified Coach</div>
          <div style={{fontSize:'12px',color:'#8A8A8A'}}>Your profile shows a verified badge to athletes</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{background:'white',borderRadius:'12px',border:'1.5px solid #EBEBEB',padding:'14px 16px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'4px'}}>
        <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A'}}>Get Verified</div>
        <div style={{background:'#3b82f6',borderRadius:'50%',width:'18px',height:'18px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:'white'}}>✓</div>
      </div>
      <div style={{fontSize:'12px',color:'#8A8A8A',marginBottom:'12px'}}>
        {allMet ? 'You qualify for verification! It will be applied automatically.' : 'Meet these criteria to earn your verified badge automatically.'}
      </div>
      {criteria.map((c, i) => (
        <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:i<2?'1px solid #EBEBEB':'none'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'18px',height:'18px',borderRadius:'50%',background:c.met?'rgba(34,197,94,0.1)':'#F7F7F5',border:c.met?'1.5px solid #22c55e':'1.5px solid #EBEBEB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:c.met?'#22c55e':'#8A8A8A',flexShrink:0}}>
              {c.met ? '✓' : '○'}
            </div>
            <div style={{fontSize:'13px',fontWeight:'600',color:c.met?'#1A1A1A':'#8A8A8A'}}>{c.label}</div>
          </div>
          <div style={{fontSize:'12px',fontWeight:'700',color:c.met?'#22c55e':'#8A8A8A'}}>{c.value}</div>
        </div>
      ))}
    </div>
  )
}
