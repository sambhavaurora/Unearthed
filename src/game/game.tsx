import { Environment, KeyboardControls, useGLTF, useKeyboardControls } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { Physics, RigidBody } from "@react-three/rapier"
import React, { Suspense, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import Hud from "../ui/hud"
import Dialog from "../ui/dialog"
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
			<RigidBody type="fixed" position={[0, -9.5, 0]} colliders="trimesh">
				<primitive object={gltf.scene} scale={1} />
			</RigidBody>
		</>
	)
}

const Player = ({
	gameplayState = "Active",
	onPositionUpdate = (_p0: THREE.Vector3) => {},
	setElements,
}: {
	gameplayState: GameplayState
	onPositionUpdate: (p0: THREE.Vector3) => void
	setElements: React.Dispatch<React.SetStateAction<React.ReactNode[]>>
}) => {
	const playerRef = useRef<any>()
	const [, getKeys] = useKeyboardControls()
	const [globalState, setGlobalState] = useState({
		hasEnteredFacility: false
	})

	const Events: Event[] = [
		{
			range: [new THREE.Vector3(34, -19, 21), new THREE.Vector3(40, -15, 13)],
			callback: () => {
				console.log("You Lose!")
				setElements(() => {
					const newElements = [
						<Dialog>
							Meow! I'm a cat. I'm stuck in this box. Can you help me get out?
						</Dialog>,
					]

					setTimeout(() => {
						setElements([])
					}, 5000)

					return newElements
				})
			},
		},
		{
			range: [new THREE.Vector3(-11, -15, 4), new THREE.Vector3(-1, -11, -7)],
			callback: () => {
				if(!globalState.hasEnteredFacility) {
					setElements(() => {
						const newElements = [
							<Dialog>
								<b>rumbles</b><span className="w-8">{" "}</span><i>[The Door behind you caves in!]</i>
							</Dialog>,
						]
	
						setTimeout(() => {
							setElements([])
						}, 5000)
	
						return newElements
					})

					setGlobalState({ hasEnteredFacility: true })
				}
			}
		}
	]
	const [activeEvents, setActiveEvents] = useState<boolean[]>(new Array(Events.length).fill(false))

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
			const { forward, backward, left, right } = getKeys()

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

			// Normalize velocity
			if (velocity.length() > 0) {
				velocity.normalize().multiplyScalar(maxVelocity * 40 * delta)
			}
			playerRef.current.setLinvel({ x: velocity.x, y: playerRef.current.linvel().y, z: velocity.z })

			// Update player position
			const playerPosition = playerRef.current.translation()
			onPositionUpdate(new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z))

			// Check events
			const newActiveEvents = Events.map((event, index) => {
				const isInRegion = isBetween(event.range[0], event.range[1], playerPosition)

				if (isInRegion && !activeEvents[index]) {
					// Player just entered the region
					event.callback()
				}

				return isInRegion
			})

			setActiveEvents(newActiveEvents)
		}
	})

	return (
		<>
			<RigidBody
				ref={playerRef}
				colliders="ball"
				position={[-32, -15.5, -1]} // Raised slightly
				mass={1}
				friction={0.2} // Add some friction
				restitution={0.2} // Add some bounciness
			>
				<mesh>
					<capsuleGeometry args={[0.4, 0.8, 4, 8]} /> // Slightly smaller
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

const Game: React.FC<GameProps> = ({}) => {
	const [gameplayState] = React.useState<GameplayState>("Active")
	const [playerPosition, setPlayerPosition] = React.useState(new THREE.Vector3())
	const [elements, setElements] = useState<React.ReactNode[]>([])

	const handlePositionUpdate = (position: THREE.Vector3) => {
		setPlayerPosition(position)
	}

	return (
		<div className="game flex flex-col h-screen w-full">
			<Hud position={playerPosition} showPosition />
			{elements}
			<KeyboardControls
				map={[
					{ name: "forward", keys: ["ArrowUp", "w", "W"] },
					{ name: "backward", keys: ["ArrowDown", "s", "S"] },
					{ name: "left", keys: ["ArrowLeft", "a", "A"] },
					{ name: "right", keys: ["ArrowRight", "d", "D"] },
					{ name: "jump", keys: ["Space"] },
				]}
			>
				<Canvas camera={{ fov: 90 }} className="fade-in">
					<Suspense fallback={null}>
						<Physics debug gravity={[0, -9.8, 0]}>
							<Scene />
							<Player gameplayState={gameplayState} onPositionUpdate={handlePositionUpdate} setElements={setElements} />
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