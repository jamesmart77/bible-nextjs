import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";

const { code } = transformSync(readFileSync(new URL("./PlaybackController.ts", import.meta.url), "utf8"), {
  loader: "ts", format: "esm",
});
const { PlaybackController } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

class Audio extends EventTarget {
  src = "";
  paused = true;
  loop = false;
  playbackRate = 1;
  plays = [];
  playFailure = null;
  play() {
    this.plays.push(this.src);
    if (this.playFailure) return Promise.reject(this.playFailure);
    this.paused = false;
    this.dispatchEvent(new Event("playing"));
    return Promise.resolve();
  }
  pause() { this.paused = true; this.dispatchEvent(new Event("pause")); }
  removeAttribute() { this.src = ""; }
  load() {}
  end() { this.paused = true; this.dispatchEvent(new Event("ended")); }
}
const track = (n, next = String(n + 1)) => ({
  passageRef: `Psalm ${n}`, audioSrc: `https://example.com/${n}.mp3`,
  previousChapter: n > 1 ? String(n - 1) : null, nextChapter: next,
  passageUrl: `/passages/Psalms/${n}`,
});
const flush = () => new Promise(resolve => setImmediate(resolve));
function setup(loader = async ref => track(Number(ref))) {
  const audio = new Audio();
  let snapshot;
  const controller = new PlaybackController(audio, loader, value => { snapshot = value; });
  return { audio, controller, state: () => snapshot };
}

test("prepared chapters start synchronously on the same element through Psalm 10", async () => {
  const { audio, controller, state } = setup();
  controller.setMode("continuous");
  controller.select(track(1));
  controller.setSpeed(1.5);
  controller.play();
  for (let n = 2; n <= 10; n++) {
    await flush();
    audio.end();
    assert.equal(audio.plays.at(-1), track(n).audioSrc, "play must happen before ended returns");
    assert.equal(state().track.passageRef, `Psalm ${n}`);
    assert.equal(audio.playbackRate, 1.5);
    assert.equal(state().isNavigating, false);
  }
  controller.dispose();
});

test("stop, repeat and end of Bible do not advance", async () => {
  let fetches = 0;
  const { audio, controller, state } = setup(async () => { fetches++; return track(2); });
  controller.select(track(1));
  controller.play();
  audio.end();
  assert.equal(state().isPlaying, false);
  controller.setMode("repeat");
  assert.equal(audio.loop, true);
  controller.setMode("stop");
  assert.equal(audio.loop, false);
  controller.select(track(150, null));
  controller.setMode("continuous");
  audio.end();
  await flush();
  assert.equal(fetches, 0);
  assert.equal(audio.plays.length, 1);
  controller.dispose();
});

test("pause, close and new selections cancel a pending chapter transition", async () => {
  for (const action of ["pause", "close", "select", "dispose"]) {
    let resolve;
    const { audio, controller } = setup(() => new Promise(r => { resolve = r; }));
    controller.select(track(1));
    controller.goToChapter("2");
    if (action === "select") controller.select(track(99));
    else controller[action]();
    resolve(track(2));
    await flush();
    assert.equal(audio.plays.length, 0, action);
    assert.notEqual(audio.src, track(2).audioSrc, action);
    controller.dispose();
  }
});

test("failed prefetch is retried and failure releases chapter controls", async () => {
  let attempts = 0;
  const { audio, controller, state } = setup(async () => {
    attempts++;
    throw new Error("offline");
  });
  controller.setMode("continuous");
  controller.select(track(1));
  await flush();
  assert.equal(state().error, null);
  audio.end();
  await flush();
  assert.equal(attempts, 2);
  assert.equal(state().isNavigating, false);
  assert.match(state().error, /Could not load/);
  controller.dispose();
});

test("skipping to an in-flight prefetched chapter shares the request", async () => {
  let resolve;
  let requests = 0;
  const { audio, controller } = setup(() => {
    requests++;
    return new Promise(r => { resolve = r; });
  });
  controller.setMode("continuous");
  controller.select(track(1));
  audio.end();
  assert.equal(requests, 1);
  resolve(track(2, null));
  await flush();
  assert.deepEqual(audio.plays, [track(2).audioSrc]);
  controller.dispose();
});

test("book boundaries use the supplied next chapter metadata", async () => {
  const proverbs = { ...track(1, null), passageRef: "Proverbs 1", passageUrl: "/passages/Proverbs/1" };
  const { audio, controller, state } = setup(async ref => {
    assert.equal(ref, "20001001-20001033");
    return proverbs;
  });
  controller.setMode("continuous");
  controller.select(track(150, "20001001-20001033"));
  await flush();
  audio.end();
  assert.equal(state().track.passageRef, "Proverbs 1");
  controller.dispose();
});

test("play rejection and native media errors are visible and recoverable", async () => {
  const { audio, controller, state } = setup();
  controller.select(track(1));
  audio.playFailure = new Error("NotAllowedError");
  controller.play();
  await flush();
  assert.equal(state().isPlaying, false);
  assert.match(state().error, /Press play/);
  audio.playFailure = null;
  controller.play();
  assert.equal(state().error, null);
  audio.dispatchEvent(new Event("error"));
  assert.match(state().error, /Audio could not load/);
  controller.dispose();
});

test("turning off continuous playback cancels a pending automatic advance", async () => {
  let resolve;
  const { audio, controller, state } = setup(() => new Promise(r => { resolve = r; }));
  controller.setMode("continuous");
  controller.select(track(1));
  controller.play();
  audio.end();
  assert.equal(state().isPlaying, false);
  controller.setMode("stop");
  resolve(track(2));
  await flush();
  assert.deepEqual(audio.plays, [track(1).audioSrc]);
  assert.equal(state().isNavigating, false);
  controller.dispose();
});
