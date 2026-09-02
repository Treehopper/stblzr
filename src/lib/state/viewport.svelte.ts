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
	// iOS also tries to scroll the page to "reveal" the focused input instead of just
	// shrinking the visible area. That scroll happens immediately as focus moves, so it
	// has to be undone on every single event, not just once things settle down - a
	// debounced correction still lets the native scroll flash on screen for however long
	// the debounce window is, no matter how short it's set.
	const pinScroll = () => window.scrollTo(0, 0);
	window.visualViewport?.addEventListener('resize', pinScroll);
	window.visualViewport?.addEventListener('scroll', pinScroll);
	window.addEventListener('scroll', pinScroll);

	// Moving focus from one input to another makes iOS briefly report the keyboard as
	// closing (old field blurs) and then reopening (new field focuses), firing extra
	// resize events with a transient, momentarily-taller height in between. Applying every
	// event as it arrives made the layout visibly jump for that brief moment, so the height
	// is only committed once events stop arriving for a short debounce window - short
	// enough to still feel instant for a real keyboard open/close, long enough to swallow
	// the in-between blip from switching fields.
	let debounce: ReturnType<typeof setTimeout> | undefined;
	const sync = () => {
		clearTimeout(debounce);
		debounce = setTimeout(() => {
			height = readHeight();
		}, 100);
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
