'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  isJumping: boolean;
  isSwinging: boolean;
  swingFrame: number;
  health: number;
  color: string;
  name: string;
}

interface GameState {
  player1: Player;
  player2: Player;
  gameStatus: 'waiting' | 'playing' | 'ended';
  winner: string | null;
}

const GAME_WIDTH = 900;
const GAME_HEIGHT = 500;
const GROUND_Y = 420;
const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 80;
const GRAVITY = 0.8;
const JUMP_FORCE = -16;
const MOVE_SPEED = 5;
const SWORD_RANGE = 80;
const SWING_DURATION = 15;
const MAX_HEALTH = 100;
const DAMAGE = 25;

export default function SwordBattlesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const animationRef = useRef<number>(0);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'ended'>('waiting');
  const [winner, setWinner] = useState<string | null>(null);
  const [health1, setHealth1] = useState(MAX_HEALTH);
  const [health2, setHealth2] = useState(MAX_HEALTH);

  const initGame = useCallback(() => {
    const initialState: GameState = {
      player1: {
        x: 150,
        y: GROUND_Y - PLAYER_HEIGHT,
        vx: 0,
        vy: 0,
        facing: 'right',
        isJumping: false,
        isSwinging: false,
        swingFrame: 0,
        health: MAX_HEALTH,
        color: '#DC2626',
        name: 'Red Spartan',
      },
      player2: {
        x: GAME_WIDTH - 150 - PLAYER_WIDTH,
        y: GROUND_Y - PLAYER_HEIGHT,
        vx: 0,
        vy: 0,
        facing: 'left',
        isJumping: false,
        isSwinging: false,
        swingFrame: 0,
        health: MAX_HEALTH,
        color: '#2563EB',
        name: 'Blue Spartan',
      },
      gameStatus: 'playing',
      winner: null,
    };
    gameStateRef.current = initialState;
    setGameStatus('playing');
    setWinner(null);
    setHealth1(MAX_HEALTH);
    setHealth2(MAX_HEALTH);
  }, []);

  const drawSpartan = useCallback((ctx: CanvasRenderingContext2D, player: Player, isPlayer1: boolean) => {
    const { x, y, facing, isSwinging, swingFrame, color } = player;
    const facingRight = facing === 'right';

    ctx.save();

    // Legs
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(x + 15, y + 50, 12, 30);
    ctx.fillRect(x + 33, y + 50, 12, 30);

    // Body
    ctx.fillStyle = color;
    ctx.fillRect(x + 10, y + 20, 40, 35);

    // Helmet
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 30, y + 12, 18, 0, Math.PI * 2);
    ctx.fill();

    // Visor (position based on facing direction)
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    const visorX = facingRight ? x + 38 : x + 22;
    ctx.ellipse(visorX, y + 12, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Arms and sword
    ctx.fillStyle = color;
    if (isSwinging) {
      // Sword swing animation
      const swingAngle = (swingFrame / SWING_DURATION) * Math.PI - Math.PI / 4;
      const armX = facingRight ? x + 45 : x + 15;
      ctx.save();
      ctx.translate(armX, y + 30);
      if (!facingRight) ctx.scale(-1, 1);
      ctx.rotate(swingAngle);
      // Arm
      ctx.fillStyle = color;
      ctx.fillRect(0, -5, 25, 10);
      // Sword
      ctx.fillStyle = '#06B6D4';
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 15;
      ctx.fillRect(20, -3, 50, 6);
      ctx.restore();
    } else {
      // Sword arm at rest
      const swordArmX = facingRight ? x + 45 : x - 5;
      ctx.fillRect(swordArmX, y + 25, 20, 10);
      // Sword at rest
      ctx.fillStyle = '#06B6D4';
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 10;
      const swordX = facingRight ? x + 55 : x - 1;
      ctx.fillRect(swordX, y + 20, 6, 35);
    }

    // Other arm
    ctx.shadowBlur = 0;
    ctx.fillStyle = color;
    const otherArmX = facingRight ? x - 5 : x + 45;
    ctx.fillRect(otherArmX, y + 25, 20, 10);

    ctx.restore();

    // Health bar above player
    const healthPercent = player.health / MAX_HEALTH;
    const barWidth = 50;
    const barHeight = 6;
    const barX = x + (PLAYER_WIDTH - barWidth) / 2;
    const barY = y - 15;

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Player label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isPlayer1 ? 'P1' : 'P2', x + PLAYER_WIDTH / 2, barY - 5);
  }, []);

  const drawGame = useCallback((ctx: CanvasRenderingContext2D, state: GameState) => {
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
      const sx = (i * 73) % GAME_WIDTH;
      const sy = (i * 37) % (GROUND_Y - 50);
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

    // Ground detail
    ctx.fillStyle = '#4b5563';
    for (let i = 0; i < GAME_WIDTH; i += 30) {
      ctx.fillRect(i, GROUND_Y, 20, 3);
    }

    // Platform decorations
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(GAME_WIDTH, GROUND_Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw players
    drawSpartan(ctx, state.player1, true);
    drawSpartan(ctx, state.player2, false);

    // VS text in center
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.font = 'bold 120px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VS', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);
  }, [drawSpartan]);

  const checkSwordHit = useCallback((attacker: Player, defender: Player): boolean => {
    if (!attacker.isSwinging || attacker.swingFrame < 5 || attacker.swingFrame > 12) {
      return false;
    }

    const attackerCenter = attacker.x + PLAYER_WIDTH / 2;
    const defenderCenter = defender.x + PLAYER_WIDTH / 2;
    const distance = Math.abs(attackerCenter - defenderCenter);

    // Check if facing the right direction
    const isFacingDefender =
      (attacker.facing === 'right' && defenderCenter > attackerCenter) ||
      (attacker.facing === 'left' && defenderCenter < attackerCenter);

    // Check vertical overlap
    const verticalOverlap =
      attacker.y < defender.y + PLAYER_HEIGHT && attacker.y + PLAYER_HEIGHT > defender.y;

    return distance < SWORD_RANGE && isFacingDefender && verticalOverlap;
  }, []);

  const updateGame = useCallback(() => {
    if (!gameStateRef.current || gameStateRef.current.gameStatus !== 'playing') return;

    const state = gameStateRef.current;
    const keys = keysRef.current;

    // Player 1 controls (WASD + Space)
    if (keys.has('a')) {
      state.player1.vx = -MOVE_SPEED;
      state.player1.facing = 'left';
    } else if (keys.has('d')) {
      state.player1.vx = MOVE_SPEED;
      state.player1.facing = 'right';
    } else {
      state.player1.vx = 0;
    }

    if (keys.has('w') && !state.player1.isJumping) {
      state.player1.vy = JUMP_FORCE;
      state.player1.isJumping = true;
    }

    if (keys.has(' ') && !state.player1.isSwinging) {
      state.player1.isSwinging = true;
      state.player1.swingFrame = 0;
    }

    // Player 2 controls (Arrow keys + Enter)
    if (keys.has('arrowleft')) {
      state.player2.vx = -MOVE_SPEED;
      state.player2.facing = 'left';
    } else if (keys.has('arrowright')) {
      state.player2.vx = MOVE_SPEED;
      state.player2.facing = 'right';
    } else {
      state.player2.vx = 0;
    }

    if (keys.has('arrowup') && !state.player2.isJumping) {
      state.player2.vy = JUMP_FORCE;
      state.player2.isJumping = true;
    }

    if (keys.has('enter') && !state.player2.isSwinging) {
      state.player2.isSwinging = true;
      state.player2.swingFrame = 0;
    }

    // Update positions
    [state.player1, state.player2].forEach((player) => {
      // Apply gravity
      player.vy += GRAVITY;

      // Update position
      player.x += player.vx;
      player.y += player.vy;

      // Ground collision
      if (player.y >= GROUND_Y - PLAYER_HEIGHT) {
        player.y = GROUND_Y - PLAYER_HEIGHT;
        player.vy = 0;
        player.isJumping = false;
      }

      // Wall collision
      if (player.x < 0) player.x = 0;
      if (player.x > GAME_WIDTH - PLAYER_WIDTH) player.x = GAME_WIDTH - PLAYER_WIDTH;

      // Update swing animation
      if (player.isSwinging) {
        player.swingFrame++;
        if (player.swingFrame >= SWING_DURATION) {
          player.isSwinging = false;
          player.swingFrame = 0;
        }
      }
    });

    // Check for hits
    if (checkSwordHit(state.player1, state.player2) && state.player1.swingFrame === 8) {
      state.player2.health -= DAMAGE;
      setHealth2(state.player2.health);
      // Knockback
      state.player2.vx = state.player1.facing === 'right' ? 10 : -10;
      state.player2.vy = -5;
    }

    if (checkSwordHit(state.player2, state.player1) && state.player2.swingFrame === 8) {
      state.player1.health -= DAMAGE;
      setHealth1(state.player1.health);
      // Knockback
      state.player1.vx = state.player2.facing === 'right' ? 10 : -10;
      state.player1.vy = -5;
    }

    // Check for winner
    if (state.player1.health <= 0) {
      state.gameStatus = 'ended';
      state.winner = state.player2.name;
      setGameStatus('ended');
      setWinner(state.player2.name);
    } else if (state.player2.health <= 0) {
      state.gameStatus = 'ended';
      state.winner = state.player1.name;
      setGameStatus('ended');
      setWinner(state.player1.name);
    }
  }, [checkSwordHit]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !gameStateRef.current) return;

    updateGame();
    drawGame(ctx, gameStateRef.current);

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, drawGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'enter'].includes(key)) {
        e.preventDefault();
        keysRef.current.add(key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameStatus === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameStatus, gameLoop]);

  // Draw waiting screen
  useEffect(() => {
    if (gameStatus === 'waiting') {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Title
      ctx.fillStyle = '#06B6D4';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 20;
      ctx.fillText('EXTREME SWORD BATTLES', GAME_WIDTH / 2, 120);

      // Sword icon
      ctx.fillStyle = '#06B6D4';
      ctx.fillRect(GAME_WIDTH / 2 - 60, 160, 120, 8);
      ctx.fillRect(GAME_WIDTH / 2 - 10, 150, 20, 30);

      ctx.shadowBlur = 0;

      // Instructions
      ctx.fillStyle = '#fff';
      ctx.font = '18px monospace';
      ctx.fillText('1v1 Energy Sword Combat', GAME_WIDTH / 2, 220);

      ctx.font = '16px monospace';
      ctx.fillStyle = '#DC2626';
      ctx.fillText('PLAYER 1 (Red)', GAME_WIDTH / 2 - 150, 280);
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('W - Jump', GAME_WIDTH / 2 - 150, 310);
      ctx.fillText('A/D - Move', GAME_WIDTH / 2 - 150, 335);
      ctx.fillText('SPACE - Swing Sword', GAME_WIDTH / 2 - 150, 360);

      ctx.fillStyle = '#2563EB';
      ctx.fillText('PLAYER 2 (Blue)', GAME_WIDTH / 2 + 150, 280);
      ctx.fillStyle = '#9ca3af';
      ctx.fillText('UP - Jump', GAME_WIDTH / 2 + 150, 310);
      ctx.fillText('LEFT/RIGHT - Move', GAME_WIDTH / 2 + 150, 335);
      ctx.fillText('ENTER - Swing Sword', GAME_WIDTH / 2 + 150, 360);

      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('Press START to begin!', GAME_WIDTH / 2, 430);
    }
  }, [gameStatus]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-cyan-400">Extreme Sword Battles</h1>
        <div className="flex items-center gap-4">
          {gameStatus !== 'playing' && (
            <Button
              onClick={initGame}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {gameStatus === 'waiting' ? 'Start Battle' : 'Rematch'}
            </Button>
          )}
        </div>
      </div>

      {/* Health bars */}
      <div className="flex justify-between items-center max-w-[900px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-red-600" />
          <span className="font-mono text-red-400">P1</span>
          <div className="w-48 h-4 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-200"
              style={{ width: `${(health1 / MAX_HEALTH) * 100}%` }}
            />
          </div>
          <span className="font-mono text-sm text-zinc-400">{health1}%</span>
        </div>
        <div className="text-2xl font-bold text-zinc-600">VS</div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-zinc-400">{health2}%</span>
          <div className="w-48 h-4 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-200 ml-auto"
              style={{ width: `${(health2 / MAX_HEALTH) * 100}%` }}
            />
          </div>
          <span className="font-mono text-blue-400">P2</span>
          <div className="w-4 h-4 rounded-full bg-blue-600" />
        </div>
      </div>

      {/* Game Canvas */}
      <Card className="bg-zinc-900/50 border-zinc-800 max-w-[932px] mx-auto">
        <CardContent className="p-4">
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="rounded-lg border-2 border-cyan-500/30 mx-auto block"
            style={{ imageRendering: 'pixelated' }}
          />
        </CardContent>
      </Card>

      {/* Winner overlay */}
      {gameStatus === 'ended' && winner && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="bg-zinc-900 border-cyan-500/50 p-8 text-center">
            <CardContent className="space-y-4">
              <h2 className="text-4xl font-bold text-cyan-400">VICTORY!</h2>
              <p className="text-2xl" style={{ color: winner.includes('Red') ? '#DC2626' : '#2563EB' }}>
                {winner} Wins!
              </p>
              <Button onClick={initGame} className="bg-cyan-600 hover:bg-cyan-700 mt-4">
                Rematch
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls reminder */}
      <div className="max-w-[900px] mx-auto grid grid-cols-2 gap-8 text-sm text-zinc-500">
        <div className="text-center">
          <span className="text-red-400 font-semibold">Player 1:</span> W/A/D + SPACE
        </div>
        <div className="text-center">
          <span className="text-blue-400 font-semibold">Player 2:</span> Arrows + ENTER
        </div>
      </div>
    </div>
  );
}
