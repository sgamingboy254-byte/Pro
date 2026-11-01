/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  FolderSync,
  Music,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  X,
  Upload,
  ShieldCheck,
} from 'lucide-react';
import { deviceSyncStore, subscribeToDeviceSync } from '../utils/deviceSyncStore';
import { playClickSound } from '../utils/audio';

export default function AllFilesPermissionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isGranted, setIsGranted] = useState(() =>
    deviceSyncStore.isFilePermissionGranted()
  );
  const [musicCount, setMusicCount] = useState(() =>
    deviceSyncStore.getMusicTracks().length
  );
  const [photoCount, setPhotoCount] = useState(() =>
    deviceSyncStore.getGalleryPhotos().length
  );
  const [docCount, setDocCount] = useState(() =>
    deviceSyncStore.getFiles().length
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeToDeviceSync(() => {
      setIsGranted(deviceSyncStore.isFilePermissionGranted());
      setMusicCount(deviceSyncStore.getMusicTracks().length);
      setPhotoCount(deviceSyncStore.getGalleryPhotos().length);
      setDocCount(deviceSyncStore.getFiles().length);
    });
  }, []);

  if (!isOpen) return null;

  const handleGrantPermission = () => {
    playClickSound(950, 0.03);
    deviceSyncStore.setFilePermissionGranted(true);
    setIsGranted(true);
    setFeedback('All device files permission is ALIVE! Your music, photos, and documents are synchronized.');
  };

  const handleBatchFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    playClickSound(900, 0.03);

    deviceSyncStore.batchImportAllFiles(files);
    setFeedback(`Imported ${files.length} device items. Music is available on iPod, photos in Gallery, files in Manager.`);
  };

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-sm bg-[#121317] border-2 border-[#4a3f32] rounded-3xl p-4 shadow-2xl flex flex-col justify-between max-h-[92%] overflow-y-auto space-y-3.5 text-[#eedecf]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2b251e] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#2a241c] border border-[#c5a880] flex items-center justify-center text-[#c5a880]">
              <FolderSync className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif-royal font-bold text-xs text-[#faf7f2] tracking-wider uppercase block">
                Permission for All Files
              </span>
              <span className="text-[9px] font-mono-tech text-[#c5a880] flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isGranted ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                <span>{isGranted ? 'PERMISSION ALIVE & ACTIVE' : 'AWAITING GRANT'}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1e2025] hover:bg-[#2b2e35] text-[#eedecf] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Real Explanation */}
        <div className="p-3 rounded-2xl bg-[#17181d] border border-[#332b21] space-y-2">
          <p className="text-[11px] text-[#c9b7a4] font-sans leading-relaxed">
            When <strong className="text-white">Permission for All Files</strong> is alive, all music from your mobile phone shows in the <strong className="text-[#c5a880]">iPod Music Player</strong>, all your camera photos appear in the <strong className="text-[#c5a880]">Gallery</strong>, and all internal phone documents appear in <strong className="text-[#c5a880]">Files</strong>.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#26211a]">
            <div className="p-2 rounded-xl bg-[#0e0f12] border border-[#2d251d] text-center">
              <Music className="w-4 h-4 text-[#c5a880] mx-auto mb-1" />
              <div className="text-xs font-bold text-white">{musicCount}</div>
              <div className="text-[8px] font-mono-tech text-[#8c735d]">Songs on iPod</div>
            </div>

            <div className="p-2 rounded-xl bg-[#0e0f12] border border-[#2d251d] text-center">
              <ImageIcon className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-xs font-bold text-white">{photoCount}</div>
              <div className="text-[8px] font-mono-tech text-[#8c735d]">Gallery Photos</div>
            </div>

            <div className="p-2 rounded-xl bg-[#0e0f12] border border-[#2d251d] text-center">
              <FileText className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-xs font-bold text-white">{docCount}</div>
              <div className="text-[8px] font-mono-tech text-[#8c735d]">Phone Docs</div>
            </div>
          </div>
        </div>

        {/* Hidden Multi-file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          onChange={handleBatchFileSelect}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#b3956f] hover:from-[#d5ba94] hover:to-[#c5a880] active:scale-95 text-black font-serif-royal font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Select Phone Files & Folders (Multi-Select)</span>
          </button>

          {!isGranted && (
            <button
              onClick={handleGrantPermission}
              className="w-full py-2 px-3 rounded-xl bg-[#1d261f] border border-emerald-500/50 hover:bg-[#253328] text-emerald-400 font-mono-tech text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Grant Full Phone Storage Permission</span>
            </button>
          )}

          {feedback && (
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-300 font-sans flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{feedback}</span>
            </div>
          )}
        </div>

        {/* Explanatory Features List */}
        <div className="p-2.5 rounded-2xl bg-[#141518] border border-[#2b251e] space-y-1.5 text-[10px] text-[#9c8976]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880]" />
            <span>iPod Music Player: Select and play all phone music with click-wheel</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Gallery: Inspect camera pictures with vintage royal filters</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Files App: View documents, storage meter, and audit backups</span>
          </div>
        </div>

        {/* Footer Done */}
        <button
          onClick={() => {
            playClickSound(800, 0.02);
            onClose();
          }}
          className="w-full py-2 rounded-xl bg-[#1e2025] hover:bg-[#282b32] text-xs font-serif-royal text-[#eedecf] transition-colors"
        >
          Confirm & Return to Apps
        </button>
      </div>
    </div>
  );
}
