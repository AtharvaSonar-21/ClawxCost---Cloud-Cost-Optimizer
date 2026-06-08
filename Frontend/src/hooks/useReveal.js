import { useEffect } from 'react'

/**
 * Adds `revealed` class to every `.reveal-ready` element once it
 * enters the viewport. Reuses a single IntersectionObserver instance.
 */
export default function useReveal(threshold = 0.12) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal-ready')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold }
    )

    els.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [threshold])
}
