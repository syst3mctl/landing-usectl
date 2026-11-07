// The "Book a demo" popup's open channel.
//
// The button lives in TWO builds that are both in the DOM at once (the pinned desktop scene and
// the stacked < 1024 / reduce-motion one, one of them display:none), so the modal itself is
// mounted ONCE at page level (app/_site/landing.tsx) and the buttons only ask it to open. A plain
// window event is enough for that and keeps both builds free of any modal state.
//
// `isBookDemoOpen()` is read by the desktop scene's wheel + keyboard push driver
// (HeroSectionClient): while the popup owns the screen, a scroll or an arrow key must NOT move the
// scene behind it. It is a module flag rather than React state because that driver runs inside a
// GSAP context, outside React's render cycle.

export const OPEN_BOOK_DEMO_EVENT = "usectl:book-demo";

let open = false;

/** True while the popup is on screen (including its closing fade). */
export const isBookDemoOpen = () => open;

/** Set by the modal itself — nothing else should call this. */
export const setBookDemoOpen = (value: boolean) => {
  open = value;
};

/** Ask the page-level modal to open. Safe to call from any client component. */
export const openBookDemo = () => {
  window.dispatchEvent(new Event(OPEN_BOOK_DEMO_EVENT));
};
