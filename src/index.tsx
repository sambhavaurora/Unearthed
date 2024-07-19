/* @refresh reload */
import { render } from "solid-js/web"
import "./index.css"
import "./game/base.tsx"

const App = () => {
	return (
		<>
			<div>
				<h1>Hello, Solid!</h1>
			</div>
		</>
	)
}

render(App, document.body)
