'use client';
import { useEffect, useState } from 'react';

export default function MouseGlow() {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate position as percentage for CSS variables
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setPosition({ x, y });
      
      // Update global CSS variables for the background gradient
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="mouse-glow"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%` 
      }} 
    />
  );
}
