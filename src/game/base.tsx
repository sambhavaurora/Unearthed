// set up three js with animating cube
import { onCleanup } from "solid-js"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

const Cube = () => {
	const scene = new THREE.Scene()
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
	const renderer = new THREE.WebGLRenderer()
	renderer.setSize(window.innerWidth, window.innerHeight)
	scene.background = new THREE.Color(0xcccccc) // Light gray background
	document.body.appendChild(renderer.domElement)

	const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
	scene.add(ambientLight)

	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
	directionalLight.position.set(0, 1, 1)
	scene.add(directionalLight)

	const controls = new OrbitControls(camera, renderer.domElement)
	// load a gltf into scene
	const loader = new GLTFLoader()
	loader.load(
		"/models/scene.gltf",
		(gltf) => {
			console.log(gltf)
			const model = gltf.scene
			scene.add(model)
		},
		undefined,
		(error) => {
			console.error(error)
		},
	)

	const animate = () => {
		controls.update()
		renderer.render(scene, camera)
	}

	animate()

	onCleanup(() => {
		document.body.removeChild(renderer.domElement)
	})
}

export default Cube
