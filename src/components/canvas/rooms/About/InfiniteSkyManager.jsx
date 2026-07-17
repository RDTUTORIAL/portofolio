import { useState, useRef, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Text, PositionalAudio, Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import SkyChunk, { CHUNK_LENGTH, ROOM_Z } from './SkyChunk';
import { useScene } from '../../../../context/SceneContext';
import { useSecrets } from '../../../../context/SecretsContext';
import { SECRET_IDS } from '../../../../data/secretContent';
import { BLUEPRINT_THEME } from '../../../../utils/blueprintTheme';
import '../../shaders/RevealBasicMaterial';
import { isTouchDevice } from '../../../../utils/deviceDetect';
import { useAudio } from '../../../../context/AudioManager';

const _tempVec3 = new THREE.Vector3();
const STORY_CYCLE_LENGTH = 120;
const MILESTONE_CORRIDOR_CLIP_Z = -8.0;

const isBlueprintMode = () => typeof document !== 'undefined' && document.documentElement.classList.contains('blueprint-mode');
const titleColor = () => (isBlueprintMode() ? BLUEPRINT_THEME.line : '#1a1a1a');
const bodyColor = () => (isBlueprintMode() ? BLUEPRINT_THEME.paper : '#555555');
const wireColor = () => (isBlueprintMode() ? BLUEPRINT_THEME.line : '#333');
const labelOutline = () => (isBlueprintMode() ? BLUEPRINT_THEME.background : '#fff');

export const BALLOON_AUDIO_SETTINGS = {
    volume: 1.0,
    distance: 2,
    rolloff: 2
};

const AwardButton = ({ onClick, texture, paintedTexture, width, height, position, label = 'VIEW' }) => {
    const isTouch = isTouchDevice();
    const meshRef = useRef();
    const buttonRevealRef = useRef();
    const paintedRef = useRef();
    const hideDelayRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        const targetScale = hovered ? 1.05 : 1.0;
        const lerpFactor = 10 * delta;
        meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, lerpFactor);
        meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScale, lerpFactor);
        meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, targetScale, lerpFactor);
    });

    const handlePointerOver = () => {
        if (isTouch) return;
        setHovered(true);
        document.body.style.cursor = 'pointer';
        if (buttonRevealRef.current) {
            gsap.to(buttonRevealRef.current, { uProgress: 1.0, duration: 0.8, ease: 'power2.out', overwrite: true });
        }
        if (hideDelayRef.current) hideDelayRef.current.kill();
        if (paintedRef.current) {
            paintedRef.current.visible = true;
            if (paintedRef.current.material) paintedRef.current.material.opacity = 1;
        }
    };

    const handlePointerOut = () => {
        if (isTouch) return;
        setHovered(false);
        document.body.style.cursor = 'auto';
        if (buttonRevealRef.current) {
            gsap.to(buttonRevealRef.current, { uProgress: 0.0, duration: 0.5, ease: 'power2.out', overwrite: true });
        }
        hideDelayRef.current = gsap.delayedCall(0.55, () => {
            if (paintedRef.current?.material) paintedRef.current.material.opacity = 0;
        });
    };

    return (
        <group ref={meshRef} position={position}>
            <mesh ref={paintedRef} position={[0, 0, -0.001]} visible>
                <planeGeometry args={[width, height]} />
                <meshBasicMaterial color={isBlueprintMode() ? BLUEPRINT_THEME.paper : '#e0e0e0'} map={paintedTexture} transparent opacity={0} side={THREE.DoubleSide} alphaTest={0.5} depthWrite={false} />
            </mesh>
            <mesh onClick={onClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
                <planeGeometry args={[width, height]} />
                <revealBasicMaterial
                    ref={buttonRevealRef}
                    map={texture}
                    transparent
                    side={THREE.DoubleSide}
                    alphaTest={0.1}
                    depthWrite={false}
                    uProgress={0.0}
                />
            </mesh>
            <Text position={[0, 0, 0.05]} fontSize={0.25} color={isBlueprintMode() ? BLUEPRINT_THEME.background : '#1a1a1a'} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Bold.ttf">
                {isBlueprintMode() ? 'OPEN' : label}
            </Text>
        </group>
    );
};

