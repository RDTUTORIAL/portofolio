import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { usePerformance } from '../../../context/PerformanceContext';
import { useSecrets } from '../../../context/SecretsContext';
import { SECRET_IDS } from '../../../data/secretContent';
import { BLUEPRINT_THEME } from '../../../utils/blueprintTheme';

const isBlueprintMode = () => typeof document !== 'undefined' && document.documentElement.classList.contains('blueprint-mode');

const Secret404Tag = () => {
    const { discoverSecret } = useSecrets();

    return (
        <group position={[-1.55, -0.2, -0.9]} rotation={[0, 0.5, 0]}>
            <mesh
                onPointerDown={(e) => {
                    e.stopPropagation();
                    discoverSecret(SECRET_IDS.CORRIDOR_404);
                }}
            >
                <planeGeometry args={[0.35, 0.18]} />
                <meshBasicMaterial color="#f6f0e7" transparent opacity={0.95} />
            </mesh>
            <Text
                position={[0, 0, 0.01]}
                fontSize={0.08}
                color={isBlueprintMode() ? BLUEPRINT_THEME.line : '#555555'}
                font="/fonts/CabinSketch-Bold.ttf"
                anchorX="center"
                anchorY="middle"
            >
                {'404'}
            </Text>
        </group>
    );
};

const BlueprintThoughtBubble = () => {
    if (!isBlueprintMode()) return null;

    return (
        <Text
            position={[0.95, 1.08, 0.56]}
            fontSize={0.06}
            color={BLUEPRINT_THEME.line}
            font="/fonts/CabinSketch-Regular.ttf"
            anchorX="left"
            anchorY="middle"
        >
            {'curiosity > comfort'}
        </Text>
    );
};

