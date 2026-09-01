import { browser } from '$app/environment';

// iOS Safari never shrinks the CSS/layout viewport for the on-screen keyboard - there's
// no browser chrome to hide, so `dvh` and `@media (max-height)` stay static even in a
// plain browser tab, and *especially* in standalone/PWA mode. Instead it pans the
// *visual* viewport, which only the VisualViewport API can observe. Tracking it here
// gives every component a reliable "how much space is actually visible right now".
function readHeight(): number {
	if (!browser) return 0;
	return window.visualViewport?.height ?? window.innerHeight;
}

let height = $state(readHeight());

if (browser) {
	const sync = () => {
		height = readHeight();
		// iOS also tries to scroll the page to "reveal" the focused input instead of
		// just shrinking the visible area - keep it pinned since our layout already
		// accounts for the smaller height.
		window.scrollTo(0, 0);
	};
	window.visualViewport?.addEventListener('resize', sync);
	window.visualViewport?.addEventListener('scroll', sync);
	window.addEventListener('resize', sync);
}

export const viewportSize = {
	get height() {
		return height;
	}
};
