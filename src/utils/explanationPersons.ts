import { AppExplanationPerson, AppId } from '../types/os';

export const APP_EXPLANATION_PERSONS: Record<AppId, AppExplanationPerson> = {
  phone: {
    name: 'Baroness Althea Vance',
    title: 'Chief Inspector of Telecommunications',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    bio: 'Oversees the sovereign rotary switchboard and links directly with your real mobile device carrier network.',
    roleExplanation:
      'This application provides a tactile vintage rotary telephone interface while maintaining full synchronization with your real mobile phone: real local time, exact battery percentage, and direct carrier calling to real phone numbers.',
    syncedServices: ['Mobile Phone Carrier (tel:)', 'Real Battery Telemetry', 'Exact Atomic Clock'],
  },
  whatsapp: {
    name: 'Lord High Chamberlain Sterling',
    title: 'Keeper of Diplomatic Communications',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    bio: 'Curates royal diplomatic wires and bridges communications with your real-world contacts.',
    roleExplanation:
      'Manage real personal and royal contacts. You can add your actual mobile phone contacts and dispatch genuine messages via direct WhatsApp Web API links (wa.me) alongside internal encrypted court communiqués.',
    syncedServices: ['Real WhatsApp Direct Links (wa.me)', 'Custom Phone Contacts', 'Device Storage'],
  },
  youtube: {
    name: 'Lady Seraphina of Vienna',
    title: 'Imperial Audio-Visual Archivist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: 'Preserves world broadcasts and classical telecasts in a distraction-free luxury format.',
    roleExplanation:
      'A stripped-down, focused YouTube interface showing only the classic logo, search bar, and your real profile settings. Streams authentic YouTube videos with zero advertisement clutter.',
    syncedServices: ['YouTube Search & Embed Stream', 'Google User Account Profile', 'Quality Settings'],
  },
  gemini: {
    name: 'Gemini Sovereign Intelligence',
    title: 'Royal Counselor & Neural Emissary',
    avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80',
    bio: 'High-order neural cognition powering statecraft, literature, and advanced technical reasoning.',
    roleExplanation:
      'Connected directly to Google Gemini 3.8 Flash via secure server backend. Delivers real, live, aristocratic intelligence to answer your queries with scholarly precision.',
    syncedServices: ['Google GenAI SDK (gemini-3.8-flash)', 'Real-Time Neural Generation', 'History Ledger'],
  },
  music: {
    name: 'Maestro Julian Vane',
    title: 'Royal Kapellmeister of Geneva',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    bio: 'Director of the Sovereign Chamber Orchestra and custodian of the mechanical audio wheel.',
    roleExplanation:
      'Modeled on the classic click-wheel iPod. Plays polyphonic classical compositions and allows you to load and play real audio files (MP3/WAV) directly from your mobile device.',
    syncedServices: ['Web Audio Polyphonic Synthesizer', 'Local Device Audio Player', 'Tactile Click Engine'],
  },
  notes: {
    name: 'Chancellor of the Scriptorium',
    title: 'Imperial Records Master',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    bio: 'Preserves royal decrees, state treaties, and confidential memoranda on illuminated parchment.',
    roleExplanation:
      'Samsung Notes Royal Edition. Write, edit, pin, and search real personal notes and decrees with persistent local storage saving directly on your phone.',
    syncedServices: ['Persistent Local Storage', 'Search & Pinning Engine', 'Parchment Pad'],
  },
  files: {
    name: 'High Archivist Eamon',
    title: 'Custodian of the Central Crypt Vault',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    bio: 'Oversees encrypted royal documents, file dossiers, and storage telemetry.',
    roleExplanation:
      'Manage documents, audio recordings, images, and archives with real storage measurement, document previewing, and local device file importing.',
    syncedServices: ['Device File Importer', 'Document Previewer', 'Storage Quota Telemetry'],
  },
  gallery: {
    name: 'Duchess Corinne',
    title: 'Royal Conservator of Photographic Arts',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    bio: 'Curator of the national photographic collection and vintage film development.',
    roleExplanation:
      'High-resolution photo albums with real vintage filter switcher (Skinny Sepia, Royal Silver, Film Noir). Automatically synchronizes with real snapshots taken with your Camera.',
    syncedServices: ['Camera Capture Sync', 'Local Image Upload', 'Vintage Filter Engine'],
  },
  camera: {
    name: 'Master Daguerreotypist Henri',
    title: 'Director of Palace Optical Sciences',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    bio: 'Designs rangefinder reticles, exposure apertures, and instant shutter mechanics.',
    roleExplanation:
      'Operates your physical device camera via hardware stream (getUserMedia). Captures real photographs, adds vintage filters, and saves them directly to your Gallery.',
    syncedServices: ['Real Device Camera Lens', 'Mechanical Shutter Sound', 'Gallery Sync'],
  },
  clock: {
    name: 'Grand Horologist Jean-Pierre',
    title: 'Master of the Geneva Guild of Complications',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    bio: 'Crafts tourbillons, perpetual calendars, and precision chronometers for the royal house.',
    roleExplanation:
      'Synchronized in real-time with your device system time. Features an analog chronometer, world time zones, precision lap stopwatch, and countdown timer with chimes.',
    syncedServices: ['Real System Atomic Clock', 'Haute Horlogerie Dials', 'Audio Alarm Bells'],
  },
  calendar: {
    name: 'Lord Registrar of Audiences',
    title: 'Keeper of the Perpetual Royal Almanac',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    bio: 'Coordinates sovereign audiences, diplomatic summits, and state banquets.',
    roleExplanation:
      'Perpetual calendar synchronized with the real current date. Add real appointments, set reminders, and inspect court decrees with persistent storage.',
    syncedServices: ['Current System Date', 'Appointment Scheduler', 'Persistent Agenda'],
  },
  calculator: {
    name: 'Chief Exchequer Alistair',
    title: 'Imperial Treasury Mathematician',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    bio: 'Computes sovereign revenues, bullion allocations, and mathematical functions.',
    roleExplanation:
      'Mechanical brass arithmometer with tactile sound feedback, basic and scientific mathematical operations, and an ongoing audit paper tape ledger.',
    syncedServices: ['Tactile Sound Engine', 'Audit Paper Ledger', 'Mathematical Processor'],
  },

  custom_app: {
    name: 'Imperial Hardware Marshal',
    title: 'Sovereign Security Warden',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    bio: 'Enforces permanent hardware allocation locks for external mobile applications.',
    roleExplanation:
      'Your permanently bound mobile application slot. Operates exclusively within this device chassis in accordance with royal security rules.',
    syncedServices: ['Hardware Allocation Lock', 'Persistent Binding', 'Dedicated Memory'],
  },
  snake: {
    name: 'Master of the Royal Menagerie',
    title: 'Imperial Gaming Arbiter',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    bio: 'Preserves classic retro CRT pastimes and arcade diversions in pure monochrome phosphor.',
    roleExplanation:
      'Aethelgard Royal Serpent retro arcade game with CRT scanlines, mechanical D-pad control, high-score tracking, and antique bell chimes.',
    syncedServices: ['Tactile D-Pad Engine', 'Phosphor CRT Renderer', 'High Score Ledger'],
  },
  colour_memory: {
    name: 'Countess Aurelia of Florence',
    title: 'Keeper of the Royal Jewel Vault',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: 'Custodian of the singing jewel box and imperial memory trials.',
    roleExplanation:
      'Antique Royal Colour Memory puzzle that displays sequences of 3 to 5 singing jewels (Ruby, Emerald, Sapphire, Topaz, Amethyst) for the user to reproduce with harmonic bell tones.',
    syncedServices: ['Polyphonic Harmonic Synthesizer', '3 to 5 Jewel Memory Trials', 'Streak Tracker'],
  },
};