const Doodles = () => {
    const groupRef = useRef();
    const { tier } = usePerformance();
    const { discoverSecret } = useSecrets();
    const isLowTier = tier === 'LOW';
    const coffeeClickRef = useRef(0);
    const coffeeSteamRef = useRef();

    useFrame((state) => {
        if (!coffeeSteamRef.current) return;
        const time = state.clock.elapsedTime;
        coffeeSteamRef.current.material.opacity = isBlueprintMode() ? 0.4 + Math.sin(time * 2) * 0.08 : 0.18 + Math.sin(time * 2) * 0.05;
    });

    const textures = useTexture({
        paperBall: '/textures/corridor/decorations/paper_ball.webp',
        paperAirplane: '/textures/corridor/decorations/paper_airplane.webp',
        pencil: '/textures/corridor/decorations/pencil.webp',
        coffeeCup: '/textures/corridor/decorations/coffee_cup.webp',
        coffeeSteam: '/textures/corridor/asap.png',
    });

    Object.values(textures).forEach((tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
    });

    return (
        <group ref={groupRef}>
            <Secret404Tag />
            <BlueprintThoughtBubble />
            <mesh ref={coffeeSteamRef} position={[1.2, 1.04, -0.09]} rotation={[0, 0, 0.08]} raycast={() => null}>
                <planeGeometry args={[0.48, 0.32]} />
                <meshBasicMaterial
                    color={isBlueprintMode() ? BLUEPRINT_THEME.line : '#ffffff'}
                    map={textures.coffeeSteam}
                    transparent
                    opacity={0.18}
                    alphaTest={0.04}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            <SketchElement
                texture={textures.paperAirplane}
                position={[0.5, 0.8, 0.3]}
                scale={0.55}
                rotationSpeed={0.15}
                floatSpeed={0.7}
                floatAmount={0.04}
                isInteractive
                onPointerDown={(e, innerRef) => {
                    e.stopPropagation();
                    if (innerRef.current) {
                        gsap.to(innerRef.current.rotation, {
                            x: innerRef.current.rotation.x + Math.PI * 2,
                            duration: 1,
                            ease: 'power2.inOut'
                        });
                    }
                }}
            />

            <SketchElement
                texture={textures.paperBall}
                position={[-0.9, -0.7, 0.4]}
                scale={0.4}
                rotationSpeed={0.4}
                floatSpeed={0.5}
                floatAmount={0.02}
            />

            <SketchElement
                texture={textures.paperBall}
                position={[-1.3, 0.5, -0.2]}
                scale={0.3}
                rotationSpeed={-0.3}
                floatSpeed={0.6}
                floatAmount={0.03}
            />

            <SketchElement
                texture={textures.pencil}
                position={[0.7, -0.8, 0.5]}
                scale={0.5}
                rotationSpeed={0.1}
                floatSpeed={0.4}
                floatAmount={0.02}
                initialRotation={-0.4}
            />

            <SketchElement
                texture={textures.coffeeCup}
                position={[1.2, 0.6, -0.1]}
                scale={0.35}
                rotationSpeed={0.05}
                floatSpeed={0.35}
                floatAmount={0.025}
                isInteractive
                onPointerDown={(e, innerRef) => {
                    e.stopPropagation();

                    if (innerRef.current) {
                        gsap.fromTo(innerRef.current.scale,
                            { x: 0.8, y: 0.8, z: 0.8 },
                            { x: 1, y: 1, z: 1, duration: 0.3, ease: 'back.out(2)' }
                        );
                    }

                    coffeeClickRef.current += 1;
                    if (coffeeClickRef.current >= 2) {
                        discoverSecret(SECRET_IDS.CORRIDOR_COFFEE);
                    }
                }}
            />

            {!isLowTier && (
                <>
                    <AnimatedStar position={[-1.5, 1.2, 0]} scale={0.1} speed={0.4} />
                    <AnimatedStar position={[1.6, 0.8, -0.5]} scale={0.08} speed={0.5} />
                    <AnimatedStar position={[-1.2, 0.1, 0.5]} scale={0.06} speed={0.3} />
                    <AnimatedStar position={[1.3, 1.4, -1]} scale={0.07} speed={0.6} />

                    <DoodleCircle position={[1.2, -0.2, 0.2]} scale={0.05} />
                    <DoodleCircle position={[-1.3, 1.0, 0.3]} scale={0.04} />

                    <Squiggle position={[-1.6, 0.5, -0.3]} rotation={0.2} />
                    <Squiggle position={[1.4, 0.3, 0.2]} rotation={-0.3} />

                    <ThoughtBubble position={[0.9, 0.7, 0.5]} />
                </>
            )}
        </group>
    );
};

const SketchElement = ({
    texture,
    position,
    scale = 0.3,
    rotationSpeed = 0.1,
    floatSpeed = 0.5,
    floatAmount = 0.03,
    initialRotation = 0,
    isInteractive = false,
    onPointerDown
}) => {
    const ref = useRef();
    const innerRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        if (isInteractive) {
            document.body.style.cursor = hovered ? 'pointer' : 'auto';
        }
        return () => {
            if (isInteractive && hovered) document.body.style.cursor = 'auto';
        };
    }, [hovered, isInteractive]);

    useEffect(() => {
        if (texture.image) {
            const aspectRatio = texture.image.width / texture.image.height;
            setDimensions({
                width: scale * aspectRatio,
                height: scale
            });
        }
    }, [texture, scale]);

    useFrame((state) => {
        if (!ref.current) return;
        const time = state.clock.elapsedTime;
        ref.current.position.y = position[1] + Math.sin(time * floatSpeed + position[0]) * floatAmount;
        ref.current.rotation.z = initialRotation + Math.sin(time * rotationSpeed) * 0.1;
        const pulse = 1 + Math.sin(time * 1.5 + position[0] * 2) * 0.03;
        ref.current.scale.setScalar(pulse);
    });

    return (
        <group ref={ref} position={position}>
            <group ref={innerRef}>
                <mesh position={[0.01, -0.01, -0.01]} raycast={() => null}>
                    <planeGeometry args={[dimensions.width, dimensions.height]} />
                    <meshBasicMaterial color="#e0e0e0" map={texture} transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} alphaTest={0.5} />
                </mesh>
                <mesh>
                    <planeGeometry args={[dimensions.width, dimensions.height]} />
                    <meshBasicMaterial color="#e0e0e0" map={texture} transparent side={THREE.DoubleSide} depthWrite={false} alphaTest={0.5} />
                </mesh>
                <mesh
                    position={[0, 0, 0.02]}
                    onPointerDown={onPointerDown ? (e) => onPointerDown(e, innerRef) : undefined}
                    onPointerOver={isInteractive ? (e) => { e.stopPropagation(); setHovered(true); } : undefined}
                    onPointerOut={isInteractive ? (e) => { e.stopPropagation(); setHovered(false); } : undefined}
                >
                    <planeGeometry args={[dimensions.width, dimensions.height]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>
            </group>
        </group>
    );
};

