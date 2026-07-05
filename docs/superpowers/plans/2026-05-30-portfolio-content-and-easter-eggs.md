# Portfolio Content and Easter Eggs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the portfolio’s public-facing English content to match Danis’s real story and add a subtle Curiosity Trail + Blueprint Unlock easter egg system that feels personal, premium, and interactive.

**Architecture:** Keep the existing single-scene structure intact and layer the work into three bounded areas: content data, About-room storytelling, and a reusable secret-tracking system. Reuse the existing achievements/localStorage pattern for persistence, keep interactions room-local where possible, and route all large reveal UI through existing overlay or achievements surfaces instead of inventing a new global system.

**Tech Stack:** React 19, React Three Fiber, Drei, GSAP, Vite, Three.js, existing context providers (`SceneContext`, `AchievementsContext`, `PerformanceContext`)

---

## File map

### Modify
- `src/components/canvas/rooms/Studio/contentData.js`
  - Replace placeholder English copy with real, user-aligned content.
  - Add explicit metadata for content tone, links, and “real work / exploration” themes.
- `src/components/canvas/rooms/About/InfiniteSkyManager.jsx`
  - Rewrite About milestone copy from Indonesian placeholder text to polished English.
  - Add secret-trigger interactions for About objects that already exist in-scene.
  - Add Blueprint-mode visual switch handling where About visuals need to react.
- `src/components/canvas/rooms/About/AboutRoom.jsx`
  - Hook About-specific secret events into existing scroll/airplane interactions.
- `src/components/canvas/corridor/Doodles.jsx`
  - Attach click handlers and small reveal states to corridor objects (coffee / hidden frame / 404 clue).
- `src/components/canvas/corridor/Corridor.jsx`
  - Mount any small secret helper meshes or labels needed for the corridor-only secrets.
- `src/components/canvas/rooms/Studio/StudioRoom.jsx`
  - Add one Studio-side secret interaction tied to a monitor / hidden technical object.
  - React to Blueprint mode if monitor accents or particles should shift.
- `src/context/AchievementsContext.jsx`
  - Extend current achievement/progress storage to support secret discovery and Blueprint unlock.
- `src/components/ui/AchievementsPanel.jsx`
  - Show secret progress cleanly without breaking tutorial achievements.
- `src/components/ui/AchievementPopup.jsx`
  - Support popup copy for secret discoveries and the final Blueprint unlock.
- `src/components/ui/GlobalOverlay.jsx`
  - Support a compact “memory note / curiosity fragment” overlay layout if inline quotes are too cramped.
- `src/App.jsx`
  - Mount any global Blueprint mode class / state bridge if the final visual switch needs one.
- `src/index.css`
  - Add world-level Blueprint mode CSS hooks for DOM overlays / cursor / high-level color treatment.

### Create
- `src/context/SecretsContext.jsx`
  - Central store for secret IDs, discovered state, unlock threshold, and Blueprint mode toggling.
- `src/data/secretContent.js`
  - Canonical registry of secrets, English copy fragments, and reward metadata.
- `src/components/ui/SecretsProgressBadge.jsx`
  - Small reusable badge / counter for “X/Y hidden details found”.
- `src/utils/blueprintTheme.js`
  - Helper constants for Blueprint mode colors / naming so logic is not duplicated across files.

### Optional create only if extraction is needed during implementation
- `src/components/canvas/rooms/About/aboutStoryContent.js`
  - If `InfiniteSkyManager.jsx` becomes too dense, extract milestone copy and overlay payloads here instead of growing the file further.

### Validation targets
- Manual browser validation via `npm run dev`
- Production-like validation via `npm run build && npm run preview`
- Lint via `npm run lint`

---

## Task 1: Add a reusable secrets system

**Files:**
- Create: `src/context/SecretsContext.jsx`
- Create: `src/data/secretContent.js`
- Create: `src/utils/blueprintTheme.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create the secret registry**

Create `src/data/secretContent.js` with a fixed list of secrets and one final unlock threshold.

```js
export const SECRET_IDS = {
  CORRIDOR_COFFEE: 'corridor_coffee',
  CORRIDOR_FRAME: 'corridor_frame',
  CORRIDOR_404: 'corridor_404',
  ABOUT_AIRPLANE: 'about_airplane',
  ABOUT_IOT: 'about_iot',
  STUDIO_TERMINAL: 'studio_terminal',
};

