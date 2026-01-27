import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
          Halo 3 Game Simulator
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          A database simulation app demonstrating PostgreSQL functions, triggers, and views
          through Halo 3-style multiplayer game tracking.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Link href="/games/new">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              Create New Game
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              View Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-500">Game Simulation</CardTitle>
            <CardDescription>
              Create games, assign players to teams, and record kill events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-zinc-400 space-y-2">
              <li>- Select maps and game types</li>
              <li>- Assign players to Red/Blue teams</li>
              <li>- Record kills with weapons and modifiers</li>
              <li>- Track headshots, assassinations, and sprees</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-500">Database Features</CardTitle>
            <CardDescription>
              PostgreSQL triggers and functions in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-zinc-400 space-y-2">
              <li>- Auto-updating player stats via triggers</li>
              <li>- Team score calculations</li>
              <li>- Kill streak tracking</li>
              <li>- Achievement awarding system</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-500">Stats & Views</CardTitle>
            <CardDescription>
              Rich statistics powered by PostgreSQL views
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-zinc-400 space-y-2">
              <li>- Player leaderboards</li>
              <li>- Weapon usage statistics</li>
              <li>- Game history and summaries</li>
              <li>- Achievement progress tracking</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-orange-500">Quick Start</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-orange-500">1</span>
            </div>
            <h3 className="font-semibold mb-1">Create Game</h3>
            <p className="text-sm text-zinc-500">Select a map and game type</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-orange-500">2</span>
            </div>
            <h3 className="font-semibold mb-1">Add Players</h3>
            <p className="text-sm text-zinc-500">Assign players to teams</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-orange-500">3</span>
            </div>
            <h3 className="font-semibold mb-1">Simulate</h3>
            <p className="text-sm text-zinc-500">Record kills and events</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-orange-500">4</span>
            </div>
            <h3 className="font-semibold mb-1">View Stats</h3>
            <p className="text-sm text-zinc-500">Check the dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