const InfiniteSkyManager = ({ scrollProgressRef }) => {
    const [activeChunks, setActiveChunks] = useState([-1, 0, 1, 2]);
    const [activeStoryCycles, setActiveStoryCycles] = useState([-1, 0, 1]);
    const worldRef = useRef();
    // Subscribe so class-based blueprint materials re-render when the mode toggles.
    useSecrets();

    const getCurrentChunk = (worldZ) => Math.floor(worldZ / CHUNK_LENGTH);
    const getCurrentStoryCycle = (worldZ) => Math.floor(worldZ / STORY_CYCLE_LENGTH);

    useFrame(() => {
        if (!worldRef.current) return;
        const scrollProgress = scrollProgressRef?.current || 0;
        worldRef.current.position.z = scrollProgress;

        const currentChunk = getCurrentChunk(scrollProgress);
        const shouldBeActiveChunks = [currentChunk - 1, currentChunk, currentChunk + 1, currentChunk + 2];
        const chunksNeedUpdate = shouldBeActiveChunks.some((c) => !activeChunks.includes(c)) || activeChunks.some((c) => !shouldBeActiveChunks.includes(c));
        if (chunksNeedUpdate) setActiveChunks(shouldBeActiveChunks);

        const currentStoryCycle = getCurrentStoryCycle(scrollProgress);
        const shouldBeActiveCycles = [currentStoryCycle - 1, currentStoryCycle, currentStoryCycle + 1];
        const cyclesNeedUpdate = shouldBeActiveCycles.some((c) => !activeStoryCycles.includes(c)) || activeStoryCycles.some((c) => !shouldBeActiveCycles.includes(c));
        if (cyclesNeedUpdate) setActiveStoryCycles(shouldBeActiveCycles);
    });

    return (
        <group ref={worldRef}>
            {activeChunks.map((chunkIndex) => (
                <SkyChunk key={`sky-chunk-${chunkIndex}`} chunkIndex={chunkIndex} seed={42} scrollProgressRef={scrollProgressRef} />
            ))}

            {activeStoryCycles.map((cycleIndex) => (
                <group key={`story-cycle-${cycleIndex}`}>
                    <IntroMilestone z={-(cycleIndex * STORY_CYCLE_LENGTH + 15)} scrollProgressRef={scrollProgressRef} />
                    <AwardsMilestone z={-(cycleIndex * STORY_CYCLE_LENGTH + 55)} scrollProgressRef={scrollProgressRef} />
                    <SkillsMilestone z={-(cycleIndex * STORY_CYCLE_LENGTH + 95)} scrollProgressRef={scrollProgressRef} />
                </group>
            ))}
        </group>
    );
};

