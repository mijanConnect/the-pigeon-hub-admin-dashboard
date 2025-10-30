import { useEffect, useRef } from "react";
import { attachDragToElement } from "./dragScroll";

/**
 * SyncHorizontalScroll
 *
 * Wrap any horizontally-scrollable content (typically an AntD Table wrapper)
 * and provide a fixed bottom scrollbar that mirrors the main container's
 * horizontal scroll. Also attaches drag-to-scroll to the main container.
 *
 * Props:
 * - children: the content to render inside the scrollable container
 * - containerClassName: optional className applied to the main container
 * - containerStyle: optional inline styles for the main container
 * - bottomStyle: optional styles for the bottom scrollbar wrapper
 * - watch: optional dependency (number or array) that triggers a resize/sync
 */

const defaultBottomStyle = {
  position: "fixed",
  // left/right will be computed to align with the main container when shown
  bottom: 0,
  height: 12,
  overflowX: "auto",
  overflowY: "hidden",
  display: "none",
  zIndex: 9999,
  background: "transparent",
  boxSizing: "border-box",
};

const SyncHorizontalScroll = ({
  children,
  containerClassName = "overflow-x-auto",
  containerStyle = {},
  bottomStyle = {},
  watch = null,
}) => {
  const mainRef = useRef(null);
  const bottomRef = useRef(null);

  // attach drag-to-scroll to main container once
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return undefined;
    const cleanup = attachDragToElement(el);
    return cleanup;
  }, []);

  // keep bottom scrollbar in sync with main container
  useEffect(() => {
    const scrollEl = mainRef.current;
    const bottomWrap = bottomRef.current;
    if (!scrollEl || !bottomWrap) return undefined;

    const inner = bottomWrap.querySelector(".sync-inner");
    if (!inner) return undefined;

    const update = () => {
      try {
        // Set inner width to the scrollable content width so scrollbar range matches
        inner.style.width = `${scrollEl.scrollWidth}px`;

        // Determine whether horizontal scrolling is needed
        const needsScroll = scrollEl.scrollWidth - 1 > scrollEl.clientWidth;

        // If needed, show the bottom scrollbar and align it with the main container
        if (needsScroll) {
          bottomWrap.style.display = "block";

          // Align left/width to match the visible container (respecting gutters)
          const rect = scrollEl.getBoundingClientRect();
          // Use left + width to position the fixed bottom scrollbar exactly under the container
          bottomWrap.style.left = `${Math.max(0, rect.left)}px`;
          bottomWrap.style.width = `${Math.max(0, rect.width)}px`;
        } else {
          bottomWrap.style.display = "none";
        }
      } catch (e) {
        // ignore
      }
    };

    update();
    // follow-up update after paint to catch async layout
    requestAnimationFrame(() => setTimeout(update, 50));

    const onMainScroll = () => {
      try {
        bottomWrap.scrollLeft = scrollEl.scrollLeft;
      } catch (e) {}
    };
    const onBottomScroll = () => {
      try {
        scrollEl.scrollLeft = bottomWrap.scrollLeft;
      } catch (e) {}
    };

    scrollEl.addEventListener("scroll", onMainScroll);
    bottomWrap.addEventListener("scroll", onBottomScroll);

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => update());
      ro.observe(scrollEl);
    }

    window.addEventListener("resize", update);

    return () => {
      scrollEl.removeEventListener("scroll", onMainScroll);
      bottomWrap.removeEventListener("scroll", onBottomScroll);
      window.removeEventListener("resize", update);
      if (ro) ro.disconnect();
    };
  }, [watch]);

  return (
    <>
      <div ref={mainRef} className={containerClassName} style={containerStyle}>
        {children}
      </div>

      <div
        ref={bottomRef}
        style={{ ...defaultBottomStyle, ...bottomStyle }}
        className="bottom-sync-scrollbar"
      >
        <div className="sync-inner" style={{ height: 1 }} />
      </div>
    </>
  );
};

export default SyncHorizontalScroll;
