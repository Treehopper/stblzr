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

// iOS also tries to "reveal" the focused input by panning the visual viewport down and
// away from the top of the (fixed-position, non-scrollable) page, rather than scrolling
// the document. A `position: fixed` app shell stays pinned to the *layout* viewport, so
// without correcting for this it visibly slides out from under the visible area. Tracking
// this lets the app shell follow the pan instead of fighting it.
function readOffsetTop(): number {
	if (!browser) return 0;
	return window.visualViewport?.offsetTop ?? 0;
}

let height = $state(readHeight());
let offsetTop = $state(readOffsetTop());

if (browser) {
	// The pan (offsetTop) has to track every event immediately - any lag makes the app
	// shell visibly lag behind the native pan for a frame or two, which reads as a jump.
	const syncOffsetTop = () => {
		offsetTop = readOffsetTop();
	};
	window.visualViewport?.addEventListener('resize', syncOffsetTop);
	window.visualViewport?.addEventListener('scroll', syncOffsetTop);

	// Moving focus from one input to another makes iOS briefly report the keyboard as
	// closing (old field blurs) and then reopening (new field focuses), firing extra
	// resize events with a transient, momentarily-taller height in between. Applying every
	// event as it arrives made the layout visibly jump for that brief moment, so the height
	// is only committed once events stop arriving for a short debounce window - short
	// enough to still feel instant for a real keyboard open/close, long enough to swallow
	// the in-between blip from switching fields.
	let debounce: ReturnType<typeof setTimeout> | undefined;
	const syncHeight = () => {
		clearTimeout(debounce);
		debounce = setTimeout(() => {
			height = readHeight();
		}, 100);
	};
	window.visualViewport?.addEventListener('resize', syncHeight);
	window.visualViewport?.addEventListener('scroll', syncHeight);
	window.addEventListener('resize', syncHeight);
}

export const viewportSize = {
	get height() {
		return height;
	},
	get offsetTop() {
		return offsetTop;
	}
};
