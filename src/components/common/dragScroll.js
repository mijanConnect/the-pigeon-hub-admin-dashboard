// dragScroll.js
// Helper to attach drag-to-scroll behavior to a horizontal container element.

export function attachDragToElement(el) {
  if (!el) return () => {};

  let isDown = false;
  let startX = 0;
  let scrollLeftStart = 0;

  const shouldShowGrabFor = (target) => {
    if (!el) return false;
    if (el.scrollWidth <= el.clientWidth + 1) return false;
    if (!target) return false;
    try {
      if (
        target.closest &&
        (target.closest("td") ||
          target.closest("th") ||
          target.closest("a") ||
          target.closest("input") ||
          target.closest("textarea") ||
          target.closest("button") ||
          target.closest(".ant-btn") ||
          target.isContentEditable)
      ) {
        return false;
      }
    } catch (err) {
      // ignore
    }
    return true;
  };

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    const tgt = e.target;
    if (shouldShowGrabFor(tgt) === false) return;

    isDown = true;
    el.classList.add("cursor-grabbing");
    startX = e.pageX - el.offsetLeft;
    scrollLeftStart = el.scrollLeft;
    try {
      el.style.userSelect = "none";
    } catch (err) {}
  };

  const onMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - startX;
    el.scrollLeft = scrollLeftStart - walk;
  };

  const onMouseUp = () => {
    if (!isDown) return;
    isDown = false;
    el.classList.remove("cursor-grabbing");
    try {
      el.style.userSelect = "";
    } catch (err) {}
  };

  const onTouchStart = (e) => {
    isDown = true;
    startX = e.touches[0].pageX - el.offsetLeft;
    scrollLeftStart = el.scrollLeft;
  };

  const onTouchMove = (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - el.offsetLeft;
    const walk = x - startX;
    el.scrollLeft = scrollLeftStart - walk;
  };

  const onTouchEnd = () => {
    isDown = false;
  };

  const onPointerMoveForCursor = (ev) => {
    const tgt = ev.target;
    if (shouldShowGrabFor(tgt)) el.classList.add("cursor-grab");
    else el.classList.remove("cursor-grab");
  };

  const onLeaveForCursor = () => el.classList.remove("cursor-grab");

  el.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  el.addEventListener("touchstart", onTouchStart, { passive: true });
  el.addEventListener("touchmove", onTouchMove, { passive: true });
  el.addEventListener("touchend", onTouchEnd);

  el.addEventListener("mousemove", onPointerMoveForCursor);
  el.addEventListener("mouseenter", onPointerMoveForCursor);
  el.addEventListener("mouseleave", onLeaveForCursor);

  return function cleanup() {
    el.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);

    el.removeEventListener("touchstart", onTouchStart);
    el.removeEventListener("touchmove", onTouchMove);
    el.removeEventListener("touchend", onTouchEnd);

    el.removeEventListener("mousemove", onPointerMoveForCursor);
    el.removeEventListener("mouseenter", onPointerMoveForCursor);
    el.removeEventListener("mouseleave", onLeaveForCursor);
    try {
      el.style.userSelect = "";
    } catch (err) {}
  };
}
