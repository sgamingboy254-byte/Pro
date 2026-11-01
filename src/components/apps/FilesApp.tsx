/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Folder,
  FileText,
  Music,
  Image as ImageIcon,
  Archive,
  HardDrive,
  Download,
  Eye,
  Plus,
  X,
  FileCheck,
  FolderSync,
} from 'lucide-react';
import { FileItem } from '../../types/os';
import { playClickSound } from '../../utils/audio';
import { deviceSyncStore, subscribeToDeviceSync } from '../../utils/deviceSyncStore';
import RoyalPdfReaderModal, { PdfDocumentData } from '../common/RoyalPdfReaderModal';
import { BookOpen } from 'lucide-react';

export default function FilesApp({ onBack }: { onBack: () => void }) {
  const [files, setFiles] = useState<FileItem[]>(() =>
    deviceSyncStore.getFiles()
  );
  const [activeFolder, setActiveFolder] = useState<'All' | 'Documents' | 'Music' | 'Images' | 'Archives' | 'Hidden'>('All');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [activePdfDoc, setActivePdfDoc] = useState<PdfDocumentData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeToDeviceSync(() => {
      setFiles(deviceSyncStore.getFiles());
    });
  }, []);

  const handleSelectFile = (file: FileItem) => {
    playClickSound(850, 0.02);
    setSelectedFile(file);
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    playClickSound(950, 0.03);
    deviceSyncStore.batchImportAllFiles(selected);
  };

  const getFileIcon = (type: FileItem['type'], name?: string) => {
    if (name && (name.startsWith('.') || name.includes('crypt14'))) {
      return <Archive className="w-5 h-5 text-amber-400" />;
    }
    switch (type) {
      case 'audio':
        return <Music className="w-5 h-5 text-[#c5a880]" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-400" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-amber-400" />;
      default:
        return <FileText className="w-5 h-5 text-cyan-400" />;
    }
  };

  const filteredFiles = files.filter((f) => {
    if (activeFolder === 'Hidden') {
      return f.name.startsWith('.') || f.name.includes('crypt14');
    }
    if (activeFolder === 'All') return true;
    return f.folder === activeFolder;
  });

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#121316] via-[#0d0e11] to-[#07080a] text-[#eedecf] select-none overflow-hidden relative font-sans">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleAddFiles}
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
              Internal Storage • Phone Access
            </span>
            <h2 className="font-editorial text-sm font-bold text-white leading-tight">
              Phone File Manager
            </h2>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1 rounded-full bg-[#241e17] border border-[#524434] text-[9px] font-mono-tech text-[#c5a880] hover:border-[#c5a880] flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>+ Import</span>
        </button>
      </div>

      {/* Storage Volume Meter */}
      <div className="p-3 bg-[#101114] border-b border-[#24211c]">
        <div className="flex items-center justify-between text-[10px] font-mono-tech mb-1.5">
          <span className="flex items-center gap-1.5 text-[#c5a880]">
            <HardDrive className="w-3 h-3" />
            <span>Phone Storage (Permission Alive)</span>
          </span>
          <span className="text-white font-semibold">42.8 GB / 128 GB</span>
        </div>
        <div className="w-full h-2 bg-[#1b1c20] rounded-full overflow-hidden flex border border-[#3b342a]">
          <div className="w-[18%] bg-[#c5a880]" title="System Docs" />
          <div className="w-[14%] bg-emerald-500" title="Phone Photos" />
          <div className="w-[22%] bg-cyan-500" title="Phone Music" />
          <div className="w-[8%] bg-amber-500" title="Backups & Hidden Vaults" />
        </div>
        <div className="flex justify-between text-[8px] font-mono-tech text-[#8c735d] mt-1">
          <span>{files.length} Total Synced Items (Including Hidden Files)</span>
          <span className="text-emerald-400">Transferred from Phone Access</span>
        </div>
      </div>

      {/* Folder Tabs with Hidden Files Tab */}
      <div className="px-3 py-2 bg-[#0e0f12] border-b border-[#211e18] flex gap-1.5 overflow-x-auto">
        {(['All', 'Documents', 'Music', 'Images', 'Archives', 'Hidden'] as const).map((folder) => (
          <button
            key={folder}
            onClick={() => {
              playClickSound(800, 0.02);
              setActiveFolder(folder);
            }}
            className={`px-3 py-1 rounded-full text-[10px] font-mono-tech whitespace-nowrap transition-all ${
              activeFolder === folder
                ? 'bg-[#c5a880] text-black font-bold shadow'
                : 'bg-[#18191d] text-[#8c735d] hover:text-[#eedecf]'
            }`}
          >
            {folder === 'Hidden' ? '🔒 Hidden Files' : folder}
          </button>
        ))}
      </div>

      {/* Files List */}
      <div className="flex-1 p-3 overflow-y-auto divide-y divide-[#1f2026]">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            onClick={() => handleSelectFile(file)}
            className="py-2.5 px-2 hover:bg-[#16181d] active:bg-[#1a1c22] rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#1a1c22] border border-[#38332a] group-hover:border-[#c5a880] flex items-center justify-center flex-shrink-0 transition-colors">
                {getFileIcon(file.type)}
              </div>
              <div className="min-w-0">
                <h4 className="font-serif-royal font-bold text-xs text-white group-hover:text-[#c5a880] truncate leading-tight">
                  {file.name}
                </h4>
                <div className="flex items-center gap-2 text-[9px] font-mono-tech text-[#8c735d] mt-0.5">
                  <span>{file.size}</span>
                  <span>•</span>
                  <span>{file.date}</span>
                  <span>•</span>
                  <span className="text-[#a8937e]">{file.folder}</span>
                </div>
              </div>
            </div>

            <Eye className="w-4 h-4 text-[#8c735d] group-hover:text-[#c5a880] flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* File Inspector Modal */}
      {selectedFile && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
          <div className="w-full max-w-xs bg-[#141518] border-2 border-[#524434] rounded-2xl p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2b251e] pb-2">
              <div className="flex items-center gap-2">
                {getFileIcon(selectedFile.type)}
                <span className="font-serif-royal font-bold text-xs text-white truncate max-w-[170px]">
                  {selectedFile.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1 rounded-full bg-[#1e2025] text-[#eedecf]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-[10px] font-mono-tech text-[#c5a880]">
              <div className="flex justify-between">
                <span className="text-[#8c735d]">Size:</span>
                <span>{selectedFile.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c735d]">Folder:</span>
                <span>{selectedFile.folder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c735d]">Date:</span>
                <span>{selectedFile.date}</span>
              </div>
            </div>

            {/* Preview text or image */}
            <div className="p-2.5 rounded-xl bg-[#0b0c0e] border border-[#2b251e] max-h-36 overflow-y-auto text-[11px] font-sans text-[#c9b7a4]">
              {selectedFile.type === 'image' && selectedFile.contentPreview?.startsWith('http') ? (
                <img
                  src={selectedFile.contentPreview}
                  alt={selectedFile.name}
                  className="w-full h-28 object-cover rounded-lg"
                />
              ) : (
                <p className="leading-relaxed whitespace-pre-wrap">
                  {selectedFile.contentPreview || 'Standard file metadata verification passed. Ready for device export.'}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-1.5 pt-1">
              {(selectedFile.name.toLowerCase().endsWith('.pdf') || selectedFile.type === 'doc') && (
                <button
                  onClick={() => {
                    playClickSound(900, 0.02);
                    setActivePdfDoc({
                      title: selectedFile.name.replace(/\.pdf$/i, ''),
                      fileName: selectedFile.name,
                      fileSize: selectedFile.size,
                      extractedText: selectedFile.contentPreview,
                      pageCount: 4,
                    });
                    setSelectedFile(null);
                  }}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-red-900 to-amber-950 hover:from-red-800 hover:to-amber-900 border border-red-500/50 text-white font-serif-royal font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span>Open & Read PDF Document</span>
                </button>
              )}

              <button
                onClick={() => setSelectedFile(null)}
                className="w-full py-1.5 rounded-xl bg-[#241e17] border border-[#524434] text-xs font-serif-royal text-[#eedecf] hover:text-[#c5a880] transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Royal PDF Reader Modal */}
      {activePdfDoc && (
        <RoyalPdfReaderModal
          document={activePdfDoc}
          onClose={() => setActivePdfDoc(null)}
        />
      )}
    </div>
  );
}
