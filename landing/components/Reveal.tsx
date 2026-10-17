'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/** Fades `.reveal` blocks in as they scroll into view. Without JS they are simply visible. */
export function RevealObserver() {
  const pathname = usePathname()
  useEffect(() => {
    document.documentElement.classList.add('js')
    const els = document.querySelectorAll('.reveal:not(.is-visible)')
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-visible')); return }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target) }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [pathname])
  return null
}
