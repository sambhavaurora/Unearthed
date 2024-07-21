import * as THREE from 'three';

export default function({ position }: { position: THREE.Vector3 }) {
    return (
        <span className="flex justify-center items-center p-4 bg-black bg-opacity-35 absolute inset-4 z-10 pointer-events-none h-min w-max text-2xl">
            {position.clone().floor().toArray().join(", ")}
        </span>
    )
}