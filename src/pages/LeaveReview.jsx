import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LeaveReview({ booking, session, onBack, onSubmitted }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!rating) return
    setLoading(true)
    await supabase.from('reviews').insert({
      athlete_id: session.user.id,
      trainer_id: booking.trainer_id,
      booking_id: booking.id,
      rating,
      content
    })

    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('trainer_id', booking.trainer_id)

    if (allReviews) {
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      await supabase.from('trainers').update({
        rating: Math.round(avg * 10) / 10,
        review_count: allReviews.length
      }).eq('id', booking.trainer_id)
    }

    setLoading(false)
    onSubmitted()
  }

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{background:'white',padding:'14px 18px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #EBEBEB'}}>
        <button onClick={onBack} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
        <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px'}}>Leave a Review</div>
      </div>

      <div style={{padding:'24px 18px',display:'flex',flexDirection:'column',gap:'20px'}}>
        <div style={{background:'#1A1A1A',borderRadius:'16px',padding:'18px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:'-30px',right:'-30px',width:'130px',height:'130px',background:'radial-gradient(circle,rgba(227,41,26,0.35) 0%,transparent 65%)'}} />
          <div style={{position:'relative'}}>
            <div style={{fontSize:'9px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1.5px',color:'rgba(255,255,255,0.35)',marginBottom:'6px'}}>Session with</div>
            <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'22px',color:'white',letterSpacing:'0.5px',marginBottom:'3px'}}>{booking.trainer?.full_name?.toUpperCase()}</div>
            <div style={{fontSize:'11px',color:'rgba(255,255,255,0.45)'}}>{new Date(booking.date).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</div>
          </div>
        </div>

        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'14px',textAlign:'center'}}>How was your session?</div>
          <div style={{display:'flex',justifyContent:'center',gap:'12px'}}>
            {[1,2,3,4,5].map(star => (
              <div
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                style={{fontSize:'36px',cursor:'pointer',opacity:(hovered||rating)>=star?1:0.3,transition:'all 0.15s'}}
              >
                ★
              </div>
            ))}
          </div>
          {rating > 0 && (
            <div style={{textAlign:'center',marginTop:'8px',fontSize:'13px',fontWeight:'700',color:'#1A1A1A'}}>
              {['','Needs Work','Below Average','Good','Great','Outstanding!'][rating]}
            </div>
          )}
        </div>

        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#8A8A8A',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Your Review (optional)</div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder='Tell other athletes what to expect...'
            rows={4}
            style={{width:'100%',padding:'12px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'14px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A',resize:'none'}}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!rating || loading}
          style={{background:!rating||loading?'rgba(227,41,26,0.4)':'#E3291A',color:'white',border:'none',borderRadius:'12px',padding:'15px',fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',letterSpacing:'1px',cursor:'pointer',marginBottom:'20px'}}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </div>
  )
}
