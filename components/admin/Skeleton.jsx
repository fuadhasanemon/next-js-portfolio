/** Placeholder block for content that has not arrived yet. */
const Skeleton = ({ className = "h-4 w-full" }) => (
  <span aria-hidden="true" className={`skeleton block rounded-md ${className}`} />
);

export default Skeleton;
