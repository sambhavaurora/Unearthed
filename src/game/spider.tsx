import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { RigidBody, CuboidCollider, useRapier } from '@react-three/rapier'
import * as THREE from 'three'

const Spider = ({ playerRef }) => {
  const spiderRef = useRef()
  const { rapier, world } = useRapier()
  const spiderModel = useGLTF('/models/spider.glb') // Assume we have a spider model

  const rayOrigin = new THREE.Vector3()
  const rayDirection = new THREE.Vector3()

  useFrame((state, delta) => {
    if (!spiderRef.current || !playerRef.current) return

    const spiderPosition = spiderRef.current.translation()
    const playerPosition = playerRef.current.translation()

    // Calculate direction to player
    rayDirection.subVectors(playerPosition, spiderPosition).normalize()

    // Set up the ray for collision detection
    rayOrigin.copy(spiderPosition)
    const rayLength = 5

    // Perform the raycast
    const ray = new rapier.Ray(rayOrigin, rayDirection)
    const hit = world.castRay(ray, rayLength, true)

    if (!hit) {
      // Move towards player if no obstacle
      const newPosition = new THREE.Vector3(
        spiderPosition.x + rayDirection.x * delta * 2,
        spiderPosition.y,
        spiderPosition.z + rayDirection.z * delta * 2
      )
      spiderRef.current.setNextKinematicTranslation(newPosition)

      // Rotate to face player
      const angle = Math.atan2(rayDirection.x, rayDirection.z)
      spiderRef.current.setNextKinematicRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle))
    }

    // Check for attack range
    if (spiderPosition.distanceTo(playerPosition) < 2) {
      // Implement attack logic here
      console.log('Spider attacks!')
    }
  })

  return (
    <RigidBody ref={spiderRef} type="kinematicPosition" colliders={false} position={[0, 0, 5]}>
      <CuboidCollider args={[0.5, 0.5, 0.5]} />
      <primitive object={spiderModel.scene} scale={0.5} />
    </RigidBody>
  )
}

export default Spider
