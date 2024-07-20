import { Environment, OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { useLoader } from "@react-three/fiber"
import { Suspense } from "react"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

const Model = () => {
	const gltf = useLoader(GLTFLoader, "/models/scene.gltf")
	return (
		<>
			<primitive object={gltf.scene} scale={0.4} />
		</>
	)
}

export default function App() {
	return (
		<div className="App h-[100vh] w-[100vw]">
			<Canvas>
				<Suspense fallback={null}>
					<Model />
					<OrbitControls />
					<Environment preset="city" />
				</Suspense>
			</Canvas>
		</div>
	)
}
