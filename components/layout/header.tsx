"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);

      // Check which section is in view
      const sections = document.querySelectorAll("section[id]");
      const scrollPosition = window.scrollY + 300;

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).offsetHeight;
        const sectionId = section.getAttribute("id") || "";

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          setActiveSection(sectionId);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-playfair font-bold text-xl">AIT Lab</span>
            <span className="hidden md:inline-block text-sm text-muted-foreground">
              | Texas Traffic Tales
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <Link
                href="#map"
                className={`text-sm font-medium transition-colors ${
                  activeSection === "map"
                    ? "text-primary"
                    : "hover:text-primary"
                }`}
              >
                Map
              </Link>
              <Link
                href="#road-types"
                className={`text-sm font-medium transition-colors ${
                  activeSection === "road-types"
                    ? "text-primary"
                    : "hover:text-primary"
                }`}
              >
                Road Types
              </Link>
              <Link
                href="#rankings"
                className={`text-sm font-medium transition-colors ${
                  activeSection === "rankings"
                    ? "text-primary"
                    : "hover:text-primary"
                }`}
              >
                Rankings
              </Link>
              <Link
                href="#costs"
                className={`text-sm font-medium transition-colors ${
                  activeSection === "costs"
                    ? "text-primary"
                    : "hover:text-primary"
                }`}
              >
                Costs
              </Link>
              <Link
                href="#commuter-impact"
                className={`text-sm font-medium transition-colors ${
                  activeSection === "commuter-impact"
                    ? "text-primary"
                    : "hover:text-primary"
                }`}
              >
                Commuters
              </Link>
              <Link
                href="#regions"
                className={`text-sm font-medium transition-colors ${
                  activeSection === "regions"
                    ? "text-primary"
                    : "hover:text-primary"
                }`}
              >
                Regions
              </Link>
            </nav>
            {/* <ModeToggle /> */}
          </div>

          <div className="md:hidden flex items-center">
            {/* <ModeToggle /> */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="ml-2"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <nav className="flex flex-col py-4 px-4">
            <Link
              href="#map"
              className={`py-2 text-sm font-medium transition-colors ${
                activeSection === "map" ? "text-primary" : "hover:text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Map
            </Link>
            <Link
              href="#road-types"
              className={`py-2 text-sm font-medium transition-colors ${
                activeSection === "road-types"
                  ? "text-primary"
                  : "hover:text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Road Types
            </Link>
            <Link
              href="#rankings"
              className={`py-2 text-sm font-medium transition-colors ${
                activeSection === "rankings"
                  ? "text-primary"
                  : "hover:text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Rankings
            </Link>
            <Link
              href="#costs"
              className={`py-2 text-sm font-medium transition-colors ${
                activeSection === "costs"
                  ? "text-primary"
                  : "hover:text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Costs
            </Link>
            <Link
              href="#commuter-impact"
              className={`py-2 text-sm font-medium transition-colors ${
                activeSection === "commuter-impact"
                  ? "text-primary"
                  : "hover:text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Commuters
            </Link>
            <Link
              href="#regions"
              className={`py-2 text-sm font-medium transition-colors ${
                activeSection === "regions"
                  ? "text-primary"
                  : "hover:text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Regions
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
