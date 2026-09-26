# Background audio

Reported on Pixel 10 / Chrome, both a browser tab and the installed PWA: continuous
playback starting at Psalm 1 stops around Psalm 4 with the screen locked.

## Diagnosis

The old `ended` callback awaited a server action to resolve the next chapter,
redirected to a new passage page, fetched passage/session/history data, and relied
on a React effect to call `play()`. Page remounts could also replace the media
element. This creates a gap with no active audio and makes restarting depend on
background page work. This is a likely cause from code inspection, not a
hardware-confirmed diagnosis. Network loss or Android audio interruptions can
also stop a stream.

Chrome can suspend background page callbacks:
https://developer.chrome.com/docs/web-platform/page-lifecycle-api

## Implementation

- The root layout owns the player, so client-side navigation cannot remount it.
- A controller owns one native audio element. React displays its state; it does
  not schedule continuous-play transitions.
- In continuous mode, resolve the next chapter's metadata during the current
  chapter. On `ended`, change the same element's source and call `play()`
  synchronously if the metadata is ready. Preparing the following chapter starts
  directly in the controller, without waiting for a React render.
- Only a bounded metadata cache is kept in memory. This does not download audio
  for offline use or guarantee the next media request succeeds.
- Media Session supplies passage metadata and lock-screen/headset controls where
  supported. Optional Audio Session playback mode is feature-detected.
- Pause, close, a new selection, disposal, or disabling continuous mode invalidates
  pending transitions. Failed playback and chapter requests show recoverable errors.
- Reading-page navigation is independent. Tap the player's passage title to read
  what is playing; playback and speed survive that navigation.

Media Session playlist guidance:
https://developer.chrome.com/blog/media-session

## Why not a service worker?

The app already uses Serwist. Service workers are event-driven and may be
terminated; they cannot own a DOM audio element or keep a page alive. Caching can
address network availability, but adding a worker is not a background playback
fix. Offline audio would be separate work, including media range requests and
storage management.

https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation

## Validation

Run `npm run test:audio`, `npx tsc --noEmit`, and `npm run build`.
`npx next build --webpack` is an alternate production build when the environment
blocks Turbopack's local worker port.

The controller tests use a fake media element to assert synchronous handoffs,
cancellation, failure recovery, repeat/stop, and book boundaries. They cannot
simulate Android suspension or establish that the reported device issue is fixed.

On a Pixel 10, test both Chrome and the installed PWA after deploying:

1. Open Psalm 1, select Keep playing, press play, immediately lock the screen.
   Let it run through at least Psalm 10 and then for a full 30-minute session.
2. Repeat on mobile data. Verify lock-screen metadata changes, pause stays paused,
   and play/next/previous work. Repeat with the usual Bluetooth headphones.
3. Unlock and tap the playing passage title. Confirm audio continues without
   restarting. Verify playback speed survives chapter and book changes.
4. Test Repeat and Stop, Psalm 150 to Proverbs 1, and the last chapter of Revelation.
5. With a chapter request pending on a slow connection, close or pause the player.
   It must not restart when the request finishes. Restore connectivity and retry
   with the chapter control after a failure.
6. Verify interruption by a call or another media app does not cause unsolicited
   playback. Record whether any remaining stop is mid-chapter or at its boundary.

If the problem remains, collect Chrome's media events/network errors and Android
battery restriction settings during the failure. Media Session is not an OS
keep-alive guarantee; a process killed by Android cannot continue this playlist.
