import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Camera,
  RefreshCw,
  Sliders,
  Image as ImageIcon,
  Check,
  Zap,
  ZapOff,
} from 'lucide-react';
import { GalleryPhoto } from '../../types/os';
import { playCameraShutterSound, playClickSound } from '../../utils/audio';

export default function CameraApp({
  onBack,
  onOpenGallery,
}: {
  onBack: () => void;
  onOpenGallery: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(true);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'4:3' | '1:1' | '16:9'>('4:3');
  const [lensFilter, setLensFilter] = useState<'none' | 'sepia' | 'monochrome'>('none');

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable, using vintage viewfinder mode:', err);
        setCameraError(true);
      }
    }
    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    playCameraShutterSound();

    if (flashEnabled) {
      setFlashActive(true);
      setTimeout(() => setFlashActive(false), 200);
    }

    let photoDataUrl = '';

    if (videoRef.current && canvasRef.current && !cameraError) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Apply filter if selected
        if (lensFilter === 'sepia') {
          ctx.filter = 'sepia(80%) contrast(110%)';
        } else if (lensFilter === 'monochrome') {
          ctx.filter = 'grayscale(100%) contrast(120%)';
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        photoDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      }
    } else {
      // Fallback captured royal image
      photoDataUrl =
        'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80';
    }

    if (photoDataUrl) {
      setCapturedPhoto(photoDataUrl);

      // Save to localStorage so it instantly shows up in the Gallery app!
      const newPhoto: GalleryPhoto = {
        id: `cam_${Date.now()}`,
        title: `Royal Snapshot ${new Date().toLocaleTimeString()}`,
        url: photoDataUrl,
        date: 'Today',
        location: 'Palace Camera',
        isUserPhoto: true,
      };

      const existing = localStorage.getItem('royal_camera_photos');
      const photoList: GalleryPhoto[] = existing ? JSON.parse(existing) : [];
      photoList.unshift(newPhoto);
      localStorage.setItem('royal_camera_photos', JSON.stringify(photoList));
    }
  };

  const getFilterStyle = () => {
    switch (lensFilter) {
      case 'sepia':
        return 'sepia(80%) contrast(110%)';
      case 'monochrome':
        return 'grayscale(100%) contrast(120%)';
      default:
        return 'none';
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-[#eedecf] select-none relative overflow-hidden">
      {/* Flash overlay */}
      {flashActive && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-200" />
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#121316] border-b border-[#292520] z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-[#eedecf] hover:text-[#c5a880]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-serif-royal">Home</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playClickSound(800, 0.02);
              setFlashEnabled(!flashEnabled);
            }}
            className="p-1 text-[#eedecf] hover:text-[#c5a880]"
          >
            {flashEnabled ? (
              <Zap className="w-4 h-4 text-[#c5a880]" />
            ) : (
              <ZapOff className="w-4 h-4 text-neutral-500" />
            )}
          </button>
          <button
            onClick={() => {
              playClickSound(800, 0.02);
              setLensFilter(
                lensFilter === 'none'
                  ? 'sepia'
                  : lensFilter === 'sepia'
                  ? 'monochrome'
                  : 'none'
              );
            }}
            className="text-[10px] font-mono-tech px-2 py-0.5 rounded border border-[#3d362e] text-[#c5a880]"
          >
            {lensFilter.toUpperCase()}
          </button>
        </div>

        <button
          onClick={onOpenGallery}
          className="text-xs font-serif-royal text-[#c5a880] hover:text-white"
        >
          Gallery
        </button>
      </div>

      {/* Viewfinder Area */}
      <div className="flex-1 relative flex items-center justify-center bg-[#070708] overflow-hidden">
        {/* Hidden Canvas for captures */}
        <canvas ref={canvasRef} className="hidden" />

        {!cameraError ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ filter: getFilterStyle() }}
            className="w-full h-full object-cover"
          />
        ) : (
          /* High-Fidelity Retro Camera Viewfinder Fallback */
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80"
              alt="Palace Salon"
              style={{ filter: getFilterStyle() }}
              className="w-full h-full object-cover filter brightness-90"
            />
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/75 rounded border border-[#3b352b] text-[10px] font-mono-tech text-[#c5a880]">
              OPERA SALON LIVE FEED
            </div>
          </div>
        )}

        {/* Vintage Rangefinder Reticle & HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[10px] font-mono-tech text-[#c5a880]/80">
            <span>ISO 200</span>
            <span>1/250s • f/1.8</span>
            <span>RAW 48MP</span>
          </div>

          {/* Golden Rangefinder Center Crosshair */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-24 h-24 border border-[#c5a880]/40 rounded-lg relative flex items-center justify-center">
              <div className="w-2 h-2 rounded-full border border-[#c5a880]" />
              <div className="w-6 h-[1px] bg-[#c5a880]/50 absolute" />
              <div className="h-6 w-[1px] bg-[#c5a880]/50 absolute" />
            </div>
          </div>

          <div className="flex justify-between items-center text-[9px] font-mono-tech text-[#8c735d]">
            <span>LEICA-AETHELGARD APERTURE</span>
            <span>GOLDEN RATIO GRID</span>
          </div>
        </div>
      </div>

      {/* Bottom Shutter Controls */}
      <div className="p-4 bg-[#121316] border-t border-[#292520] flex items-center justify-around z-10">
        {/* Gallery Preview Thumbnail */}
        <button
          onClick={onOpenGallery}
          className="w-11 h-11 rounded-lg border-2 border-[#c5a880] overflow-hidden bg-[#1e2025] hover:scale-105 transition-transform"
        >
          {capturedPhoto ? (
            <img src={capturedPhoto} alt="Last Snap" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8c735d]">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}
        </button>

        {/* Tactile Mechanical Shutter Button */}
        <button
          onClick={handleCapture}
          className="w-18 h-18 rounded-full bg-gradient-to-b from-[#f5ede2] to-[#c5a880] p-1 shadow-[0_4px_16px_rgba(197,168,128,0.4)] active:scale-95 transition-transform"
        >
          <div className="w-full h-full rounded-full border-2 border-[#121316] bg-gradient-to-b from-[#ffffff] to-[#ecdccb] flex items-center justify-center shadow-inner">
            <div className="w-5 h-5 rounded-full bg-[#121316]" />
          </div>
        </button>

        {/* Aspect Ratio Switch */}
        <button
          onClick={() => {
            playClickSound(800, 0.02);
            setAspectRatio(aspectRatio === '4:3' ? '1:1' : aspectRatio === '1:1' ? '16:9' : '4:3');
          }}
          className="w-11 h-11 rounded-lg border border-[#3d362e] bg-[#1a1c21] flex flex-col items-center justify-center text-[10px] font-mono-tech text-[#eedecf]"
        >
          <span>RATIO</span>
          <span className="text-[#c5a880] font-bold">{aspectRatio}</span>
        </button>
      </div>
    </div>
  );
}