const IntroMilestone = ({ z, scrollProgressRef }) => {
    const avatarTexture = useLoader(THREE.TextureLoader, '/textures/about/awatarnachmurce.webp');
    const groupRef = useRef();
    const titleRef = useRef();
    const brandRef = useRef();
    const avatarRef = useRef();
    const motto1Ref = useRef();
    const motto2Ref = useRef();
    const baseY = 2;
    const legacyAspectRatio = 2816 / 1536;
    const avatarWidth = 6;
    const avatarHeight = avatarWidth / legacyAspectRatio;
    const { discoverSecret } = useSecrets();
    const [avatarMood, setAvatarMood] = useState(false);

    const handleAvatarClick = (e) => {
        e.stopPropagation();
        setAvatarMood(true);
        discoverSecret(SECRET_IDS.ABOUT_AVATAR);

        if (avatarRef.current) {
            gsap.killTweensOf(avatarRef.current.scale);
            gsap.killTweensOf(avatarRef.current.rotation);
            gsap.fromTo(avatarRef.current.scale,
                { x: 0.92, y: 0.92, z: 0.92 },
                { x: 1, y: 1, z: 1, duration: 0.55, ease: 'elastic.out(1, 0.35)' }
            );
            gsap.fromTo(avatarRef.current.rotation,
                { z: -0.05 },
                { z: 0.05, duration: 0.16, yoyo: true, repeat: 5, ease: 'sine.inOut' }
            );
        }
    };

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.elapsedTime;
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;
        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;
        if (!groupRef.current.visible) return;

        const distanceZ = z + scrollProgress - 55;
        const spreadStart = -70;
        const spreadEnd = -50;
        let spreadFactor = 0;

        if (distanceZ > spreadStart && distanceZ < spreadEnd) {
            spreadFactor = (distanceZ - spreadStart) / (spreadEnd - spreadStart);
            spreadFactor = Math.min(1, Math.max(0, spreadFactor));
            spreadFactor = spreadFactor * spreadFactor;
        } else if (distanceZ >= spreadEnd) {
            spreadFactor = 1;
        }

        const maxSpread = 15;
        if (titleRef.current) titleRef.current.position.x = -spreadFactor * maxSpread * 0.8;
        if (brandRef.current) brandRef.current.position.x = spreadFactor * maxSpread * 0.6;
        if (avatarRef.current) {
            avatarRef.current.position.y = baseY + Math.sin(time * 0.8) * 0.15 + spreadFactor * 3;
            avatarRef.current.position.x = -spreadFactor * maxSpread * 0.3;
        }
        if (motto1Ref.current) motto1Ref.current.position.x = spreadFactor * maxSpread * 0.7;
        if (motto2Ref.current) motto2Ref.current.position.x = -spreadFactor * maxSpread * 0.5;
    });

    return (
        <group ref={groupRef} position={[0, 0, z]}>
            <Text ref={titleRef} position={[0, 5, 0.1]} fontSize={1.2} color={titleColor()} anchorX="center" anchorY="middle" font="/fonts/RubikScribble-Regular.ttf">
                DANIS
            </Text>
            <Text ref={brandRef} position={[0, 4.3, 0.1]} fontSize={0.45} color={bodyColor()} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Regular.ttf">
                {'< Creative Software Engineer />'}
            </Text>
            <mesh
                ref={avatarRef}
                position={[0, baseY, 0]}
                onPointerDown={handleAvatarClick}
                onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
            >
                <planeGeometry args={[avatarWidth, avatarHeight]} />
                <meshBasicMaterial color={isBlueprintMode() ? BLUEPRINT_THEME.paper : '#e0e0e0'} map={avatarTexture} transparent side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            <mesh position={[0, baseY, 0.08]} onPointerDown={handleAvatarClick}>
                <planeGeometry args={[avatarWidth * 0.92, avatarHeight * 0.92]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
            {avatarMood && (
                <Text
                    position={[2.15, baseY + 0.78, 0.25]}
                    fontSize={0.18}
                    color={isBlueprintMode() ? BLUEPRINT_THEME.line : '#4a4a4a'}
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/CabinSketch-Bold.ttf"
                    outlineWidth={0.025}
                    outlineColor={labelOutline()}
                >
                    {'still debugging the sky'}
                </Text>
            )}
            <Text ref={motto1Ref} position={[0, 0, 0.1]} fontSize={0.32} color={bodyColor()} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Regular.ttf" fontStyle="italic">
                {'"I started coding in grade 6,'}
            </Text>
            <Text ref={motto2Ref} position={[0, -0.5, 0]} fontSize={0.32} color={bodyColor()} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Regular.ttf" fontStyle="italic">
                {'and kept turning curiosity into real systems."'}
            </Text>
            {isBlueprintMode() && (
                <Text position={[0, -1.15, 0.2]} fontSize={0.12} color={BLUEPRINT_THEME.line} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Regular.ttf">
                    {'still exploring'}
                </Text>
            )}
        </group>
    );
};

const AWARDS_DATA = {
    origin: {
        id: 'award-origin',
        layout: 'story',
        title: 'The Origin',
        date: 'Grade 6 onward',
        description: 'I started learning coding in grade 6, then kept exploring through private experiments, IoT builds, and small systems that taught me how software connects with the physical world.',
        url: '#',
        gallery: [
            { label: 'IoT Prototyping', date: 'Hardware Experiments', image: '/textures/about/img/iot-lksai-nasional.webp', url: '#' },
            { label: 'Code Meets Hardware', date: 'Software + Devices', image: '/textures/about/img/iot.webp', url: '#' }
        ],
        platformConfig: { label: 'THE ORIGIN', color: '#1a1a1a', icon: '🚀' }
    },
    competitor: {
        id: 'award-competitor',
        layout: 'story',
        title: 'The Competitor',
        date: 'City & Bali Province',
        description: 'Competitions helped sharpen my discipline across web and AI. LKS gave me room to test my skills under pressure, from city-level web achievements to province-level web and AI results.',
        url: '#',
        gallery: [
            { label: 'LKS Web Technologies', date: 'City Level', image: '/textures/about/img/lkskotaweb.webp', url: '#' },
            { label: 'LKS Web Technologies', date: 'Bali Province', image: '/textures/about/img/lkswebprov.webp', url: '#' }
        ],
        platformConfig: { label: 'THE COMPETITOR', color: '#1a1a1a', icon: '🏆' }
    },
    realworld: {
        id: 'award-realworld',
        layout: 'story',
        title: 'Real World Impact',
        date: 'SMK years',
        description: 'During SMK, exploration turned into delivery. I worked on websites, dashboards, academic systems, company projects, and production-level needs where curiosity matured into responsibility.',
        url: '#',
        gallery: [
            { label: 'Mahaputra Dashboard', date: 'Operational System', image: '/textures/about/img/mahaputra.webp', url: '#' },
            { label: 'Iraga Coffee', date: 'Web Experience', image: '/textures/about/img/iragacoffee.webp', url: '#' }
        ],
        platformConfig: { label: 'REAL WORLD', color: '#1a1a1a', icon: '🌍' }
    }
};

