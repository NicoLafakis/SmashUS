import { useEffect, useRef } from 'react'
import { Game } from './game/Game'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Game | null>(null)

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const game = new Game(containerRef.current)
    gameRef.current = game
    game.start()

    return () => {
      game.destroy()
      gameRef.current = null
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    />
  )
}

export default App
