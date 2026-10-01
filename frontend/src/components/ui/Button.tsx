import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-gradient text-white shadow-md hover:brightness-110',
  secondary: 'border border-brand-purple text-brand-purple hover:bg-brand-purple/10',
  ghost: 'text-brand-blue hover:bg-brand-blue/10',
};

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-purple ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
