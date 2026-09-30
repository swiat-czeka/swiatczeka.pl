import { socials } from '@/lib/site';

export function SocialLinks({ className = '' }: { className?: string }) {
  const active = socials.filter((social) => social.href);
  if (!active.length) return null;
  return (
    <ul className={`social-links ${className}`.trim()} aria-label="Media społecznościowe">
      {active.map((social) => (
        <li key={social.label}><a href={social.href} target="_blank" rel="noopener noreferrer">{social.label}</a></li>
      ))}
    </ul>
  );
}
