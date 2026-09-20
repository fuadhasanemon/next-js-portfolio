import Reveal from "@/components/Reveal";

const TimeLine = () => {
	const data = [
		{
			id: 0,
			title: "Software Engineer",
			duration: "July 2024 - Present",
			org: "Silicon Orchard Ltd.",
			skills: [
				"React.js",
				"TypeScript",
				"Next.js",
				"Node.js",
				"Redux.js",
				"zustand",
				"Express.js",
				"MongoDB",
				"MySQL",
				"PostgreSQL",
				"GraphQL",
				"AWS",
				"Firebase",
				"SASS",
				"Tailwind CSS",
				"Bootstrap",
				"Material UI",
				"Shadcn UI",
				"JavaScript",
				"PHP",
				"wordPress",
			],
			class:
				"bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300",
		},
		{
			id: 1,
			title: "Software Engineer",
			duration: "June 2022 - July 2024",
			org: "Spring Rain Private Ltd.",
			skills: [
				"React.js",
				"Redux.js",
				"SASS",
				"TypeScript",
				"NextJs",
				"wordPress",
				"Node.js",
				"Express.js",
				"MongoDB",
				"MySQL",
				"GraphQL",
				"AWS",
				"Firebase",
				"Tailwind CSS",
				"Bootstrap",
				"Material UI",
				"Shadcn UI",
			],
			class:
				"bg-violet-200 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-violet-900 dark:text-red-300",
		},
		{
			id: 2,
			title: "Frontend Developer",
			duration: "Oct 2020 - Jun 2022",
			org: "Dcastalia",
			skills: [
				"JavaScript",
				"PHP",
				"React.js",
				"jQuery",
				"Node.js",
				"Express.js",
				"MongoDB",
				"MySQL",
			],
			class:
				"bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300",
		},
	];
	return (
		<ol
			className="relative ms-3 border-s"
			style={{ borderColor: "rgb(var(--line) / 0.14)" }}
		>
			{data.map((item, i) => (
				<Reveal
					as="li"
					key={item.id}
					delay={i * 90}
					y={24}
					className="group relative ms-8 pb-14 last:pb-0"
				>
					{/* Node marker */}
					<span
						aria-hidden="true"
						className="absolute -start-[2.5rem] top-1.5 grid h-4 w-4 place-items-center rounded-full ring-4 transition-transform duration-500 group-hover:scale-125"
						style={{
							background: item.id === 0 ? "rgb(var(--accent))" : "rgb(var(--faint))",
							"--tw-ring-color": "rgb(var(--bg))",
						}}
					>
						<span className="h-1.5 w-1.5 rounded-full bg-bg" />
					</span>

					<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
						<h3 className="text-fluid-h3 font-semibold text-ink">
							{item.title}
						</h3>
						{item.id === 0 && (
							<span
								className="rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium text-white"
								style={{ background: "rgb(var(--accent))" }}
							>
								Current
							</span>
						)}
					</div>

					<p className="mt-1.5 text-fluid-base text-ink/80">{item.org}</p>

					<time className="mt-1 block font-space text-xs uppercase tracking-wider text-faint">
						{item.duration}
					</time>

					<ul className="mt-5 flex flex-wrap gap-1.5">
						{item.skills.map((skill) => (
							<li
								key={skill}
								className="rounded-md border px-2 py-0.5 text-[0.72rem] text-muted transition-colors duration-300 hover:border-accent/50 hover:text-accent"
								style={{ borderColor: "rgb(var(--line) / 0.13)" }}
							>
								{skill}
							</li>
						))}
					</ul>
				</Reveal>
			))}
		</ol>
	);
};

export default TimeLine;
