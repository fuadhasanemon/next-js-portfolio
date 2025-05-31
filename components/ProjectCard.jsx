import Image from "next/image";
import Link from "next/link";

import clubswan from "@/public/work/clubswan.jpg";
import gablesrealty from "@/public/work/gablesrealty-ca.jpg";
import awr from "@/public/work/awr.jpg";
import dnotch from "@/public/work/dnotch.png";
import aurae from "@/public/work/aure.png";
import supportive from "@/public/work/supportive-college.png";
import visuali from "@/public/work/visuali.png";
import scribe from "@/public/work/scribe.jpg";
import ucb from "@/public/work/ucb.png";
import ecoCeramics from "@/public/work/eco-ceramic.jpg";
import modern from "@/public/work/mordenroaringlion.jpg";
import marketingClubswan from "@/public/work/marketing-clubswan.jpg";
import diva from "@/public/work/diva.jpg";
import bestCollegeQuest from "@/public/work/bestcollegequest.jpg";
import canadachoise from "@/public/work/canadachoicestor.jpg";
import coinx from "@/public/work/coinx-licenses.jpg";
import educo from "@/public/work/educo.jpg";
import lakshaGroup from "@/public/work/laksha-group.jpg";
import simpleLivingInsider from "@/public/work/simplelivinginsider.jpg";
import strollerInsider from "@/public/work/strollerinsider.jpg";
import tedxmodern from "@/public/work/tedxmorden.jpg";
import slickDigital from "@/public/work/slick-digital.png";
import directHomes2u from "@/public/work/directhomes2u.png";
import jcx from "@/public/work/jcx.png";
import dhakaTech from "@/public/work/dhakatech.png";
import siliconOrchard from "@/public/work/silicon0orchard.png";
import solChat from "@/public/work/sol-chat.jpg";

