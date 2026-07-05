import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { isTouchDevice } from '../../utils/deviceDetect';

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Disable on touch devices
        if (isTouchDevice()) return;

        // Make cursor visible on first mouse movement
        const onMouseMoveInitial = () => {
            setIsVisible(true);
            window.removeEventListener('mousemove', onMouseMoveInitial);
        };
        window.addEventListener('mousemove', onMouseMoveInitial);

        // GSAP quick setter for performance
        const xSet = gsap.quickSetter(cursorRef.current, "x", "px");
        const ySet = gsap.quickSetter(cursorRef.current, "y", "px");

        const onMouseMove = (e) => {
            // Slight smoothing
            gsap.to(cursorRef.current, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.15,
                ease: "power2.out",
                overwrite: "auto"
            });
        };

        window.addEventListener('mousemove', onMouseMove);
        
        // Observe body cursor style changes (done by R3F and our code)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const currentCursor = document.body.style.cursor;
                    if (currentCursor === 'pointer') {
                        setIsHovering(true);
                    } else if (currentCursor === 'auto' || currentCursor === 'default' || currentCursor === '') {
                        setIsHovering(false);
                    }
                }
            });
        });

        // Add a global style to hide the real cursor completely
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
            * { cursor: none !important; }
        `;
        document.head.appendChild(styleEl);

        observer.observe(document.body, { attributes: true });

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousemove', onMouseMoveInitial);
            observer.disconnect();
            document.head.removeChild(styleEl);
        };
    }, []);

    if (isTouchDevice()) return null;

    return (
        <div
            ref={cursorRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 99999,
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.3s ease',
            }}
        >
            <img 
                src={isHovering ? '/cursors/cursor-pointer.webp' : '/cursors/cursor-default.webp'} 
                alt="cursor"
                style={{
                    width: isHovering ? '40px' : '32px',
                    height: isHovering ? '40px' : '32px',
                    objectFit: 'contain',
                    transform: isHovering ? 'translate(-40%, -10%)' : 'translate(-10%, -10%)',
                    transition: 'width 0.2s, height 0.2s, transform 0.2s',
                    filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))'
                }}
            />
        </div>
    );
};

export default CustomCursor;