export const SECRET_UNLOCK_TARGET = 5;

export const SECRET_CONTENT = {
  [SECRET_IDS.CORRIDOR_COFFEE]: {
    id: SECRET_IDS.CORRIDOR_COFFEE,
    title: 'After Hours',
    shortLabel: 'Coffee clue',
    line: 'Curiosity kept me up long before engineering became real work.',
  },
  [SECRET_IDS.CORRIDOR_FRAME]: {
    id: SECRET_IDS.CORRIDOR_FRAME,
    title: 'Private Drafts',
    shortLabel: 'Hidden frame',
    line: 'Some of my earliest work stayed private, but it shaped the way I build.',
  },
  [SECRET_IDS.CORRIDOR_404]: {
    id: SECRET_IDS.CORRIDOR_404,
    title: 'Unfinished Experiments',
    shortLabel: '404 door',
    line: 'Not every experiment ships. Every one of them teaches something.',
  },
  [SECRET_IDS.ABOUT_AIRPLANE]: {
    id: SECRET_IDS.ABOUT_AIRPLANE,
    title: 'Paper Pilot',
    shortLabel: 'Airplane memory',
    line: 'I started with curiosity, then stayed for the joy of figuring things out.',
  },
  [SECRET_IDS.ABOUT_IOT]: {
    id: SECRET_IDS.ABOUT_IOT,
    title: 'Beyond the Web',
    shortLabel: 'IoT artifact',
    line: 'The web is my main canvas, not the limit of what I explore.',
  },
  [SECRET_IDS.STUDIO_TERMINAL]: {
    id: SECRET_IDS.STUDIO_TERMINAL,
    title: 'Builder Mode',
    shortLabel: 'Hidden terminal',
    line: 'Real projects taught me discipline; curiosity kept the work alive.',
  },
};
```

- [ ] **Step 2: Create Blueprint mode constants**

Create `src/utils/blueprintTheme.js`.

```js
export const BLUEPRINT_MODE_CLASS = 'blueprint-mode';

export const BLUEPRINT_THEME = {
  background: '#0d1b2a',
  paper: '#d8e6ff',
  accent: '#7fb3ff',
  line: '#9cc4ff',
};
```

- [ ] **Step 3: Create the secrets context**

Create `src/context/SecretsContext.jsx`.

```jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SECRET_CONTENT, SECRET_UNLOCK_TARGET } from '../data/secretContent';

const STORAGE_KEY = 'danis_secrets_v1';
const SecretsContext = createContext(null);

export const SecretsProvider = ({ children }) => {
  const [discoveredSecrets, setDiscoveredSecrets] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isBlueprintUnlocked, setIsBlueprintUnlocked] = useState(false);
  const [activeSecret, setActiveSecret] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(discoveredSecrets));
  }, [discoveredSecrets]);

  useEffect(() => {
    if (discoveredSecrets.length >= SECRET_UNLOCK_TARGET) {
      setIsBlueprintUnlocked(true);
    }
  }, [discoveredSecrets]);

  const discoverSecret = useCallback((secretId) => {
    setDiscoveredSecrets((prev) => {
      if (prev.includes(secretId)) return prev;
      return [...prev, secretId];
    });
    setActiveSecret(SECRET_CONTENT[secretId] || null);
  }, []);

  const dismissActiveSecret = useCallback(() => setActiveSecret(null), []);
  const toggleBlueprintMode = useCallback(() => {
    if (!isBlueprintUnlocked) return;
    document.documentElement.classList.toggle('blueprint-mode');
  }, [isBlueprintUnlocked]);

  const value = useMemo(() => ({
    discoveredSecrets,
    secretCount: discoveredSecrets.length,
    secretTotal: Object.keys(SECRET_CONTENT).length,
    isBlueprintUnlocked,
    activeSecret,
    discoverSecret,
    dismissActiveSecret,
    toggleBlueprintMode,
  }), [discoveredSecrets, isBlueprintUnlocked, activeSecret, discoverSecret, dismissActiveSecret, toggleBlueprintMode]);

  return <SecretsContext.Provider value={value}>{children}</SecretsContext.Provider>;
};