const AwardsMilestone = ({ z, scrollProgressRef }) => {
    const isTouch = isTouchDevice();
    const { openOverlay } = useScene();
    const groupRef = useRef();
    const originRef = useRef();
    const competitorRef = useRef();
    const realworldRef = useRef();

    const buttonTexture = useLoader(THREE.TextureLoader, '/textures/about/button.webp');
    const buttonPaintedTexture = useLoader(THREE.TextureLoader, isTouch ? '/textures/about/button.webp' : '/textures/about/button_painted.webp');
    buttonTexture.colorSpace = THREE.SRGBColorSpace;
    buttonPaintedTexture.colorSpace = THREE.SRGBColorSpace;

    const buttonLegacyAspect = 894 / 208;
    const buttonHeight = 0.35;
    const buttonWidth = buttonHeight * buttonLegacyAspect;
    const buttonY = -1.5;

    useFrame(() => {
        if (!groupRef.current) return;
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;
        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;
        if (!groupRef.current.visible) return;

        const distanceZ = z + scrollProgress - 55;
        const revealStart = -120;
        const revealEnd = -50;
        let revealFactor = 0;
        if (distanceZ > revealStart && distanceZ < revealEnd) {
            revealFactor = (distanceZ - revealStart) / (revealEnd - revealStart);
            revealFactor = Math.min(1, Math.max(0, revealFactor));
            revealFactor = revealFactor * revealFactor;
        } else if (distanceZ >= revealEnd) {
            revealFactor = 1;
        }

        const originStart = -80;
        const originEnd = -20;
        let originFactor = 0;
        if (distanceZ > originStart && distanceZ < originEnd) {
            originFactor = (distanceZ - originStart) / (originEnd - originStart);
            originFactor = Math.min(1, Math.max(0, originFactor));
            originFactor = 1 - Math.pow(1 - originFactor, 2);
        } else if (distanceZ >= originEnd) {
            originFactor = 1;
        }

        const spreadX = 5;
        if (competitorRef.current) competitorRef.current.position.x = -revealFactor * spreadX;
        if (realworldRef.current) realworldRef.current.position.x = revealFactor * spreadX;
        if (originRef.current) originRef.current.position.y = 0.5 + originFactor * 2.5;
    });

    return (
        <group ref={groupRef} position={[0, 2, z]}>
            <Text position={[0, 4, 0]} fontSize={1.2} color={titleColor()} anchorX="center" anchorY="middle" font="/fonts/RubikScribble-Regular.ttf">
                MILESTONES
            </Text>

            <group ref={competitorRef} position={[0, 0.5, -0.5]}>
                <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                    <mesh position={[0, 0, 0]}>
                        <octahedronGeometry args={[1, 0]} />
                        <meshBasicMaterial color={wireColor()} wireframe />
                    </mesh>
                </Float>
                <AwardButton onClick={(e) => { e.stopPropagation(); openOverlay(AWARDS_DATA.competitor); }} texture={buttonTexture} paintedTexture={buttonPaintedTexture} width={buttonWidth} height={buttonHeight} position={[0, buttonY, 0.05]} label="EXPLORE" />
                <Text position={[0, 1.5, 0.01]} fontSize={0.45} color={titleColor()} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Bold.ttf">
                    THE COMPETITOR
                </Text>
            </group>

            <group ref={realworldRef} position={[0, 0.5, -0.2]}>
                <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1}>
                    <mesh position={[0, 0, 0]}>
                        <sphereGeometry args={[1, 16, 16]} />
                        <meshBasicMaterial color={wireColor()} wireframe />
                    </mesh>
                </Float>
                <AwardButton onClick={(e) => { e.stopPropagation(); openOverlay(AWARDS_DATA.realworld); }} texture={buttonTexture} paintedTexture={buttonPaintedTexture} width={buttonWidth} height={buttonHeight} position={[0, buttonY, 0.05]} label="EXPLORE" />
                <Text position={[0, 1.5, 0.01]} fontSize={0.45} color={titleColor()} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Bold.ttf">
                    REAL WORLD
                </Text>
            </group>

            <group ref={originRef} position={[0, 0.5, 0]}>
                <Float speed={3} rotationIntensity={2} floatIntensity={2}>
                    <mesh position={[0, 0, 0]}>
                        <icosahedronGeometry args={[1, 0]} />
                        <meshBasicMaterial color={isBlueprintMode() ? BLUEPRINT_THEME.paper : '#1a1a1a'} wireframe />
                    </mesh>
                </Float>
                <AwardButton onClick={(e) => { e.stopPropagation(); openOverlay(AWARDS_DATA.origin); }} texture={buttonTexture} paintedTexture={buttonPaintedTexture} width={buttonWidth} height={buttonHeight} position={[0, buttonY, 0.05]} label="EXPLORE" />
                <Text position={[0, 1.5, 0.01]} fontSize={0.45} color={titleColor()} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Bold.ttf">
                    THE ORIGIN
                </Text>
            </group>
        </group>
    );
};

