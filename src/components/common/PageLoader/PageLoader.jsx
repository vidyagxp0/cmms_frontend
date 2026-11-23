import Skeleton from "../Skeleton/Skeleton";

/**
 * Shown inside a layout while a lazily-loaded page chunk downloads.
 * Usually visible for only a few milliseconds (pages are prefetched on idle).
 */
const PageLoader = () => (
    <div className="w-full space-y-6" aria-busy="true" aria-live="polite">
        <Skeleton variant="title" className="w-full" />
        <Skeleton variant="form" fields={6} />
    </div>
);

export default PageLoader;
