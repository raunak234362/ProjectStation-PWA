/**
 * Disables browser developer tools shortcuts and context menu ("Inspect")
 * in production deployments while keeping local development unobstructed.
 */
export function disableDevToolsInProduction(): () => void {
  if (!import.meta.env.PROD || typeof window === "undefined") {
    return () => {};
  }

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key?.toUpperCase() || "";
    const hasCtrlOrMeta = event.ctrlKey || event.metaKey;

    const isF12 = event.key === "F12" || event.keyCode === 123;
    const isContextKey =
      event.key === "ContextMenu" || (event.shiftKey && event.key === "F10");
    const isInspectShortcut =
      hasCtrlOrMeta &&
      event.shiftKey &&
      (key === "I" || key === "J" || key === "C" || key === "K");
    const isMacInspectShortcut =
      event.metaKey &&
      event.altKey &&
      (key === "I" || key === "J" || key === "C" || key === "U");
    const isViewSource = hasCtrlOrMeta && key === "U";

    if (
      isF12 ||
      isContextKey ||
      isInspectShortcut ||
      isMacInspectShortcut ||
      isViewSource
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  document.addEventListener("contextmenu", handleContextMenu, { capture: true });
  window.addEventListener("keydown", handleKeyDown, { capture: true });

  return () => {
    document.removeEventListener("contextmenu", handleContextMenu, {
      capture: true,
    });
    window.removeEventListener("keydown", handleKeyDown, { capture: true });
  };
}
