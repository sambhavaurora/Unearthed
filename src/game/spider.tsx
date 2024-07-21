import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { useEffect, useRef } from "react"
import * as YUKA from "yuka"

import React from "react"

type SpiderProps = {
	playerRef: React.RefObject<any>
}

const Spider: React.FC<SpiderProps> = ({ playerRef }) => {
	const spiderRef = useRef<any>()
	const { scene } = useGLTF("/models/spider.gltf")
	const vehicleRef = useRef(new YUKA.Vehicle())
	const targetRef = useRef(new YUKA.GameEntity())

	useEffect(() => {
		const vehicle = vehicleRef.current
		const target = targetRef.current

		const entityManager = new YUKA.EntityManager()
		entityManager.add(vehicle)

		const seekBehavior = new YUKA.SeekBehavior(target.position)
		vehicle.steering.add(seekBehavior)

		vehicle.setRenderComponent(spiderRef, (entity) => {
			// @ts-ignore
			spiderRef.current.setNextKinematicTranslation(entity.position)
			// @ts-ignore
			spiderRef.current.setNextKinematicRotation(entity.rotation)
		})

		return () => {
			entityManager.clear()
		}
	}, [])

	useFrame((_state, delta) => {
		if (playerRef.current && targetRef.current && vehicleRef.current) {
			const playerPosition = playerRef.current.translation()
			targetRef.current.position.set(playerPosition.x, 0, playerPosition.z)

			const distance = vehicleRef.current.position.distanceTo(targetRef.current.position)
			vehicleRef.current.maxSpeed = Math.min(5, distance)

			vehicleRef.current.update(delta)
		}
	})

	return (
		<RigidBody ref={spiderRef} type="kinematicPosition" position={[-32, -15.5, -1]}>
			<primitive object={scene} scale={0.5} />
		</RigidBody>
	)
}

export default Spider
