import { Environment, KeyboardControls, OrbitControls, useGLTF, useKeyboardControls } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Physics, RigidBody, useRapier } from "@react-three/rapier"
import React, { Suspense, useEffect, useRef } from "react"
import * as THREE from "three"
import DarkSky from "./dark-sky"

type GameplayState = "Active" | "Paused" | "GameOver"

interface GameProps {
	onExit: () => void
}

const FollowCamera = ({ target }: { target: React.MutableRefObject<any> }) => {
	const { camera, size } = useThree()
	const mousePosition = useRef({ x: 0, y: 0 })
	const cameraPositionRef = useRef(new THREE.Vector3(0, 5, 10))
	const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0))
	const cameraOffset = useRef(new THREE.Vector3(0, 5, 10))

	useEffect(() => {
		const updateMousePosition = (event: { clientX: number; clientY: number }) => {
			mousePosition.current = {
				x: (event.clientX / size.width) * 2 - 1,
				y: -(event.clientY / size.height) * 2 + 1,
			}
		}

		window.addEventListener("mousemove", updateMousePosition)

		return () => {
			window.removeEventListener("mousemove", updateMousePosition)
		}
	}, [size])

	useFrame(() => {
		if (target.current) {
			const targetPosition = target.current.translation()

			// Calculate camera offset based on mouse position
			const offsetX = mousePosition.current.x * 2
			const offsetY = mousePosition.current.y * 2

			// Update camera position
			const idealPosition = new THREE.Vector3(
				targetPosition.x + cameraOffset.current.x + offsetX,
				targetPosition.y + cameraOffset.current.y + offsetY,
				targetPosition.z + cameraOffset.current.z,
			)

			cameraPositionRef.current.lerp(idealPosition, 0.1)
			camera.position.copy(cameraPositionRef.current)

			// Update camera target
			const idealTarget = new THREE.Vector3(
				targetPosition.x + offsetX * 0.1,
				targetPosition.y + offsetY * 0.1,
				targetPosition.z,
			)

			cameraTargetRef.current.lerp(idealTarget, 0.1)
			camera.lookAt(cameraTargetRef.current)
		}
	})

	return null
}

const Model = ({ gameplayState = "Active" }) => {
	const gltf = useGLTF("/models/meow.glb")
	const gltf2 = useGLTF("/models/scene.gltf")
	const rigidBodyRef = useRef<any>()
	const [, getKeys] = useKeyboardControls()

	const velocity = new THREE.Vector3()
	const maxVelocity = 3 // Adjust this value to set maximum speed

	useFrame((state, delta) => {
		if (gameplayState === "Active" && rigidBodyRef.current) {
			const { forward, backward, left, right, jump } = getKeys()
			const speed = 50

			// Reset velocity
			velocity.set(0, 0, 0)

			// Calculate move direction
			if (forward) velocity.z -= speed
			if (backward) velocity.z += speed
			if (left) velocity.x -= speed
			if (right) velocity.x += speed

			// Normalize and scale the velocity
			if (velocity.length() > 0) {
				velocity.normalize().multiplyScalar(maxVelocity)
			}

			// Apply the velocity
			rigidBodyRef.current.setLinvel({ x: velocity.x, y: rigidBodyRef.current.linvel().y, z: velocity.z })

			// Handle jumping
			if (jump) {
				const currentVel = rigidBodyRef.current.linvel()
				rigidBodyRef.current.setLinvel({ x: currentVel.x, y: 5, z: currentVel.z })
			}
		}
	})

	return (
		<>
			<RigidBody type="fixed" position={[0, -10, 0]} colliders= "trimesh">
				<primitive object={gltf.scene} scale={2}  />
			</RigidBody>
			<RigidBody ref={rigidBodyRef} colliders="cuboid" position={[0, 1, 0]}>
				<primitive object={gltf2.scene} scale={1} />
			</RigidBody>
			{/* <FollowCamera target={rigidBodyRef} /> */}
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
							<fog attach="fog" args={["#001020", -5, 50]} />
							<ambientLight intensity={1} />
							{/* <pointLight position={[0, 100, 0]} castShadow /> */}
							<OrbitControls />
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
