'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import './App.css';

// ============================================================
// キャラクター定義
// ============================================================
type CharacterId = 'human' | 'vtuber' | 'cat';

interface Character {
  id: CharacterId;
  name: string;
  title: string;
  color: string;
  accent: string;
  emoji: string;
  images: {
    idle: string;
    medium: string;
    large: string;
  };
  reactions: {
    small: string[];
    medium: string[];
    large: string[];
    idle: string[];
  };
}

const CHARACTERS: Character[] = [
  {
    id: 'human',
    name: '田中（実写）',
    title: '一般人 / 雑談配信者',
    color: '#3b82f6',
    accent: '#93c5fd',
    emoji: '👤',
    images: {
      idle: '/human.png',
      medium: '/human_happy.png',
      large: '/human_surprised.png',
    },
    reactions: {
      idle: ['あ、どうも。マイク入ってますか？', '今日はまったり雑談です。', 'お茶でも飲みながら話しましょう。'],
      small: ['お、100円！ありがとうございます！', 'お茶代助かります笑', '感謝です！'],
      medium: ['おおっ、500円！マジですか！', 'ありがとうございます！夕飯が豪華になります！', '助かる〜！'],
      large: ['えっ、赤スパ！？！？', 'ちょっと待って、高すぎない！？大丈夫！？', '本当にありがとうございます！！一生ついていきます！！😭'],
    },
  },
  {
    id: 'vtuber',
    name: 'ルナ・ステラ',
    title: '銀河のVtuber',
    color: '#a855f7',
    accent: '#d8b4fe',
    emoji: '🌟',
    images: {
      idle: '/vtuber.png',
      medium: '/vtuber_excited.png',
      large: '/vtuber_shocked.png',
    },
    reactions: {
      idle: ['こんるな〜🌟', 'みんな息してる〜？（圧）', '今日も元気に配信中だよ！💕'],
      small: ['ないすぱ〜💕', 'チャリンチャリン🎶', 'あざまる水産！'],
      medium: ['うおー！ありがとー！！✨', 'めちゃくちゃ助かるにゃ〜！', 'テンション上がってきた！！🎀'],
      large: ['赤スパ来たーー！！！🎉', '石油王じゃん！！愛してる！！！💖', 'スクショ！みんなスクショして！！📸'],
    },
  },
  {
    id: 'cat',
    name: 'タマ（猫）',
    title: '配信デスクの主',
    color: '#f59e0b',
    accent: '#fcd34d',
    emoji: '🐱',
    images: {
      idle: '/cat.png',
      medium: '/cat_happy.png',
      large: '/cat_surprised.png',
    },
    reactions: {
      idle: ['ニャー', 'ゴロゴロ...', '（毛づくろいに夢中）'],
      small: ['ニャッ！？', 'にゃ〜ん🎶', '（しっぽを振る）'],
      medium: ['ンニャオ！！✨', '（ちゅ〜るの気配に敏感）', 'ゴロゴロ...（ご機嫌）'],
      large: ['フシャーッ！！！（大興奮）', '（キーボードの上でダンス）', 'ニャオオオオン！！！！🎊'],
    },
  },
];

// ============================================================
// エフェクト定義
// ============================================================
type TierType = 'small' | 'medium' | 'large';

interface SuperchatTier {
  id: TierType;
  label: string;
  coin: string;
  amount: string;
  color: string;
}

const TIERS: SuperchatTier[] = [
  { id: 'small', label: '🎁 100円', coin: '💙', amount: '¥100', color: '#3b82f6' },
  { id: 'medium', label: '🎁 500円', coin: '💚', amount: '¥500', color: '#10b981' },
  { id: 'large', label: '🎁 1000円', coin: '❤️', amount: '¥1,000', color: '#ef4444' },
];

interface Message {
  id: string;
  tier: TierType;
  text: string;
  name: string;
  amount: string;
  color: string;
}

