import React, { useState } from 'react';
import {
  ChevronLeft,
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Crown,
} from 'lucide-react';
import { playClickSound } from '../../utils/audio';

interface Message {
  id: string;
  role: 'user' | 'gemini';
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'g_intro',
    role: 'gemini',
    text: 'Greetings, Your Majesty. I am Gemini Sovereign, Royal Intelligence to the Crown of Aethelgard. Inquire of statecraft, sciences, arts, or high philosophies—I stand at your supreme command.',
    time: '08:00',
  },
];

const SUGGESTIONS = [
  'Draft a formal diplomatic treaty',
  'Explain quantum entanglement classically',
  'Compose a sonnet on horology & time',
  'Strategize sovereign gold reserves',
];

export default function GeminiApp({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    playClickSound(950, 0.02);
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      text,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply ||
        'Sire, the imperial neural network has registered your counsel. How may we proceed?';

      const geminiMsg: Message = {
        id: `g_${Date.now()}`,
        role: 'gemini',
        text: replyText,
        time: timeStr,
      };

      setMessages((prev) => [...prev, geminiMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: `g_${Date.now()}`,
        role: 'gemini',
        text: `Your Grace, I have received your mandate regarding "${text}". True nobility lies in patience and wisdom; the court archives are presently being synchronized.`,
        time: timeStr,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0b0d] text-[#eedecf] select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#292520] bg-[#121316]">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-[#eedecf] hover:text-[#c5a880] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-serif-royal">Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#c5a880] to-[#f5ede2] flex items-center justify-center text-black shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
          </div>
          <div>
            <span className="font-serif-royal text-xs tracking-wider text-[#c5a880] font-bold block">
              Google Gemini
            </span>
            <span className="text-[8px] font-mono-tech text-[#8c735d]">
              SOVEREIGN INTELLIGENCE 3.8
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            playClickSound(800, 0.02);
            setMessages(INITIAL_MESSAGES);
          }}
          className="p-1 text-[#8c735d] hover:text-[#eedecf]"
          title="Reset Royal Session"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-[#1c1d22] border border-[#c5a880] flex items-center justify-center text-[#c5a880] flex-shrink-0 mt-0.5">
                  <Crown className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-3 text-xs shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-[#c5a880] to-[#eedecf] text-black font-medium rounded-tr-none'
                    : 'bg-[#141518] text-[#faf7f2] border border-[#2b2721] rounded-tl-none'
                }`}
              >
                <div className="font-editorial text-sm leading-relaxed whitespace-pre-wrap">
                  {m.text}
                </div>
                <div
                  className={`flex items-center justify-between text-[9px] font-mono-tech mt-2 pt-1 border-t ${
                    isUser
                      ? 'border-[#8c735d]/30 text-[#4a3f31]'
                      : 'border-[#26221c] text-[#8c735d]'
                  }`}
                >
                  <span>{m.time}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(m.id, m.text)}
                      className="hover:text-white flex items-center gap-1"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-center">
            <div className="w-7 h-7 rounded-full bg-[#1c1d22] border border-[#c5a880] flex items-center justify-center text-[#c5a880]">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="px-3 py-2 rounded-xl bg-[#141518] border border-[#2b2721] text-xs text-[#c5a880] font-mono-tech flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880] animate-ping" />
              <span>Consulting Sovereign Neural Archives...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Chips */}
      <div className="p-2 border-t border-[#201d19] bg-[#0e0f12]">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="px-2.5 py-1 rounded-full text-[10px] font-serif-royal bg-[#181a1f] hover:bg-[#282a32] text-[#eedecf] border border-[#2c2721] whitespace-nowrap transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 mt-1.5"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Command Gemini Sovereign..."
            className="flex-1 px-3 py-2 rounded-xl bg-[#131417] border border-[#3b342b] text-xs text-[#faf7f2] placeholder-[#7d6f61] focus:outline-none focus:border-[#c5a880]"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-3.5 py-2 rounded-xl bg-[#c5a880] text-black font-serif-royal font-bold text-xs disabled:opacity-50 hover:bg-[#eedecf] transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
