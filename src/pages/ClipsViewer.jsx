import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

function VideoThumb({ url, title }) {
  const videoRef = useRef()
  const canvasRef = useRef()
  const [thumb, setThumb] = useState(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.addEventListener('loadeddata', () => {
      video.currentTime = 1
    })
    video.addEventListener('seeked', () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0)
      setThumb(canvas.toDataURL('image/jpeg'))
    })
  }, [url])

  return (
    <div style={{width:'100%',height:'100%',position:'relative'}}>
      <video ref={videoRef} src={url} style={{display:'none'}} crossOrigin='anonymous' preload='metadata' />
      <canvas ref={canvasRef} style={{display:'none'}} />
      {thumb ? (
        <img src={thumb} alt={title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
      ) : (
        <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1a1a1a,#2d0a07)',gap:'8px'}}>
          <div style={{width:'44px',height:'44px',background:'rgba(255,255,255,0.15)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',color:'white'}}>▶</div>
          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.5px'}}>Video</div>
        </div>
      )}
    </div>
  )
}

export default function ClipsViewer({ userId, onManageClips }) {
  const [clips, setClips] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchClips() }, [userId])

  async function fetchClips() {
    const { data } = await supabase
      .from('clips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setClips(data)
    setLoading(false)
  }

  function isVideo(url) {
    return url?.match(/\.(mp4|mov|webm|avi|mkv)$/i)
  }

  if (loading) return <div style={{textAlign:'center',padding:'30px',color:'#8A8A8A',fontSize:'13px'}}>Loading clips...</div>

  if (clips.length === 0) return (
    <div style={{textAlign:'center',padding:'40px 20px',background:'#F7F7F5',borderRadius:'12px'}}>
      <div style={{fontSize:'32px',marginBottom:'12px'}}>🎬</div>
      <div style={{fontFamily:"'Bebas Neue', sans-serif",fontSize:'18px',color:'#1A1A1A',letterSpacing:'0.5px',marginBottom:'6px'}}>No Clips Yet</div>
      <div style={{fontSize:'12px',color:'#8A8A8A',marginBottom:'16px'}}>Upload training videos and photos</div>
      {onManageClips && <button onClick={onManageClips} style={{background:'#E3291A',color:'white',border:'none',borderRadius:'100px',padding:'10px 24px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>Upload First Clip</button>}
    </div>
  )

  return (
    <div>
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:1000,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px'}} onClick={() => setSelected(null)}>
          <button onClick={() => setSelected(null)} style={{position:'absolute',top:'20px',right:'20px',background:'rgba(255,255,255,0.1)',border:'none',color:'white',width:'36px',height:'36px',borderRadius:'50%',fontSize:'20px',cursor:'pointer'}}>×</button>
          {isVideo(selected.url) ? (
            <video src={selected.url} controls autoPlay playsInline style={{maxWidth:'100%',maxHeight:'75vh',borderRadius:'8px'}} onClick={e => e.stopPropagation()} />
          ) : (
            <img src={selected.url} alt={selected.title} style={{maxWidth:'100%',maxHeight:'75vh',objectFit:'contain',borderRadius:'8px'}} onClick={e => e.stopPropagation()} />
          )}
          <div style={{color:'white',fontWeight:'700',fontSize:'14px',marginTop:'16px'}}>{selected.title}</div>
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
        {clips.map(clip => (
          <div key={clip.id} onClick={() => setSelected(clip)} style={{background:'#1A1A1A',borderRadius:'10px',overflow:'hidden',position:'relative',aspectRatio:'9/14',cursor:'pointer'}}>
            {clip.thumbnail_url ? (
              <img src={clip.thumbnail_url} alt={clip.title} style={{width:'100%',height:'100%',objectFit:'cover'}} />
            ) : isVideo(clip.url) ? (
              <VideoThumb url={clip.url} title={clip.title} />
            ) : (
              <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1a1a1a,#2d0a07)'}}>
                <div style={{fontSize:'32px'}}>📷</div>
              </div>
            )}
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 50%)'}} />
            <div style={{position:'absolute',bottom:'8px',left:'8px',right:'8px'}}>
              <div style={{fontSize:'10px',fontWeight:'700',color:'white',marginBottom:'2px'}}>{clip.title}</div>
              <div style={{fontSize:'9px',color:'rgba(255,255,255,0.5)'}}>{isVideo(clip.url)?'🎬':'📷'} · {new Date(clip.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
