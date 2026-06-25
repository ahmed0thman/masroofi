# expo-audio: Common Pitfalls & Solutions

A collection of hard-learned lessons integrating `expo-audio` with `expo-file-system`
in a React Native (Expo SDK 56) app on iOS simulator. Covers audio recording and playback.

---

## 1. `useAudioRecorder` — native getters are NOT reactive

**Problem:** `audioRecorder.isRecording` and `audioRecorder.uri` are native getters
on a `SharedObject`. They return live values when read, but they **do not trigger
React re-renders** when they change. Using them as effect dependencies or returning
them from a hook gives stale snapshots.

**Solution:** Use `useAudioRecorderState(audioRecorder)` which polls the recorder
every 500ms and returns proper React state with `isRecording` and `url`.

```ts
const audioRecorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY });
const recorderState = useAudioRecorderState(audioRecorder);

// ❌ Stale — evaluated once at render time
return { isRecording: audioRecorder.isRecording };

// ✅ Reactive — polls and triggers re-renders
return { isRecording: recorderState.isRecording };
```

---

## 2. `useAudioRecorderState` uses `url`, not `uri`

**Problem:** The `RecorderState` type returned by `useAudioRecorderState` uses
`url` as the property name, while the recorder instance uses `uri`.

```ts
recorder.uri             // ✅ on the AudioRecorder instance
recorderState.url        // ✅ on the RecorderState (polled)
audioRecorderState.uri   // ❌ undefined
```

**Solution:** Read the correct property depending on where you get it.

```ts
// After stop(), the instance getter is live
const uri = audioRecorder.uri ?? recorderState.url;
```

---

## 3. `stop()` can timeout — always wrap in try/catch

**Problem:** On iOS simulator, calling `stop()` a second time often produces:

```
[AudioToolbox] AQMEIO_HAL.cpp:2950 Waiting for Stop to be signaled timed out.
```