const AnimatedStar = ({ position, scale = 0.1, speed = 0.5 }) => {
    const ref = useRef();

    useFrame((state) => {
        if (ref.current) {
            const time = state.clock.elapsedTime;
            ref.current.rotation.z = time * speed;
            ref.current.position.y = position[1] + Math.sin(time * 0.8 + position[0]) * 0.03;
            ref.current.scale.setScalar(scale * (1 + Math.sin(time * 2) * 0.15));
        }
    });

    return (
        <group ref={ref} position={position} scale={scale}>
            {[0, 1, 2, 3].map((i) => (
                <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
                    <planeGeometry args={[1, 0.12]} />
                    <meshBasicMaterial color="#2a2a2a" transparent opacity={0.7} side={2} />
                </mesh>
            ))}
        </group>
    );
};

const Squiggle = ({ position, rotation = 0 }) => {
    const ref = useRef();

    useFrame((state) => {
        if (ref.current) {
            const time = state.clock.elapsedTime;
            ref.current.position.x = position[0] + Math.sin(time * 0.5) * 0.02;
        }
    });

    return (
        <group ref={ref} position={position} rotation={[0, 0, rotation]}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <mesh key={i} position={[i * 0.07, Math.sin(i * 1.5) * 0.035, 0]}>
                    <circleGeometry args={[0.015, 8]} />
                    <meshBasicMaterial color="#444" transparent opacity={0.5} />
                </mesh>
            ))}
        </group>
    );
};

const DoodleCircle = ({ position, scale = 0.08 }) => {
    const ref = useRef();

    useFrame((state) => {
        if (ref.current) {
            const time = state.clock.elapsedTime;
            const pulse = 1 + Math.sin(time * 2) * 0.1;
            ref.current.scale.setScalar(scale * pulse);
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <ringGeometry args={[0.6, 1, 12]} />
            <meshBasicMaterial color="#333" transparent opacity={0.4} side={2} />
        </mesh>
    );
};

const ThoughtBubble = ({ position }) => {
    const ref = useRef();
    const contentRef = useRef();

    useFrame((state) => {
        if (ref.current) {
            const time = state.clock.elapsedTime;
            ref.current.position.y = position[1] + Math.sin(time * 0.6) * 0.02;
        }

        if (contentRef.current) {
            const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
            contentRef.current.material.opacity = pulse;
        }
    });

    return (
        <group ref={ref} position={position}>
            <mesh>
                <circleGeometry args={[0.12, 16]} />
                <meshBasicMaterial color="#fff" />
            </mesh>
            <mesh>
                <ringGeometry args={[0.11, 0.13, 16]} />
                <meshBasicMaterial color="#333" />
            </mesh>
            <mesh position={[-0.1, -0.1, 0]}>
                <circleGeometry args={[0.035, 8]} />
                <meshBasicMaterial color="#fff" />
            </mesh>
            <mesh position={[-0.1, -0.1, 0]}>
                <ringGeometry args={[0.03, 0.04, 8]} />
                <meshBasicMaterial color="#333" />
            </mesh>
            <mesh ref={contentRef} position={[0, 0, 0.01]}>
                <planeGeometry args={[0.05, 0.06]} />
                <meshBasicMaterial color="#111111" transparent opacity={0.9} />
            </mesh>
        </group>
    );
};

export default Doodles;
