import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  withTagline?: boolean;
  className?: string;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  size = 'md',
  withText = false,
  withTagline = false,
  className = ''
}) => {
  // Dimensions map
  const sizeMap = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36 sm:w-44 sm:h-44'
  };

  const glowSizeMap = {
    xs: '-inset-1',
    sm: '-inset-1.5',
    md: '-inset-2',
    lg: '-inset-3',
    xl: '-inset-4'
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      {/* Outer Animated Wrapper */}
      <motion.div
        className="relative flex items-center justify-center cursor-pointer select-none"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* 1. Pulsing Golden Divine Glow */}
        <motion.div
          className={`absolute ${glowSizeMap[size]} rounded-full bg-gradient-to-tr from-gold-600 via-amber-400 to-yellow-200 blur-xl pointer-events-none opacity-60`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.45, 0.75, 0.45],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* 2. Celestial Rotating Golden Orbit Ring */}
        <motion.div
          className={`absolute ${glowSizeMap[size]} rounded-full border border-gold-400/40 pointer-events-none`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#F5DE88] absolute -top-0.5 left-1/2 -translate-x-1/2" />
        </motion.div>

        {/* 3. The Logo Emblem with Floating Breath */}
        <motion.div
          className={`relative ${sizeMap[size]} rounded-full overflow-hidden shadow-2xl border-2 border-gold-500/80 bg-navy-950`}
          animate={{
            y: [-1.5, 1.5, -1.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <img
            src="/logo.png"
            alt="Faith & Creator Studio Logo"
            className="w-full h-full object-cover rounded-full"
          />

          {/* 4. Diagonal Divine Light Sweep Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              repeatDelay: 2.5,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Optional Brand Typography */}
      {withText && (
        <motion.div
          className="text-center mt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-ivory-50 via-gold-400 to-amber-200 tracking-wider">
            Faith & Creator Studio
          </h1>

          {/* Animated Gold Separator */}
          <motion.div
            className="h-0.5 w-24 mx-auto my-1.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent"
            animate={{ width: ['4rem', '8rem', '4rem'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {withTagline && (
            <p className="text-[11px] sm:text-xs text-amber-200/80 tracking-[0.25em] uppercase font-medium">
              Inspire • Create • Share
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};
