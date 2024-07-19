/* @refresh reload */
import { render } from "solid-js/web"
import "./index.css"
import Cube from "./game/base.tsx"

const App = () => {
	return (
		<>
			<div>
				<h1>Hello, Solid!</h1>
			</div>
			<Cube />
		</>
	)
}

render(App, document.body)
