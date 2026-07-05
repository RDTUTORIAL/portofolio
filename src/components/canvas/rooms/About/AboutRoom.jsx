import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';
import PaperAirplane from './PaperAirplane';
import InfiniteSkyManager from './InfiniteSkyManager';
import { useScene } from '../../../../context/SceneContext';
import { useAchievements } from '../../../../context/AchievementsContext';
import { useAudio } from '../../../../context/AudioManager';
import { useSecrets } from '../../../../context/SecretsContext';
import { SECRET_IDS } from '../../../../data/secretContent';
import { BLUEPRINT_THEME } from '../../../../utils/blueprintTheme';
import { isDraftRoomBlockingSceneInput } from '../../../../utils/modalState';

const CHUNK_LENGTH = 40;
const AIRPLANE_SECRET_THRESHOLD = 3;

export const AUDIO_SETTINGS = {
    volume: 2.5,
    distance: 2,
    rolloff: 0.8
};

const isBlueprintMode = () => typeof document !== 'undefined' && document.documentElement.classList.contains('blueprint-mode');

const AirplaneSecretLabel = () => {
    if (!isBlueprintMode()) return null;

    return (
        <Text
            position={[0.55, 0.5, 1.15]}
            fontSize={0.08}
            color={BLUEPRINT_THEME.line}
            anchorX="left"
            anchorY="middle"
            font="/fonts/CabinSketch-Regular.ttf"
        >
            {'paper pilot unlocked'}
        </Text>
    );
};

