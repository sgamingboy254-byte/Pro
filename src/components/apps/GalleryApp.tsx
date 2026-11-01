/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Image as ImageIcon,
  Sliders,
  Maximize2,
  Trash2,
  Plus,
  X,
  Camera,
  Share2,
  Smartphone,
} from 'lucide-react';
import { GalleryPhoto } from '../../types/os';
import { playClickSound } from '../../utils/audio';
import { deviceSyncStore, subscribeToDeviceSync } from '../../utils/deviceSyncStore';

export default function GalleryApp({ onBack }: { onBack: () => void }) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() =>
    deviceSyncStore.getGalleryPhotos()
  );
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);
  const [activeFilter, setActiveFilter] = useState<'none' | 'sepia' | 'monochrome' | 'noir'>('none');
  const [albumFilter, setAlbumFilter] = useState<'All' | 'My Phone Photos' | 'Palace Estates'>('All');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeToDeviceSync(() => {
      setPhotos(deviceSyncStore.getGalleryPhotos());
    });
  }, []);

  const handleSelectPhoto = (photo: GalleryPhoto) => {
    playClickSound(850, 0.02);
    setActivePhoto(photo);
    setActiveFilter('none');
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    playClickSound(900, 0.03);
    deviceSyncStore.addCustomImageFiles(files);
  };

  const getFilterStyle = () => {
    switch (activeFilter) {
      case 'sepia':
        return 'sepia(80%) contrast(110%) brightness(95%)';
      case 'monochrome':
        return 'grayscale(100%) contrast(125%)';
      case 'noir':
        return 'grayscale(100%) contrast(160%) brightness(85%)';
      default:
        return 'none';
    }
  };

  const filteredPhotos = photos.filter((p) => {
    if (albumFilter === 'My Phone Photos') return p.isUserPhoto;
    if (albumFilter === 'Palace Estates') return !p.isUserPhoto;
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#121316] to-[#0a0b0d] text-[#eedecf] select-none overflow-hidden relative">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleUploadPhoto}
        className="hidden"
      />

      {/* Top Header */}
      <div className="p-3 bg-[#17181c] border-b border-[#312b23] flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 rounded-full bg-[#202227] hover:bg-[#2c2f37] text-[#eedecf] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="font-serif-royal text-[9px] tracking-widest text-[#c5a880] uppercase block">
              Aethelgard OS
            </span>
            <h2 className="font-editorial text-sm font-bold text-white leading-tight">
              Phone Gallery & Camera
            </h2>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1 rounded-full bg-[#241e17] border border-[#524434] text-[9px] font-mono-tech text-[#c5a880] hover:border-[#c5a880] flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>+ Add Photos</span>
        </button>
      </div>

      {/* Album Filters */}
      <div className="px-3 py-2 bg-[#101114] border-b border-[#23201a] flex gap-2 overflow-x-auto text-xs">
        {(['All', 'My Phone Photos', 'Palace Estates'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              playClickSound(800, 0.02);
              setAlbumFilter(tab);
            }}
            className={`px-3 py-1 rounded-full text-[10px] font-mono-tech transition-all flex items-center gap-1 ${
              albumFilter === tab
                ? 'bg-[#c5a880] text-black font-bold shadow'
                : 'bg-[#18191d] text-[#8c735d] hover:text-[#eedecf]'
            }`}
          >
            {tab === 'My Phone Photos' && <Smartphone className="w-2.5 h-2.5" />}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {/* Photos Masonry/Grid */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2.5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => handleSelectPhoto(photo)}
              className="group relative rounded-xl overflow-hidden border border-[#3b3429] bg-[#141518] shadow-md cursor-pointer aspect-square hover:border-[#c5a880] transition-all"
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                <span className="text-[10px] font-serif-royal font-bold text-white truncate block">
                  {photo.title}
                </span>
                <span className="text-[8px] font-mono-tech text-[#c5a880] truncate">
                  {photo.location} • {photo.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal with Royal Filters */}
      {activePhoto && (
        <div className="absolute inset-0 bg-black/95 z-50 flex flex-col justify-between p-3 select-none">
          {/* Lightbox Topbar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActivePhoto(null)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center">
              <h4 className="font-serif-royal text-xs font-bold text-white truncate max-w-[180px]">
                {activePhoto.title}
              </h4>
              <span className="text-[9px] font-mono-tech text-[#c5a880]">
                {activePhoto.location}
              </span>
            </div>
            <div className="w-7" />
          </div>

          {/* Main Photo Display with Applied Filter */}
          <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
            <img
              src={activePhoto.url}
              alt={activePhoto.title}
              style={{ filter: getFilterStyle() }}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300"
            />
          </div>

          {/* Filter Bar Controls */}
          <div className="p-2.5 rounded-2xl bg-[#141518] border border-[#3b3429] flex items-center justify-around">
            <span className="text-[9px] font-mono-tech text-[#8c735d] uppercase mr-1">
              Filter:
            </span>
            {(['none', 'sepia', 'monochrome', 'noir'] as const).map((flt) => (
              <button
                key={flt}
                onClick={() => {
                  playClickSound(900, 0.02);
                  setActiveFilter(flt);
                }}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-mono-tech uppercase transition-all ${
                  activeFilter === flt
                    ? 'bg-[#c5a880] text-black font-bold shadow'
                    : 'bg-[#1e2025] text-[#eedecf] hover:bg-[#2a2c33]'
                }`}
              >
                {flt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
