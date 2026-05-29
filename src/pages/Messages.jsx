import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function Messages({ session, openConvoWith, onConvoOpened }) {
  const [conversations, setConversations] = useState([])
  const [selectedConvo, setSelectedConvo] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (openConvoWith) {
      setSelectedConvo({ otherId: openConvoWith.id, otherProfile: openConvoWith })
      onConvoOpened()
    }
  }, [openConvoWith])

  useEffect(() => {
    if (!selectedConvo) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    fetchMessages(selectedConvo)
    intervalRef.current = setInterval(() => {
      fetchMessages(selectedConvo)
    }, 3000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [selectedConvo])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchConversations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id,full_name,role), receiver:profiles!messages_receiver_id_fkey(id,full_name,role)')
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false })
    if (!error && data) {
      const seen = new Set()
      const convos = []
      data.forEach(msg => {
        const otherId = msg.sender_id === session.user.id ? msg.receiver_id : msg.sender_id
        const otherProfile = msg.sender_id === session.user.id ? msg.receiver : msg.sender
        if (!seen.has(otherId)) {
          seen.add(otherId)
          convos.push({ otherId, otherProfile, lastMessage: msg })
        }
      })
      setConversations(convos)
    }
    setLoading(false)
  }

  async function fetchMessages(convo) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${convo.otherId}),and(sender_id.eq.${convo.otherId},receiver_id.eq.${session.user.id})`)
      .order('created_at', { ascending: true })
    if (!error) setMessages(data || [])
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedConvo) return
    const msg = newMessage.trim()
    setNewMessage('')
    await supabase.from('messages').insert({
      sender_id: session.user.id,
      receiver_id: selectedConvo.otherId,
      content: msg
    })
    fetchMessages(selectedConvo)
    fetchConversations()
  }

  if (selectedConvo) {
    return (
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{background:'white',padding:'12px 16px',display:'flex',alignItems:'center',gap:'10px',borderBottom:'1px solid #EBEBEB',flexShrink:0}}>
          <button onClick={() => setSelectedConvo(null)} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#1A1A1A'}}>‹</button>
          <div style={{width:'38px',height:'38px',borderRadius:'10px',background:'linear-gradient(135deg,#E3291A,#9a1c10)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'serif',fontSize:'14px',color:'white',fontWeight:'900'}}>
            {selectedConvo.otherProfile?.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:'15px',fontWeight:'700',color:'#1A1A1A'}}>{selectedConvo.otherProfile?.full_name}</div>
            <div style={{fontSize:'11px',color:'#22c55e',fontWeight:'600'}}>Active now</div>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'12px 14px',display:'flex',flexDirection:'column',gap:'10px'}}>
          {messages.length === 0 ? (
            <div style={{textAlign:'center',padding:'40px 20px'}}>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>Start the conversation</div>
              <div style={{fontSize:'12px',color:'#8A8A8A'}}>Introduce yourself and tell {selectedConvo.otherProfile?.full_name?.split(' ')[0]} what you want to work on</div>
            </div>
          ) : messages.map(msg => (
            <div key={msg.id} style={{display:'flex',flexDirection:msg.sender_id===session.user.id?'row-reverse':'row',gap:'6px',alignItems:'flex-end'}}>
              {msg.sender_id !== session.user.id && (
                <div style={{width:'26px',height:'26px',borderRadius:'7px',background:'linear-gradient(135deg,#E3291A,#9a1c10)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:'white',fontWeight:'900',fontFamily:'serif',flexShrink:0}}>
                  {selectedConvo.otherProfile?.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
                </div>
              )}
              <div>
                <div style={{maxWidth:'260px',padding:'10px 13px',borderRadius:'16px',fontSize:'13px',lineHeight:1.5,background:msg.sender_id===session.user.id?'#1A1A1A':'white',color:msg.sender_id===session.user.id?'white':'#1A1A1A',border:msg.sender_id===session.user.id?'none':'1px solid #EBEBEB',borderBottomRightRadius:msg.sender_id===session.user.id?'4px':'16px',borderBottomLeftRadius:msg.sender_id===session.user.id?'16px':'4px'}}>
                  {msg.content}
                </div>
                <div style={{fontSize:'9px',color:'#8A8A8A',marginTop:'2px',textAlign:msg.sender_id===session.user.id?'right':'left'}}>
                  {new Date(msg.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div style={{background:'white',borderTop:'1px solid #EBEBEB',padding:'10px 14px 24px',display:'flex',gap:'8px',alignItems:'center',flexShrink:0}}>
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key==='Enter' && sendMessage()}
            placeholder={`Message ${selectedConvo.otherProfile?.full_name?.split(' ')[0]}...`}
            style={{flex:1,background:'#F7F7F5',border:'1.5px solid #EBEBEB',borderRadius:'22px',padding:'10px 14px',fontSize:'13px',outline:'none',color:'#1A1A1A'}}
          />
          <button onClick={sendMessage} style={{width:'40px',height:'40px',background:'#E3291A',border:'none',borderRadius:'50%',color:'white',fontSize:'18px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>↑</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{flex:1,overflowY:'auto'}}>
      <div style={{padding:'16px 20px 12px',background:'white',borderBottom:'1px solid #EBEBEB'}}>
        <div style={{fontFamily:'serif',fontSize:'24px',fontWeight:'900',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'10px'}}>Messages</div>
        <div style={{background:'#F7F7F5',border:'1.5px solid #EBEBEB',borderRadius:'10px',padding:'9px 12px',display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',color:'#8A8A8A'}}>
          Search conversations...
        </div>
      </div>
      {loading ? (
        <div style={{textAlign:'center',padding:'40px',color:'#8A8A8A',fontSize:'14px'}}>Loading...</div>
      ) : conversations.length === 0 ? (
        <div style={{textAlign:'center',padding:'60px 24px'}}>
          <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A',marginBottom:'8px'}}>No messages yet</div>
          <div style={{fontSize:'12px',color:'#8A8A8A'}}>Find a coach and send them a message to get started</div>
        </div>
      ) : conversations.map((convo,i) => (
        <div key={i} onClick={() => setSelectedConvo(convo)} style={{display:'flex',gap:'12px',alignItems:'center',padding:'14px 20px',borderBottom:'1px solid #EBEBEB',cursor:'pointer',background:'white'}}>
          <div style={{width:'48px',height:'48px',borderRadius:'14px',background:'linear-gradient(135deg,#E3291A,#9a1c10)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'serif',fontSize:'18px',color:'white',fontWeight:'900',flexShrink:0}}>
            {convo.otherProfile?.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2px'}}>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#1A1A1A'}}>{convo.otherProfile?.full_name}</div>
              <div style={{fontSize:'10px',color:'#8A8A8A'}}>{new Date(convo.lastMessage.created_at).toLocaleDateString()}</div>
            </div>
            <div style={{fontSize:'12px',color:'#8A8A8A',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{convo.lastMessage.content}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
