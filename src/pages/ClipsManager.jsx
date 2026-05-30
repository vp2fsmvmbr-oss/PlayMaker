import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function ClipsManager({ session, onBack }) {
  const [clips, setClips] = useState([])
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [selected, setSelected] = useState(null)
  const fileRef = useRef()

  useEffect(() => { fetchClips() }, [])

  async function fetchClips() {
    const { data } = await supabase
      .from('clips')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    if (data) setClips(data)
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    if (!isVideo && !isImage) { alert('Please upload a video or image file'); return }
    if (file.size > 50 * 1024 * 1024) { alert('File must be under 50MB'); return }
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('Clips').upload(fileName, file)
    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('Clips').getPublicUrl(fileName)
    await supabase.from('clips').insert({
      user_id: session.user.id,
      title: title.trim() || (isVideo ? 'Training Clip' : 'Photo'),
      url: urlData.publicUrl,
      thumbnail_url: isImage ? urlData.publicUrl : null
    })
    setTitle('')
    setShowUpload(false)
    setUploading(false)
    await fetchClips()
  }

  async function deleteClip(clip) {
    if (!window.confirm('Delete this clip?')) return
    const parts = clip.url.split('/Clips/')
    if (parts[1]) {
      await supabase.storage.from('Clips').remove([decodeURIComponent(parts[1])])
    }
    await supabase.from('clips').delete().eq('id', clip.id)
    fetchClips()
  }

  function isVideo(url) {
    return url?.match(/\.(mp4|mov|webm|avi|mkv)$/i)
  }

  return (
    <div style={{minHeight:'100%',background:'#F7F7F5'}}>
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:1000,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px'}} onClick={() => setSelected(null)}>
          <button onClick={() => setSelected(null)} style={{position:'absolute',top:'20px',right:'20px',background:'rgba(255,255,255,0.1)',border:'none',color:'white',width:'36px',height:'36px',borderRadius:'50%',fontSize:'20px',cursor:'pointer'}}>×</button>
          {isVideo(selected.url) ? (
            <video src={selected.url} controls autoPlay playsInline style={{maxWidth:'100%',maxHeight:'75vh',borderRadius:'8px'}} onClick={e => e.stopPropagation()} />
          ) : (
            <img src={selected.url} alt={selected.title} style={{maxWidth:'100%',maxHeight:'75vh',objectFit:'contain',borderRadius:'8px'}} onClick={e => e.stopPropagation()} />
          )}
          <div style={{color:'white',fontWeight:'700',fontSize:'14px',marginTop:'16px',textAlign:'center'}}>{selected.title}</div>
          <div style={{color:'rgba(255,255,255,0.4)',fontSize:'11px',marginTop:'4px'}}>{new Date(selected.created_at).toLocaleDateString()}</div>
        </div>
      )}

      <div style={{background:'white',padding:'14px 18px',display:'flex',alignItems:'center',gap:'12px',borderBottom:'1px solid #EBEBEB',position:'sticky',top:0,zIndex:10}}>
        <button onClick={onBack} style={{width:'34px',height:'34px',borderRadius:'50%',background:'#F7F7F5',border:'none',fontSize:'20px',cursor:'pointer',color:'#1A1A1A'}}>‹</button>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px'}}>My Clips</div>
          <div style={{fontSize:'11px',color:'#8A8A8A'}}>{clips.length} clips uploaded</div>
        </div>
        <button onClick={() => setShowUpload(!showUpload)} style={{background:'#E3291A',color:'white',border:'none',borderRadius:'100px',padding:'8px 16px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>
          {showUpload ? 'Cancel' : '+ Add Clip'}
        </button>
      </div>

      {showUpload && (
        <div style={{background:'white',padding:'16px 18px',borderBottom:'1px solid #EBEBEB'}}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder='Clip title (e.g. Route Running Drill)'
            style={{width:'100%',padding:'10px 14px',borderRadius:'10px',border:'1.5px solid #EBEBEB',fontSize:'13px',outline:'none',boxSizing:'border-box',background:'#F7F7F5',color:'#1A1A1A',marginBottom:'10px'}}
          />
          {uploading ? (
            <div style={{background:'#F7F7F5',borderRadius:'10px',padding:'20px',textAlign:'center'}}>
              <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A',marginBottom:'6px'}}>Uploading...</div>
              <div style={{fontSize:'12px',color:'#8A8A8A'}}>Please wait</div>
            </div>
          ) : (
            <div onClick={() => fileRef.current?.click()} style={{background:'#F7F7F5',borderRadius:'10px',border:'2px dashed #EBEBEB',padding:'24px',textAlign:'center',cursor:'pointer'}}>
              <div style={{fontSize:'28px',marginBottom:'8px'}}>📎</div>
              <div style={{fontSize:'13px',fontWeight:'700',color:'#1A1A1A',marginBottom:'4px'}}>Tap to upload</div>
              <div style={{fontSize:'11px',color:'#8A8A8A'}}>Videos or images · Max 50MB</div>
            </div>
          )}
          <input ref={fileRef} type='file' accept='video/*,image/*' style={{display:'none'}} onChange={handleUpload} />
        </div>
      )}

      <div style={{padding:'16px 18px 80px'}}>
        {clips.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 20px',background:'white',borderRadius:'14px',border:'1.5px solid #EBEBEB'}}>
            <div style={{fontSize:'40px',marginBottom:'16px'}}>🎬</div>
            <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'20px',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'6px'}}>No Clips Yet</div>
            <div style={{fontSize:'12px',color:'#8A8A8A',marginBottom:'20px'}}>Upload training videos and photos</div>
            <button onClick={() => setShowUpload(true)} style={{background:'#E3291A',color:'white',border:'none',borderRadius:'100px',padding:'10px 24px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>Upload First Clip</button>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            {clips.map(clip => (
              <div key={clip.id} onClick={() => setSelected(clip)} style={{background:'#1A1A1A',borderRadius:'12px',overflow:'hidden',position:'relative',aspectRatio:'9/14',cursor:'pointer'}}>
                {clip.thumbnail_url ? (
                  <img src={clip.thumbnail_url} alt={clip.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                ) : (
                  <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1a1a1a,#2d0a07)'}}>
                    <div style={{width:'44px',height:'44px',background:'rgba(255,255,255,0.15)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',color:'white'}}>▶</div>
                  </div>
                )}
                <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 50%)'}} />
                <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'10px'}}>
                  <div style={{fontSize:'11px',fontWeight:'700',color:'white',marginBottom:'2px'}}>{clip.title}</div>
                  <div style={{fontSize:'9px',color:'rgba(255,255,255,0.5)'}}>{isVideo(clip.url) ? '🎬 Video' : '📷 Photo'} · {new Date(clip.created_at).toLocaleDateString()}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteClip(clip) }} style={{position:'absolute',top:'8px',right:'8px',background:'rgba(0,0,0,0.5)',border:'none',borderRadius:'50%',width:'28px',height:'28px',color:'white',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
