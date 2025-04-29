"use client"

import { useEffect, useState } from "react"
import { useScroll } from "framer-motion"

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]")

    const checkActiveSection = () => {
      const scrollPosition = window.scrollY + 300

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop
        const sectionHeight = (section as HTMLElement).offsetHeight
        const sectionId = section.getAttribute("id") || ""

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(sectionId)
        }
      })
    }

    window.addEventListener("scroll", checkActiveSection)
    // Initial check
    checkActiveSection()

    return () => {
      window.removeEventListener("scroll", checkActiveSection)
    }
  }, [])

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 hidden md:block">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
        <div className="flex space-x-2">
          {["map", "road-types", "rankings", "costs", "commuter-impact", "regions"].map((section) => (
            <a
              key={section}
              href={`#${section}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeSection === section ? "bg-primary scale-125" : "bg-muted-foreground/50 hover:bg-muted-foreground"
              }`}
              aria-label={`Jump to ${section} section`}
            ></a>
          ))}
        </div>
      </div>
    </div>
  )
}
