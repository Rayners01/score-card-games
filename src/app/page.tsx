'use client';

import { useState, useEffect } from 'react';
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Player, Colour, bgClasses } from "@/types";
import { ChartDialog } from "@/components/ui/chart";
import { db } from '@/lib/firebase';
import { ref, set, onValue, onDisconnect, get, runTransaction } from 'firebase/database';

const maxPlayers = bgClasses.length;

export default function Home() {
  // ===== Client ID =====
  let clientId = '';
  if (typeof window !== 'undefined') {
    clientId = localStorage.getItem('clientId') || '';
    if (!clientId) {
      clientId = generateAlphanumeric(13);
      localStorage.setItem('clientId', clientId);
    }
  }

  // ===== Game state =====
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameCode, setGameCode] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // ===== UI state =====
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [scoreInput, setScoreInput] = useState("");
  const [editName, setEditName] = useState("");
  const [editScore, setEditScore] = useState("");
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  const selectedPlayer = players.find(p => p.id === selectedPlayerId) || null;

  // ====== Firebase Real-time Sync & Host Election ======
  useEffect(() => {
    if (!gameCode) return;

    const gameRef = ref(db, `games/${gameCode}`);
    const clientsRef = ref(db, `games/${gameCode}/clients`);

    // Track client presence
    const connectedRef = ref(db, ".info/connected");
    const clientRef = ref(db, `games/${gameCode}/clients/${clientId}`);

    const unsubConnected = onValue(connectedRef, snap => {
      if (snap.val() === true) {
        // Mark self online
        set(clientRef, { online: true });
        onDisconnect(clientRef).set({ online: false });
      }
    });

    // Listen for game updates
    const unsubGame = onValue(gameRef, async snapshot => {
      const data = snapshot.val() || {};
      const gamePlayers: Player[] = data.players?.map((p: Player) => ({
        ...p,
        scores: p.scores || []
      })) || [];
      setPlayers(gamePlayers);

      // Host election logic
      const hostId = data.hostId;
      const clients = data.clients || {};
      const hostOnline = hostId ? clients[hostId]?.online : false;

      if (!hostId || !hostOnline) {
        // Attempt to claim host safely using transaction
        const hostRef = ref(db, `games/${gameCode}/hostId`);
        runTransaction(hostRef, current => {
          if (!current || !clients[current]?.online) return clientId;
          return current;
        }).then(result => {
          if (result.committed && result.snapshot.val() === clientId) {
            setIsHost(true);
          } else if (result.snapshot.val() !== clientId) {
            setIsHost(false);
          }
        });
      } else {
        setIsHost(hostId === clientId);
      }
    });

    return () => {
      unsubGame();
      unsubConnected();
    };
  }, [gameCode]);

  const savePlayersToFirebase = (updatedPlayers: Player[]) => {
    if (!gameCode || !isHost) return;
    const gameRef = ref(db, `games/${gameCode}/players`);
    set(gameRef, updatedPlayers);
  };

  // ====== Host / Join Game ======
  const createGame = () => {
    const code = generateGameCode();
    setGameCode(code);
    setIsHost(true);
    setPlayers([]);
    const gameRef = ref(db, `games/${code}`);
    set(gameRef, { players: [], hostId: clientId, clients: { [clientId]: { online: true } } });
    const clientRef = ref(db, `games/${code}/clients/${clientId}`);
    onDisconnect(clientRef).set({ online: false });
  };

  const joinGame = () => {
    if (!joinCode) return;
    setGameCode(joinCode.toLowerCase());
    setIsHost(false);
    setJoinDialogOpen(false);
  };

  // ====== Player actions ======
  const handleClickPlayer = (player: Player) => {
    if (!isHost) return;
    setSelectedPlayerId(player.id);
    setScoreInput("");
    setShowEdit(false);
  };

  const handleAddNewPlayer = () => {
    if (!newPlayerName || players.length >= maxPlayers) return;
    const newPlayer: Player = {
      id: generateAlphanumeric(13),
      name: newPlayerName,
      scores: []
    };
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    savePlayersToFirebase(updatedPlayers);
    setNewDialogOpen(false);
    setNewPlayerName("");
  };

  const handleAddScore = () => {
    if (!selectedPlayer) return;
    const value = parseInt(scoreInput);
    if (!isNaN(value)) {
      const updatedPlayers = players.map(p =>
        p.id === selectedPlayer.id ? { ...p, scores: [...p.scores, value] } : p
      );
      setPlayers(updatedPlayers);
      savePlayersToFirebase(updatedPlayers);
      setScoreInput("");
    }
    setSelectedPlayerId(null)
  };

  const handleSaveEdit = () => {
    if (!selectedPlayer) return;
    const updatedPlayers = players.map(p => {
      if (p.id !== selectedPlayer.id) return p;
      const updatedScores = [...p.scores];
      if (editScore && updatedScores.length > 0) {
        updatedScores[updatedScores.length - 1] = parseInt(editScore);
      }
      return { ...p, name: editName || p.name, scores: updatedScores };
    });
    setPlayers(updatedPlayers);
    savePlayersToFirebase(updatedPlayers);
    setShowEdit(false);
  };

  const handleDelete = () => {
    if (!selectedPlayer) return;
    const updatedPlayers = players.filter(p => p.id !== selectedPlayerId);
    setPlayers(updatedPlayers);
    savePlayersToFirebase(updatedPlayers);
    setSelectedPlayerId(null);
  };

  // ====== Render ======
  return (
    <div className="w-full bg-emerald-400 overflow-hidden" style={{ height: '100dvh' }}>
      {!gameCode ? (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Button onClick={createGame}>Create Game</Button>
          <Button onClick={() => setJoinDialogOpen(true)}>Join Game</Button>
        </div>
      ) : (
        <>
          <div className="text-center text-white font-bold py-2 bg-green-600">
            Game Code: <span className="underline">{gameCode}</span>
          </div>

          {players.length > 0 ? (
            <div className={`grid w-full h-full ${players.length > 6 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {players.map((p, idx) => {
                const { primary, hover } = bgClasses[idx];
                return (
                  <div
                    key={p.id}
                    className={`flex ${primary} ${hover} flex-col items-center justify-center cursor-pointer p-2`}
                    onClick={() => handleClickPlayer(p)}
                  >
                    <div className="text-[6vw] sm:text-[5vw] md:text-[4vw] text-white font-bold mb-1 truncate text-center">
                      {p.name}
                    </div>
                    <div className="text-[10vw] sm:text-[8vw] md:text-[6vw] text-gray-100 font-bold text-center">
                      {getScore(p)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-screen">
              <div className="bg-gray-400 text-gray-600 px-6 py-4 rounded-lg text-center text-[5vw] sm:text-[4vw]">
                No Players.
              </div>
            </div>
          )}
        </>
      )}

      {/* Player Dialog (Host only) */}
      <Dialog open={!!selectedPlayer && isHost} onOpenChange={() => setSelectedPlayerId(null)}>
        {selectedPlayer && (
          <>
            {!showEdit ? (
              <>
                <button
                  className="absolute top-4 left-4 text-sm text-blue-500"
                  onClick={() => {
                    setEditName(selectedPlayer.name);
                    setEditScore(selectedPlayer.scores.at(-1)?.toString() || "");
                    setShowEdit(true);
                  }}
                >
                  EDIT
                </button>
                <h2 className="text-lg font-bold mt-6 mb-2">{selectedPlayer.name}</h2>
                <p className="mb-4">Total: {getScore(selectedPlayer)}</p>
                <Input
                  type="number"
                  value={scoreInput}
                  onChange={e => setScoreInput(e.target.value)}
                  placeholder="Add to score"
                  className="mb-3"
                />
                <Button onClick={handleAddScore} className="w-full">ADD</Button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-2">Edit Player</h2>
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Player name"
                  className="mb-3"
                />
                <Input
                  type="number"
                  value={editScore}
                  onChange={e => setEditScore(e.target.value)}
                  placeholder="Last round score"
                  className="mb-3"
                />
                <div className="flex justify-between">
                  <Button onClick={handleDelete} className="w-[45%] bg-red-500 hover:bg-red-600">DELETE</Button>
                  <Button onClick={handleSaveEdit} className="w-[45%]">SAVE</Button>
                </div>
              </>
            )}
          </>
        )}
      </Dialog>

      {/* New Player Dialog (Host only) */}
      <Dialog open={newDialogOpen && isHost} onOpenChange={() => setNewDialogOpen(false)}>
        <>
          <h2 className="text-lg font-bold mb-2">New Player</h2>
          <Input
            value={newPlayerName}
            onChange={e => setNewPlayerName(e.target.value)}
            placeholder="Player name"
            className="mb-3"
          />
          <Button onClick={handleAddNewPlayer} className="w-full">ADD</Button>
        </>
      </Dialog>

      {/* Chart Dialog */}
      <ChartDialog open={chartDialogOpen} onOpenChange={setChartDialogOpen} players={players} />

      {/* Bottom Buttons */}
      {gameCode && (
        <>
          <button
            className="absolute bottom-2 left-2 w-12 h-12 bg-gray-500 hover:bg-gray-600 rounded-full"
            onClick={() => setChartDialogOpen(true)}
          >
            📈
          </button>
          {isHost && (
            <button
              className="absolute bottom-2 right-2 w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full"
              onClick={() => setNewDialogOpen(true)}
            >
              +
            </button>
          )}
        </>
      )}

      {/* Join Game Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={() => setJoinDialogOpen(false)}>
        <>
          <h2 className="text-lg font-bold mb-2">Enter Game Code</h2>
          <Input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="Game Code" />
          <Button onClick={joinGame} className="w-full mt-2">Join</Button>
        </>
      </Dialog>
    </div>
  );
}

// ===== Utility Functions =====
function getScore(player: Player): number {
  return (player.scores || []).reduce((sum, s) => sum + s, 0);
}

function randomBg(id: string): Colour {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return bgClasses[hash % bgClasses.length];
}

function generateAlphanumeric(n: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let res = '';
  for (let i = 0; i < n; i++) res += chars[Math.floor(Math.random() * chars.length)];
  return res;
}

function generateGameCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let res = '';
  for (let i = 0; i < 5; i++) res += chars[Math.floor(Math.random() * chars.length)];
  return res;
}