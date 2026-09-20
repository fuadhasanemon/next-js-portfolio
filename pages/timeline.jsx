import SectionHeading from "@/components/SectionHeading";
import Seo from "@/components/Seo";
import TimeLine from "@/components/TimeLine";
import { useRevealGroup } from "@/hooks/useReveal";

const Timeline = () => {
  const revealRef = useRevealGroup();

  return (
    <>
      <Seo
        title="Timeline"
        description="The roles, milestones and technology stacks that shaped Fuad Hasan Emon's engineering career."
        path="/timeline"
      />

      <div ref={revealRef} className="shell pb-28 pt-36 sm:pt-40">
        <SectionHeading
          as="h1"
          eyebrow="Career"
          title="Timeline"
          lead="The roles and milestones so far, in order. LinkedIn has the longer version if you want the detail."
        />

        <div className="mt-20">
          <TimeLine />
        </div>
      </div>
    </>
  );
};

export default Timeline;
