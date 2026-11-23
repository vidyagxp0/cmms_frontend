import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Warns the user when they try to leave a page with unsaved changes.
 *
 * Handles:
 *   - Browser back button / trackpad swipe-back (popstate) → custom modal
 *   - Refresh / tab-close / external nav (beforeunload)    → native browser dialog
 *   - Exposes showModal / setShowModal for the Cancel button
 */
export const useUnsavedChanges = (isDirty) => {
  const [showModal, setShowModal] = useState(false);
  const isDirtyRef = useRef(isDirty);
  const bypassRef = useRef(false);
  const sentinelPushedRef = useRef(false);

  useEffect(() => { isDirtyRef.current = isDirty; }, [isDirty]);

  // Sentinel history entry for back-button interception
  useEffect(() => {
    if (!isDirty || sentinelPushedRef.current) return;
    window.history.pushState(
      { ...window.history.state, __unsaved_sentinel: true },
      "",
      window.location.href
    );
    sentinelPushedRef.current = true;
  }, [isDirty]);

  // beforeunload — refresh / close tab / external link → native dialog only
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirtyRef.current || bypassRef.current) return;
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // popstate — back button & trackpad swipe-back → our custom modal
  useEffect(() => {
    const handlePopState = () => {
      if (bypassRef.current || !isDirtyRef.current) return;
      window.history.pushState(
        { ...window.history.state, __unsaved_sentinel: true },
        "",
        window.location.href
      );
      setShowModal(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const confirmLeave = useCallback(() => {
    bypassRef.current = true;
    sentinelPushedRef.current = false;
    setShowModal(false);
  }, []);

  const cancelLeave = useCallback(() => {
    setShowModal(false);
  }, []);

  return { showModal, setShowModal, confirmLeave, cancelLeave };
};