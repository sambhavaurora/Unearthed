import { Children } from "react"

export default function Dialog(props: { children: React.ReactNode }) {
	return (
		<div className="dialog absolute inset-0 w-[100vw] h-[100vh] pointer-events-none flex justify-center items-end">
			{Children.map(props.children, child => (
				<>
					{child}
				</>
			))}
		</div>
	)
}