This happens when the audio session is in a bad state (see issue #4). If
`stop()` throws, the `uri` may be null and the recording file is lost.

**Solution:** Always wrap `stop()` in try/catch.

```ts
const stopRecording = async () => {
  try {
    await audioRecorder.stop();
    const uri = audioRecorder.uri ?? recorderState.url;
    if (uri) {
      const source = new File(uri);
      await source.move(destination);
    }
  } catch (error) {
    console.error('Failed to stop recording:', error);
  }
};
```

---

## 4. Audio session must be configured before EVERY recording

**Problem:** CoreAudio errors on the second recording:

```
[CoreAudio] AudioDeviceStop: no device with given ID
```

`setAudioModeAsync({ allowsRecording: true })` was called only once on mount.
iOS can reset the audio session category after a recording ends, so subsequent
`prepareToRecordAsync()` calls find no recording-capable session.

**Solution:** Call `setAudioModeAsync` immediately before each recording, not
just at init.

```ts
const record = async () => {
  await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
  await audioRecorder.prepareToRecordAsync();
  await audioRecorder.record();
};
```

---

## 5. `File.move()` fails when destination already exists

**Problem:** The underlying `AVAudioRecorder` reuses the same UUID filename
(`recording-<UUID>.m4a`) across recordings. The first recording's file is moved
to a `recordings/` subdirectory. The second recording creates a temp file with
the **same name**. Moving it to `recordings/` fails because a file with that
name already exists there.

```
"recording-XXXX.m4a" couldn't be moved to "recordings" because
an item with the same name already exists.
```

**Solution (keep all recordings):** Use a unique name with a timestamp prefix.

```ts
const dest = new File(recordingDir, `${Date.now()}_${source.name}`);
await source.move(dest);
```

**Alternative (overwrite):** Pass `{ overwrite: true }` to `move()`.

```ts
await source.move(recordingDir, { overwrite: true });
```

---

## 6. Separate hook instances create isolated state

**Problem:** A child component called `useRecordings()` directly instead of
receiving `onDelete` as a prop. This created a second hook instance with its
own `recordingList` state. Deleting a file called `setRecordingList` on the
child's instance, while the parent's instance (driving the FlatList) was never
updated.

```ts
// ❌ RecordingCard.tsx — separate hook instance
const { onDelete } = useRecordings();
```

**Solution:** Call `useRecordings()` once in the parent and pass callbacks down.

```ts
// Parent (Home.tsx)
const { onDelete, recordingList } = useRecordings();

<FlatList renderItem={({ item }) => (
  <RecordingCard recording={item} onDelete={onDelete} />
)} />

// RecordingCard.tsx — no hook call
const RecordingCard = ({ recording, onDelete }: { ... }) => { ... };
```

---

## 7. Effect dependency on `player.currentTime` causes runaway re-renders

**Problem:** The `useEffect` that sets up the playback listener included
`player.currentTime` and `player.duration` in its dependency array:

```ts
useEffect(() => {
  player.addListener('playbackStatusUpdate', ...);
  return () => player.removeAllListeners('playbackStatusUpdate');
}, [player.currentTime, player.duration, player]);
//   ↑ changes 30+ times/sec during playback
```

`player.currentTime` updates every frame during playback, causing the effect to
tear down and re-add the listener on every frame. The rapid `removeAllListeners`
/ `addListener` cycle can corrupt the native player's internal state.

**Solution:** Depend only on `[player]` (the SharedObject reference is stable).

```ts
useEffect(() => {
  const listener = player.addListener('playbackStatusUpdate', (status) => {
    if (status.didJustFinish) setIsPlaying(false);
  });
  return () => listener.remove();
}, [player]);
```

Also prefer `listener.remove()` over `removeAllListeners()` to avoid nuking
listeners added by other parts of the codebase.

---

## 8. `player.play()` does NOT restart finished audio on iOS

**Problem:** After audio reaches the end (`didJustFinish = true`), calling
`player.play()` on iOS produces silence. The `AVPlayer` is paused at the end
position, and `play()` from there is a no-op. The UI shows "playing" but no
sound comes out.

This is especially confusing during rapid toggling — the user may hit play
after the audio has finished and hear nothing.

```ts
// ❌ On iOS, this does nothing if audio is at the end:
player.play();
```

**Root cause (from expo-audio iOS source):** `play()` calls
`ref.playImmediately(atRate:)` on `AVPlayer`. When `AVPlayer` is at the end and
`actionAtItemEnd = .pause`, playback starts from the end position and finishes
immediately — effectively silent.

**Solution:** Track `didJustFinish` with a ref and seek to 0 before playing.

```ts
const didJustFinishRef = useRef(false);

useEffect(() => {
  const listener = player.addListener('playbackStatusUpdate', (status) => {
    if (status.didJustFinish) {
      didJustFinishRef.current = true;
      setIsPlaying(false);
    }
  });
  return () => listener.remove();
}, [player]);

const handlePlayPause = () => {
  if (isPlaying) {
    player.pause();
    setIsPlaying(false);
  } else {
    if (didJustFinishRef.current) {
      player.seekTo(0);
      didJustFinishRef.current = false;
    }
    player.play();
    setIsPlaying(true);
  }
};
```

---

## 9. Rapid toggling needs a throttle guard

**Problem:** Even with the fixes above, hammering play/pause faster than the
native player can respond can still leave the `AVPlayer` in an inconsistent
state (iOS simulator is particularly sensitive).

**Solution:** Reject toggles within 1 second of the previous one.

```ts
const lastToggleRef = useRef(0);

const handlePlayPause = () => {
  const now = Date.now();
  if (now - lastToggleRef.current < 1000) return;
  lastToggleRef.current = now;

  // ... actual toggle logic
};
```

---

## Summary checklist

| Area | Issue | Fix |
|------|-------|-----|
| Recording | Stale `isRecording`/`uri` | `useAudioRecorderState()` |
| Recording | Property name mismatch (`uri` vs `url`) | Fallback: `recorder.uri ?? recorderState.url` |
| Recording | `stop()` timeout crash | try/catch around `stop()` |
| Recording | Audio session lost after first recording | `setAudioModeAsync` before each `record()` |
| Recording | `move()` collision on re-used UUID | Timestamp-prefixed destination |
| Playback | Non-reactive `player.playing` | Track with React state + ref |
| Playback | Effect loop on `currentTime` | Depend only on `[player]` |
| Playback | `play()` silent after finish | `seekTo(0)` before `play()` |
| Playback | Rapid toggle corruption | Throttle guard (1s debounce) |
| Architecture | Separate hook instances | Pass callbacks as props |