const BlueprintGrid = () => {
    if (!isBlueprintMode()) return null;

    return (
        <group position={[0, 0, -180]}>
            <gridHelper args={[250, 24, BLUEPRINT_THEME.line, BLUEPRINT_THEME.accent]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
    );
};

const AboutRoom = ({ showRoom, onReady, isExiting, isWarmup }) => {
    const { camera } = useThree();
    const { isTeleporting, overlayContent } = useScene();
    const { showTutorial, unlockAchievement, hidePopup } = useAchievements();
    const { discoverSecret } = useSecrets();
    const { globalVolume, isMuted } = useAudio();
    const effectiveVolume = isMuted ? 0 : AUDIO_SETTINGS.volume * globalVolume;

    const audioRef = useRef();
    const overlayRef = useRef(overlayContent);
    const hasSignaledReady = useRef(false);
    const frameCount = useRef(0);
    const scrollPosition = useRef(0);
    const scrollVelocity = useRef(0);
    const baseCameraRotation = useRef({ x: 0, y: 0, z: 0 });
    const isFlightActive = useRef(false);
    const currentBank = useRef(0);
    const currentPitch = useRef(0);
    const roomRef = useRef();
    const airplaneGroupRef = useRef();
    const airplaneClicksRef = useRef(0);
    const lastTouchY = useRef(0);

    const FRAMES_TO_WAIT = 25;

    useEffect(() => {
        if (audioRef.current && audioRef.current.setVolume) {
            audioRef.current.setVolume(effectiveVolume);
        }
    }, [effectiveVolume]);

    useEffect(() => {
        overlayRef.current = overlayContent;
    }, [overlayContent]);

    useEffect(() => {
        if (isExiting || isTeleporting) {
            hidePopup();
        }
    }, [isExiting, isTeleporting, hidePopup]);

    useEffect(() => {
        if (isTeleporting) {
            currentBank.current = 0;
            currentPitch.current = 0;
            isFlightActive.current = false;
            baseCameraRotation.current = { x: 0, y: 0, z: 0 };
            scrollPosition.current = 0;
            scrollVelocity.current = 0;
        }
    }, [isTeleporting]);

    useFrame((state, delta) => {
        if (!hasSignaledReady.current) {
            if (roomRef.current) {
                roomRef.current.traverse((child) => {
                    if (child.isMesh) child.frustumCulled = false;
                });
            }

            frameCount.current++;
            if (frameCount.current >= FRAMES_TO_WAIT) {
                if (roomRef.current) {
                    roomRef.current.traverse((child) => {
                        if (child.isMesh) child.frustumCulled = true;
                    });
                }

                hasSignaledReady.current = true;
                onReady?.();
                if (!isTeleporting && !isExiting && !isWarmup) {
                    setTimeout(() => showTutorial('about_fly'), 2000);
                }
            }
        }

        if (isTeleporting) return;

        scrollPosition.current += scrollVelocity.current * delta * 60;
        scrollVelocity.current *= 0.95;
        if (Math.abs(scrollVelocity.current) < 0.001) {
            scrollVelocity.current = 0;
        }

        if (scrollPosition.current > 15) {
            unlockAchievement('about_fly');
        }

        if (isExiting) return;

        if (!isFlightActive.current && scrollPosition.current > 0.5) {
            isFlightActive.current = true;
            baseCameraRotation.current = {
                x: camera.rotation.x,
                y: camera.rotation.y,
                z: camera.rotation.z
            };
        }

        if (isFlightActive.current) {
            const chunkProgress = (scrollPosition.current % CHUNK_LENGTH) / CHUNK_LENGTH;
            let bankAngle = Math.sin(chunkProgress * Math.PI * 2) * 0.12;
            let pitchAngle = Math.sin(chunkProgress * Math.PI * 4) * 0.05;
            const flightProgress = Math.min(1, (scrollPosition.current - 0.5) / 5.0);
            bankAngle *= flightProgress;
            pitchAngle *= flightProgress;

            const lerpSpeed = 1 - Math.pow(0.02, delta);
            currentBank.current = THREE.MathUtils.lerp(currentBank.current, bankAngle, lerpSpeed);
            currentPitch.current = THREE.MathUtils.lerp(currentPitch.current, pitchAngle, lerpSpeed);

            camera.rotation.x = baseCameraRotation.current.x + currentPitch.current;
            camera.rotation.z = baseCameraRotation.current.z + currentBank.current;
        } else {
            currentBank.current = 0;
            currentPitch.current = 0;
        }

        if (airplaneGroupRef.current) {
            airplaneGroupRef.current.rotation.x = currentPitch.current * 3 + 0.1;
            airplaneGroupRef.current.rotation.z = -currentBank.current * 2;
        }
    });

    useEffect(() => {
        const handleWheel = (e) => {
            if (overlayRef.current || isDraftRoomBlockingSceneInput()) return;
            scrollVelocity.current += e.deltaY * 0.002;
        };

        window.addEventListener('wheel', handleWheel, { passive: true });
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    useEffect(() => {
        const handleTouchStart = (e) => {
            if (isDraftRoomBlockingSceneInput()) return;
            if (e.touches.length === 1) {
                lastTouchY.current = e.touches[0].clientY;
            }
        };

        const handleTouchMove = (e) => {
            if (overlayRef.current || isDraftRoomBlockingSceneInput()) return;
            if (e.touches.length === 1) {
                const deltaY = lastTouchY.current - e.touches[0].clientY;
                lastTouchY.current = e.touches[0].clientY;
                scrollVelocity.current += deltaY * 0.005;
            }
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    const handleAirplaneSecretClick = (e) => {
        e.stopPropagation();
        if (overlayRef.current) return;

        airplaneClicksRef.current += 1;
        if (airplaneClicksRef.current >= AIRPLANE_SECRET_THRESHOLD) {
            discoverSecret(SECRET_IDS.ABOUT_AIRPLANE);
        }
    };

    return (
        <group ref={roomRef} position={[0, 0, -25]}>
            {!isWarmup && (
                <PositionalAudio
                    ref={audioRef}
                    url="/sounds/szumwiatru.mp3"
                    distanceModel="exponential"
                    refDistance={AUDIO_SETTINGS.distance}
                    rolloffFactor={AUDIO_SETTINGS.rolloff}
                    loop
                    autoplay
                    volume={effectiveVolume}
                />
            )}

            <group ref={airplaneGroupRef} position={[0, -0.3, 1]} onPointerDown={handleAirplaneSecretClick}>
                <PaperAirplane
                    scale={0.8}
                    color={isBlueprintMode() ? BLUEPRINT_THEME.paper : '#faf8f5'}
                />
                <AirplaneSecretLabel />
                <mesh position={[0, 0, 0.08]} onPointerDown={handleAirplaneSecretClick}>
                    <planeGeometry args={[1.35, 0.9]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>
            </group>

            <InfiniteSkyManager scrollProgressRef={scrollPosition} />
            <BlueprintGrid />

            <mesh position={[0, 0, -200]}>
                <planeGeometry args={[300, 150]} />
                <meshBasicMaterial color={isBlueprintMode() ? BLUEPRINT_THEME.background : '#87CEEB'} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

export default AboutRoom;
