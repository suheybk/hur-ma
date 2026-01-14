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
    <img
      src="/hurma-icons/icon-palm.svg"
      alt="Hur"
      width={icon}
      height={icon}
      className="inline-block object-contain"
    />
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
