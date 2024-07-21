import { Children } from "react"

export default function Dialog(props: { children: React.ReactNode }) {
	return (
		<div className="dialog dialog-fade absolute inset-0 w-[100vw] h-[100vh] pointer-events-none flex justify-center items-end z-10">
			{Children.map(props.children, child => (
				<>
					<span className="text-2xl pointer-events-none h-[40%] flex gap-4 justify-center items-center">{child}</span>
				</>
			))}
		</div>
	)
}
