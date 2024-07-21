import * as THREE from "three"

interface Props {
	position: THREE.Vector3
	showPosition: boolean
}

export default function({ position, showPosition }: Props) {
	return (
		<>
			{showPosition == true
				? (
					<span className="flex justify-center items-center p-4 bg-black bg-opacity-35 absolute inset-4 z-10 pointer-events-none h-min w-max text-2xl">
						{position.clone().floor().toArray().join(", ")}
					</span>
				)
				: <></>}
			<span className="flex justify-center items-center p-4 bg-black bg-opacity-35 absolute z-10 top-4 right-4 pointer-events-none h-min w-max text-2xl">
				Press W, A, S, D to move!
			</span>
            <div className="flex justify-center items-center p-4 bg-black bg-opacity-35 absolute z-10 bottom-16 left-4 pointer-events-none h-min w-max text-2xl">
				
			</div>
		</>
	)
}
