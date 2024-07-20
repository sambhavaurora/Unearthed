import React from "react"

interface CreditsProps {
	onBack: () => void
}

const CreditData: Record<string, string[]> = {
	"Game Design": ["Ishat Gupta", "Sambhav Arora"],
	"Technical Design and Programming": ["Ishat Gupta", "Ishan Jaiswal"],
	"Visual Art": ["Pixelstories"],
	"Music": ["Sambhav Arora"],
}

const Credits: React.FC<CreditsProps> = ({ onBack }) => {
	return (
		<div className="credits flex flex-col items-center justify-between gap-8 p-16 md:p-32 h-[100vh]">
			<h1 className="font-bold text-3xl">Credits</h1>
			<div className="flex flex-col gap-4">
				{Object.keys(CreditData).map((category) => (
					<>
						<div className="flex justify-between gap-24">
							<h2 className="font-bold text-xl text-green-700">{category}</h2>
							<h2>
								{CreditData[category].map((name, index) => (
									<>{index === 0 ? name : `, ${name}`}</>
								))}
							</h2>
						</div>
					</>
				))}
			</div>
			<button onClick={onBack}>Back to Main Menu</button>
		</div>
	)
}

export default Credits
