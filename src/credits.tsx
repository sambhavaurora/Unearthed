import React from "react"

interface CreditsProps {
	onBack: () => void
}

const Credits: React.FC<CreditsProps> = ({ onBack }) => {
	return (
		<div className="credits">
			<h2>Credits</h2>
			<p>Game created by: Your Name</p>
			<p>Graphics: Your Artist</p>
			<p>Music: Your Composer</p>
			<button onClick={onBack}>Back to Main Menu</button>
		</div>
	)
}

export default Credits
