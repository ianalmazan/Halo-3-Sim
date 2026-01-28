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
import { useState } from 'react';
import { FFAPlayerAssignment } from './ffa-player-assignment';

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

interface TeamAssignmentProps {
  users: User[];
  teams: Team[];
  assignedPlayers: { userId: string; teamId: string | null }[];
  onAssign: (userId: string, teamId: string | null) => void;
  onRemove: (userId: string) => void;
  isTeamBased?: boolean;
}

export function TeamAssignment({
  users,
  teams,
  assignedPlayers,
  onAssign,
  onRemove,
  isTeamBased = true,
}: TeamAssignmentProps) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  // For FFA mode, use the FFA-specific component
  if (!isTeamBased) {
    return (
      <FFAPlayerAssignment
        users={users}
        teams={teams}
        assignedPlayers={assignedPlayers.map(p => ({ userId: p.userId, teamId: p.teamId || null }))}
        onAssign={onAssign}
        onRemove={onRemove}
      />
    );
  }

  // Team-based mode logic
  const assignedUserIds = assignedPlayers.map((p) => p.userId);
  const availableUsers = users.filter((u) => !assignedUserIds.includes(u.id));

  const handleAssign = () => {
    if (selectedUser && selectedTeam) {
      onAssign(selectedUser, selectedTeam);
      setSelectedUser('');
    }
  };

  const getTeamPlayers = (teamId: string) => {
    return assignedPlayers
      .filter((p) => p.teamId === teamId)
      .map((p) => users.find((u) => u.id === p.userId))
      .filter(Boolean) as User[];
  };

  // Only show first 2 teams (Red and Blue) for team-based games
  const displayTeams = teams.slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Select Player</label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a player" />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.gamertag} [{user.serviceTag}]
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Select Team</label>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a team" />
            </SelectTrigger>
            <SelectContent>
              {displayTeams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    {team.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleAssign}
          disabled={!selectedUser || !selectedTeam}
        >
          Add Player
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {displayTeams.map((team) => (
          <Card key={team.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: team.color }}
                />
                {team.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getTeamPlayers(team.id).map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2 bg-zinc-800/50 rounded"
                  >
                    <div>
                      <span className="font-medium">{player.gamertag}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {player.serviceTag}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(player.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {getTeamPlayers(team.id).length === 0 && (
                  <p className="text-sm text-zinc-500 italic">No players assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
