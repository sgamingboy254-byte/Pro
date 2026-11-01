import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Plus,
  Pin,
  Trash2,
  Search,
  BookOpen,
  Check,
  Edit3,
  Calendar,
  Share2,
  FileUp,
  FileText,
  Download,
  ExternalLink,
  X,
  FolderOpen,
  Layers,
  CheckCircle,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { NoteItem, FileItem } from '../../types/os';
import { playClickSound, playRoyalBellChime, playMicroTick } from '../../utils/audio';
import { hapticButtonClick, hapticMicro, hapticSuccess } from '../../utils/haptics';
import { deviceSyncStore } from '../../utils/deviceSyncStore';
import RoyalPdfReaderModal from '../common/RoyalPdfReaderModal';

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note_pdf_treaty',
    title: 'Treaty of St. Gall (Diplomatic Charter).pdf',
    content:
      'Executive Summary:\n• Unconditional neutrality ratified across all nine sovereign cantons.\n• Gold bullion exchange protocol fixed at 1:1 against imperial sovereignty sovereigns.\n• Signatories: Prime Chancellor Padave & Sovereign Envoy.',
    category: 'Royal PDF Archive',
    date: '27 Oct 2026',
    pinned: true,
    pdfData: {
      name: 'Treaty_of_St_Gall_Diplomatic_Charter.pdf',
      size: '2.4 MB',
      pageCount: 14,
      extractedText: 'TREATY OF ST. GALL - SOVEREIGN ALLIANCE & DIPLOMATIC ACCORD 2026',
    },
  },
  {
    id: 'note_1',
    title: 'State Banquet Protocol & Seating',
    content:
      '1. Sovereign Ambassador of St. Gall seated at right of Crown Prince.\n2. Service starts at 20:00 with the 1982 Vintage Bordeaux.\n3. Royal Guards stationed at Corinthian Columns A & D.',
    category: 'Palace Decrees',
    date: '26 Oct 2026',
    pinned: true,
  },
  {
    id: 'note_2',
    title: 'Private Vault Passcode & Access',
    content:
      'Primary Vault combination: 77-24-91-80. Requires dual retinal scan and mechanical brass key preserved in the Sovereign Chamber.',
    category: 'Security',
    date: '24 Oct 2026',
    pinned: true,
  },
  {
    id: 'note_3',
    title: 'Autumn Horse Racing & Equestrian Cup',
    content:
      'Review thoroughbred pedigree certificates for the Grand Royal Steeplechase. Order hand-crafted leather saddles from Florence workshop.',
    category: 'Leisure',
    date: '21 Oct 2026',
    pinned: false,
  },
];

