import logoPrincipal from '../../assets/logo/logosemtexto.png';
import logoClara from '../../assets/logo/logobranca.png';

export interface LogoProps {
  /** "principal" para fundo claro (cabeçalho), "clara" para fundo escuro (rodapé). */
  variant?: 'principal' | 'clara';
  className?: string;
}

export function Logo({ variant = 'principal', className = 'h-8 w-auto' }: LogoProps) {
  const src = variant === 'clara' ? logoClara : logoPrincipal;

  return <img src={src} alt="" className={className} />;
}
