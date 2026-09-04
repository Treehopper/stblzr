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

// The tallest height observed since load - the keyboard-closed baseline.
let maxHeight = $state(height);

// How much shorter than the baseline counts as "the keyboard is open". Comfortably
// bigger than any safe-area inset (~34px on current hardware) so that alone can't
// misfire this, but well under any real keyboard's height.
const KEYBOARD_OPEN_THRESHOLD = 150;

// How close to the baseline counts as "fully recovered" after the keyboard closes.
const RECOVERED_THRESHOLD = 4;

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

	// Confirmed WebKit bug, standalone/home-screen PWA only: the first time the
	// on-screen keyboard opens, window.innerHeight/visualViewport.height/100dvh all
	// shrink and then never recompute back to the true full height for the rest of the
	// session - not even once the keyboard is fully dismissed - short of force-quitting
	// the app. No amount of reading those values more cleverly fixes this, because the
	// values themselves are wrong from that point on. The only known workaround is
	// forcing WebKit to recompute by triggering a synchronous reflow: toggle a
	// full-viewport element's display off and back on. See
	// https://dev.to/cederhook/fixing-the-ios-standalone-pwa-keyboard-bug-that-shrinks-your-viewport-for-good-63d
	const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
	const healViewport = () => {
		if (!isStandalone) return;
		if (maxHeight - readHeight() <= RECOVERED_THRESHOLD) return;
		const root = document.querySelector<HTMLElement>('.theme-root');
		if (!root) return;
		const prevDisplay = root.style.display;
		root.style.display = 'none';
		void root.offsetHeight; // force a synchronous reflow before restoring
		root.style.display = prevDisplay;
		syncHeight();
	};

	if (isStandalone) {
		document.addEventListener(
			'focusout',
			(event) => {
				if (!(event.target instanceof HTMLElement)) return;
				if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
				// Give iOS's own close animation a moment to finish reporting its (wrong)
				// final height before checking whether it needs correcting.
				setTimeout(healViewport, 140);
			},
			true
		);
	}
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
