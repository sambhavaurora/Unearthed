import { Sky } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import React, { useMemo, useRef } from "react"
import * as THREE from "three"

const DarkSky = () => {
	const shaderRef = useRef(null)

	const uniforms = useMemo(
		() => ({
			topColor: { value: new THREE.Color("#001020") },
			bottomColor: { value: new THREE.Color("#000510") },
			offset: { value: 100 },
			exponent: { value: 0.6 },
			time: { value: 0 },
		}),
		[],
	)

	useFrame(({ clock }) => {
		if (shaderRef.current) {
			;(shaderRef.current as any).uniforms.time.value = clock.elapsedTime * 0.2
		}
	})

	return (
		<>
			<Sky
				distance={450000}
				sunPosition={[0, -1, 0]}
				inclination={0}
				azimuth={0.25}
			/>
			<mesh scale={1000}>
				<sphereGeometry args={[1, 32, 32]} />
				<shaderMaterial
					ref={shaderRef}
					uniforms={uniforms}
					vertexShader={`
            varying vec3 vWorldPosition;
            void main() {
              vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
              vWorldPosition = worldPosition.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
          `}
					fragmentShader={`
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            uniform float time;
            varying vec3 vWorldPosition;
            
            // Simplex 2D noise
            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

            float snoise(vec2 v){
              const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
              vec2 i  = floor(v + dot(v, C.yy) );
              vec2 x0 = v -   i + dot(i, C.xx);
              vec2 i1;
              i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
              vec4 x12 = x0.xyxy + C.xxzz;
              x12.xy -= i1;
              i = mod(i, 289.0);
              vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
              + i.x + vec3(0.0, i1.x, 1.0 ));
              vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                dot(x12.zw,x12.zw)), 0.0);
              m = m*m ;
              m = m*m ;
              vec3 x = 2.0 * fract(p * C.www) - 1.0;
              vec3 h = abs(x) - 0.5;
              vec3 ox = floor(x + 0.5);
              vec3 a0 = x - ox;
              m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
              vec3 g;
              g.x  = a0.x  * x0.x  + h.x  * x0.y;
              g.yz = a0.yz * x12.xz + h.yz * x12.yw;
              return 130.0 * dot(m, g);
            }
            
            void main() {
              vec3 direction = normalize( vWorldPosition - cameraPosition );
              float height = normalize( vWorldPosition ).y;
              float noise = snoise(vWorldPosition.xz * 0.001 + time * 0.05) * 0.15;
              float cloudMix = smoothstep(0.2, 0.6, noise + 0.2);
              vec3 skyColor = mix( bottomColor, topColor, max( pow( max( height + offset, 0.0 ), exponent ), 0.0 ) );
              vec3 cloudColor = vec3(0.2, 0.2, 0.3);
              gl_FragColor = vec4( mix(skyColor, cloudColor, cloudMix), 1.0 );
            }
          `}
					side={THREE.BackSide}
				/>
			</mesh>
		</>
	)
}

export default DarkSky
