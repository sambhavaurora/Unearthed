import { Environment, KeyboardControls, OrbitControls, useGLTF, useKeyboardControls } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Physics, RigidBody, useRapier } from "@react-three/rapier"
import React, { Suspense, useEffect, useRef } from "react"
import * as THREE from "three"
import DarkSky from "./dark-sky"
import FirstPersonCamera from "./fpp-camera"

type GameplayState = "Active" | "Paused" | "GameOver"

interface GameProps {
	onExit: Function
}

const Scene = () => {
	const gltf = useGLTF("/models/entrance.glb")
	return (
		<>
			<RigidBody type="fixed" position={[0, -10, 0]} colliders="trimesh">
				<primitive object={gltf.scene} scale={1} />
			</RigidBody>
		</>
	)
}

const Player = React.forwardRef(({ gameplayState = "Active" }, ref) => {
	const [, getKeys] = useKeyboardControls()

	const velocity = new THREE.Vector3()
	const maxVelocity = 3 // Adjust this value to set maximum speed
	const entranceDirection = new THREE.Vector3(0, 0, -1);
	const playerDirection = new THREE.Vector3(0, 0, 1);
	const rotationAngle = playerDirection.angleTo(entranceDirection);
	const initialRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle)

	useEffect(() => {
		const canvas = document.querySelector("canvas")
		if (canvas) {
			canvas.addEventListener("click", () => {
				canvas.requestPointerLock()
			})
		}

		if (ref.current) {
			ref.current.quaternion.copy(initialRotation)
		}
	}, [ref.current])

	useFrame((state, delta) => {
		if (gameplayState === "Active" && ref.current) {
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
				velocity.normalize().multiplyScalar(maxVelocity)
			}

			// Apply the velocity
			const currentVel = ref.current.linvel()
			ref.current.setLinvel({ x: velocity.x, y: currentVel.y, z: velocity.z })

			// Handle jumping
			if (jump && Math.abs(currentVel.y) < 0.05) {
				ref.current.setLinvel({ x: currentVel.x, y: 5, z: currentVel.z })
			}

			// Rotate the player to face the camera direction
			const lookAtVector = new THREE.Vector3(cameraForward.x, 0, cameraForward.z).normalize()
			const playerRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), lookAtVector)
			ref.current.setRotation(playerRotation)
		}
	})

	return (
		<>
			<RigidBody ref={ref} colliders="ball" position={[-32, 1, 0]} mass={1}>
				<mesh>
					<capsuleGeometry args={[0.5, 1, 4, 8]} />
					<meshStandardMaterial color="blue" />
				</mesh>
			</RigidBody>
			<FirstPersonCamera playerRef={ref} />
		</>
	)
})

const Spider = ({ playerRef }) => {
	const spiderRef = useRef()
	const { world } = useRapier()
	const spiderModel = useGLTF('/models/spider.gltf') // Assume we have a spider model

	const targetPosition = new THREE.Vector3()
	const currentPosition = new THREE.Vector3()
	const direction = new THREE.Vector3()

	useFrame((state, delta) => {
		if (!spiderRef.current || !playerRef.current) return

		// Get player and spider positions
		playerRef.current.getWorldPosition(targetPosition)
		spiderRef.current.getWorldPosition(currentPosition)

		// Calculate direction to player
		direction.subVectors(targetPosition, currentPosition).normalize()

		// Raycast to check for obstacles
		const ray = new THREE.Raycaster(currentPosition, direction)
		const hit = world.castRay(ray.ray, 5, true)

		if (!hit) {
			// Move towards player if no obstacle
			const newPosition = currentPosition.add(direction.multiplyScalar(delta * 2))
			spiderRef.current.setNextKinematicTranslation(newPosition)

			// Rotate to face player
			const lookAtMatrix = new THREE.Matrix4().lookAt(currentPosition, targetPosition, new THREE.Vector3(0, 1, 0))
			const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(lookAtMatrix)
			spiderRef.current.setNextKinematicRotation(targetQuaternion)
		}

		// Check for attack range
		if (currentPosition.distanceTo(targetPosition) < 2) {
			// Implement attack logic here
			console.log('Spider attacks!')
		}
	})

	return (
		<RigidBody ref={spiderRef} type="kinematicPosition" colliders="hull">
			<primitive object={spiderModel.scene} scale={0.5} />
		</RigidBody>
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
	const playerRef = useRef()

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
							<Scene />
							<Player ref={playerRef} gameplayState={gameplayState} />
							/*<Spider playerRef={playerRef} />*/
							<Environment preset="night" />
							<fog attach="fog" args={["#001020", -25, 50]} />
							<ambientLight intensity={1} />
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
