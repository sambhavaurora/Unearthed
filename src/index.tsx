import "./index.css"
import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import Credits from "./credits"
import Game from "./game/game.tsx"
import MainMenu from "./mainMenu.tsx"

type GameState = "menu" | "playing" | "credits"

const App: React.FC = () => {
	const [gameState, setGameState] = useState<GameState>("menu")

	const startNewGame = () => {
		setGameState("playing")
	}

	const showCredits = () => {
		setGameState("credits")
	}

	const exitGame = () => {
		if (window.confirm("Are you sure you want to exit the game?")) {
			window.close()
		}
	}

	const returnToMainMenu = () => {
		setGameState("menu")
	}

	return (
		<>
			{gameState === "menu" && (
				<MainMenu
					onNewGame={startNewGame}
					onCredits={showCredits}
					onExit={exitGame}
				/>
			)}
			{gameState === "playing" && <Game onExit={returnToMainMenu} />}
			{gameState === "credits" && <Credits onBack={returnToMainMenu} />}
		</>
	)
}

createRoot(document.body).render(<App />)
