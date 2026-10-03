const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold ' +
  'transition-all duration-300 ease-out active:scale-[0.98] whitespace-nowrap';

const variants = {
  primary:
    'bg-accent text-paper glow-accent hover:brightness-110 hover:-translate-y-px hover:shadow-[0_14px_34px_-12px_rgb(74_93_35/0.6),0_2px_6px_-2px_rgb(43_35_29/0.18)]',
  outline:
    'border border-ink/15 text-ink hover:border-ink/40 hover:bg-white/60 backdrop-blur-sm',
};

export default function Button({ as: Tag = 'a', variant = 'primary', className = '', children, ...props }) {
  return (
    <Tag className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
