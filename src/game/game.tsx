import { Environment, KeyboardControls, OrbitControls, useGLTF, useKeyboardControls } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Physics, RigidBody, useRapier } from "@react-three/rapier"
import React, { Suspense, useEffect, useRef } from "react"
import * as THREE from "three"
import DarkSky from "./dark-sky"

type GameplayState = "Active" | "Paused" | "GameOver"

interface GameProps {
	onExit: Function
}
const FirstPersonCamera = ({ playerRef }: { playerRef: React.MutableRefObject<any> }) => {
	const { camera } = useThree()
	const cameraOffset = new THREE.Vector3(0, 1.5, 0) // Adjust this to change camera height

	useFrame(() => {
		if (playerRef.current) {
			const playerPosition = playerRef.current.translation()
			camera.position.copy(new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z)).add(cameraOffset)

		}
	})

	return null
}

const Model = ({ gameplayState = "Active" }) => {
	const gltf = useGLTF("/models/entrance.glb")
	const gltf2 = useGLTF("/models/scene.gltf")
	const playerRef = useRef<any>()
	const [, getKeys] = useKeyboardControls()

	const velocity = new THREE.Vector3()
	const maxVelocity = 3 // Adjust this value to set maximum speed

	useFrame((state, delta) => {
		if (gameplayState === "Active" && playerRef.current) {
			const { forward, backward, left, right, jump } = getKeys()
			const speed = 50 * delta

			// Reset velocity
			velocity.set(0, 0, 0)

			// Get the camera's forward and right vectors
			const cameraQuat = new THREE.Quaternion()
			state.camera.getWorldQuaternion(cameraQuat)
			const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(cameraQuat)
			const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraQuat)

			// Calculate move direction relative to camera
			if (forward) velocity.add(cameraForward)
			if (backward) velocity.sub(cameraForward)
			if (left) velocity.sub(cameraRight)
			if (right) velocity.add(cameraRight)

			// Remove vertical component and normalize
			velocity.y = 0
			if (velocity.length() > 0) {
				velocity.normalize().multiplyScalar(maxVelocity)
			}

			// Apply the velocity
			const currentVel = playerRef.current.linvel()
			playerRef.current.setLinvel({ x: velocity.x, y: currentVel.y, z: velocity.z })

			// Handle jumping
			if (jump && Math.abs(currentVel.y) < 0.05) {
				playerRef.current.setLinvel({ x: currentVel.x, y: 5, z: currentVel.z })
			}
		}
	})

	return (
		<>
			<RigidBody type="fixed" position={[0, -10, 0]} colliders="trimesh">
				<primitive object={gltf.scene} scale={1} />
			</RigidBody>
			<RigidBody ref={playerRef} colliders="ball" position={[0, 1, 0]} mass={1}>
				<mesh visible={false}>
					<sphereGeometry args={[0.5]} />
				</mesh>
				<primitive object={gltf2.scene} scale={0.4} />
			</RigidBody>
			<FirstPersonCamera playerRef={playerRef} />
		</>
	)
}

const Lights = () => {
	return (
		<>
			<ambientLight intensity={0.1} />
			<directionalLight position={[5, 5, 5]} intensity={0.5} color="white" />
			<pointLight position={[10, 10, 10]} intensity={0.5} color="yellow" />
			<spotLight
				position={[0, 10, 0]}
				angle={0.3}
				penumbra={1}
				intensity={0.5}
				castShadow
			/>
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
				<Canvas camera={{ position: [0, 5, 10], fov: 90 }}>
					<Suspense fallback={null}>
						<Physics debug>
							<Model gameplayState={gameplayState} />
							<Environment preset="night" />
							<fog attach="fog" args={["#001020", -10, 50]} />
							<ambientLight intensity={1} />
							{/* <pointLight position={[0, 100, 0]} castShadow /> */}
						</Physics>
					</Suspense>
					<DarkSky />
					<Lights />
				</Canvas>
			</KeyboardControls>
		</div>
	)
}

export default Game