const BALLOON_CONFIG = [
    { texture: '/textures/about/react.webp', paintedTexture: '/textures/about/react_painted.webp', label: 'React', size: 'large', x: -1.5, y: 4, z: 0.1, phase: 2 },
    { texture: '/textures/about/js.webp', paintedTexture: '/textures/about/js_painted.webp', label: 'JavaScript', size: 'large', x: -2.5, y: 2, z: 0.4, phase: 0 },
    { texture: '/textures/about/ts.webp', paintedTexture: '/textures/about/ts_painted.webp', label: 'TypeScript', size: 'large', x: 2.5, y: 2.5, z: 0.2, phase: 1.5 },
    { texture: '/textures/about/php.webp', paintedTexture: '/textures/about/php_painted.webp', label: 'PHP', size: 'large', x: 0, y: 3.5, z: 0.5, phase: 3 },
    { texture: '/textures/about/next.webp', paintedTexture: '/textures/about/next_painted.webp', label: 'Next.js', size: 'medium', x: -4, y: 1.5, z: -0.3, phase: 0.8 },
    { texture: '/textures/about/flutter.webp', paintedTexture: '/textures/about/flutter_painted.webp', label: 'Flutter', size: 'medium', x: 0, y: 1, z: -0.4, phase: 4 },
    { texture: '/textures/about/pytorch.webp', paintedTexture: '/textures/about/pytorch_painted.webp', label: 'PyTorch', size: 'medium', x: 4, y: 2, z: -0.2, phase: 2.2 },
    { texture: '/textures/about/laravel.webp', paintedTexture: '/textures/about/laravel_painted.webp', label: 'Laravel', size: 'medium', x: 3.5, y: 0.5, z: -0.5, phase: 3.1 },
    { texture: '/textures/about/cpp.webp', paintedTexture: '/textures/about/cpp_painted.webp', label: 'C / C++', size: 'medium', x: -3.5, y: 0, z: -0.2, phase: 1.7 },
    { texture: '/textures/about/python.webp', paintedTexture: '/textures/about/python_painted.webp', label: 'Python', size: 'medium', x: 1.5, y: 4, z: 0.3, phase: 1.2 },
    { texture: '/textures/about/psql.webp', paintedTexture: '/textures/about/psql_painted.webp', label: 'PostgreSQL', size: 'small', x: 4.5, y: 1, z: -0.6, phase: 1.1 },
    { texture: '/textures/about/git.webp', paintedTexture: '/textures/about/git_painted.webp', label: 'Git', size: 'small', x: 5.5, y: 3, z: -0.7, phase: 2.8 },
    { texture: '/textures/about/figma.webp', paintedTexture: '/textures/about/figma_painted.webp', label: 'Figma', size: 'small', x: -5.5, y: 2.5, z: -0.8, phase: 1.2 },
    { texture: '/textures/about/firebase.webp', paintedTexture: '/textures/about/firebase_painted.webp', label: 'Firebase', size: 'small', x: -3, y: 5.5, z: -0.5, phase: 3.5 },
    { texture: '/textures/about/docker.webp', paintedTexture: '/textures/about/docker_painted.webp', label: 'Docker', size: 'small', x: 3.5, y: 4.5, z: -0.6, phase: 4.5 },
    { texture: '/textures/about/iot.webp', paintedTexture: '/textures/about/iot_painted.webp', label: 'IoT (Arduino/ESP)', size: 'small', x: -1.5, y: 6, z: -0.7, phase: 2.5 },
];

