import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function BlockButton({ session, otherId, otherName }) {
  const [blocked, setBlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => { checkBlocked() }, [])

  async function checkBlocked() {
    const { data } = await supabase.from('blocks').select('id').eq('blocker_id', session.user.id).eq('blocked_id', otherId).single()
    setBlocked(!!data)
    setLoading(false)
  }

  async function toggleBlock() {
    if (blocked) {
      await supabase.from('blocks').delete().eq('blocker_id', session.user.id).eq('blocked_id', otherId)
      setBlocked(false)
    } else {
      await supabase.from('blocks').insert({ blocker_id: session.user.id, blocked_id: otherId })
      setBlocked(true)
    }
    setShowMenu(false)
  }

  if (loading) return null

  return (
    <div style={{position:'relative'}}>
      <button onClick={() => setShowMenu(!showMenu)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'20px',color:'#8A8A8A',padding:'4px',lineHeight:1}}>⋯</button>
      {showMenu && (
        <div style={{position:'absolute',right:0,top:'100%',background:'white',borderRadius:'12px',boxShadow:'0 4px 20px rgba(0,0,0,0.15)',border:'1px solid #EBEBEB',overflow:'hidden',minWidth:'160px',zIndex:100}}>
          <button onClick={toggleBlock} style={{width:'100%',padding:'14px 16px',border:'none',background:'none',textAlign:'left',fontSize:'14px',fontWeight:'600',color:blocked?'#22c55e':'#E3291A',cursor:'pointer',display:'block'}}>
            {blocked ? `Unblock ${otherName?.split(' ')[0]}` : `Block ${otherName?.split(' ')[0]}`}
          </button>
          <button onClick={() => setShowMenu(false)} style={{width:'100%',padding:'14px 16px',border:'none',background:'#F7F7F5',textAlign:'left',fontSize:'14px',fontWeight:'600',color:'#8A8A8A',cursor:'pointer',display:'block'}}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
