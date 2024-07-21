import { useFrame, useThree } from "@react-three/fiber"
import React, { useEffect, useRef } from "react"
import * as THREE from "three"

const FirstPersonCamera = ({ playerRef }: { playerRef: React.MutableRefObject<any> }) => {
	const { camera } = useThree()
	const pitchRef = useRef(new THREE.Object3D())
	const yawRef = useRef(new THREE.Object3D())
	const cameraOffset = new THREE.Vector3(0, 1.5, 0)

	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			if (document.pointerLockElement) {
				const sensitivity = 0.002
				yawRef.current.rotation.y -= event.movementX * sensitivity
				pitchRef.current.rotation.x -= event.movementY * sensitivity
				pitchRef.current.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitchRef.current.rotation.x))
			}
		}

        yawRef.current.rotation.y = Math.PI * 1.5
		document.addEventListener("mousemove", handleMouseMove)
		return () => document.removeEventListener("mousemove", handleMouseMove)
	}, [])

	useFrame(() => {
		if (playerRef.current) {
			const playerPosition = playerRef.current.translation()
			yawRef.current.position.set(playerPosition.x, playerPosition.y, playerPosition.z)
			camera.position.copy(yawRef.current.position).add(cameraOffset)
			camera.quaternion.setFromEuler(new THREE.Euler(pitchRef.current.rotation.x, yawRef.current.rotation.y, 0, "YXZ"))
		}
	})

	return (
		<object3D ref={yawRef}>
			<object3D ref={pitchRef} />
		</object3D>
	)
}

export default FirstPersonCamera
