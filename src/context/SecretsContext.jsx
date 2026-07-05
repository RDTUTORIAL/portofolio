import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SECRET_CONTENT, SECRET_UNLOCK_TARGET } from '../data/secretContent';
import { BLUEPRINT_MODE_CLASS } from '../utils/blueprintTheme';
import { DRAFT_ROOM_OPEN_CLASS } from '../utils/modalState';
import { useAchievements } from './AchievementsContext';

const STORAGE_KEY = 'danis_secrets_v1';
const SecretsContext = createContext(null);

export const SecretsProvider = ({ children }) => {
  const { unlockAchievement } = useAchievements();
  const [discoveredSecrets, setDiscoveredSecrets] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isBlueprintUnlocked, setIsBlueprintUnlocked] = useState(false);
  const [isBlueprintActive, setIsBlueprintActive] = useState(false);
  const [isDraftRoomOpen, setIsDraftRoomOpen] = useState(false);
  const [activeSecret, setActiveSecret] = useState(null);
  const discoveredSecretsRef = useRef(discoveredSecrets);

  useEffect(() => {
    discoveredSecretsRef.current = discoveredSecrets;
  }, [discoveredSecrets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(discoveredSecrets));
  }, [discoveredSecrets]);

  useEffect(() => {
    if (discoveredSecrets.length >= SECRET_UNLOCK_TARGET) {
      setIsBlueprintUnlocked(true);
      unlockAchievement('blueprint_unlocked');
    }
  }, [discoveredSecrets, unlockAchievement]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.classList.toggle(BLUEPRINT_MODE_CLASS, isBlueprintActive);

    return () => {
      document.documentElement.classList.remove(BLUEPRINT_MODE_CLASS);
    };
  }, [isBlueprintActive]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.classList.toggle(DRAFT_ROOM_OPEN_CLASS, isDraftRoomOpen);

    return () => {
      document.documentElement.classList.remove(DRAFT_ROOM_OPEN_CLASS);
    };
  }, [isDraftRoomOpen]);

  const discoverSecret = useCallback((secretId) => {
    const secret = SECRET_CONTENT[secretId];
    if (!secret) return;

    if (discoveredSecretsRef.current.includes(secretId)) {
      setActiveSecret(secret);
      return;
    }

    const nextSecrets = [...discoveredSecretsRef.current, secretId];
    discoveredSecretsRef.current = nextSecrets;
    setDiscoveredSecrets(nextSecrets);
    setActiveSecret(secret);
    unlockAchievement('secret_hunter');
  }, [unlockAchievement]);

  const dismissActiveSecret = useCallback(() => setActiveSecret(null), []);

  const toggleBlueprintMode = useCallback(() => {
    if (!isBlueprintUnlocked) return;
    setIsBlueprintActive((prev) => {
      const next = !prev;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle(BLUEPRINT_MODE_CLASS, next);
      }
      return next;
    });
  }, [isBlueprintUnlocked]);

  const openDraftRoom = useCallback(() => {
    if (!isBlueprintUnlocked) return;
    setIsDraftRoomOpen(true);
    unlockAchievement('draft_room');
  }, [isBlueprintUnlocked, unlockAchievement]);

  const closeDraftRoom = useCallback(() => setIsDraftRoomOpen(false), []);

  const value = useMemo(() => ({
    discoveredSecrets,
    secretCount: discoveredSecrets.length,
    secretTotal: Object.keys(SECRET_CONTENT).length,
    isBlueprintUnlocked,
    isBlueprintActive,
    isDraftRoomOpen,
    activeSecret,
    discoverSecret,
    dismissActiveSecret,
    toggleBlueprintMode,
    openDraftRoom,
    closeDraftRoom,
  }), [discoveredSecrets, isBlueprintUnlocked, isBlueprintActive, isDraftRoomOpen, activeSecret, discoverSecret, dismissActiveSecret, toggleBlueprintMode, openDraftRoom, closeDraftRoom]);

  return <SecretsContext.Provider value={value}>{children}</SecretsContext.Provider>;
};

export const useSecrets = () => {
  const context = useContext(SecretsContext);
  if (!context) throw new Error('useSecrets must be used within a SecretsProvider');
  return context;
};
