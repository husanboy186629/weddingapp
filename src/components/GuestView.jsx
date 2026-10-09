import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Send,
  Sparkles,
  User,
  MessageCircleHeart,
  CalendarHeart,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─────────── Vaqt formati ─────────── */
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

/* ═══════════════════════════════════
   MEHMON LOGIN MODAL (Ism-Familiya)
   ═══════════════════════════════════ */
function GuestLogin({ onLogin }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimF = firstName.trim();
    const trimL = lastName.trim();
    if (!trimF || !trimL) return;
    const guest = { firstName: trimF, lastName: trimL };
    localStorage.setItem('wedding_guest', JSON.stringify(guest));
    onLogin(guest);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="luxury-card rounded-2xl p-7 sm:p-8 w-full max-w-md animate-fade-in-up relative overflow-hidden shadow-2xl">
        {/* Dekorativ oltin burchaklar */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold-500 rounded-tl-2xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold-500 rounded-br-2xl" />

        <div className="text-center mb-6">
          <Heart className="w-12 h-12 text-rose-500 mx-auto mb-2 animate-heartbeat" />
          <h2 className="font-script text-4xl text-gold-600 mb-1">Xush kelibsiz!</h2>
          <p className="font-serif text-base text-gray-600">
            Kelin va kuyovga tabrik yo'llash uchun ism-familiyangizni kiriting
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-serif text-sm font-semibold text-gray-700 mb-1">
              Ismingiz
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Masalan: Xusanboy"
                required
                className="w-full pl-11 pr-4 py-3 border border-gold-200 rounded-xl bg-white/90
                           font-serif text-base focus:border-gold-500 focus:ring-2 focus:ring-gold-200
                           transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-serif text-sm font-semibold text-gray-700 mb-1">
              Familiyangiz
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Masalan: Xamidov"
                required
                className="w-full pl-11 pr-4 py-3 border border-gold-200 rounded-xl bg-white/90
                           font-serif text-base focus:border-gold-500 focus:ring-2 focus:ring-gold-200
                           transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-gold py-3.5 rounded-xl font-serif text-lg font-semibold
                       flex items-center justify-center gap-2 mt-2 shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            Kirish va Tabriklash
          </button>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   TABRIK KARTASI
   ═══════════════════════════════════ */
function WishCard({ wish, index }) {
  return (
    <div
      className="luxury-card rounded-2xl p-5 animate-fade-in-up relative overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 via-rose-300 to-gold-400" />

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-gold-400 to-gold-600
                        flex items-center justify-center text-white font-serif font-bold text-lg shadow-md">
          {wish.firstName?.[0]?.toUpperCase() || '?'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap justify-between">
            <h4 className="font-serif font-bold text-gray-800 text-lg">
              {wish.firstName} {wish.lastName}
            </h4>
            {wish.createdAt && (
              <span className="text-xs text-gray-400 font-sans">
                {formatTime(wish.createdAt)}
              </span>
            )}
          </div>
          <p className="mt-2.5 font-sans text-gray-700 text-base leading-relaxed whitespace-pre-wrap break-words">
            {wish.message}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   ASOSIY MEHMON SAHIFASI
   ═══════════════════════════════════ */
export default function GuestView() {
  const [guest, setGuest] = useState(null);
  const [message, setMessage] = useState('');
  const [wishes, setWishes] = useState([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // LocalStorage dan mehmonni tiklash
  useEffect(() => {
    const saved = localStorage.getItem('wedding_guest');
    if (saved) {
      try {
        setGuest(JSON.parse(saved));
      } catch {
        localStorage.removeItem('wedding_guest');
      }
    }
  }, []);

  // Ma'lumotlarni serverdan yuklash funksiyasi
  const fetchWishes = async () => {
    try {
      const res = await fetch('/api/wishes');
      if (res.ok) {
        const data = await res.json();
        setWishes(data);
      }
    } catch (err) {
      console.warn('API fetch xatolik:', err);
    }
  };

  // Real-time: SSE orqali tinglash + har 4 soniyada zaxira tekshiruv (mobil tarmoq uzilishlari uchun)
  useEffect(() => {
    fetchWishes();

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
      evtSource.onerror = () => {
        // SSE uzilsa polling orqali ishlab turadi
      };
    } catch (e) {
      console.warn(e);
    }

    const interval = setInterval(fetchWishes, 4000);

    return () => {
      if (evtSource) evtSource.close();
      clearInterval(interval);
    };
  }, []);

  // Tabrik yuborish
  const handleSend = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || !guest) return;

    setSending(true);
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: guest.firstName,
          lastName: guest.lastName,
          message: text,
        }),
      });

      if (!res.ok) {
        throw new Error('Server xatosi');
      }

      const created = await res.json();
      setMessage('');
      setSent(true);
      // Mahalliy ro'yxatga ham darhol qo'shish
      setWishes((prev) => [created, ...prev.filter(w => w.id !== created.id)]);
      setTimeout(() => setSent(false), 3500);
    } catch (err) {
      console.error('Xatolik:', err);
      alert("Tabrik yuborishda xatolik yuz berdi. Server ishlayotganiga ishonch hosil qiling.");
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('wedding_guest');
    setGuest(null);
  };

  return (
    <div className="min-h-screen bg-cream bg-wedding-pattern flex flex-col justify-between">
      {/* Mehmon kirmagan bo'lsa modal chiqadi */}
      {!guest && <GuestLogin onLogin={setGuest} />}

      <div>
        {/* ─── HEADER ─── */}
        <header className="relative pt-8 pb-6 px-4 text-center overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gold-200/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-lg mx-auto">
            <Sparkles className="w-6 h-6 text-gold-500 mx-auto mb-2 animate-float" />

            <p className="font-serif text-sm tracking-[0.3em] text-gold-600 uppercase mb-2">
              Raqamli Tilaklar Kitobi
            </p>

            <h1 className="font-script text-5xl sm:text-6xl text-gold-600 mb-2 leading-tight">
              Fotima & Ibrohimjon
            </h1>

            <div className="flex items-center justify-center gap-3 my-2">
              <span className="h-px w-14 bg-gold-400" />
              <Heart className="w-4 h-4 text-rose-500 animate-heartbeat" />
              <span className="h-px w-14 bg-gold-400" />
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-700 font-serif text-lg">
              <CalendarHeart className="w-5 h-5 text-gold-600" />
              <span>20 Oktyabr, 2026</span>
            </div>

            <p className="mt-4 font-serif text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
              Bizning unutilmas to'y oqshomimizga xush kelibsiz! Kelin va kuyovga
              o'z ezgu tilaklaringizni yozib qoldiring. 💛
            </p>
          </div>
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <main className="max-w-lg mx-auto px-4 pb-8">
          {/* Mehmon paneli */}
          {guest && (
            <div className="flex items-center justify-between mb-5 px-4 py-2.5 luxury-card rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600
                                flex items-center justify-center text-white text-sm font-serif font-bold">
                  {guest.firstName[0].toUpperCase()}
                </div>
                <span className="font-serif text-sm font-semibold text-gray-800">
                  {guest.firstName} {guest.lastName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                title="Ismni o'zgartirish"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── FORM ── */}
          {guest && (
            <form onSubmit={handleSend} className="mb-8">
              <div className="luxury-card rounded-2xl p-5 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-300 via-gold-400 to-rose-300" />

                <div className="flex items-center gap-2 mb-3">
                  <MessageCircleHeart className="w-5 h-5 text-gold-600" />
                  <h3 className="font-serif font-bold text-gray-800 text-lg">
                    Tilagingizni yozing
                  </h3>
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Kelin va kuyovga o'z samimiy tabrik va duolaringizni yozing..."
                  rows={4}
                  required
                  maxLength={1000}
                  className="w-full p-3.5 border border-gold-200 rounded-xl bg-white/70 font-sans text-base
                             resize-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200
                             transition-all placeholder:text-gray-400"
                />

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400 font-sans">
                    {message.length}/1000
                  </span>
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="btn-gold px-6 py-2.5 rounded-xl font-serif font-semibold text-base
                               flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                               shadow-md"
                  >
                    {sending ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                        </svg>
                        Yuborilmoqda...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Yuborish
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Muvaffaqiyat xabari */}
              {sent && (
                <div className="mt-3 flex items-center gap-2 justify-center text-emerald-dark font-serif
                                text-sm animate-fade-in bg-green-50 py-2.5 rounded-xl border border-green-200 shadow-sm">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Tabrigingiz qabul qilindi va bazaga saqlandi! Rahmat!
                </div>
              )}
            </form>
          )}

          {/* ── FEED ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-500" />
                <h3 className="font-serif font-bold text-gray-800 text-xl">
                  Barcha Tabriklar
                </h3>
              </div>
              <span className="text-sm text-gold-700 font-serif font-semibold bg-gold-100 px-2.5 py-0.5 rounded-full">
                {wishes.length} ta tilak
              </span>
            </div>

            {wishes.length === 0 ? (
              <div className="text-center py-16 luxury-card rounded-2xl">
                <Heart className="w-12 h-12 text-gold-400 mx-auto mb-3 animate-float" />
                <p className="font-serif text-gray-600 text-lg">
                  Hozircha tilaklar yo'q
                </p>
                <p className="font-sans text-gray-400 text-sm mt-1">
                  Birinchi bo'lib tabrik qoldiring!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {wishes.map((w, i) => (
                  <WishCard key={w.id} wish={w} index={i} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* FOOTER & ADMIN LINK */}
      <footer className="text-center py-6 font-sans text-xs text-gray-400 flex flex-col items-center gap-2">
        <span className="ornament">Fotima & Ibrohimjon — 20.10.2026</span>
        <Link
          to="/admin"
          className="text-gray-400 hover:text-gold-600 transition-colors flex items-center gap-1 font-serif text-xs opacity-70 hover:opacity-100"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Admin panelga o'tish
        </Link>
      </footer>
    </div>
  );
}