export const useSecrets = () => {
  const context = useContext(SecretsContext);
  if (!context) throw new Error('useSecrets must be used within a SecretsProvider');
  return context;
};
```

- [ ] **Step 4: Wire the provider into the app tree**

Modify `src/App.jsx` so `SecretsProvider` wraps `AppContent` inside the existing providers.

```jsx
import { SecretsProvider } from './context/SecretsContext';

export default function App() {
  useEffect(() => {
    const filteredImages = filterTexturesByDevice(IMAGE_ASSETS, supportsHover);
    filteredImages.forEach(path => preloadBrowserImage(path));
  }, []);

  return (
    <PerformanceProvider>
      <AchievementsProvider>
        <SecretsProvider>
          <AppContent />
        </SecretsProvider>
      </AchievementsProvider>
    </PerformanceProvider>
  );
}
```

- [ ] **Step 5: Verify the app still builds after provider wiring**

Run: `npm run build`

Expected: Vite production build completes successfully with no import errors.

---

## Task 2: Update Studio content to match Danis’s real profile

**Files:**
- Modify: `src/components/canvas/rooms/Studio/contentData.js`

- [ ] **Step 1: Replace placeholder monitor content with aligned English copy**

Rewrite `RAW_CONTENT_DATA` entries so they match the approved voice: humble, sharp, curiosity-driven, and grounded in real work.

Use this shape for the first six items:

```js
const RAW_CONTENT_DATA = [
  {
    id: 'web-001',
    platform: 'web',
    title: 'Creative Web Engineering',
    description: 'I build web experiences that combine engineering discipline with visual clarity, motion, and performance. My main field is the web, but I approach it with the mindset of a builder, not just a designer.',
    frontTexture: '/textures/studio/monitorfront_postnafbdoublewinner.webp',
    paintedFrontTexture: '/textures/studio/monitorfront_postnafbdoublewinner_painted.webp',
    thumbnail: null,
    url: '#',
    date: '2026-01-10',
    readTime: '5 min',
  },
  {
    id: 'web-002',
    platform: 'web',
    title: 'Production Work, Not Just Practice',
    description: 'During vocational school, curiosity turned into real delivery. I worked on websites and systems for freelance clients and real-world needs, learning how to make ideas usable, stable, and production-ready.',
    thumbnail: null,
    url: '#',
    date: '2025-12-20',
    readTime: '6 min',
  },
  {
    id: 'web-003',
    platform: 'web',
    title: 'From Curiosity to Craft',
    description: 'I started learning seriously in 2019, and a lot of my early work came from experiments, self-driven projects, and late-night iterations. That curiosity still shapes how I learn and how I ship.',
    thumbnail: null,
    url: '#',
    date: '2025-12-10',
    readTime: '4 min',
  },
  {
    id: 'web-004',
    platform: 'web',
    title: 'Interfaces With Personality',
    description: 'I care about how software feels as much as how it functions. Animation, hierarchy, texture, and responsiveness matter because they change how people remember the work.',
    thumbnail: null,
    url: '#',
    date: '2025-11-25',
    readTime: '7 min',
  },
  {
    id: 'web-005',
    platform: 'web',
    title: 'Systems Thinking on the Frontend',
    description: 'Even when I work on the UI layer, I think in systems: architecture, data flow, maintainability, and performance. The visual layer is only one part of the engineering story.',
    thumbnail: null,
    url: '#',
    date: '2025-11-15',
    readTime: '7 min',
  },
  {
    id: 'web-006',
    platform: 'web',
    title: 'Still Early, Already Serious',
    description: 'I have only just graduated vocational school, but the work is already real. I treat every project as a chance to refine both technical quality and professional discipline.',
    thumbnail: null,
    url: '#',
    date: '2025-11-01',
    readTime: '5 min',
  },
];
```

- [ ] **Step 2: Rewrite the AI/Cyber and IoT entries in the same tone**

Replace the current AI/IoT copy with language that reflects exploration rather than inflated claims.

```js
{
  id: 'ai-001',
  platform: 'ai_cyber',
  title: 'AI Exploration With Real Stakes',
  description: 'I explore AI as a serious engineering field, not only as a trend. Competitions and applied projects pushed me to think about usefulness, clarity, and problem-solving under pressure.',
  frontTexture: '/textures/studio/tvfront_filmikprojektdlamultiego.webp',
  paintedFrontTexture: '/textures/studio/tvfront_filmikprojektdlamultiego_painted.webp',
  thumbnail: null,
  url: '#',
  date: '2026-01-08',
  views: '2.4K',
  duration: '15:32',
},
{
  id: 'ai-002',
  platform: 'ai_cyber',
  title: 'Competition Built Discipline',
  description: 'Technology competitions sharpened my focus, confidence, and speed of execution. They taught me how to keep thinking clearly while solving real constraints in limited time.',
  frontTexture: '/textures/studio/tvfront_filmikedytowaniezdjec.webp',
  paintedFrontTexture: '/textures/studio/tvfront_filmikedytowaniezdjec_painted.webp',
  thumbnail: null,
  url: '#',
  date: '2025-10-11',
  views: '1.2K',
  duration: '7:45',
},
{
  id: 'iot-001',
  platform: 'iot',
  title: 'Beyond the Browser',
  description: 'The web is where I build most often, but not where my curiosity ends. I also explore hardware, embedded systems, and small connected devices as part of how I learn.',
  frontTexture: '/textures/studio/phonefront_followmeontiktok.webp',
  paintedFrontTexture: '/textures/studio/phonefront_followmeontiktok_painted.webp',
  thumbnail: null,
  url: '#',
  date: '2026-01-09',
  views: '15.2K',
  likes: '1.2K',
}
```

Apply the same tone to the remaining items before moving on.

- [ ] **Step 3: Keep the existing texture fallback logic unchanged**

Do not rewrite the `CONTENT_DATA` mapping logic. Only confirm it still ends with:

```js
export const CONTENT_DATA = RAW_CONTENT_DATA.map((item) => {
  return {
    ...item,
    frontTexture: item.frontTexture || (
      item.platform === 'web' ? webTextures[webIdx++ % webTextures.length] :
      item.platform === 'ai_cyber' ? aiTextures[aiIdx++ % aiTextures.length] :
      iotTextures[iotIdx++ % iotTextures.length]
    ),
    paintedFrontTexture: item.paintedFrontTexture || (
      item.platform === 'web' ? webPaintedTextures[webPIdx++ % webPaintedTextures.length] :
      item.platform === 'ai_cyber' ? aiPaintedTextures[aiPIdx++ % aiPaintedTextures.length] :
      iotPaintedTextures[iotPIdx++ % iotPaintedTextures.length]
    )
  };
});
```

- [ ] **Step 4: Run a focused lint check for the Studio data file**

Run: `npm run lint -- src/components/canvas/rooms/Studio/contentData.js`

Expected: No lint errors for malformed strings or duplicate keys.

---

## Task 3: Rewrite About story content in English

**Files:**
- Modify: `src/components/canvas/rooms/About/InfiniteSkyManager.jsx`
- Optional create if extracting: `src/components/canvas/rooms/About/aboutStoryContent.js`

- [ ] **Step 1: Rewrite the intro milestone text in English**

Replace the hardcoded intro text block in `IntroMilestone` with copy aligned to the approved story.

```jsx
<Text
  ref={brandRef}
  position={[0, 4.3, 0.1]}
  fontSize={0.45}
  color="#4a4a4a"
  anchorX="center"
  anchorY="middle"
  font="/fonts/CabinSketch-Regular.ttf"
