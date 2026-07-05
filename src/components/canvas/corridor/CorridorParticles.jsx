import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePerformance } from '../../../context/PerformanceContext';

const CorridorParticles = ({ count = 300, length = 100, zOffset = 0 }) => {
    const meshRef = useRef();
    const { tier } = usePerformance();

    // Reduce particles on lower end devices
    const particleCount = useMemo(() => {
        if (tier === 'LOW') return Math.floor(count * 0.2);
        if (tier === 'MEDIUM') return Math.floor(count * 0.5);
        return count;
    }, [count, tier]);

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const corridorWidth = 4;
    const corridorHeight = 3.5;

    // Generate random positions, phases and speeds for particles
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * corridorWidth * 0.9;
            const y = (Math.random() - 0.5) * corridorHeight * 0.9;
            // Spread across the corridor length
            const z = zOffset + length / 2 - Math.random() * length;

            temp.push({
                x, y, z,
                speedX: (Math.random() - 0.5) * 0.05,
                speedY: (Math.random() - 0.5) * 0.05 + 0.02, // slight upward tendency
                phase: Math.random() * Math.PI * 2,
                scale: Math.random() * 0.02 + 0.01 // very small dust
            });
        }
        return temp;
    }, [particleCount, length, zOffset]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const time = state.clock.elapsedTime;

        particles.forEach((particle, i) => {
            // Very gentle floating movement
            const px = particle.x + Math.sin(time * 0.5 + particle.phase) * 0.1;
            let py = particle.y + Math.sin(time * 0.3 + particle.phase) * 0.1 + (time * particle.speedY) % corridorHeight;
            const pz = particle.z + Math.cos(time * 0.4 + particle.phase) * 0.1;

            // Wrap around Y axis
            if (py > corridorHeight / 2) py -= corridorHeight;

            dummy.position.set(px, py, pz);
            dummy.scale.setScalar(particle.scale);
            // Slight rotation for the dust particles
            dummy.rotation.x = time * particle.speedX * 5;
            dummy.rotation.y = time * particle.speedY * 5;
            
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    if (particleCount === 0) return null;

    return (
        <instancedMesh ref={meshRef} args={[null, null, particleCount]} raycast={() => null}>
            <planeGeometry args={[1, 1]} />
            {/* Soft, somewhat transparent dust material */}
            <meshBasicMaterial 
                color="#bbaea0" 
                transparent 
                opacity={0.3} 
                depthWrite={false} 
                side={THREE.DoubleSide} 
            />
        </instancedMesh>
    );
};

export default CorridorParticles;
