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

// The tallest height observed since load - the keyboard-closed baseline. Whether
// visualViewport.height includes the bottom safe area at rest is inconsistent across
// devices, so the app shell used to always add env(safe-area-inset-bottom) back on top
// of it, which overshot on devices where it was already included and left a
// same-color-as-the-page but visibly separate band at the bottom. Comparing the live
// height against this baseline - rather than trusting either reading in isolation - is
// what tells the shell whether the keyboard is actually open.
let maxHeight = $state(height);

// How much shorter than the baseline counts as "the keyboard is open". Comfortably
// bigger than any safe-area inset (~34px on current hardware) so that alone can't
// misfire this, but well under any real keyboard's height.
const KEYBOARD_OPEN_THRESHOLD = 150;

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
	// resize events with a transient, momentarily-taller height in between. Debouncing
	// every change to swallow that blip meant the height also lagged behind on a real
	// shrink (keyboard first opening, or tabbing further down while it stays open) -
	// each field visited before the debounce settled stayed misaligned, which is why the
	// jump only went away once you stopped moving for a beat. A shrink is never the
	// blip (the blip only ever reads taller), so only debounce growth; apply shrinks the
	// instant they arrive.
	let debounce: ReturnType<typeof setTimeout> | undefined;
	const commit = (next: number) => {
		height = next;
		if (next > maxHeight) maxHeight = next;
	};
	const syncHeight = () => {
		clearTimeout(debounce);
		const next = readHeight();
		if (next <= height) {
			commit(next);
		} else {
			debounce = setTimeout(() => commit(readHeight()), 100);
		}
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
	},
	get keyboardOpen() {
		return maxHeight - height > KEYBOARD_OPEN_THRESHOLD;
	}
};