const SIZE_MULTIPLIERS = {
    large: 3.0,
    medium: 2.2,
    small: 1.6,
};

const SkillBalloon = ({ config, revealFactorRef, spreadFactorRef, timeRef }) => {
    const { discoverSecret } = useSecrets();
    const isTouch = isTouchDevice();
    const texture = useLoader(THREE.TextureLoader, config.texture);
    const paintedTextureUrl = isTouch ? config.texture : config.paintedTexture;
    const paintedTexture = useLoader(THREE.TextureLoader, paintedTextureUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    paintedTexture.colorSpace = THREE.SRGBColorSpace;

    const [isPopping, setIsPopping] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [isFadingOutText, setIsFadingOutText] = useState(false);
    const popRef = useRef(0);
    const textFadeRef = useRef(1);
    const respawnOffsetRef = useRef(0);
    const balloonRevealRef = useRef();
    const paintedMeshRef = useRef();
    const paintedMatRef = useRef();
    const hideDelayRef = useRef();
    const textRef = useRef();
    const balloonAudioRef = useRef();
    const { globalVolume, isMuted } = useAudio();

    const playBalloonSound = () => {
        if (balloonAudioRef.current) {
            const vol = isMuted ? 0 : BALLOON_AUDIO_SETTINGS.volume * globalVolume;
            balloonAudioRef.current.setVolume(vol);
            if (balloonAudioRef.current.isPlaying) balloonAudioRef.current.stop();
            balloonAudioRef.current.play();
        }
    };

    const aspect = 1;
    const baseHeight = SIZE_MULTIPLIERS[config.size];
    const outerGroupRef = useRef();
    const innerGroupRef = useRef();
    const targetScale = useRef(1.0);
    const currentScale = useRef(1.0);
    const targetMagnet = useRef({ x: 0, y: 0 });
    const currentMagnet = useRef({ x: 0, y: 0 });
    const positionScale = isTouch ? 0.5 : 1;
    const spreadScale = isTouch ? 0.4 : 1;
    const sizeScale = isTouch ? 0.85 : 1;

    useEffect(() => {
        document.body.style.cursor = hovered && !isPopping ? 'pointer' : 'auto';
    }, [hovered, isPopping]);

    useEffect(() => {
        if (!isPopping) return undefined;
        const timer = setTimeout(() => setIsFadingOutText(true), 3000);
        return () => clearTimeout(timer);
    }, [isPopping]);

    const handlePointerOver = (e) => {
        if (isTouch) return;
        e.stopPropagation();
        if (!isPopping) setHovered(true);
        if (balloonRevealRef.current) {
            gsap.to(balloonRevealRef.current, { uProgress: 1.0, duration: 0.8, ease: 'power2.out', overwrite: true });
        }
        if (hideDelayRef.current) hideDelayRef.current.kill();
        if (paintedMeshRef.current) paintedMeshRef.current.visible = true;
        if (paintedMatRef.current) paintedMatRef.current.opacity = 1;
    };

    const handlePointerOut = (e) => {
        if (isTouch) return;
        e.stopPropagation();
        setHovered(false);
        if (balloonRevealRef.current) {
            gsap.to(balloonRevealRef.current, { uProgress: 0.0, duration: 0.5, ease: 'power2.out', overwrite: true });
        }
        hideDelayRef.current = gsap.delayedCall(0.55, () => {
            if (paintedMatRef.current) paintedMatRef.current.opacity = 0;
        });
    };

    useFrame((_, delta) => {
        targetScale.current = hovered && !isPopping ? 1.05 : 1.0;
        if (!hovered || isPopping) {
            targetMagnet.current.x = 0;
            targetMagnet.current.y = 0;
        }

        currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale.current, 8 * delta);
        currentMagnet.current.x = THREE.MathUtils.lerp(currentMagnet.current.x, targetMagnet.current.x, 8 * delta);
        currentMagnet.current.y = THREE.MathUtils.lerp(currentMagnet.current.y, targetMagnet.current.y, 8 * delta);

        if (isPopping) {
            popRef.current = THREE.MathUtils.lerp(popRef.current, 1, 2.5 * delta);
            if (hideDelayRef.current) hideDelayRef.current.kill();
            if (balloonRevealRef.current) balloonRevealRef.current.uProgress = 0;
        }

        if (isFadingOutText) {
            textFadeRef.current = THREE.MathUtils.lerp(textFadeRef.current, 0, 2 * delta);
            if (textFadeRef.current < 0.05) {
                setIsPopping(false);
                setHovered(false);
                setIsFadingOutText(false);
                popRef.current = 0;
                textFadeRef.current = 1;
                respawnOffsetRef.current = -12;
                if (outerGroupRef.current) outerGroupRef.current.position.y -= 12;
                if (balloonRevealRef.current) balloonRevealRef.current.opacity = 1;
                if (textRef.current) textRef.current.fillOpacity = 0;
                if (balloonRevealRef.current) balloonRevealRef.current.uProgress = 0;
                if (paintedMatRef.current) paintedMatRef.current.opacity = 0;
                if (paintedMeshRef.current) paintedMeshRef.current.visible = false;
            }
        }

        if (respawnOffsetRef.current < -0.01) {
            respawnOffsetRef.current = THREE.MathUtils.lerp(respawnOffsetRef.current, 0, 1.5 * delta);
        }

        if (balloonRevealRef.current && isPopping) balloonRevealRef.current.opacity = 1 - popRef.current;
        if (paintedMatRef.current && isPopping) paintedMatRef.current.opacity = 1 - popRef.current;
        if (textRef.current && isPopping) {
            textRef.current.fillOpacity = popRef.current * textFadeRef.current;
            textRef.current.outlineOpacity = popRef.current * textFadeRef.current;
        }
    });

    const baseX = config.x * positionScale;

    useFrame(() => {
        if (!outerGroupRef.current) return;
        const time = timeRef.current;
        const revealFactor = revealFactorRef.current;
        const spreadFactor = spreadFactorRef.current;

        const floatY = Math.sin(time * 0.6 + config.phase) * 0.3;
        const floatX = Math.sin(time * 0.4 + config.phase * 0.7) * 0.15;
        const rotation = Math.sin(time * 0.3 + config.phase) * 0.08;
        const startY = config.y - 8;
        const endY = config.y;
        const currentY = startY + revealFactor * (endY - startY) + floatY + respawnOffsetRef.current;

        let scale = revealFactor * sizeScale;
        const popScaleEffect = currentScale.current + popRef.current * 0.4;
        scale *= popScaleEffect;

        const maxSpread = 15 * spreadScale;
        let spreadX = 0;
        if (config.x < -0.5) {
            spreadX = -spreadFactor * maxSpread * (0.5 + Math.abs(config.x) / 6);
        } else if (config.x > 0.5) {
            spreadX = spreadFactor * maxSpread * (0.5 + Math.abs(config.x) / 6);
        } else {
            spreadX = config.phase > 3.5 ? spreadFactor * maxSpread * 0.8 : -spreadFactor * maxSpread * 0.8;
        }

        outerGroupRef.current.position.set(baseX + floatX + spreadX, currentY, config.z);
        outerGroupRef.current.rotation.z = rotation;
        const s = Math.max(0.001, scale);
        outerGroupRef.current.scale.set(s, s, s);
        if (innerGroupRef.current) innerGroupRef.current.position.set(currentMagnet.current.x, currentMagnet.current.y, 0);
    });

    const handlePop = (e) => {
        e.stopPropagation();
        if (isPopping) return;
        setIsPopping(true);
        playBalloonSound();
        if (config.label === 'IoT (Arduino/ESP)') {
            discoverSecret(SECRET_IDS.ABOUT_IOT);
        }
    };

    return (
        <group ref={outerGroupRef} position={[baseX, config.y - 8, config.z]}>
            <group ref={innerGroupRef}>
                <mesh ref={paintedMeshRef} visible>
                    <planeGeometry args={[baseHeight * aspect, baseHeight]} />
                    <meshBasicMaterial color={isBlueprintMode() ? BLUEPRINT_THEME.paper : '#e0e0e0'} ref={paintedMatRef} map={paintedTexture} transparent opacity={0} side={THREE.DoubleSide} alphaTest={0.5} depthWrite={false} />
                </mesh>

                <mesh
                    position={[0, 0, 0.001]}
                    onPointerDown={handlePop}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                    onPointerMove={(e) => {
                        if (hovered && !isPopping && outerGroupRef.current) {
                            outerGroupRef.current.getWorldPosition(_tempVec3);
                            targetMagnet.current.x = (e.point.x - _tempVec3.x) * 0.15;
                            targetMagnet.current.y = (e.point.y - _tempVec3.y) * 0.15;
                        }
                    }}
                    visible={popRef.current < 0.99}
                >
                    <planeGeometry args={[baseHeight * aspect, baseHeight]} />
                    <revealBasicMaterial ref={balloonRevealRef} map={texture} transparent side={THREE.DoubleSide} depthWrite={false} uProgress={0.0} />
                </mesh>

                {isPopping && textFadeRef.current > 0.01 && (
                    <Text
                        ref={textRef}
                        position={[0, 0, 0.1]}
                        fontSize={baseHeight * 0.4}
                        color={titleColor()}
                        anchorX="center"
                        anchorY="middle"
                        font="/fonts/RubikScribble-Regular.ttf"
                        fillOpacity={0}
                        outlineWidth={0.02}
                        outlineColor={labelOutline()}
                        outlineOpacity={0}
                    >
                        {config.label}
                    </Text>
                )}

                {isBlueprintMode() && config.label === 'IoT (Arduino/ESP)' && !isPopping && (
                    <Text
                        position={[0, -1.45, 0.12]}
                        fontSize={0.09}
                        color={BLUEPRINT_THEME.line}
                        anchorX="center"
                        anchorY="middle"
                        font="/fonts/CabinSketch-Regular.ttf"
                        outlineWidth={0.02}
                        outlineColor={BLUEPRINT_THEME.background}
                    >
                        {'hardware curiosity'}
                    </Text>
                )}

                <PositionalAudio ref={balloonAudioRef} url="/sounds/baloonpoop.mp3" distanceModel="exponential" rolloffFactor={BALLOON_AUDIO_SETTINGS.rolloff} refDistance={BALLOON_AUDIO_SETTINGS.distance} loop={false} />
            </group>
        </group>
    );
};

