import { Environment, KeyboardControls, OrbitControls, useGLTF, useKeyboardControls } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import React, { Suspense, useRef } from "react"
import * as THREE from "three"
import { Physics, RigidBody } from "@react-three/rapier";
type GameplayState = "Active" | "Paused" | "GameOver"

interface GameProps {
	onExit: () => void
}

const Model = ({ gameplayState = "Active" }) => {
	const gltf = useGLTF("/models/meow.glb")
	const gltf2 = useGLTF("/models/scene.gltf")
	const modelRef = useRef<THREE.Object3D>(null)
	const [, getKeys] = useKeyboardControls()

	useFrame(() => {
		if (gameplayState === "Active" && modelRef.current) {
			const { forward, backward, left, right, jump } = getKeys()

			if (forward) modelRef.current.position.z -= 0.1
			if (backward) modelRef.current.position.z += 0.1
			if (left) modelRef.current.position.x -= 0.1
			if (right) modelRef.current.position.x += 0.1
			if (jump) modelRef.current.position.y += 0.1
		}
	})

	return (
		<>
			<RigidBody type="fixed" position={[0, -0.5, 0]}>
				<primitive object={gltf.scene} scale={2} />
			</RigidBody>
			<RigidBody colliders={'cuboid'} position={[0, 1, 0]}>
				<primitive object={gltf2.scene} scale={0.4} ref={modelRef} />
			</RigidBody>
		</>
	)
}

const Game: React.FC<GameProps> = ({ onExit }) => {
	const [gameplayState, setGameplayState] = React.useState<GameplayState>("Active")

	return (
		<div className="game flex flex-col h-screen w-full">
			<KeyboardControls
				map={[
					{ name: "forward", keys: ["ArrowUp", "w", "W"] },
					{ name: "backward", keys: ["ArrowDown", "s", "S"] },
					{ name: "left", keys: ["ArrowLeft", "a", "A"] },
					{ name: "right", keys: ["ArrowRight", "d", "D"] },
					{ name: "jump", keys: ["Space"] },
				]}
			>
				<Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
					<Suspense fallback={null}>
						<Physics debug>
							<Model gameplayState={gameplayState} />
							<Environment preset="city" />
							<OrbitControls />
							<fog attach="fog" args={["blue", 0, 50]} />
							<ambientLight intensity={0.5} />
							<pointLight position={[10, 10, 10]} />
						</Physics>
					</Suspense>
				</Canvas>
			</KeyboardControls>
		</div>
	)
}

export default Game
