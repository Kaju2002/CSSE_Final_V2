import React from 'react'
import { Facebook, Linkedin, Twitter, Youtube } from 'lucide-react'

const socialLinks = [
  { label: 'Facebook', icon: Facebook },
  { label: 'Twitter', icon: Twitter },
  { label: 'LinkedIn', icon: Linkedin },
  { label: 'YouTube', icon: Youtube }
]

const Footer: React.FC = () => {
  return (
  <footer className="sticky bottom-0 z-30 w-full border-t border-[#e1eaf5] bg-white px-6 py-6 text-sm text-[#6f7d95]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-6">
          <a href="#" className="transition hover:text-[#2a6bb7]">Company</a>
          <a href="#" className="transition hover:text-[#2a6bb7]">Resources</a>
          <a href="#" className="transition hover:text-[#2a6bb7]">Legal</a>
        </div>
        <div className="flex items-center gap-3">
          {socialLinks.map(({ label, icon: Icon }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8e3f3] bg-white text-[#1b2b4b] transition hover:border-[#2a6bb7] hover:text-[#2a6bb7]"
            >
              <Icon className="h-4 w-4" strokeWidth={1.6} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