// ============================================================
// メインアプリ
// ============================================================
export default function App() {
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [viewerName, setViewerName] = useState(() => localStorage.getItem('viewer_name') || '');
  const [nameInput, setNameInput] = useState(() => localStorage.getItem('viewer_name') || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [reacting, setReacting] = useState<TierType | null>(null);
  const [currentText, setCurrentText] = useState('');
  const [voltage, setVoltage] = useState(0);
  const [showYTButton, setShowYTButton] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const reactTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // テキスト自動更新
  useEffect(() => {
    if (!selectedChar) return;
    const texts = reacting ? selectedChar.reactions[reacting] : selectedChar.reactions.idle;
    setCurrentText(texts[Math.floor(Math.random() * texts.length)]);
  }, [reacting, selectedChar]);

  // ボルテージ自然減衰
  useEffect(() => {
    const timer = setInterval(() => {
      setVoltage(v => Math.max(0, v - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ボルテージ閾値でYTボタン表示
  useEffect(() => {
    if (voltage >= 75) setShowYTButton(true);
  }, [voltage]);

  const fireConfetti = useCallback(() => {
    const end = Date.now() + 2 * 1000;
    const colors = ['#ff6eb4', '#a855f7', '#60a5fa', '#f59e0b'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  const handleSendSuperchat = useCallback((tier: TierType) => {
    if (!selectedChar || !viewerName) return;

    const tierData = TIERS.find(t => t.id === tier)!;
    
    // 画面の揺れ
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    // ド派手演出（大）
    if (tier === 'large') {
      fireConfetti();
    }

    // メッセージ追加
    const reactions = selectedChar.reactions[tier];
    const newMsg: Message = {
      id: crypto.randomUUID(),
      tier,
      text: reactions[Math.floor(Math.random() * reactions.length)],
      name: viewerName,
      amount: tierData.amount,
      color: tierData.color,
    };
    setMessages(prev => [...prev.slice(-4), newMsg]);

    // リアクション
    if (reactTimeout.current) clearTimeout(reactTimeout.current);
    setReacting(tier);
    reactTimeout.current = setTimeout(() => setReacting(null), tier === 'large' ? 5000 : 3000);

    // ボルテージ
    const gain = tier === 'large' ? 25 : tier === 'medium' ? 12 : 5;
    setVoltage(v => Math.min(100, v + gain));
  }, [selectedChar, viewerName, fireConfetti]);

  const handleNameSubmit = () => {
    if (!nameInput.trim()) return;
    setViewerName(nameInput.trim());
    localStorage.setItem('viewer_name', nameInput.trim());
  };

  // ------------------------------------------------------------
  // キャラ選択画面
  // ------------------------------------------------------------
  if (!selectedChar) {
    return (
      <div className="char-select-screen">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="select-header"
        >
          <h1 className="app-title">💰 スパチャ体験デモ V2</h1>
          <p className="app-subtitle">プレミアムな体験で、あの興奮をもう一度。</p>
        </motion.div>
        
        <div className="char-grid">
          {CHARACTERS.map((char, index) => (
            <motion.button
              key={char.id}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, translateY: -10 }}
              className="char-card-premium"
              onClick={() => setSelectedChar(char)}
              style={{ '--accent': char.color } as React.CSSProperties}
            >
              <div className="char-img-wrap">
                <img src={char.images.idle} alt={char.name} className="char-img-preview" />
                <div className="img-overlay" />
              </div>
              <div className="char-info-box">
                <span className="char-emoji-large">{char.emoji}</span>
                <span className="char-title-tag">{char.title}</span>
                <h3 className="char-name-big">{char.name}</h3>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // 現在表示すべき画像を決定
  const displayImage = reacting === 'large' ? selectedChar.images.large : (reacting === 'medium' ? selectedChar.images.medium : selectedChar.images.idle);

  // ------------------------------------------------------------
  // メイン画面
  // ------------------------------------------------------------
  return (
    <div className={`app-screen premium ${isShaking ? 'shake-screen' : ''}`}>
      <div className="bg-dynamic-gradient" style={{ '--char-color': selectedChar.color } as React.CSSProperties} />
      
      <header className="premium-header">
        <motion.button 
          whileHover={{ x: -5 }}
          className="back-btn-premium" 
          onClick={() => { setSelectedChar(null); setShowYTButton(false); setVoltage(0); }}
        >
          ← EXIT
        </motion.button>
        <div className="header-center">
          <div className="live-status">
            <span className="pulse-dot" />
            LIVE
          </div>
          <h2 className="header-char-name">{selectedChar.name} のライブ配信</h2>
        </div>
        <div className="header-right">
          <div className="voltage-pills">
            <span className="voltage-icon">🔥</span>
            <div className="voltage-meter">
              <motion.div 
                className="voltage-progress" 
                animate={{ width: `${voltage}%`, backgroundColor: selectedChar.color }} 
              />
            </div>
          </div>
        </div>
      </header>

      <main className="premium-layout">
        <div className="stage">
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedChar.id + (reacting || 'idle')}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="character-visual-wrap"
            >
              <AnimatePresence>
                {currentText && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bubble-premium"
                    style={{ borderColor: selectedChar.color }}
                  >
                    {currentText}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.img 
                key={displayImage}
                src={displayImage} 
                alt={selectedChar.name} 
                className={`stage-char-img ${reacting ? 'active-reaction' : ''}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={reacting === 'large' ? { 
                  opacity: 1,
                  scale: [1, 1.1, 1],
                  rotate: [0, -2, 2, 0],
                } : reacting ? { 
                  opacity: 1,
                  y: [0, -20, 0] 
                } : { 
                  opacity: 1,
                  y: [0, -5, 0] 
                }}
                transition={{ 
                  opacity: { duration: 0.2 },
                  duration: reacting === 'large' ? 0.3 : reacting ? 0.4 : 3, 
                  repeat: reacting ? 0 : Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="premium-sidebar">
          <div className="glass-panel user-identity">
            <h4 className="panel-sub">IDENTITY</h4>
            <div className="username-field">
              <input 
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
                placeholder="あなたの名前..."
                className="premium-input"
              />
              <button onClick={handleNameSubmit} className="premium-action-btn">SET</button>
            </div>
            {viewerName && (
              <div className="id-active flex items-center justify-between">
                <span>ID: {viewerName}</span>
                <a 
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedChar.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 font-bold"
                  title={`${selectedChar.name} を YouTube で検索`}
                >
                  <span className="text-[10px]">YouTubeで検索</span>
                  <span>↗</span>
                </a>
              </div>
            )}
          </div>

          <div className="glass-panel superchat-actions">
            <h4 className="panel-sub">SUPPORT</h4>
            <div className="sc-button-grid">
              {TIERS.map(tier => (
                <motion.button
                  key={tier.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!viewerName}
                  onClick={() => handleSendSuperchat(tier.id)}
                  className={`sc-btn-premium tier-${tier.id}`}
                  style={{ '--t-color': tier.color } as React.CSSProperties}
                >
                  <span className="sc-icon">{tier.coin}</span>
                  <div className="sc-btn-label">
                    <span className="sc-amt">{tier.amount}</span>
                    <span className="sc-desc">{tier.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="glass-panel feed-log">
            <h4 className="panel-sub">LIVE FEED</h4>
            <div className="feed-scroll">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: 20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: -20 }}
                    className="sc-log-card"
                    style={{ borderLeftColor: msg.color }}
                  >
                    <div className="log-head">
                      <span className="log-user">{msg.name}</span>
                      <span className="log-amt" style={{ color: msg.color }}>{msg.amount}</span>
                    </div>
                    <p className="log-msg">{msg.text}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence>
            {showYTButton && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="yt-cta-premium"
              >
                <div className="cta-content">
                  <h5>🔥 熱狂の渦！</h5>
                  <p>本物のスパチャで、さらに熱く応援しよう。</p>
                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedChar.name)}`}
                    target="_blank" 
                    rel="noreferrer" 
                    className="cta-btn-red"
                  >
                    YouTubeで応援する
                  </a>
                </div>
                <button className="cta-dismiss" onClick={() => setShowYTButton(false)}>✕</button>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </main>
    </div>
  );
}
