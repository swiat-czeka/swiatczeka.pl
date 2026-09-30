import { Facebook, Instagram, Youtube } from 'lucide-react';
import { socials } from '@/lib/site';

const icons = { facebook: Facebook, youtube: Youtube, instagram: Instagram };

export function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <ul className={`social-links ${className}`.trim()} aria-label="Media społecznościowe">
      {socials.map((social) => {
        const Icon = icons[social.icon];
        return (
          <li key={social.label}>
            <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} title={social.label}><Icon size={20} /></a>
          </li>
        );
      })}
    </ul>
  );
}