>
  {'< Creative Software Engineer />'}
</Text>

<Text
  ref={motto1Ref}
  position={[0, 0, 0.1]}
  fontSize={0.32}
  color="#555555"
  anchorX="center"
  anchorY="middle"
  font="/fonts/CabinSketch-Regular.ttf"
  fontStyle="italic"
>
  {'"I started with curiosity in 2019,'}
</Text>

<Text
  ref={motto2Ref}
  position={[0, -0.5, 0]}
  fontSize={0.32}
  color="#555555"
  anchorX="center"
  anchorY="middle"
  font="/fonts/CabinSketch-Regular.ttf"
  fontStyle="italic"
>
  {'and kept building until curiosity became real work."'}
</Text>
```

- [ ] **Step 2: Replace `AWARDS_DATA` placeholder copy with English story cards**

Rewrite the three overlay payloads in `AWARDS_DATA`.

```js
const AWARDS_DATA = {
  origin: {
    id: 'award-origin',
    layout: 'story',
    title: 'The Origin',
    date: '2019 - 2023',
    description: 'I started learning seriously in 2019. A lot of the early work came from private projects, experiments, and freelance practice that never became public, but that period built the habits I still rely on now.',
    url: '#',
    gallery: [
      { label: 'Early Curiosity', date: '2019', image: '/textures/about/SOTY.webp', url: '#' },
      { label: 'Private Iteration', date: '2021 - 2023', image: '/textures/about/SOTM.webp', url: '#' }
    ],
    platformConfig: {
      label: 'THE ORIGIN',
      color: '#1a1a1a',
      icon: '🚀'
    }
  },
  competitor: {
    id: 'award-competitor',
    layout: 'story',
    title: 'The Competitor',
    date: '2023 - 2024',
    description: 'Competitions helped sharpen my discipline. Through web development and AI events, I learned how to think under pressure, keep standards high, and trust the work I had put in beforehand.',
    url: '#',
    gallery: [
      { label: 'Web Technologies', date: 'City & Province', image: '/textures/about/FEATURED.webp', url: '#' },
      { label: 'Government AI Competition', date: 'City & Province', image: '/textures/about/SOTDAYYOUNGMULTIGSAP.webp', url: '#' }
    ],
    platformConfig: {
      label: 'THE COMPETITOR',
      color: '#1a1a1a',
      icon: '🏆'
    }
  },
  realworld: {
    id: 'award-realworld',
    layout: 'story',
    title: 'Real World Impact',
    date: '2023 - Present',
    description: 'During vocational school, exploration turned into delivery. I worked on websites, apps, and practical systems for clients and real needs, and that is where curiosity matured into professional responsibility.',
    url: '#',
    gallery: [
      { label: 'Web Projects', date: 'Production Work', image: '/textures/about/SOTY.webp', url: '#' },
      { label: 'Applied Systems', date: 'Client & School Work', image: '/textures/about/SOTM.webp', url: '#' }
    ],
    platformConfig: {
      label: 'REAL WORLD',
      color: '#1a1a1a',
      icon: '🌍'
    }
  }
};
```

- [ ] **Step 3: Update the skills section subtitle to reflect the broader identity**

In `SkillsMilestone`, replace the description string.

```jsx
<Text
  position={[0, 4.6, 0.5]}
  fontSize={0.25}
  color="#555555"
  anchorX="center"
  anchorY="middle"
  font="/fonts/CabinSketch-Regular.ttf"
  maxWidth={6}
  textAlign="center"
