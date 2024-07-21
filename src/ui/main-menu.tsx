import React, { useEffect, useRef, useState } from "react"

interface MainMenuProps {
	onNewGame: Function
	onCredits: Function
	onExit: Function
}

const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onCredits, onExit }) => {
	const audioRef = useRef<HTMLAudioElement>(null)

	const MenuItems: Record<string, Function> = {
		"New Game": () => {
			audioRef.current?.play()
			onNewGame()
		},
		"Credits": onCredits,
		"Exit": onExit
	}

	return (
		<div className="flex flex-col gap-24 justify-center items-center w-full h-full fade-in">
			<audio src="/sfx/menu.mp3" loop muted ref={audioRef} />
			<img src="/ui/unearthed_logo.png" className="h-16 md:h-32 logo" />
			<div className="flex flex-col text-2xl">
				{Object.keys(MenuItems).map((item, index) => (
					<button
						key={index}
						onClick={() => MenuItems[item]()}
						className="menu-button px-4 py-2"
					>
						{item}
					</button>
				))}
			</div>
		</div>
	)
}

export default MainMenu