const SkillsMilestone = ({ z, scrollProgressRef }) => {
    const groupRef = useRef();
    const revealFactorRef = useRef(0);
    const spreadFactorRef = useRef(0);
    const timeRef = useRef(0);

    useFrame((state) => {
        if (!groupRef.current) return;
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;
        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;
        if (!groupRef.current.visible) return;

        timeRef.current = state.clock.elapsedTime;
        const distanceZ = z + scrollProgress - 55;

        const revealStart = -100;
        const revealEnd = -25;
        let newRevealFactor = 0;
        if (distanceZ > revealStart && distanceZ < revealEnd) {
            newRevealFactor = (distanceZ - revealStart) / (revealEnd - revealStart);
            newRevealFactor = Math.min(1, Math.max(0, newRevealFactor));
            newRevealFactor = 1 - Math.pow(1 - newRevealFactor, 3);
        } else if (distanceZ >= revealEnd) {
            newRevealFactor = 1;
        }
        revealFactorRef.current = newRevealFactor;

        const spreadStart = -70;
        const spreadEnd = -40;
        let newSpreadFactor = 0;
        if (distanceZ > spreadStart && distanceZ < spreadEnd) {
            newSpreadFactor = (distanceZ - spreadStart) / (spreadEnd - spreadStart);
            newSpreadFactor = Math.min(1, Math.max(0, newSpreadFactor));
            newSpreadFactor = newSpreadFactor * newSpreadFactor;
        } else if (distanceZ >= spreadEnd) {
            newSpreadFactor = 1;
        }
        spreadFactorRef.current = newSpreadFactor;
    });

    return (
        <group ref={groupRef} position={[0, 0, z]}>
            <Text position={[0, 6, 0.5]} fontSize={1.2} color={titleColor()} anchorX="center" anchorY="middle" font="/fonts/RubikScribble-Regular.ttf">
                SKILLS
            </Text>
            <Text position={[0, 5.2, 0.5]} fontSize={0.4} color={bodyColor()} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Regular.ttf">
                The Core Pillars
            </Text>
            <Text position={[0, 4.6, 0.5]} fontSize={0.25} color={bodyColor()} anchorX="center" anchorY="middle" font="/fonts/CabinSketch-Regular.ttf" maxWidth={6} textAlign="center">
                {'Web engineering at the core, with curiosity stretching into AI, cybersecurity, IoT, and embedded systems.'}
            </Text>

            {BALLOON_CONFIG.map((config, index) => (
                <SkillBalloon key={index} config={config} revealFactorRef={revealFactorRef} spreadFactorRef={spreadFactorRef} timeRef={timeRef} />
            ))}
        </group>
    );
};

export default InfiniteSkyManager;