>
  {'Web engineering at the core, with curiosity stretching into AI, cybersecurity, and hardware.'}
</Text>
```

- [ ] **Step 4: Run the app and manually verify About copy tone**

Run: `npm run dev`

Expected manual result:
- Intro copy is fully English.
- Story overlays feel humble, specific, and personal.
- No overflow or clipped text in the About overlays.

---

## Task 4: Build secret progress UI and popup support

**Files:**
- Create: `src/components/ui/SecretsProgressBadge.jsx`
- Modify: `src/components/ui/AchievementPopup.jsx`
- Modify: `src/components/ui/AchievementsPanel.jsx`
- Modify: `src/components/ui/NavigationUI.jsx`

- [ ] **Step 1: Add the secrets progress badge component**

Create `src/components/ui/SecretsProgressBadge.jsx`.

```jsx
import { useSecrets } from '../../context/SecretsContext';

const SecretsProgressBadge = () => {
  const { secretCount, secretTotal, isBlueprintUnlocked } = useSecrets();

  return (
    <div className={`secrets-progress-badge ${isBlueprintUnlocked ? 'unlocked' : ''}`}>
      <span className="label">Hidden details</span>
      <span className="value">{secretCount}/{secretTotal}</span>
    </div>
  );
};

export default SecretsProgressBadge;
```

- [ ] **Step 2: Mount the badge near the existing HUD controls**

Modify `src/components/ui/NavigationUI.jsx` and render the badge inside the `hasEntered` branch.

```jsx
import SecretsProgressBadge from './SecretsProgressBadge';

{hasEntered && (
  <>
    <SecretsProgressBadge />
    <div className={`nav-controls ${isMenuOpen || isAudioMenuOpen ? 'menu-open' : ''} ${isUIHidden ? 'ui-hidden' : ''}`}>
      {/* existing buttons */}
    </div>
  </>
)}
```

- [ ] **Step 3: Extend the achievements panel to show secret progress**

Modify `src/components/ui/AchievementsPanel.jsx`.

```jsx
import { useSecrets } from '../../context/SecretsContext';

