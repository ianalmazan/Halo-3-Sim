'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

interface User {
  id: string;
  gamertag: string;
  serviceTag: string;
}

interface Team {
  id: string;
  name: string;
  color: string;
}

interface FFAPlayerAssignmentProps {
  users: User[];
  teams: Team[];
  assignedPlayers: { userId: string; teamId: string | null }[];
  onAssign: (userId: string, teamId: string) => void;
  onRemove: (userId: string) => void;
  maxPlayers?: number;
}

export function FFAPlayerAssignment({
  users,
  teams,
  assignedPlayers,
  onAssign,
  onRemove,
  maxPlayers = 8,
}: FFAPlayerAssignmentProps) {
  const assignedUserIds = assignedPlayers.map((p) => p.userId);
  const availableUsers = users.filter((u) => !assignedUserIds.includes(u.id));

  // Get colors that are already assigned
  const usedColorIds = assignedPlayers.map((p) => p.teamId).filter(Boolean);
  const availableColors = teams.filter((t) => !usedColorIds.includes(t.id));

  const getPlayerInfo = (assignment: { userId: string; teamId: string | null }) => {
    const user = users.find((u) => u.id === assignment.userId);
    const color = teams.find((t) => t.id === assignment.teamId);
    return { user, color };
  };

  const handleAddPlayer = (userId: string) => {
    // Auto-assign the next available color
    const nextColor = availableColors[0];
    if (nextColor) {
      onAssign(userId, nextColor.id);
    }
  };

  const canAddMore = assignedPlayers.length < maxPlayers && availableUsers.length > 0 && availableColors.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">
          {assignedPlayers.length} / {maxPlayers} players
        </div>
        {canAddMore && (
          <Select onValueChange={handleAddPlayer}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Add player..." />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.gamertag} [{user.serviceTag}]
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {assignedPlayers.map((assignment, index) => {
          const { user, color } = getPlayerInfo(assignment);
          if (!user) return null;

          return (
            <Card
              key={assignment.userId}
              className="overflow-hidden relative"
              style={{
                background: color ? `linear-gradient(135deg, ${color.color}30 0%, transparent 70%)` : undefined,
                borderColor: color?.color || '#3f3f46',
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: color?.color || '#666' }}
                    />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{user.gamertag}</div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {user.serviceTag}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400"
                    onClick={() => onRemove(user.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-zinc-500 mt-2">
                  Player {index + 1}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {canAddMore && (
          <Card className="border-dashed border-zinc-700 bg-transparent">
            <CardContent className="p-4 flex items-center justify-center h-full min-h-[100px]">
              <Select onValueChange={handleAddPlayer}>
                <SelectTrigger className="border-none bg-transparent hover:bg-zinc-800/50">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Plus className="h-4 w-4" />
                    <span>Add Player</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.gamertag} [{user.serviceTag}]
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}
      </div>

      {assignedPlayers.length === 0 && (
        <div className="text-center py-8 text-zinc-500">
          <p>No players added yet.</p>
          <p className="text-sm mt-1">Add players using the dropdown above.</p>
        </div>
      )}

      {assignedPlayers.length > 0 && assignedPlayers.length < 2 && (
        <div className="text-center text-yellow-500 text-sm">
          Add at least 2 players to start the game.
        </div>
      )}
    </div>
  );
}
