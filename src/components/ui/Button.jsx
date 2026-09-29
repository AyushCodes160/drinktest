const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold ' +
  'transition-all duration-300 ease-out active:scale-[0.98] whitespace-nowrap';

const variants = {
  primary:
    'bg-accent text-ink glow-accent hover:brightness-110 hover:shadow-[0_0_0_1px_rgb(200_255_46/0.7),0_0_36px_0_rgb(200_255_46/0.7),0_0_90px_-10px_rgb(200_255_46/0.8)]',
  outline:
    'border border-white/20 text-white hover:border-white/60 hover:bg-white/5 backdrop-blur-sm',
};

export default function Button({ as: Tag = 'a', variant = 'primary', className = '', children, ...props }) {
  return (
    <Tag className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
