import { useState, useEffect } from "react";

import Image from "next/image";

import TechCard from "@/components/TechCard";

import {
	HiOutlineArrowLongLeft,
	HiOutlineArrowLongRight,
} from "react-icons/hi2";

import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Seo from "@/components/Seo";
import { useRevealGroup } from "@/hooks/useReveal";

const Tech = () => {
	const data = [
		{
			title: "VS Code",
			id: 0,
			main: "/icons/vscode-original.svg",
			desc: "Best coding IDE to ever exist, comes with tons of customization",
			tag: "code",
			bg: "bg-blue-50",
			text: "text-blue-500",
		},
		{
			title: "JavaScript",
			id: 1,
			main: "/icons/javascript-original.svg",
			desc: "A lightweight, interpreted, or just-in-time compiled programming language with first-class functions.",
			tag: "code",
			bg: "bg-yellow-50",
			text: "text-yellow-500",
		},
		{
			title: "TypeScript",
			id: 2,
			main: "/icons/typescript-plain.svg",
			desc: "SuperScript of Javascript, made by microsoft with robust type safety.",
			tag: "code",
			bg: "bg-blue-50",
			text: "text-blue-500",
		},
		{
			title: "React JS",
			id: 3,
			main: "/icons/react-original.svg",
			desc: "A free and open-source front-end JavaScript library for building user interfaces based on components",
			tag: "develop",
			bg: "bg-blue-50",
			text: "text-blue-500",
		},
		{
			title: "Next JS",
			id: 4,
			main: "/icons/nextjs-original.svg",
			desc: "An open-source web development framework providing React-based web applications.",
			tag: "develop",
			bg: "bg-gray-900",
			text: "text-gray-50",
		},
		{
			title: "Tailwind CSS",
			id: 5,
			main: "/icons/tailwindcss-plain.svg",
			desc: "A utility-first CSS framework for rapidly building modern websites without ever leaving your HTML.",
			tag: "design",
			bg: "bg-green-50",
			text: "text-green-500",
		},
		{
			title: "Material UI",
			id: 6,
			main: "/icons/materialui-original.svg",
			desc: "A comprehensive suite of UI tools to help you ship new features faster.",
			tag: "develop",
			bg: "bg-indigo-50",
			text: "text-indigo-500",
		},
		{
			title: "SASS",
			id: 7,
			main: "/icons/sass-original.svg",
			desc: "CSS with superpowers. The most powerful professional grade CSS extension language in the world.",
			tag: "design",
			bg: "bg-pink-300",
			text: "text-pink-800",
		},
		{
			title: "Notion",
			id: 8,
			main: "/notion-icon.svg",
			desc: "A new tool that blends your everyday work apps into one. It's the all-in-one workspace for you and your team.",
			tag: "productivity",
			bg: "bg-gray-900",
			text: "text-gray-100",
		},
		{
			title: "Figma",
			id: 9,
			main: "/icons/figma-original.svg",
			desc: "A boon for webapp designers, from wireframe to animation, it has it all.",
			tag: "design",
			bg: "bg-orange-500",
			text: "text-orange-100",
		},
		{
			title: "GitHub",
			id: 10,
			main: "/icons/github-original.svg",
			desc: "A developer's go-to platform for collaborating and showcasing their code.",
			tag: "platform",
			bg: "bg-gray-900",
			text: "text-gray-100",
		},
		{
			title: "Brave",
			id: 11,
			main: "/brave-icon.svg",
			desc: "A privacy focused browser used to block ads and extra pops.",
			tag: "platform",
			bg: "bg-orange-500",
			text: "text-orange-100",
		},
		{
			title: "WordPress",
			id: 12,
			main: "/icons/wordpress-original.svg",
			desc: "A content management system (CMS) that allows you to host and build websites.",
			tag: "develop",
			bg: "bg-blue-50",
			text: "text-blue-500",
		},
		{
			title: "Node JS",
			id: 13,
			main: "/icons/nodejs-original.svg",
			desc: "A JavaScript runtime built on Chrome's V8 JavaScript engine, used for building scalable network applications.",
			tag: "develop",
			bg: "bg-green-50",
			text: "text-green-500",
		},
		{
			title: "Express JS",
			id: 14,
			main: "/icons/express-original.png",
			desc: "A minimal and flexible Node.js web application framework that provides a robust set of features for building web and mobile applications.",
			tag: "develop",
			bg: "bg-gray-900",
			text: "text-gray-100",
		},
		{
			title: "MongoDB",
			id: 15,
			main: "/icons/mongodb-original.svg",
			desc: "A NoSQL database that uses a document-oriented data model, allowing for flexible and scalable data storage.",
			tag: "database",
			bg: "bg-green-50",
			text: "text-green-500",
		},
		{
			title: "MySQL",
			id: 16,
			main: "/icons/mysql-original.webp",
			desc: "An open-source relational database management system based on SQL (Structured Query Language).",
			tag: "database",
			bg: "bg-blue-50",
			text: "text-blue-500",
		},
		{
			title: "Firebase",
			id: 17,
			main: "/icons/firebase-plain.svg",
			desc: "A platform developed by Google for creating mobile and web applications, providing a variety of tools and services.",
			tag: "develop",
			bg: "bg-yellow-50",
			text: "text-yellow-500",
		},
		{
			title: "GraphQL",
			id: 18,
			main: "/icons/graphql-plain.png",
			desc: "A query language for APIs and a runtime for executing those queries with your existing data.",
			tag: "develop",
			bg: "bg-purple-50",
			text: "text-purple-500",
		},
		{
			title: "AWS",
			id: 19,
			main: "/icons/aws-original.webp",
			desc: "Amazon Web Services (AWS) is a subsidiary of Amazon providing on-demand cloud computing platforms and APIs to individuals, companies, and governments.",
			tag: "cloud",
			bg: "bg-yellow-50",
			text: "text-yellow-500",
		},
		{
			title: "Docker",
			id: 20,
			main: "/icons/docker-original.svg",
			desc: "A platform for developing, shipping, and running applications in containers, allowing for consistent environments across different stages of development.",
			tag: "develop",
			bg: "bg-blue-50",
			text: "text-blue-500",
		},
		{
			title: "Postman",
			id: 21,
			main: "/icons/postman-original.svg",
			desc: "A collaboration platform for API development, providing tools for designing, testing, and documenting APIs.",
			tag: "develop",
			bg: "bg-orange-50",
			text: "text-orange-500",
		},
		{
			title: "Shadcn UI",
			id: 22,
			main: "/icons/shadcn-ui.png",
			desc: "A modern UI component library for building user interfaces with React, providing a set of customizable components.",
			tag: "design",
			bg: "bg-purple-50",
			text: "text-purple-500",
		},
		{
			title: "PHP",
			id: 23,
			main: "/icons/php-original.png",
			desc: "A popular general-purpose scripting language that is especially suited to web development.",
			tag: "develop",
			bg: "bg-blue-50",
			text: "text-blue-500",
		},
		{
			title: "Linux",
			id: 24,
			main: "/icons/linux-original.png",
			desc: "An open-source operating system modelled on UNIX, widely used for servers and desktops.",
			tag: "os",
			bg: "bg-gray-900",
			text: "text-gray-100",
		},
		{
			title: "Git",
			id: 25,
			main: "/icons/git-original.png",
			desc: "A distributed version control system for tracking changes in source code during software development.",
			tag: "develop",
			bg: "bg-orange-50",
			text: "text-orange-500",
		},
		{
			title: "Python",
			id: 26,
			main: "/icons/python-original.svg",
			desc: "A high-level, interpreted programming language known for its readability and versatility.",
			tag: "develop",
			bg: "bg-blue-50",
		},
		{
			title: "Gatsby",
			id: 27,
			main: "/icons/gatsby-original.webp",
			desc: "A React-based open-source framework for creating static websites and apps, known for its speed and performance.",
			tag: "develop",
			bg: "bg-purple-50",
			text: "text-purple-500",
		},
		{
			title: "Redux",
			id: 28,
			main: "/icons/redux-original.svg",
			desc: "A predictable state container for JavaScript apps, often used with React for managing application state.",
			tag: "develop",
			bg: "bg-blue-50",
			text: "text-blue-500",
		},
		{
			title: "Zustand",
			id: 29,
			main: "/icons/zustand.webp",
			desc: "A small, fast, and scalable bearbones state-management solution for React.",
			tag: "develop",
			bg: "bg-green-50",
			text: "text-green-500",
		},
		{
			title: "Prisma",
			id: 30,
			main: "/icons/prisma.svg",
			desc: "A next-generation ORM that can be used to build GraphQL servers, REST APIs, and more.",
			tag: "develop",
			bg: "bg-purple-50",
			text: "text-purple-500",
		},
		{
			title: "Vercel",
			id: 31,
			main: "/icons/vercel.svg",
			desc: "A cloud platform for static sites and Serverless Functions that fits perfectly with Next.js.",
			tag: "platform",
			bg: "bg-gray-900",
			text: "text-gray-100",
		},
		{
			title: "Cloudflare",
			id: 32,
			main: "/icons/cloudflare.svg",
			desc: "A global network that provides content delivery, internet security, and distributed domain name server services.",
			tag: "platform",
			bg: "bg-yellow-50",
			text: "text-yellow-500",
		},
		{
			title: "PostgreSQL",
			id: 33,
			main: "/icons/postgresql-original.png",
			desc: "A powerful, open source object-relational database system with more than 15 years of active development.",
			tag: "database",
			bg: "bg-blue-50",
			text: "text-blue-500",
		},
		{
			title: "Redis",
			id: 34,
			main: "/icons/redis-original.svg",
			desc: "An open source, in-memory data structure store, used as a database, cache, and message broker.",
			tag: "database",
			bg: "bg-red-50",
			text: "text-red-500",
		},
		{
			title: "GSAP",
			id: 35,
			main: "/icons/gsap.svg",
			desc: "A powerful JavaScript library for creating high-performance animations that work in every major browser.",
			tag: "animation",
			bg: "bg-green-50",
			text: "text-green-500",
		},
	];
	const [idNumber, setIdNumber] = useState(0);
	const revealRef = useRevealGroup();

	const changeId = (id) => setIdNumber(id);
	const rightArrow = () => setIdNumber((n) => (n + 1) % data.length);
	const leftArrow = () => setIdNumber((n) => (n - 1 + data.length) % data.length);

	// Arrow keys drive the spotlight too — the buttons are not the only affordance.
	useEffect(() => {
		const onKey = (e) => {
			if (e.key === "ArrowRight") rightArrow();
			if (e.key === "ArrowLeft") leftArrow();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const active = data[idNumber];

	return (
		<>
			<Seo
				title="Tech"
				description="The languages, frameworks and tools Fuad Hasan Emon builds with day to day - React, Next.js, TypeScript, Node.js, AWS and more."
				path="/tech"
			/>

			<div ref={revealRef} className="shell pb-28 pt-36 sm:pt-40">
				<SectionHeading
					as="h1"
					eyebrow="Toolkit"
					title="Tech stack"
					lead="Like most engineers, I spend a fair amount of time evaluating tools. These are the ones that earned a permanent place."
				/>

				{/* Arrows flank the card from sm up; below that they share one row
				    underneath, where a ~215px card would squeeze the copy. */}
				<Reveal
					delay={80}
					className="mx-auto mt-16 flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-center sm:gap-5"
				>
					<div
						key={active.id}
						className="card flex flex-1 items-center gap-4 p-5 sm:order-2 sm:gap-6 sm:p-6"
					>
						<div className="relative h-14 w-14 shrink-0 rounded-xl bg-white p-2.5 sm:h-20 sm:w-20 sm:p-4">
							<Image
								src={active.main}
								alt={active.title}
								fill
								sizes="80px"
								className="select-none object-contain p-2"
							/>
						</div>
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								<h2 className="text-fluid-h3 font-semibold text-ink">
									{active.title}
								</h2>
								<span
									className="rounded-full px-2 py-0.5 font-space text-[0.6rem] uppercase tracking-wider"
									style={{
										background: "rgb(var(--accent) / 0.12)",
										color: "rgb(var(--accent))",
									}}
								>
									{active.tag}
								</span>
							</div>
							<p className="mt-2 text-fluid-sm text-muted">{active.desc}</p>
						</div>
					</div>

					{/* `sm:contents` dissolves this row so the buttons re-order around
					    the card on wider screens. */}
					<div className="flex justify-between gap-3 sm:contents">
						<button
							type="button"
							onClick={leftArrow}
							aria-label="Previous technology"
							className="grid h-10 w-10 shrink-0 place-items-center rounded-full border text-muted transition-all duration-300 hover:-translate-x-0.5 hover:border-accent/50 hover:text-accent sm:order-1"
							style={{ borderColor: "rgb(var(--line) / 0.14)" }}
						>
							<HiOutlineArrowLongLeft className="h-5 w-5" />
						</button>
						<button
							type="button"
							onClick={rightArrow}
							aria-label="Next technology"
							className="grid h-10 w-10 shrink-0 place-items-center rounded-full border text-muted transition-all duration-300 hover:translate-x-0.5 hover:border-accent/50 hover:text-accent sm:order-3"
							style={{ borderColor: "rgb(var(--line) / 0.14)" }}
						>
							<HiOutlineArrowLongRight className="h-5 w-5" />
						</button>
					</div>
				</Reveal>

				{/* Grid */}
				<Reveal
					delay={140}
					className="mx-auto mt-16 grid max-w-3xl grid-cols-4 gap-3 sm:grid-cols-6 sm:gap-4 lg:grid-cols-8"
				>
					{data.map((obj) => (
						<TechCard
							id={obj.id}
							alt={obj.title}
							main={obj.main}
							key={obj.id}
							active={obj.id === idNumber}
							changeId={changeId}
						/>
					))}
				</Reveal>
			</div>
		</>
	);
};

export default Tech;
