import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  X,
  Crown,
} from 'lucide-react';
import { CalendarEvent } from '../../types/os';
import { playClickSound } from '../../utils/audio';

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'e_1',
    title: 'State Banquet for Austro-Hungarian Envoys',
    date: '2026-10-26',
    time: '20:00 - 23:30',
    location: 'Mirror Hall, Versailles Suite',
    category: 'banquet',
  },
  {
    id: 'e_2',
    title: 'Privy Council Briefing on Maritime Treaties',
    date: '2026-10-27',
    time: '11:00 - 13:00',
    location: 'Westminster Sovereign Chamber',
    category: 'diplomatic',
  },
  {
    id: 'e_3',
    title: 'Imperial Horology Guild Inspection',
    date: '2026-10-29',
    time: '14:30 - 16:00',
    location: 'Geneva Horology Quarter',
    category: 'personal',
  },
  {
    id: 'e_4',
    title: 'Crown Treasury Audit & Bullion Vault Check',
    date: '2026-10-31',
    time: '09:00 - 11:30',
    location: 'Central Vault Sector A',
    category: 'finance',
  },
];

export default function CalendarApp({ onBack }: { onBack: () => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(26);
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('royal_calendar_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('14:00');
  const [newLocation, setNewLocation] = useState('Imperial Drawing Room');

  useEffect(() => {
    localStorage.setItem('royal_calendar_events', JSON.stringify(events));
  }, [events]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    playClickSound(800, 0.02);
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    playClickSound(800, 0.02);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const dayEvents = events.filter((e) => e.date === selectedDateStr);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    playClickSound(900, 0.02);

    const created: CalendarEvent = {
      id: `e_${Date.now()}`,
      title: newTitle.trim(),
      date: selectedDateStr,
      time: newTime,
      location: newLocation,
      category: 'personal',
    };

    setEvents([...events, created]);
    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0c0e] text-[#eedecf] select-none">
      {/* App Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#292520] bg-[#121316]">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-[#eedecf] hover:text-[#c5a880] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-serif-royal">Home</span>
        </button>

        <div className="text-center">
          <span className="font-serif-royal text-xs tracking-wider text-[#c5a880] font-bold">
            Perpetual Calendar
          </span>
          <span className="block text-[9px] font-mono-tech text-[#8c735d]">
            ROYAL ALMANAC
          </span>
        </div>

        <button
          onClick={() => {
            playClickSound(850, 0.02);
            setShowAddModal(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#c5a880] text-black font-serif-royal font-bold text-xs rounded hover:bg-[#eedecf]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#141518] border-b border-[#24211c]">
        <button
          onClick={handlePrevMonth}
          className="p-1 text-[#8c735d] hover:text-[#c5a880]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <h3 className="font-serif-royal text-sm font-bold text-[#faf7f2] tracking-wider uppercase">
            {monthNames[month]} {year}
          </h3>
        </div>
        <button
          onClick={handleNextMonth}
          className="p-1 text-[#8c735d] hover:text-[#c5a880]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-3 bg-[#0d0e11] border-b border-[#24211c]">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center text-[10px] font-serif-royal text-[#8c735d] mb-1.5 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty_${i}`} className="h-8" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isSelected = selectedDay === dayNum;
            const dayDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const hasEvent = events.some((e) => e.date === dayDateStr);

            return (
              <button
                key={`day_${dayNum}`}
                onClick={() => {
                  playClickSound(850, 0.015);
                  setSelectedDay(dayNum);
                }}
                className={`h-8 rounded-lg text-xs font-mono-tech flex flex-col items-center justify-center relative transition-all ${
                  isSelected
                    ? 'bg-[#c5a880] text-black font-bold shadow-md scale-105'
                    : 'text-[#eedecf] hover:bg-[#1a1c21]'
                }`}
              >
                <span>{dayNum}</span>
                {hasEvent && (
                  <span
                    className={`w-1 h-1 rounded-full ${
                      isSelected ? 'bg-black' : 'bg-[#c5a880]'
                    } mt-0.5`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="text-[11px] font-serif-royal uppercase tracking-wider text-[#8c735d] flex items-center justify-between border-b border-[#221f1a] pb-1">
          <span>
            Events for {selectedDay} {monthNames[month]}
          </span>
          <span className="font-mono-tech text-[#c5a880]">{dayEvents.length} Decrees</span>
        </div>

        {dayEvents.length === 0 ? (
          <div className="text-center py-8 text-[#8c735d]">
            <Crown className="w-7 h-7 mx-auto opacity-30 mb-1" />
            <p className="font-serif-royal text-xs">No royal audience scheduled</p>
          </div>
        ) : (
          dayEvents.map((event) => (
            <div
              key={event.id}
              className="p-3 rounded-xl bg-[#141518] border border-[#2b2620] hover:border-[#c5a880]/50 transition-colors shadow-sm"
            >
              <h4 className="font-editorial text-base font-bold text-[#faf7f2]">
                {event.title}
              </h4>
              <div className="flex items-center gap-3 text-[11px] text-[#8c735d] font-mono-tech mt-1.5">
                <span className="flex items-center gap-1 text-[#c5a880]">
                  <Clock className="w-3 h-3" />
                  {event.time}
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddEvent}
            className="w-full max-w-sm bg-[#141518] border border-[#42392f] rounded-2xl p-4 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-[#2b251e] pb-2">
              <h4 className="font-serif-royal font-bold text-xs text-[#faf7f2] uppercase tracking-wider">
                Schedule Royal Audience
              </h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded bg-[#201d19] text-[#eedecf]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-mono-tech text-[#8c735d] block mb-1">
                Event Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Sovereign Treaty Signing"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0b0d] border border-[#3b342b] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono-tech text-[#8c735d] block mb-1">
                  Time
                </label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0b0d] border border-[#3b342b] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono-tech text-[#8c735d] block mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0b0d] border border-[#3b342b] text-xs text-white focus:outline-none focus:border-[#c5a880]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#c5a880] text-black font-serif-royal font-bold text-xs hover:bg-[#eedecf] transition-colors mt-2"
            >
              CONFIRM IMPERIAL APPOINTMENT
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
