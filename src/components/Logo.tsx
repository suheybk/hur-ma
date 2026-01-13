'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
}

export default function Logo({ size = 'md', variant = 'full' }: LogoProps) {
  const sizes = {
    sm: { text: 'text-xl', icon: 24 },
    md: { text: 'text-3xl', icon: 32 },
    lg: { text: 'text-4xl', icon: 40 },
    xl: { text: 'text-5xl', icon: 48 },
  };

  const { text, icon } = sizes[size];

  const DateIcon = () => (
    <svg
      width={icon}
      height={icon}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
    >
      <ellipse cx="16" cy="18" rx="7" ry="10" fill="#D4A574" />
      <ellipse cx="16" cy="18" rx="5" ry="8" fill="#B8956A" />
      <ellipse cx="13" cy="14" rx="2" ry="3" fill="#E8C9A8" opacity="0.6" />
      <path d="M16 8 L16 10 Q14 9 13 7 Q14 8 16 8 Z" fill="#4A3728" />
      <path d="M16 8 L16 10 Q18 9 19 7 Q18 8 16 8 Z" fill="#4A3728" />
      <path d="M16 6 Q20 2 24 4 Q20 6 16 8 Z" fill="#6B8E23" opacity="0.8" />
      <path d="M16 6 Q12 2 8 4 Q12 6 16 8 Z" fill="#6B8E23" opacity="0.8" />
    </svg>
  );

  if (variant === 'icon') {
    return <DateIcon />;
  }

  return (
    <div className="flex items-center gap-1 select-none">
      <span
        className={`${text} font-bold tracking-tight`}
        style={{ fontFamily: "Playfair Display, serif", color: '#2C1810' }}
      >
        hur
      </span>
      <DateIcon />
      <span
        className={`${text} font-bold tracking-tight`}
        style={{ fontFamily: "Playfair Display, serif", color: '#2C1810' }}
      >
        ma
      </span>
    </div>
  );
}
