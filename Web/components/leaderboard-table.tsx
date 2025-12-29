"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trophy } from "lucide-react"

type Player = {
  id: number
  name: string
  ballSpeed: number 
  score: number 
}

export function LeaderboardTable() {
  const [players, setPlayers] = useState<Player[]>([
    {id:1, name: "Happy Gilmore", ballSpeed: 67, score: 100}, //score based on similarity w happy
  ])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null)
  const [newPlayerName, setNewPlayerName] = useState("")
  const [newPlayerBallSpeed, setNewPlayerBallSpeed] = useState("")

  const calculateScore = (ballSpeed: number) => {
    const bestSpeed = 67 // Happy Gilmore's ball speed
    const score = Math.max(0, 100 - Math.abs(bestSpeed - ballSpeed) * 2)
    return score
  }

  const sortedPlayers = [...players].sort((a, b) => {
    // Happy Gilmore always first
    if (a.name === "Happy Gilmore") return -1
    if (b.name === "Happy Gilmore") return 1
    // Others sorted by score (highest first)
    return b.score - a.score
  })

  const handleAddPlayer = async () => {
    const speed = parseFloat(newPlayerBallSpeed)
    if (!newPlayerName.trim()||isNaN(speed)|| speed<=0){
      alert("Entrez un nom et une vitesse de balle valide.")
      return
    }

    const score = calculateScore(speed)
    const newPlayer: Player = {
      id: Date.now(),
      name: newPlayerName.trim(),
      ballSpeed: speed,
      score: score,
    }
    
    // Send score to Arduino backend
    try {
      const response = await fetch('http://localhost:5000/api/control-valve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: score,
          name: newPlayer.name,
          ballSpeed: speed
        })
      })
      
      if (!response.ok) {
        console.error('Failed to send score to Arduino')
      } else {
        const data = await response.json()
        console.log('Valve controlled:', data)
      }
    } catch (error) {
      console.error('Error connecting to backend:', error)
      alert('Attention: Impossible de se connecter au serveur Arduino. Le score sera affiché mais la valve ne sera pas contrôlée.')
    }
    
    setPlayers([...players, newPlayer])
    setNewPlayerName("")
    setNewPlayerBallSpeed("")
    setShowAddDialog(false)
  }

  const handleDeleteClick = (player: Player) => {
    if (player.name === "Happy Gilmore") {
      alert("Happy Gilmore ne peut pas être supprimé!")
      return
    }
    setPlayerToDelete(player)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    if (playerToDelete) {
      setPlayers(players.filter(p => p.id !== playerToDelete.id))
    }
    setShowDeleteDialog(false)
    setPlayerToDelete(null)
  }

  const getScoreColor = (score: number) => {
    if (score < 0) return "text-primary"
    if (score > 0) return "text-destructive"
    return "text-muted-foreground"
  }


  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-sans text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
              Classement
            </h2>
            <p className="mt-2 text-muted-foreground">
              {'"Just tap it in. Just tap it in. Give it a little tappy. Tap Tap Taparoo"'}
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} size="lg">
            Ajouter un score
          </Button>
        </div>

        <Card className="overflow-hidden border-2 shadow-lg">
          <CardContent className="p-0">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 border-b-2 border-border bg-muted px-4 py-3 text-sm font-bold uppercase tracking-wide text-muted-foreground md:px-6">
              <div className="w-12">Pos</div>
              <div>Joueur</div>
              <div className="text-right">Vitesse</div>
              <div className="text-right">Score</div>
            </div>

            {/* Leaderboard rows */}
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                onClick={() => handleDeleteClick(player)}
                className={`grid cursor-pointer grid-cols-[auto_1fr_auto_auto] gap-4 border-b border-border px-4 py-4 transition-colors hover:bg-destructive/10 md:px-6 ${
                  index === 0 ? "bg-secondary/20" : ""
                }`}
              >
                {/* Position */}
                <div className="flex w-12 items-center font-bold text-foreground">
                  {player.name === "Happy Gilmore" ? (
                    <Trophy className="h-6 w-6 text-secondary" />
                  ) : (
                    <span className="text-lg">{index + 1}</span>
                  )}
                </div>
                {/* Player name */}
                <div className="flex items-center">
                  <span className="font-semibold text-foreground">{player.name}</span>
                  {player.name === "Happy Gilmore" && (
                    <Badge variant="default" className="ml-2 bg-primary text-xs">
                      GAGNANT
                    </Badge>
                  )}
                </div>

                {/* Ball speed */}
                <div className="flex items-center justify-end text-right font-bold text-foreground">
                  <span className="text-lg">{player.ballSpeed} km/h</span>
                </div>

                {/* Score */}
                <div className={`flex items-center justify-end text-right font-bold ${getScoreColor(player.score)}`}>
                  <span className="text-lg">
                    {player.score > 0 ? "+" : ""}
                    {player.score}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
         {/* Add Player Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau joueur</DialogTitle>
              <DialogDescription>
                Entrez le nom du joueur et la vitesse de la balle
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleAddPlayer(); }}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom du joueur</Label>
                  <Input
                    id="name"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Ex: Happy Gilmore"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="speed">Vitesse de la balle (km/h)</Label>
                  <Input
                    id="speed"
                    type="number"
                    value={newPlayerBallSpeed}
                    onChange={(e) => setNewPlayerBallSpeed(e.target.value)}
                    placeholder="Ex: 120"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  Ajouter
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
              <AlertDialogDescription>
                Voulez-vous vraiment supprimer <strong>{playerToDelete?.name}</strong> du classement?
                Cette action ne peut pas être annulée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>
                Supprimer
              </AlertDialogAction>
               </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Fun quotes section */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="border-2 bg-card">
            <CardContent className="p-6">
              <div className="mb-2 text-4xl">🏒</div>
              <p className="font-semibold italic text-foreground">{'"You\'re gonna die, clown!"'}</p>
              <p className="mt-1 text-sm text-muted-foreground">- Happy Gilmore</p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-card">
            <CardContent className="p-6">
              <div className="mb-2 text-4xl">🏆</div>
              <p className="font-semibold italic text-foreground">{'"I eat pieces of shit like you for breakfast!"'}</p>
              <p className="mt-1 text-sm text-muted-foreground">- Shooter McGavin</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

  )
}
