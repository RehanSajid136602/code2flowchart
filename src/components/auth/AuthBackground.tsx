'use client';

import React, { useEffect } from 'react';

const AuthBackground: React.FC = () => {
    useEffect(() => {
        const container = document.getElementById('particles');
        if (!container) return;

        const particleCount = 30;
        const particles: HTMLDivElement[] = [];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = 15 + Math.random() * 10 + 's';

            // Randomize initial top position to prevent all particles from starting at the bottom simultaneously
            particle.style.top = Math.random() * 100 + 'vh';

            container.appendChild(particle);
            particles.push(particle);
        }

        return () => {
            particles.forEach(p => p.remove());
        };
    }, []);

    return (
        <div className="auth-bg-effects">
            <div className="particles" id="particles" />
        </div>
    );
};

export default AuthBackground;
