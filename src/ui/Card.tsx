import React from 'react'

export type CardProps = {
  title?: string
  subtitle?: React.ReactNode
  media?: React.ReactNode
  tags?: Array<{ label: string; icon?: React.ReactNode }>
  meta?: Array<{ icon: React.ReactNode; label: string }>
  actions?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  fullHeight?: boolean
  children?: React.ReactNode
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  media,
  tags,
  meta,
  actions,
  footer,
  className = '',
  fullHeight = true,
  children
}) => {
  return (
    <article
      className={`group flex ${fullHeight ? 'h-full' : ''} flex-col overflow-hidden rounded-[24px] border border-[#e3eafb] bg-gradient-to-br from-white via-[#f9fbff] to-[#f2f6ff] shadow-[0_24px_40px_-28px_rgba(37,84,163,0.4)] transition-colors duration-300 hover:border-[#c8d6f6] hover:shadow-[0_28px_44px_-28px_rgba(37,84,163,0.5)] ${className}`}
    >
      {media && <figure className="relative h-36 w-full overflow-hidden">{media}</figure>}

      <div className="flex flex-1 flex-col gap-3.5 p-4">
        {(title || subtitle) && (
          <header className="space-y-1.5 text-left">
            {title && <h4 className="text-lg font-semibold tracking-tight text-[#1b2b4b]">{title}</h4>}
            {subtitle && <div className="text-xs leading-relaxed text-[#5a6a87]">{subtitle}</div>}
          </header>
        )}

        {children}

        {tags && tags.length > 0 && (
          <div
            className="-mx-1 flex gap-1.5 overflow-x-auto whitespace-nowrap px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tags.map(({ label, icon }) => (
              <span
                key={label}
                className="inline-flex flex-none items-center gap-1 rounded-full bg-[#e9efff] px-2.5 py-1 text-[11px] font-medium text-[#3557b1] shadow-[0_6px_14px_-12px_rgba(53,87,177,0.75)]"
              >
                {icon}
                {label}
              </span>
            ))}
          </div>
        )}

        {meta && meta.length > 0 && (
          <div className="flex flex-col gap-2.5 text-sm text-[#1f2a44]">
            {meta.map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl bg-white/75 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                {icon}
                <span className="text-[#505f7c]">{label}</span>
              </div>
            ))}
          </div>
        )}

        {actions && <div className="mt-auto flex flex-col gap-2.5 pt-1">{actions}</div>}

        {footer && <div className="rounded-xl bg-[#eef3ff] px-4 py-3 text-xs font-medium text-[#1f2a44]">{footer}</div>}
      </div>
    </article>
  )
}

export default Card
