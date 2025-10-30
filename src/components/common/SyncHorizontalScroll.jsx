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
  left: 0,
  right: 0,
  bottom: 0,
  height: 12,
  overflowX: "auto",
  overflowY: "hidden",
  display: "none",
  zIndex: 9999,
  background: "transparent",
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
        inner.style.width = `${scrollEl.scrollWidth}px`;
        const needsScroll = scrollEl.scrollWidth - 1 > scrollEl.clientWidth;
        bottomWrap.style.display = needsScroll ? "block" : "none";
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
