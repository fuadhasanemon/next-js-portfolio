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

const ProjectCard = () => {
  const data = [
    {
      id: 1,
      image: clubswan,
      title: "Clubswan",
      link: "https://aucardllcstg.wpengine.com/",
      target: "_blank"
    },
    {
      id: 2,
      image: gablesrealty,
      title: "Gables Realty",
      link: "https://gablesrealty.ca/",
      target: "_blank"
    },
    {
      id: 3,
      image: dnotch,
      title: "Dnotch",
      link: "https://dnotch.ca/",
      target: "_blank"
    },
    {
      id: 4,
      image: awr,
      title: "AWR Real Estate",
      link: "https://awr-alpha.netlify.app/",
      target: "_blank"
    },
    {
      id: 5,
      image: aurae,
      title: "Aurae Lifestyle",
      link: "https://auraelifestyle.com/",
      target: "_blank"
    },
    {
      id: 6,
      image: supportive,
      title: "Supportive Colleges",
      link: "https://supportivecolleges.com/",
      target: "_blank"
    },
    {
      id: 7,
      image: visuali,
      title: "Visual i",
      link: "https://visualiweb.com/",
      target: "_blank"
    },
    {
      id: 8,
      image: scribe,
      title: "Scribe",
      link: "https://fuadhasanemon.github.io/Scribe-template/",
      target: "_blank"
    },
    {
      id: 9,
      image: ucb,
      title: "UCB",
      link: "https://ucbbd.org/",
      target: "_blank"
    },
    {
      id: 10,
      image: ecoCeramics,
      title: "Eco Ceramics",
      link: "https://ecoceramics.com.bd/",
      target: "_blank"
    },
    {
      id: 11,
      image: modern,
      title: "Morden Roaring",
      link: "#",
      target: "_blank"
    },
    {
      id: 12,
      image: marketingClubswan,
      title: "Marketing Clubswan",
      link: "#",
      target: "_blank"
    }

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
      {data.map(project => {
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
