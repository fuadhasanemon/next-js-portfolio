import { useEffect, useState } from "react";
import Link from "next/link";
import { FiGitBranch } from "react-icons/fi";
import { FaRegStar } from "react-icons/fa";
import LinkedIn from "../public/icons/linkedin@2x.png";
import GitHub from "../public/icons/github@2x.png";
import Behance from "../public/icons/behance@2x.png";
import Instagram from "../public/icons/instagram@2x.png";
import Gmail from "../public/icons/google@2x.png";
import Image from "next/image";
import Star from "@/public/Star.svg";

const Footer = () => {
  const [metaData, setMetaData] = useState({ star: 0, forks: 0 });
  const [isHovering, setIsHovering] = useState(false);
  // const handleMouseOver = () => {
  //   setIsHovering(true);
  // };
  // const handleMouseOut = () => {
  //   setIsHovering(false);
  // };
  // useEffect(() => {
  //   const getData = async () => {
  //     const data = await fetch(
  //       "https://api.github.com/repos/fuadhasanemon/Shop-App---e-commerce"
  //     ).then(res => res.json());
  //     setMetaData({
  //       star: data.stargazers_count,
  //       forks: data.forks_count
  //     });
  //   };
  //   getData();
  // }, []);

  return (
    <div className=" flex select-none text-sm  py-16 mt-16 flex-col h-max items-center mx-auto justify-center">
      <div className="flex justify-center space-x-4 md:space-x-6 dark:text-white/70 text-gray-500 text-[0.6rem] sm:text-xs md:text-sm lg:text-md mt-2">
        <Link
          href="https://www.linkedin.com/in/fuadhasanemon/"
          target="blank"
          className=" dark:hover:text-purple-400 hover:text-purple-600 font-semibold"
        >
          {" "}
          {/* LinkedIn{" "} */}
          <Image src={LinkedIn} alt="linkedin" width="30" />
        </Link>
        <Link
          href="https://github.com/fuadhasanemon"
          target="blank"
          className=" dark:hover:text-purple-400 hover:text-purple-600 font-semibold"
        >
          {" "}
          {/* GitHub{" "} */}
          <Image src={GitHub} alt="github" width="30" />
        </Link>
        {/* <Link
          href="https://www.behance.net/pranjalshikhar"
          target="blank"
          className=" dark:hover:text-purple-400 hover:text-purple-600 font-semibold"
        >
          {" "}
          
          <Image src={Behance} alt="behnace" width="30" />
        </Link> */}
        <a
          href="https://www.instagram.com/emonfuad/"
          target="blank"
          className=" dark:hover:text-purple-400 hover:text-purple-600 font-semibold"
        >
          {" "}
          {/* Instagram{" "} */}
          <Image src={Instagram} alt="instagram" width="30" />
        </a>
        <Link
          href="mailto:fuadhasanemon8@gmail.com"
          target="blank"
          rel="noreferrer"
          className=" dark:hover:text-purple-400 hover:text-purple-600 font-semibold"
        >
          {" "}
          {/* Résumé{" "} */}
          <Image src={Gmail} alt="gmail" width="30" />
        </Link>
      </div>
      <a
        href="https://github.com/fuadhasanemon"
        target="blank"
        rel="noreferrer"
        className="flex flex-col text-center group hover:text-purple-800 w-max hover:font-black items-center text-gray-600 text-[0.6rem] sm:text-xs md:text-sm lg:text-md mt-8 md:mt-12 font-syne"
      >
        <div
          // onMouseOut={handleMouseOut}
          // onMouseOver={handleMouseOver}
          className="relative transition-all ease-in-out duration-1000   "
        >
          <p
            className={` ${
              isHovering && "scale-150 blur-[6px]"
            } group font-bold animate-text duration-700 transition-all linear  group-hover:bg-white lg:text-gray-700 lg:dark:text-white/40 lg:group-hover:text-transparent bg-gradient-to-r mb-2 from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent text-sm sm:text-base md:text-lg`}
          >
            © Fuad Hasan Emon
          </p>
        </div>
      </a>
    </div>
  );
};

export default Footer;
