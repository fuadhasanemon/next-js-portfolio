/**
 * Inline activity indicator. Deliberately small and monochrome — it sits next
 * to button text rather than replacing the UI with an overlay.
 */
const Spinner = ({ className = "h-3.5 w-3.5" }) => (
  <span
    aria-hidden="true"
    className={`spinner inline-block shrink-0 rounded-full ${className}`}
  />
);

export default Spinner;
