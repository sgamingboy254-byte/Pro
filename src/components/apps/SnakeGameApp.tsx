/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
  Volume2,
} from 'lucide-react';
import { playClickSound, playRoyalBellChime, playTone } from '../../utils/audio';
import { triggerHaptic, hapticButtonClick, hapticMicro, hapticSuccess } from '../../utils/haptics';

interface Props {
  onBack: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 16;
const INITIAL_SNAKE: Point[] = [
  { x: 8, y: 8 },
  { x: 8, y: 9 },
  { x: 8, y: 10 },
];

export default function SnakeGameApp({ onBack }: Props) {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>('UP');
  const [food, setFood] = useState<Point>({ x: 8, y: 4 });
  const [bonusFood, setBonusFood] = useState<Point | null>(null);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('royal_snake_high_score') || '0', 10);
  });
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(140); // ms per step
  const [speedLabel, setSpeedLabel] = useState<'Sovereign' | 'Imperial' | 'Blitz'>('Imperial');

  const nextDirectionRef = useRef<Direction>('UP');
  const gameLoopRef = useRef<number | null>(null);

  // Generate random food not on snake
  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = currentSnake.some(
        (seg) => seg.x === newFood.x && seg.y === newFood.y
      );
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    hapticButtonClick();
    playClickSound(800, 0.02);
    setSnake(INITIAL_SNAKE);
    setDirection('UP');
    nextDirectionRef.current = 'UP';
    setFood(generateFood(INITIAL_SNAKE));
    setBonusFood(null);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
  };

  const changeDirection = (newDir: Direction) => {
    const cur = direction;
    // Prevent 180-degree instant reversal
    if (
      (newDir === 'UP' && cur === 'DOWN') ||
      (newDir === 'DOWN' && cur === 'UP') ||
      (newDir === 'LEFT' && cur === 'RIGHT') ||
      (newDir === 'RIGHT' && cur === 'LEFT')
    ) {
      return;
    }
    nextDirectionRef.current = newDir;
    playClickSound(950, 0.015);
    hapticMicro();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          setIsPaused((p) => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  // Game Loop
  useEffect(() => {
    if (isGameOver || isPaused) return;

    gameLoopRef.current = window.setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const curDir = nextDirectionRef.current;
        setDirection(curDir);

        let newHead: Point;
        switch (curDir) {
          case 'UP':
            newHead = { x: head.x, y: head.y - 1 };
            break;
          case 'DOWN':
            newHead = { x: head.x, y: head.y + 1 };
            break;
          case 'LEFT':
            newHead = { x: head.x - 1, y: head.y };
            break;
          case 'RIGHT':
            newHead = { x: head.x + 1, y: head.y };
            break;
        }

        // Wall collision check
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          playTone(220, 0.25, 'sawtooth');
          triggerHaptic([60, 40, 80]);
          return prevSnake;
        }

        // Self collision check
        if (prevSnake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
          setIsGameOver(true);
          playTone(200, 0.3, 'sawtooth');
          triggerHaptic([60, 40, 80]);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          playRoyalBellChime();
          triggerHaptic([20, 20]);
          setScore((s) => {
            const nextScore = s + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('royal_snake_high_score', nextScore.toString());
            }
            // Spawn bonus crown every 50 points
            if (nextScore % 50 === 0) {
              setBonusFood(generateFood(newSnake));
            }
            return nextScore;
          });
          setFood(generateFood(newSnake));
        } else if (bonusFood && newHead.x === bonusFood.x && newHead.y === bonusFood.y) {
          // Bonus crown eaten!
          playTone(880, 0.2, 'sine');
          hapticSuccess();
          setScore((s) => {
            const nextScore = s + 50;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('royal_snake_high_score', nextScore.toString());
            }
            return nextScore;
          });
          setBonusFood(null);
        } else {
          // Normal step: pop tail
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [food, bonusFood, isGameOver, isPaused, speed, highScore, generateFood]);

  const toggleSpeed = () => {
    hapticMicro();
    playClickSound(850, 0.02);
    if (speed === 180) {
      setSpeed(130);
      setSpeedLabel('Imperial');
    } else if (speed === 130) {
      setSpeed(90);
      setSpeedLabel('Blitz');
    } else {
      setSpeed(180);
      setSpeedLabel('Sovereign');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0d10] text-[#eedecf] select-none overflow-hidden font-sans">
      {/* Top Antique Navigation Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#121419] border-b-2 border-[#362e24] shadow-md shrink-0">
        <button
          onClick={() => {
            hapticButtonClick();
            playClickSound(800, 0.02);
            onBack();
          }}
          className="flex items-center gap-1 text-xs text-[#c5a880] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-serif-royal font-bold text-[11px] tracking-wider uppercase">Menu</span>
        </button>

        <div className="flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-[#c5a880] fill-current" />
          <span className="font-serif-royal font-bold text-xs tracking-wider text-white uppercase">
            Royal Serpent
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSpeed}
            className="px-2 py-0.5 rounded-lg bg-[#1a1c23] border border-[#483d30] text-[10px] font-mono-tech text-[#c5a880] hover:bg-[#262832]"
            title="Adjust Pace"
          >
            {speedLabel}
          </button>
          <button
            onClick={() => {
              hapticMicro();
              setIsPaused((p) => !p);
            }}
            className="p-1 rounded-lg bg-[#1a1c23] border border-[#483d30] text-[#c5a880] hover:bg-[#262832]"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Game Screen & Score Header */}
      <div className="flex-1 flex flex-col items-center justify-between p-2 overflow-y-auto min-h-0">
        {/* Score & Trophy Header */}
        <div className="w-full max-w-[340px] flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#14161c] border border-[#2d251d] shadow-sm mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-serif-royal text-[#a6927d] uppercase tracking-wider">Score:</span>
            <span className="font-mono-tech text-sm font-bold text-emerald-400">{score}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#c5a880]" />
            <span className="text-[10px] font-serif-royal text-[#a6927d] uppercase tracking-wider">Best:</span>
            <span className="font-mono-tech text-sm font-bold text-[#c5a880]">{highScore}</span>
          </div>
        </div>

        {/* Vintage Royal Green CRT Screen with Ornate Brass Border */}
        <div className="relative w-full max-w-[320px] aspect-square rounded-2xl bg-[#08150c] border-4 border-[#4a3f32] shadow-[inset_0_0_20px_rgba(0,0,0,0.9),0_10px_25px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center p-1">
          {/* Subtle CRT scanline effect */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-70" />

          {/* Grid display */}
          <div
            className="w-full h-full grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
              const x = idx % GRID_SIZE;
              const y = Math.floor(idx / GRID_SIZE);

              const isHead = snake[0].x === x && snake[0].y === y;
              const isBody = snake.some((seg, sIdx) => sIdx > 0 && seg.x === x && seg.y === y);
              const isFood = food.x === x && food.y === y;
              const isBonus = bonusFood && bonusFood.x === x && bonusFood.y === y;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-center relative"
                >
                  {isHead && (
                    <div className="w-[85%] h-[85%] rounded-sm bg-gradient-to-br from-[#c5a880] to-[#917551] border border-white/60 shadow-[0_0_8px_rgba(197,168,128,0.9)] z-20" />
                  )}
                  {isBody && (
                    <div className="w-[75%] h-[75%] rounded-sm bg-gradient-to-br from-[#2ed573] to-[#1e824c] border border-emerald-400/30 z-10 shadow-[0_0_4px_rgba(46,213,115,0.6)]" />
                  )}
                  {isFood && (
                    <div className="w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-rose-500 to-amber-300 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.9)] z-10" />
                  )}
                  {isBonus && (
                    <div className="w-[90%] h-[90%] rounded-full bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-600 animate-bounce shadow-[0_0_12px_rgba(251,191,36,1)] z-15 flex items-center justify-center">
                      <Crown className="w-2.5 h-2.5 text-black" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Game Over Screen Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 text-center space-y-2">
              <span className="font-serif-royal font-bold text-lg text-rose-400 tracking-wider uppercase">
                Serpent Fallen
              </span>
              <p className="text-xs text-[#eedecf] font-mono-tech">
                Final Score: <span className="font-bold text-emerald-400">{score}</span>
              </p>
              <button
                onClick={resetGame}
                className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#ad8f65] text-black font-serif-royal font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Again</span>
              </button>
            </div>
          )}

          {/* Paused Overlay */}
          {isPaused && !isGameOver && (
            <div className="absolute inset-0 bg-black/75 z-30 flex flex-col items-center justify-center text-center">
              <span className="font-serif-royal font-bold text-sm text-[#c5a880] tracking-widest uppercase">
                Game Suspended
              </span>
              <span className="text-[10px] text-neutral-400 mt-1">Tap Play or Space to resume</span>
            </div>
          )}
        </div>

        {/* Antique D-Pad Controller with Vintage Tactile Buttons */}
        <div className="w-full max-w-[280px] flex flex-col items-center justify-center py-1">
          <button
            onClick={() => changeDirection('UP')}
            className="w-12 h-12 rounded-xl bg-[#1a1c22] border-2 border-[#483d30] shadow-md flex items-center justify-center text-[#c5a880] hover:text-white active:scale-90 active:bg-[#2d251d] transition-all"
            title="Up"
          >
            <ChevronUp className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-6 my-1">
            <button
              onClick={() => changeDirection('LEFT')}
              className="w-12 h-12 rounded-xl bg-[#1a1c22] border-2 border-[#483d30] shadow-md flex items-center justify-center text-[#c5a880] hover:text-white active:scale-90 active:bg-[#2d251d] transition-all"
              title="Left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Center Decorative Royal Medallion */}
            <div
              onClick={() => setIsPaused((p) => !p)}
              className="w-10 h-10 rounded-full bg-[#121317] border-2 border-[#3a3227] flex items-center justify-center text-[#8c735d] cursor-pointer shadow-inner active:scale-95"
              title="Pause / Resume"
            >
              <Crown className="w-4 h-4 text-[#c5a880]" />
            </div>

            <button
              onClick={() => changeDirection('RIGHT')}
              className="w-12 h-12 rounded-xl bg-[#1a1c22] border-2 border-[#483d30] shadow-md flex items-center justify-center text-[#c5a880] hover:text-white active:scale-90 active:bg-[#2d251d] transition-all"
              title="Right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <button
            onClick={() => changeDirection('DOWN')}
            className="w-12 h-12 rounded-xl bg-[#1a1c22] border-2 border-[#483d30] shadow-md flex items-center justify-center text-[#c5a880] hover:text-white active:scale-90 active:bg-[#2d251d] transition-all"
            title="Down"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