const AchievementsPanel = ({ isOpen, onClose }) => {
  const { completed } = useAchievements();
  const { secretCount, secretTotal, isBlueprintUnlocked } = useSecrets();

  return (
    <div className={`achievements-panel ${isOpen ? 'open' : ''}`} inert={!isOpen ? true : undefined}>
      <div className="achievements-card">
        <div className="achievements-header">
          <h3>ACHIEVEMENTS</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close achievements">
            <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="achievements-footer">
          <span>{completed.length} / {Object.keys(ACHIEVEMENTS).length} EXPLORED</span>
          <span>{secretCount} / {secretTotal} HIDDEN DETAILS</span>
          <span>{isBlueprintUnlocked ? 'BLUEPRINT MODE UNLOCKED' : 'KEEP EXPLORING'}</span>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Extend popup support for secret discoveries**

In `src/components/ui/AchievementPopup.jsx`, add a second rendering path that reads from `useSecrets()` when `activeSecret` exists.

```jsx
const { activeSecret, dismissActiveSecret, isBlueprintUnlocked } = useSecrets();

if (activeSecret) {
  return (
    <div className="achievement-popup show" onAnimationEnd={dismissActiveSecret}>
      <div className="achievement-popup-card secret-popup">
        <span className="achievement-type">HIDDEN DETAIL FOUND</span>
        <h4>{activeSecret.title}</h4>
        <p>{activeSecret.line}</p>
        {isBlueprintUnlocked && <span className="achievement-bonus">Blueprint Mode is now available.</span>}
      </div>
    </div>
  );
}
```

Adapt to the file’s existing markup instead of replacing tutorial achievement rendering.

- [ ] **Step 5: Run manual UI verification**

Run: `npm run dev`

Expected manual result:
- Badge appears after entering the experience.
- Achievements panel now shows hidden detail progress.
- Secret popups do not block regular tutorial/achievement popups indefinitely.

---

## Task 5: Add corridor secrets

**Files:**
- Modify: `src/components/canvas/corridor/Doodles.jsx`
- Modify: `src/components/canvas/corridor/Corridor.jsx`

- [ ] **Step 1: Add the coffee secret interaction**

In `Doodles.jsx`, import `useSecrets` and trigger `discoverSecret(SECRET_IDS.CORRIDOR_COFFEE)` when the coffee prop is clicked.

```jsx
import { useSecrets } from '../../../context/SecretsContext';
import { SECRET_IDS } from '../../../data/secretContent';

const { discoverSecret } = useSecrets();

<mesh
  onClick={(e) => {
    e.stopPropagation();
    discoverSecret(SECRET_IDS.CORRIDOR_COFFEE);
  }}
>
  {/* existing coffee geometry / material */}
</mesh>
```

If the coffee already animates, keep that behavior and only append the discovery trigger.

- [ ] **Step 2: Add one hidden frame secret**

Attach one frame / wall sketch click target in `Doodles.jsx` and reveal a short GSAP pulse when clicked.

```jsx
const [isFrameRevealed, setIsFrameRevealed] = useState(false);

<mesh
  onClick={(e) => {
    e.stopPropagation();
    setIsFrameRevealed(true);
    discoverSecret(SECRET_IDS.CORRIDOR_FRAME);
  }}
>
  <planeGeometry args={[1.2, 1.2]} />
  <meshBasicMaterial color={isFrameRevealed ? '#ffffff' : '#d9d0c5'} transparent opacity={1} />
</mesh>
```

- [ ] **Step 3: Add the 404 door clue**

Use `Corridor.jsx` to place a small extra sign or label on a non-primary door path.

```jsx
<Text
  position={[corridorWidth * 0.42, 0.8, zOffset - length * 0.35]}
  fontSize={0.18}
  color="#555"
  rotation={[0, -Math.PI / 2, 0]}
  onClick={(e) => {
    e.stopPropagation();
    discoverSecret(SECRET_IDS.CORRIDOR_404);
  }}
>
  {'404'}
</Text>
```

Match the actual file’s available imports and scene layout.

- [ ] **Step 4: Verify corridor secrets do not block navigation**

Run: `npm run dev`

Expected manual result:
- Clicking coffee / frame / 404 clue unlocks progress.
- Door entry still works.
- No accidental pointer conflicts with corridor movement.

---

## Task 6: Add About-room secrets

**Files:**
- Modify: `src/components/canvas/rooms/About/AboutRoom.jsx`
- Modify: `src/components/canvas/rooms/About/InfiniteSkyManager.jsx`

- [ ] **Step 1: Turn repeated airplane interaction into a secret**

In `AboutRoom.jsx`, add a click counter for the airplane group and unlock the airplane secret at a small threshold.

```jsx
import { useSecrets } from '../../../../context/SecretsContext';
import { SECRET_IDS } from '../../../../data/secretContent';

const airplaneClicksRef = useRef(0);
const { discoverSecret } = useSecrets();

<group
  ref={airplaneGroupRef}
  position={[0, -0.3, 1]}
  onClick={(e) => {
    e.stopPropagation();
    airplaneClicksRef.current += 1;
    if (airplaneClicksRef.current >= 3) {
      discoverSecret(SECRET_IDS.ABOUT_AIRPLANE);
    }
  }}
>
  <PaperAirplane scale={0.8} color="#faf8f5" />
</group>
```

- [ ] **Step 2: Add a clickable IoT-oriented skills secret**

In `InfiniteSkyManager.jsx`, inside `SkillBalloon`, branch on the IoT label and unlock the About IoT secret when that balloon is popped.

```jsx
if (!isPopping) {
  setIsPopping(true);
  playBalloonSound();
  if (config.label === 'IoT (Arduino/ESP)') {
    discoverSecret(SECRET_IDS.ABOUT_IOT);
  }
}
```

Wire the hook imports at the top of the file.

- [ ] **Step 3: Keep the interaction subtle**

Do not add a new full-screen overlay here. The only user-facing responses should be:
- existing balloon pop / airplane motion
- secret popup from Task 4
- progress increment

Use this acceptance check before moving on:

```txt
About secret interactions should feel like they were always part of the room,
not like a separate minigame UI was bolted on.
```

- [ ] **Step 4: Verify About room interactions on desktop and mobile simulation**

Run: `npm run dev`

Expected manual result:
- Airplane secret works after repeated interaction.
- IoT balloon unlocks its secret without breaking the existing label reveal.
- Scroll-based flight still works.

---

## Task 7: Add the Studio-side secret and small memory reveal

**Files:**
- Modify: `src/components/canvas/rooms/Studio/StudioRoom.jsx`
- Modify: `src/components/ui/GlobalOverlay.jsx`

- [ ] **Step 1: Add one hidden Studio secret trigger**

In `StudioRoom.jsx`, use either the latest-content monitor or a hidden technical prop to unlock the final secret.

```jsx
import { useSecrets } from '../../../../context/SecretsContext';
import { SECRET_IDS } from '../../../../data/secretContent';

const { discoverSecret } = useSecrets();

const handleHiddenTerminalClick = useCallback((e) => {
  e.stopPropagation();
  discoverSecret(SECRET_IDS.STUDIO_TERMINAL);
  openOverlay({
    title: 'Builder Notes',
    layout: 'story',
    date: 'Hidden Layer',
    description: 'I explore widely, but I try to build with discipline. Curiosity starts the process. Systems thinking keeps it useful.',
    url: '#',
    platformConfig: {
      label: 'SECRET',
      color: '#1a1a1a',
      icon: '⌘'
    }
  });
}, [discoverSecret, openOverlay]);
```

Attach that handler to a small mesh or a rarely used monitor face instead of replacing standard monitor browsing.

- [ ] **Step 2: Support compact “memory note” overlays if needed**

If `GlobalOverlay.jsx` needs a lighter layout, add a new `layout === 'note'` branch.

```jsx
{content.layout === 'note' ? (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <p style={{ lineHeight: 1.7, margin: 0 }}>{content.description}</p>
  </div>
) : (
  /* existing layouts */
)}
```

Only add this branch if the existing `story` layout looks too heavy during manual testing.

- [ ] **Step 3: Verify Studio secret does not break normal monitor flow**

Run: `npm run dev`

Expected manual result:
- Normal monitor rotation and overlay browsing still work.
- The hidden Studio secret is discoverable but not intrusive.
- Opening the secret note overlay does not trap the user in a broken state.

---

## Task 8: Implement Blueprint unlock behavior

**Files:**
- Modify: `src/index.css`
- Modify: `src/App.jsx`
- Modify: `src/components/ui/NavigationUI.jsx`
- Modify: `src/components/canvas/rooms/About/InfiniteSkyManager.jsx`
- Modify: `src/components/canvas/rooms/Studio/StudioRoom.jsx`

- [ ] **Step 1: Add a UI control for Blueprint mode after unlock**

In `NavigationUI.jsx`, render a small button only when `isBlueprintUnlocked` is true.

```jsx
import { useSecrets } from '../../context/SecretsContext';

const { isBlueprintUnlocked, toggleBlueprintMode } = useSecrets();

{hasEntered && isBlueprintUnlocked && (
  <button
    className="nav-btn blueprint-btn"
    onClick={toggleBlueprintMode}
    aria-label="Toggle Blueprint Mode"
  >
    BP
  </button>
)}
```

- [ ] **Step 2: Add the global Blueprint CSS mode**

In `src/index.css`, add a minimal first pass.

```css
.blueprint-mode {
  --paper-bg: #0d1b2a;
  --paper-ink: #d8e6ff;
  --paper-accent: #7fb3ff;
}

.blueprint-mode body {
  background: var(--paper-bg);
  color: var(--paper-ink);
}

.blueprint-mode .navigation-ui,
.blueprint-mode .global-overlay-wrapper,
.blueprint-mode .achievements-panel {
  filter: hue-rotate(180deg) saturate(0.75) brightness(0.9);
}
```

- [ ] **Step 3: Add light scene-level reactions in About and Studio**

Add one guarded color/material branch in each room rather than rewriting every material.

Example pattern:

```jsx
const isBlueprintActive = typeof document !== 'undefined' && document.documentElement.classList.contains('blueprint-mode');

<meshBasicMaterial
  color={isBlueprintActive ? '#9cc4ff' : '#1a1a1a'}
  wireframe={true}
/>
```

Use this only on a few signature accents (milestone wireframes, hidden labels, small UI cues). Do not attempt full material replacement in this task.

- [ ] **Step 4: Verify Blueprint mode as the final reward**

Run: `npm run dev`

Expected manual result:
- Blueprint button does not show before unlock.
- After enough secrets are found, the button appears.
- Toggling the mode changes the world feel clearly, but does not destroy readability.

---

## Task 9: Final validation and cleanup

**Files:**
- Modify only if fixes are needed from validation

- [ ] **Step 1: Run lint across the project**

Run: `npm run lint`

Expected: No ESLint errors.

- [ ] **Step 2: Run the production build and preview validation**

Run: `npm run build && npm run preview`

Expected:
- Build completes successfully.
- Production preview launches.
- No obvious regressions in first-load behavior.

- [ ] **Step 3: Manual regression checklist**

Check all of the following in the browser:

```txt
[ ] Enter corridor still works
[ ] Map teleport still works
[ ] About room story text is fully English
[ ] Studio overlays feel aligned to Danis's real identity
[ ] Secret progress increments only once per secret
[ ] Blueprint mode stays gated until enough secrets are found
[ ] Achievements/tutorial popups still behave normally
[ ] Mobile/touch fallback still avoids hover-only interactions
```

- [ ] **Step 4: Commit the finished feature**

Run:

```bash
git add src/App.jsx src/index.css src/context/SecretsContext.jsx src/context/AchievementsContext.jsx src/data/secretContent.js src/utils/blueprintTheme.js src/components/ui/SecretsProgressBadge.jsx src/components/ui/AchievementPopup.jsx src/components/ui/AchievementsPanel.jsx src/components/ui/NavigationUI.jsx src/components/ui/GlobalOverlay.jsx src/components/canvas/corridor/Corridor.jsx src/components/canvas/corridor/Doodles.jsx src/components/canvas/rooms/About/AboutRoom.jsx src/components/canvas/rooms/About/InfiniteSkyManager.jsx src/components/canvas/rooms/Studio/StudioRoom.jsx src/components/canvas/rooms/Studio/contentData.js docs/superpowers/plans/2026-05-30-portfolio-content-and-easter-eggs.md

git commit -m "feat: align portfolio story and add curiosity secrets"
```

Expected: commit created with the content/story/easter-egg feature set.