const ProjectCard = () => {
	const data = [
		{
			id: 1,
			image: clubswan,
			title: "Clubswan",
			description: "A fintech website for Clubswan",
			link: "https://aucardllcstg.wpengine.com/",
			target: "_blank",
		},
		{
			id: 2,
			image: gablesrealty,
			title: "Gables Realty",
			description: "A property rental and sales website for Gables Realty",
			link: "https://gablesrealty.ca/",
			target: "_blank",
		},
		{
			id: 3,
			image: dnotch,
			title: "Dnotch",
			description: "A agency website for Dnotch",
			link: "https://dnotch.ca/",
			target: "_blank",
		},
		{
			id: 4,
			image: awr,
			title: "AWR Real Estate",
			description: "A portfolio website for AWR Real Estate",
			link: "https://awr-alpha.netlify.app/",
			target: "_blank",
		},
		{
			id: 5,
			image: aurae,
			title: "Aurae Lifestyle",
			description: "A fintech lifestyle for Aurae Lifestyle",
			link: "https://auraelifestyle.com/",
			target: "_blank",
		},
		{
			id: 6,
			image: supportive,
			description: "A lead generation site for Supportive Colleges",
			title: "Supportive Colleges",
			link: "https://supportivecolleges.com/",
			target: "_blank",
		},
		{
			id: 7,
			image: visuali,
			description: "A software company website for Visual i",
			title: "Visual i",
			link: "https://visualiweb.com/",
			target: "_blank",
		},
		{
			id: 8,
			image: scribe,
			title: "Scribe",
			description: "A template for Scribe",
			link: "https://fuadhasanemon.github.io/Scribe-template/",
			target: "_blank",
		},
		{
			id: 9,
			image: ucb,
			title: "UCB",
			description: "A educational website for UCB Bangladesh",
			link: "https://ucbbd.org/",
			target: "_blank",
		},
		{
			id: 10,
			image: ecoCeramics,
			description: "A portfolio and e-commerce website for Eco Ceramics",
			title: "Eco Ceramics",
			link: "https://ecoceramics.com.bd/",
			target: "_blank",
		},
		{
			id: 11,
			image: modern,
			description: "A website for Morden Roaring Lion",
			title: "Morden Roaring",
			link: "#",
			target: "_blank",
		},
		{
			id: 12,
			image: marketingClubswan,
			description: "Marketing website for Clubswan",
			title: "Marketing Clubswan",
			link: "#",
			target: "_blank",
		},
		{
			id: 13,
			image: diva,
			title: "Divas Theme",
			description: "A WordPress theme for Divas",
			link: "#",
			target: "_blank",
		},
		{
			id: 14,
			image: bestCollegeQuest,
			title: "Best College Quest",
			description: "A website to find the best colleges in USA",
			link: "https://bestcollegequest.com/",
			target: "_blank",
		},
		{
			id: 15,
			image: canadachoise,
			title: "Canada Choise Store",
			description: "A affiliate website for Canada Choise Store",
			link: "#",
			target: "_blank",
		},
		{
			id: 16,
			image: coinx,
			title: "CoinX Licenses",
			description: "A website for CoinX Licenses",
			link: "#",
			target: "_blank",
		},
		{
			id: 17,
			image: educo,
			title: "Educo",
			description: "A educational website for Educo",
			link: "https://edukopathwaysbd.com/",
			target: "_blank",
		},
		{
			id: 18,
			image: lakshaGroup,
			title: "Laksha Group",
			description: "A website for agricultural company Laksha Group",
			link: "#",
			target: "_blank",
		},
		{
			id: 19,
			image: simpleLivingInsider,
			title: "Simple Living Insider",
			description: "A affiliate website for Simple Living Insider",
			link: "https://simplelivinginsider.com/",
			target: "_blank",
		},
		{
			id: 20,
			image: strollerInsider,
			title: "Stroller Insider",
			description: "A affiliate website for Stroller Insider",
			link: "https://strollerinsider.com/",
			target: "_blank",
		},
		{
			id: 21,
			image: tedxmodern,
			title: "TEDx Morden",
			description: "A membership website for TEDx Morden",
			link: "https://tedxmordenroaringlion.com/",
			target: "_blank",
		},
		{
			id: 22,
			image: slickDigital,
			title: "Slick Digital",
			description: "A digital agency website for Slick Digital",
			link: "https://slickdigital.io/",
			target: "_blank",
		},
		{
			id: 23,
			image: directHomes2u,
			title: "Direct Homes 2U",
			description: "A property selling website for Direct Homes 2U",
			link: "https://directhomes2u.com/",
			target: "_blank",
		},
		{
			id: 24,
			image: jcx,
			title: "JCX",
			description: "A real estate portfolio website for JCX",
			link: "https://jcxbd.com/",
			target: "_blank",
		},
		{
			id: 25,
			image: dhakaTech,
			title: "Dhaka Tech",
			description: "A job market website for Dhaka Tech",
			link: "https://dhakatechnology.com/",
			target: "_blank",
		},
		{
			id: 26,
			image: siliconOrchard,
			title: "Silicon Orchard",
			description: "A digital agency website for Silicon Orchard",
			link: "https://www.siliconorchard.com/",
			target: "_blank",
		},
		{
			id: 27,
			image: solChat,
			title: "Sol Chat",
			description: "A webapp for Sol Chat AI Chatbot company",
			link: "https://sol-chat.app/",
			target: "_blank",
		},

		// {
		//   id: 0,
		//   image: redeye,
		//   title: "Red Eye",
		//   description: "Question based website to know your movie genre",
		//   link: "https://red-eye.netlify.app/",
		//   target: "_self"
		// }
	];

	return (
		<div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
			{data.map((project) => {
				return (
					<div
						className="rounded-lg mb-12 flex flex-col items-center"
						key={project.id}
					>
						<Link
							href={project.link}
							target={project.target}
							onClick={() => {
								project.title === "Portfolio"
									? alert("You are already on this site! 🤩")
									: project.title === "Pokedex"
									? alert(
											"Ash Ketchum asked you to open in desktop browser.. 🚀"
									  )
									: "";
							}}
						>
							<div className="rounded-lg overflow-hidden h-[300px]">
								<Image
									loading="lazy"
									src={project.image}
									alt={project.title}
									width="200"
									className="rounded-lg drop-shadow-2xl transform transition-transform duration-[5000ms] ease-in-out hover:translate-y-[calc(-100%+400px)]"
								/>
							</div>
						</Link>
						<div className="flex flex-col items-center">
							<h1 className="font-semibold text-[1.5rem] mt-3 text-gray-700 dark:text-white">
								{project.title}
							</h1>
							<p className="max-w-[90%] text-gray-400 font-light text-center text-sm">
								{project?.description}
							</p>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default ProjectCard;
