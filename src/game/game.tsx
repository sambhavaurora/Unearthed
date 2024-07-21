import { Environment, KeyboardControls, OrbitControls, useGLTF, useKeyboardControls } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Physics, RigidBody, useRapier } from "@react-three/rapier"
import React, { Suspense, useEffect, useRef } from "react"
import * as THREE from "three"
import Coordinates from "../ui/coordinates"
import DarkSky from "./dark-sky"
import FirstPersonCamera from "./fpp-camera"

type GameplayState = "Active" | "Paused" | "GameOver"

interface Event {
	range: [THREE.Vector3, THREE.Vector3]
	callback: Function
}

const isBetween = (a: THREE.Vector3, b: THREE.Vector3, target: THREE.Vector3): boolean => {
	const minX = Math.min(a.x, b.x)
	const maxX = Math.max(a.x, b.x)
	const minY = Math.min(a.y, b.y)
	const maxY = Math.max(a.y, b.y)
	const minZ = Math.min(a.z, b.z)
	const maxZ = Math.max(a.z, b.z)

	return (
		target.x >= minX && target.x <= maxX
		&& target.y >= minY && target.y <= maxY
		&& target.z >= minZ && target.z <= maxZ
	)
}

interface GameProps {
	onExit: Function
}
const Scene = ({}) => {
	const gltf = useGLTF("/models/entrance.glb")
	
	return (
		<>
			<RigidBody type="fixed" position={[0, -10, 0]} colliders="trimesh">
				<primitive object={gltf.scene} scale={1} />
			</RigidBody>
		</>
	)
}
const Player = ({ gameplayState = "Active", onPositionUpdate = (p0: THREE.Vector3) => {} }) => {
	const playerRef = useRef<any>()
	const [, getKeys] = useKeyboardControls()
	
	const Events: Event[] = [
		{
			range: [new THREE.Vector3(17, -13, -22), new THREE.Vector3(24, -11, -16)],
			callback: () => {
				console.log("You Win!")
			},
		},
	]
	
	const velocity = new THREE.Vector3()
	const maxVelocity = 3
	useEffect(() => {
		const canvas = document.querySelector("canvas")
		if (canvas) {
			canvas.addEventListener("click", () => {
				canvas.requestPointerLock()
			})
		}
	}, [playerRef.current])

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

			// Remove vertical component for movement
			cameraForward.y = 0
			cameraRight.y = 0
			cameraForward.normalize()
			cameraRight.normalize()

			// Calculate move direction relative to camera
			if (forward) velocity.add(cameraForward)
			if (backward) velocity.sub(cameraForward)
			if (left) velocity.sub(cameraRight)
			if (right) velocity.add(cameraRight)

			if (velocity.length() > 0) {
				velocity.normalize().multiplyScalar(maxVelocity * 2)
			}

			// Apply the velocity
			const currentVel = playerRef.current.linvel()
			playerRef.current.setLinvel({ x: velocity.x, y: currentVel.y, z: velocity.z })

			// Handle jumping
			if (jump && Math.abs(currentVel.y) < 0.05) {
				playerRef.current.setLinvel({ x: currentVel.x, y: 5, z: currentVel.z })
			}

			// Update player position
			const playerPosition = playerRef.current.translation()
			onPositionUpdate(new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z))

			// map over events and run the callback only one time if the condition is true by storing the range check in a variable
			Events.map((event) => {
				const isInRange = isBetween(event.range[0], event.range[1], playerPosition)
				if (isInRange) {
					event.callback()
				}
			})
		}
	})

	return (
		<>
			<RigidBody
				ref={playerRef}
				colliders="ball"
				position={[-32, 1, 0]}
				mass={1}
				rotation={new THREE.Euler(0, Math.PI, 0)}
			>
				<mesh>
					<capsuleGeometry args={[0.5, 1, 4, 8]} />
					<meshStandardMaterial color="blue" />
				</mesh>
			</RigidBody>
			<FirstPersonCamera playerRef={playerRef} onPositionUpdate={onPositionUpdate} />
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
	const [playerPosition, setPlayerPosition] = React.useState(new THREE.Vector3())

	const handlePositionUpdate = (position: THREE.Vector3) => {
		setPlayerPosition(position)
	}

	return (
		<div className="game flex flex-col h-screen w-full">
			<Coordinates position={playerPosition} />
			<KeyboardControls
				map={[
					{ name: "forward", keys: ["ArrowUp", "w", "W"] },
					{ name: "backward", keys: ["ArrowDown", "s", "S"] },
					{ name: "left", keys: ["ArrowLeft", "a", "A"] },
					{ name: "right", keys: ["ArrowRight", "d", "D"] },
					{ name: "jump", keys: ["Space"] },
				]}
			>
				<Canvas camera={{ fov: 90 }}>
					<Suspense fallback={null}>
						<Physics>
							<Scene />
							<Player gameplayState={gameplayState} onPositionUpdate={handlePositionUpdate} />
							<Environment preset="night" />
							<fog attach="fog" args={["#001020", -10, 10]} />
							<ambientLight intensity={2.5} />
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
