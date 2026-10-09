import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import StoryCard from './StoryCard';
import { Link } from 'react-router-dom';
import {
  Lock,
  LogOut,
  Sparkles,
  Trash2,
  Users,
  MessageCircle,
  Shield,
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ADMIN_PIN = '20102026';

/* ═══════════════════════════════════
   ADMIN PIN LOGIN
   ═══════════════════════════════════ */
function AdminLogin({ onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.trim() === ADMIN_PIN) {
      sessionStorage.setItem('admin_auth', 'true');
      onLogin(true);
    } else {
      setError("Noto'g'ri pin-kod! (To'g'ri kod: 20102026)");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-cream bg-wedding-pattern flex items-center justify-center p-4">
      <div
        className={`luxury-card rounded-2xl p-8 w-full max-w-sm animate-fade-in-up relative overflow-hidden shadow-2xl
                     ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
        style={shake ? { animation: 'shake 0.4s ease-in-out' } : {}}
      >
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-gold-500 rounded-tl-2xl" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-gold-500 rounded-br-2xl" />

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-400 to-gold-600
                          flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-gray-800">Admin Kirish</h2>
          <p className="font-sans text-sm text-gray-500 mt-1">To'y sanasini kiriting (kun oyi yili)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              placeholder="Masalan: 20102026"
              required
              className="w-full pl-11 pr-4 py-3 border border-gold-200 rounded-xl bg-white/90
                         font-serif text-lg text-center tracking-widest
                         focus:border-gold-500 focus:ring-2 focus:ring-gold-200
                         transition-all placeholder:tracking-normal"
            />
          </div>

          {error && (
            <p className="text-rose-500 text-sm text-center font-serif animate-fade-in">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full btn-gold py-3 rounded-xl font-serif text-lg font-semibold
                       flex items-center justify-center gap-2 shadow-md"
          >
            <Lock className="w-5 h-5" />
            Boshqaruvga Kirish
          </button>

          <div className="text-center pt-2">
            <Link to="/" className="text-sm font-serif text-gold-700 hover:underline">
              ← Mehmon sahifasiga qaytish
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   ADMIN ASOSIY PANELI
   ═══════════════════════════════════ */
export default function AdminView() {
  const [authed, setAuthed] = useState(false);
  const [wishes, setWishes] = useState([]);
  const [exportingId, setExportingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const storyRefs = useRef({});

  // Sessiyani tekshirish
  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setAuthed(true);
    }
  }, []);

  const loadWishes = async () => {
    try {
      const res = await fetch('/api/wishes');
      if (res.ok) {
        const data = await res.json();
        setWishes(data);
      }
    } catch (e) {
      console.warn('API xato:', e);
    }
  };

  // Real-time SSE + 3 soniyalik zaxira yangilanish
  useEffect(() => {
    if (!authed) return;

    loadWishes();

    let evtSource = null;
    try {
      evtSource = new EventSource('/api/wishes/stream');
      evtSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setWishes(data);
        } catch (e) {
          console.error(e);
        }
      };
    } catch (e) {
      console.warn(e);
    }

    const interval = setInterval(loadWishes, 3000);

    return () => {
      if (evtSource) evtSource.close();
      clearInterval(interval);
    };
  }, [authed]);

  // Instagram Story PNG formatida yuklab olish (1080x1920)
  const handleExport = useCallback(async (wish) => {
    const node = storyRefs.current[wish.id];
    if (!node) {
      alert("Shablon yuklanmadi. Qayta urinib ko'ring.");
      return;
    }
    setExportingId(wish.id);
    try {
      // Shriftlar to'liq render bo'lishi uchun 2 marta chaqirish
      await toPng(node, { quality: 1, pixelRatio: 1.5, cacheBust: true });
      const dataUrl = await toPng(node, { quality: 1, pixelRatio: 1.5, cacheBust: true });

      const link = document.createElement('a');
      const safeName = `${wish.firstName}_${wish.lastName}`.replace(/[^a-zA-Z0-9_]/g, '');
      link.download = `Story_${safeName}_${wish.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export xatosi:', err);
      alert("Rasmni yaratishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setExportingId(null);
    }
  }, []);

  // Tabrikni o'chirish
  const handleDelete = async (wishId) => {
    if (!window.confirm("Haqiqatan ham ushbu tabrikni o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/wishes/${wishId}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': ADMIN_PIN },
      });
      if (res.ok) {
        setWishes((prev) => prev.filter((w) => w.id !== wishId));
      } else {
        alert("O'chirishda xatolik!");
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setAuthed(false);
  };

  if (!authed) return <AdminLogin onLogin={setAuthed} />;

  // Statistika
  const uniqueGuests = new Set(
    wishes.map((w) => `${w.firstName}_${w.lastName}`.toLowerCase())
  ).size;

  return (
    <div className="min-h-screen bg-cream bg-wedding-pattern pb-12">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gold-200/60 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-1.5 rounded-lg border border-gold-200 text-gold-700 hover:bg-gold-50 transition-colors"
              title="Saytga o'tish"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif font-bold text-gray-800 text-lg sm:text-xl leading-tight">
                To'y Admin Paneli
              </h1>
              <p className="font-sans text-xs text-gold-700">
                Aziz & Aziza — 20.10.2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadWishes}
              className="p-2 text-gray-500 hover:text-gold-600 rounded-lg border border-gold-200 hover:bg-gold-50 transition-colors"
              title="Yangilash"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors font-serif text-sm border border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── STATISTIKA ── */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="luxury-card rounded-2xl p-4 text-center">
            <MessageCircle className="w-7 h-7 text-gold-500 mx-auto mb-1" />
            <p className="font-serif text-3xl font-bold text-gray-800">{wishes.length}</p>
            <p className="font-sans text-xs text-gray-500">Jami Tabriklar</p>
          </div>
          <div className="luxury-card rounded-2xl p-4 text-center">
            <Users className="w-7 h-7 text-gold-500 mx-auto mb-1" />
            <p className="font-serif text-3xl font-bold text-gray-800">{uniqueGuests}</p>
            <p className="font-sans text-xs text-gray-500">Qatnashgan Mehmonlar</p>
          </div>
          <div className="luxury-card rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
            <Sparkles className="w-7 h-7 text-rose-400 mx-auto mb-1 animate-pulse" />
            <p className="font-serif text-3xl font-bold text-gray-800">20 / 10</p>
            <p className="font-sans text-xs text-gray-500">To'y Sanasi (2026)</p>
          </div>
        </div>
      </div>

      {/* ── TABRIKLAR RO'YXATI ── */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-500" />
            <h2 className="font-serif font-bold text-gray-800 text-xl">
              Kelib tushgan tabriklar
            </h2>
          </div>
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Avto-yangilanmoqda
          </span>
        </div>

        {wishes.length === 0 ? (
          <div className="text-center py-16 luxury-card rounded-2xl">
            <MessageCircle className="w-12 h-12 text-gold-300 mx-auto mb-3" />
            <p className="font-serif text-gray-600 text-lg">Hozircha hech qanday tabrik yo'q</p>
            <p className="font-sans text-gray-400 text-sm mt-1">Mehmonlar xabar yozishi bilan bu yerda real-time chiqadi</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wishes.map((wish) => (
              <div key={wish.id} className="luxury-card rounded-2xl overflow-hidden shadow-sm">
                <div className="h-1 bg-gradient-to-r from-gold-400 via-rose-300 to-gold-400" />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600
                                      flex items-center justify-center text-white font-serif font-bold text-xl shadow-md">
                        {wish.firstName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-gray-800 text-lg">
                          {wish.firstName} {wish.lastName}
                        </h4>
                        {wish.createdAt && (
                          <p className="text-xs text-gray-400 font-sans">
                            {formatTime(wish.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tugmalar */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExport(wish)}
                        disabled={exportingId === wish.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                                   btn-gold text-white font-serif text-xs font-semibold
                                   shadow-md disabled:opacity-50"
                        title="Instagram Story (1080x1920) sifatida yuklash"
                      >
                        {exportingId === wish.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Yuklanmoqda...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-4 h-4" />
                            <span>Story PNG</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(wish.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="font-sans text-gray-700 text-base leading-relaxed whitespace-pre-wrap break-words bg-white/60 p-3.5 rounded-xl border border-gold-100">
                    {wish.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════
          INSTAGRAM STORY RENDER ZONE
          (Ekranning orqasida 1080x1920 rasmga aylantirish uchun)
         ═══════════════════════════════════ */}
      <div
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '1080px',
          pointerEvents: 'none',
        }}
      >
        {wishes.map((wish) => (
          <StoryCard
            key={wish.id}
            wish={wish}
            ref={(el) => {
              storyRefs.current[wish.id] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
}