export default function NotesApp({ onBack }: { onBack: () => void }) {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('royal_notes_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_NOTES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'notes' | 'pdfs'>('all');
  const [activeNote, setActiveNote] = useState<NoteItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('Palace Decrees');
  const [showPdfSourceModal, setShowPdfSourceModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const [activePdfReaderDoc, setActivePdfReaderDoc] = useState<any | null>(null);

  // Quick Open PDF in Reader
  const handleOpenPdfReader = (docData: { name: string; size?: string; url?: string; pageCount?: number; extractedText?: string; rawFile?: File }) => {
    playClickSound(900, 0.02);
    hapticButtonClick();
    setActivePdfReaderDoc({
      title: docData.name.replace(/\.pdf$/i, ''),
      fileName: docData.name,
      fileSize: docData.size || '2.4 MB',
      url: docData.url,
      rawFile: docData.rawFile,
      pageCount: docData.pageCount || 4,
      extractedText: docData.extractedText,
    });
  };

  useEffect(() => {
    localStorage.setItem('royal_notes_v2', JSON.stringify(notes));
  }, [notes]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Create Standard Inscription Note
  const handleCreateNew = () => {
    playClickSound(900, 0.02);
    hapticMicro();
    const newNote: NoteItem = {
      id: `note_${Date.now()}`,
      title: 'New Royal Inscription',
      content: '',
      category: 'Palace Decrees',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      pinned: false,
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setEditCategory(newNote.category);
    setIsEditing(true);
  };

  // Open PDF selector modal
  const handleOpenPdfImportModal = () => {
    hapticButtonClick();
    playClickSound(850, 0.02);
    setShowPdfSourceModal(true);
  };

  // Handle Local Device PDF File Upload
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    hapticSuccess();
    playRoyalBellChime();

    const pdfBlobUrl = URL.createObjectURL(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const fileName = file.name;
    const cleanTitle = fileName.replace(/\.pdf$/i, '');

    // Estimate pages based on size
    const estimatedPages = Math.max(1, Math.min(100, Math.round(file.size / (80 * 1024))));

    const newPdfNote: NoteItem = {
      id: `note_pdf_${Date.now()}`,
      title: fileName,
      content: `[Imported PDF Document from Device Storage]\nFile: ${fileName}\nSize: ${sizeMb} MB • Approx ${estimatedPages} Pages\n\nPalace Observations & Annotations:\n• Document verified and archived in Samsung Notes.\n• Sovereign seal intact.`,
      category: 'Royal PDF Archive',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      pinned: true,
      pdfData: {
        name: fileName,
        size: `${sizeMb} MB`,
        url: pdfBlobUrl,
        pageCount: estimatedPages,
        extractedText: `Document: ${fileName} - Verified Imperial Crypt File.`,
      },
    };

    // Also sync into device file manager
    deviceSyncStore.addCustomDocuments([file]);

    setNotes([newPdfNote, ...notes]);
    setActiveNote(newPdfNote);
    setEditTitle(newPdfNote.title);
    setEditContent(newPdfNote.content);
    setEditCategory(newPdfNote.category);
    setIsEditing(false);
    setShowPdfSourceModal(false);

    triggerToast(`✓ Imported PDF "${fileName}" (${sizeMb} MB) successfully!`);
    handleOpenPdfReader({
      name: fileName,
      size: `${sizeMb} MB`,
      url: pdfBlobUrl,
      rawFile: file,
      pageCount: estimatedPages,
      extractedText: `Document: ${fileName} - Verified Imperial Crypt File.`,
    });
  };

  // Import existing document from File Manager
  const handleImportFromFileManager = (fileItem: FileItem) => {
    hapticSuccess();
    playRoyalBellChime();

    const newPdfNote: NoteItem = {
      id: `note_pdf_crypt_${Date.now()}`,
      title: fileItem.name,
      content: `[Imported from Royal Crypt File Manager]\nDocument Name: ${fileItem.name}\nSize: ${fileItem.size}\nDate Stored: ${fileItem.date}\n\nAnnotations & Remarks:\n${fileItem.contentPreview || 'Official Sovereign document retrieved from internal storage.'}`,
      category: 'File Manager PDF',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      pinned: true,
      pdfData: {
        name: fileItem.name,
        size: fileItem.size,
        pageCount: 6,
        extractedText: fileItem.contentPreview || fileItem.name,
      },
    };

    setNotes([newPdfNote, ...notes]);
    setActiveNote(newPdfNote);
    setEditTitle(newPdfNote.title);
    setEditContent(newPdfNote.content);
    setEditCategory(newPdfNote.category);
    setIsEditing(false);
    setShowPdfSourceModal(false);

    triggerToast(`✓ Imported "${fileItem.name}" from File Manager into Notes!`);
    handleOpenPdfReader({
      name: fileItem.name,
      size: fileItem.size,
      pageCount: 6,
      extractedText: fileItem.contentPreview || fileItem.name,
    });
  };

  const handleSelectNote = (note: NoteItem) => {
    playClickSound(800, 0.02);
    setActiveNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategory(note.category);
    setIsEditing(false);
  };

  const handleSaveActiveNote = () => {
    if (!activeNote) return;
    playClickSound(750, 0.03);
    hapticMicro();
    const updated = notes.map((n) =>
      n.id === activeNote.id
        ? {
            ...n,
            title: editTitle.trim() || 'Untitled Decree',
            content: editContent,
            category: editCategory,
          }
        : n
    );
    setNotes(updated);
    setActiveNote({
      ...activeNote,
      title: editTitle.trim() || 'Untitled Decree',
      content: editContent,
      category: editCategory,
    });
    setIsEditing(false);
    triggerToast('✓ Note saved to Royal Archives.');
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound(850, 0.02);
    hapticMicro();
    setNotes(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound(600, 0.03);
    hapticMicro();
    setNotes(notes.filter((n) => n.id !== id));
    if (activeNote?.id === id) {
      setActiveNote(null);
    }
    triggerToast('Note moved to crypt disposal.');
  };

  // Filter notes
  const filteredNotes = notes
    .filter((n) => {
      if (activeFilter === 'notes') return !n.pdfData;
      if (activeFilter === 'pdfs') return !!n.pdfData;
      return true;
    })
    .filter(
      (n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.pdfData && n.pdfData.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  // Available files from File Manager for the selection dialog
  const availableFiles = deviceSyncStore.getFiles().filter(
    (f) => f.type === 'doc' || f.name.toLowerCase().endsWith('.pdf') || f.folder === 'Documents'
  );

  return (
    <div className="h-full flex flex-col bg-[#0d0e10] text-[#eedecf] select-none relative overflow-hidden font-sans">
      {/* Hidden PDF File Input */}
      <input
        type="file"
        ref={pdfFileInputRef}
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handlePdfUpload}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-2 left-3 right-3 z-50 p-2.5 rounded-xl bg-[#14261a] border-2 border-emerald-500/70 text-emerald-300 text-[10px] font-mono-tech shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-1.5 truncate">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-neutral-400 hover:text-white text-xs ml-1">
            ✕
          </button>
        </div>
      )}

      {/* App Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#292520] bg-[#141518] shrink-0">
        <button
          onClick={activeNote ? () => setActiveNote(null) : onBack}
          className="flex items-center gap-1 text-xs text-[#eedecf] hover:text-[#c5a880] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-serif-royal font-bold text-[11px] tracking-wider uppercase">
            {activeNote ? 'All Notes' : 'Home'}
          </span>
        </button>

        <div className="text-center">
          <span className="font-serif-royal text-xs tracking-wider text-[#c5a880] font-bold block">
            Samsung Notes
          </span>
          <span className="block text-[8px] font-mono-tech text-[#8c735d]">
            ROYAL ARCHIVES & PDF VAULT
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* IMPORT PDF BUTTON - Highlighted for immediate access */}
          <button
            onClick={handleOpenPdfImportModal}
            className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-red-900 to-amber-900 hover:from-red-800 hover:to-amber-800 border border-red-500/50 text-[#eedecf] font-serif-royal font-bold text-[10px] rounded shadow active:scale-95 transition-all"
            title="Import PDF from Device or File Manager"
          >
            <FileUp className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Import</span>
            <span>PDF</span>
          </button>

          {/* New Standard Note */}
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#c5a880] text-black font-serif-royal font-bold text-[10px] rounded hover:bg-[#eedecf] shadow active:scale-95 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Note View / Edit Mode */}
      {activeNote ? (
        <div className="flex-1 flex flex-col bg-[#f5ede2] text-[#1c1a17] overflow-hidden">
          {/* Note Top Toolbar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#d8c5b2] bg-[#ebdccb] shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              {activeNote.pdfData ? (
                <span className="text-[9px] font-mono-tech uppercase px-2 py-0.5 rounded bg-red-900 text-red-200 font-bold flex items-center gap-1">
                  <FileText className="w-2.5 h-2.5" />
                  PDF ARCHIVE
                </span>
              ) : (
                <span className="text-[9px] font-mono-tech uppercase px-2 py-0.5 rounded bg-[#dcc9b4] text-[#4d4034] font-semibold">
                  {activeNote.category}
                </span>
              )}
              <span className="text-[10px] font-mono-tech text-[#6e5d4e]">
                {activeNote.date}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {isEditing ? (
                <button
                  onClick={handleSaveActiveNote}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#2b241c] text-[#f5ede2] text-xs font-serif-royal font-bold rounded shadow"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#dfcbb7] text-[#2b241c] text-xs font-semibold rounded hover:bg-[#d0b89f] transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Note</span>
                </button>
              )}
            </div>
          </div>

          {/* Parchment Paper & PDF Document Viewer */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 font-editorial bg-[radial-gradient(#d5c3af_1px,transparent_1px)] [background-size:16px_16px]">
            {/* If Note contains an attached or imported PDF */}
            {activeNote.pdfData && (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#ebd8c5] to-[#dec5ad] border-2 border-[#b5997d] shadow-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-950 to-red-800 text-white flex items-center justify-center shadow-md border border-red-500/40">
                      <FileText className="w-5 h-5 text-red-200" />
                    </div>
                    <div>
                      <h3 className="font-editorial text-sm font-bold text-[#1c1a17] leading-tight">
                        {activeNote.pdfData.name}
                      </h3>
                      <div className="text-[10px] font-mono-tech text-[#5a493a] flex items-center gap-1.5 mt-0.5">
                        <span className="font-bold text-red-800">PDF VAULT</span>
                        <span>•</span>
                        <span>{activeNote.pdfData.size}</span>
                        <span>•</span>
                        <span>{activeNote.pdfData.pageCount || 4} Pages</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action: Read PDF */}
                  <button
                    onClick={() => handleOpenPdfReader(activeNote.pdfData!)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-900 to-amber-950 hover:from-red-800 hover:to-amber-900 text-white text-xs font-serif-royal font-bold shadow-md hover:scale-105 active:scale-95 transition-all border border-red-500/40"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>Open PDF</span>
                  </button>
                </div>

                {/* PDF Document Preview & Reader Portal */}
                <div
                  onClick={() => handleOpenPdfReader(activeNote.pdfData!)}
                  className="w-full rounded-xl bg-white border border-[#cbb6a1] overflow-hidden shadow-inner cursor-pointer hover:border-[#8c735d] transition-all group relative p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b pb-1.5 text-[10px] font-mono-tech text-gray-500">
                    <span className="flex items-center gap-1 text-red-800 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                      SOVEREIGN PDF DOCUMENT • TAP TO READ FULL
                    </span>
                    <span className="text-[9px] font-bold text-[#8c735d] group-hover:text-red-700 transition-colors">
                      Page 1 of {activeNote.pdfData.pageCount || 4} →
                    </span>
                  </div>

                  <p className="font-serif text-xs leading-relaxed italic text-gray-800 line-clamp-4">
                    "{activeNote.pdfData.extractedText || 'Authentic PDF Document content safely indexed into Samsung Notes from phone file manager.'}"
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[9px] text-gray-500 font-mono-tech border-t border-gray-100">
                    <span>Imperial Seal Verified • SHA-256 Validated</span>
                    <span className="text-red-800 font-bold group-hover:underline flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>Click to Read All Pages</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Note Inscription Area */}
            {isEditing ? (
              <div className="space-y-2 bg-[#fdfbf7]/90 p-3 rounded-xl border border-[#d8c5b2]">
                <label className="block text-[9px] font-mono-tech text-[#6e5d4e] uppercase font-bold">
                  Document Title & Decree
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Note Title or PDF description..."
                  className="w-full text-base font-bold bg-transparent border-b border-[#cbb6a1] pb-1 focus:outline-none text-[#1a1714]"
                />
                <label className="block text-[9px] font-mono-tech text-[#6e5d4e] uppercase font-bold pt-1">
                  Annotation & Inscription Content
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Inscribe palace notes, diplomatic treaties, or royal thoughts..."
                  rows={8}
                  className="w-full text-xs font-sans bg-transparent focus:outline-none resize-none leading-relaxed text-[#2a241e]"
                />
              </div>
            ) : (
              <div className="bg-[#fdfbf7]/90 p-3 rounded-xl border border-[#d8c5b2] space-y-2">
                <h2 className="text-base font-bold text-[#1a1714] border-b border-[#cbb6a1] pb-1">
                  {activeNote.title}
                </h2>
                <div className="text-xs leading-relaxed whitespace-pre-wrap text-[#2a241e] font-sans">
                  {activeNote.content || '(Empty inscription. Tap Edit to compose.)'}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Notes List Mode */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search bar & Filter Tabs */}
          <div className="p-2.5 bg-[#121316] border-b border-[#292520] space-y-1.5 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8c735d] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, decrees & imported PDFs..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0a0b0d] border border-[#38322b] text-xs text-[#fbf5ee] placeholder-[#7d6f61] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1 pt-0.5">
              <button
                onClick={() => {
                  playClickSound(800, 0.02);
                  setActiveFilter('all');
                }}
                className={`flex-1 py-1 rounded text-[9px] font-mono-tech font-bold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-[#c5a880] text-black shadow'
                    : 'bg-[#18191d] text-[#eedecf] hover:bg-[#252830]'
                }`}
              >
                All ({notes.length})
              </button>
              <button
                onClick={() => {
                  playClickSound(800, 0.02);
                  setActiveFilter('pdfs');
                }}
                className={`flex-1 py-1 rounded text-[9px] font-mono-tech font-bold flex items-center justify-center gap-1 transition-all ${
                  activeFilter === 'pdfs'
                    ? 'bg-red-900 text-white border border-red-500'
                    : 'bg-[#18191d] text-red-300 hover:bg-[#252830]'
                }`}
              >
                <FileText className="w-3 h-3 text-red-400" />
                <span>PDFs ({notes.filter((n) => n.pdfData).length})</span>
              </button>
              <button
                onClick={() => {
                  playClickSound(800, 0.02);
                  setActiveFilter('notes');
                }}
                className={`flex-1 py-1 rounded text-[9px] font-mono-tech font-bold transition-all ${
                  activeFilter === 'notes'
                    ? 'bg-[#c5a880] text-black shadow'
                    : 'bg-[#18191d] text-[#eedecf] hover:bg-[#252830]'
                }`}
              >
                Notes ({notes.filter((n) => !n.pdfData).length})
              </button>
            </div>
          </div>

          {/* List of Notes */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-10 text-[#8c735d] space-y-2">
                <BookOpen className="w-8 h-8 mx-auto opacity-40" />
                <p className="font-serif-royal text-xs">No matching notes or PDFs found</p>
                <button
                  onClick={handleOpenPdfImportModal}
                  className="px-3 py-1 rounded-md bg-[#25221b] border border-[#c5a880]/50 text-[#c5a880] text-[10px] font-mono-tech"
                >
                  + Import First PDF
                </button>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer relative group shadow-sm border ${
                    note.pdfData
                      ? 'bg-gradient-to-r from-[#1a1415] to-[#121316] border-red-900/50 hover:border-red-500'
                      : 'bg-[#141518] hover:bg-[#1a1c20] border-[#2e2924] hover:border-[#c5a880]/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      {note.pinned && (
                        <Pin className="w-3 h-3 text-[#c5a880] fill-current shrink-0" />
                      )}
                      {note.pdfData && (
                        <span className="w-4.5 h-4.5 rounded bg-red-900 text-red-200 flex items-center justify-center shrink-0">
                          <FileText className="w-3 h-3" />
                        </span>
                      )}
                      <h4 className="font-editorial text-sm font-bold text-[#faf7f2] group-hover:text-[#c5a880] transition-colors truncate">
                        {note.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleTogglePin(note.id, e)}
                        className="p-1 text-[#8c735d] hover:text-[#c5a880]"
                        title="Pin Note"
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        className="p-1 text-[#8c735d] hover:text-red-400"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#9c8976] line-clamp-2 mt-1 leading-normal font-sans">
                    {note.content || 'No text content'}
                  </p>

                  <div className="flex items-center justify-between text-[9px] text-[#736353] font-mono-tech mt-2 pt-1 border-t border-[#25211b]">
                    <span className="flex items-center gap-1">
                      {note.pdfData ? (
                        <div className="flex items-center gap-2">
                          <span className="text-red-400 font-bold">PDF • {note.pdfData.size}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPdfReader(note.pdfData!);
                            }}
                            className="px-2 py-0.5 rounded bg-red-900/90 hover:bg-red-800 text-white font-mono-tech text-[9px] font-bold flex items-center gap-1 shadow-sm border border-red-500/30"
                          >
                            <BookOpen className="w-2.5 h-2.5 text-amber-300" />
                            <span>Read PDF</span>
                          </button>
                        </div>
                      ) : (
                        <span>{note.category}</span>
                      )}
                    </span>
                    <span>{note.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* IMPORT PDF MODAL - Choose from Device or File Manager */}
      {showPdfSourceModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-[340px] rounded-2xl bg-[#14161a] border-2 border-[#c5a880] shadow-2xl p-4 text-[#eedecf] space-y-3">
            <div className="flex items-center justify-between border-b border-[#2d251d] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-900 border border-red-500/50 flex items-center justify-center text-red-200">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-editorial text-sm font-bold text-white leading-tight">
                    Import PDF to Notes
                  </h3>
                  <span className="text-[9px] font-mono-tech text-[#c5a880]">
                    Device Storage or Crypt File Manager
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPdfSourceModal(false)}
                className="w-6 h-6 rounded-full bg-[#1e2026] text-neutral-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Option 1: Select directly from Local Phone Storage */}
            <div
              onClick={() => {
                playClickSound(850, 0.02);
                pdfFileInputRef.current?.click();
              }}
              className="p-3 rounded-xl bg-gradient-to-r from-[#1c1417] to-[#121318] border border-red-500/50 hover:border-red-400 cursor-pointer transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-900/60 border border-red-500/40 flex items-center justify-center text-red-300 group-hover:scale-105 transition-transform">
                  <FileUp className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-serif-royal font-bold text-white group-hover:text-red-300">
                    Upload from Phone Files (.pdf)
                  </div>
                  <div className="text-[9px] font-mono-tech text-[#a6927d]">
                    Open local file explorer to choose any PDF
                  </div>
                </div>
              </div>
            </div>

            {/* Option 2: Choose from File Manager Documents */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono-tech text-[#c5a880] uppercase tracking-wider block">
                Or Select from Phone File Manager:
              </span>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {availableFiles.length === 0 ? (
                  <div className="p-3 rounded-lg bg-[#0e1014] text-center text-[10px] text-neutral-400 font-mono-tech">
                    No documents found in Crypt. Tap "Upload from Phone Files" above.
                  </div>
                ) : (
                  availableFiles.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => handleImportFromFileManager(f)}
                      className="p-2 rounded-lg bg-[#0e1014] hover:bg-[#1a1c22] border border-[#2b251e] hover:border-[#c5a880] cursor-pointer flex items-center justify-between transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <FileText className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="text-xs font-editorial text-white truncate">
                          {f.name}
                        </span>
                      </div>
                      <span className="text-[8px] font-mono-tech text-[#a6927d] shrink-0">
                        {f.size}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => setShowPdfSourceModal(false)}
                className="w-full py-1.5 rounded-lg bg-[#181a20] text-neutral-400 hover:text-white text-xs font-mono-tech"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Royal PDF Reader Modal */}
      {activePdfReaderDoc && (
        <RoyalPdfReaderModal
          document={activePdfReaderDoc}
          onClose={() => setActivePdfReaderDoc(null)}
        />
      )}
    </div>
  );
}
