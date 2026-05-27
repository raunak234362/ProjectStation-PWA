import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ChevronDown, ChevronRight, BarChart2 } from "lucide-react";
import "./ProjectInsightNav.css";

interface TabItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ProjectInsightNavProps {
  tabs: TabItem[];
  activeTab: string;
  setActiveTab: (key: string) => void;
  className?: string;
  ease?: string;
  baseColor?: string;
  activeColor?: string;
}

const ProjectInsightNav: React.FC<ProjectInsightNavProps> = ({
  tabs,
  activeTab,
  setActiveTab,
  className = "",
  ease = "power3.out",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<HTMLButtonElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const activeTabItem = tabs.find((t) => t.key === activeTab) || tabs[0];

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 60;

    const topBarHeight = 60;
    const contentEl = contentRef.current;
    if (contentEl) {
      const contentHeight = contentEl.scrollHeight;
      return topBarHeight + contentHeight + 16;
    }
    return 400;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    // Reset initial states
    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(itemsRef.current, { y: 15, opacity: 0 });
    if (backdropRef.current) {
      gsap.set(backdropRef.current, { opacity: 0, pointerEvents: "none" });
    }

    const tl = gsap.timeline({ paused: true });

    // 1. Expand Nav height
    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.35,
      ease,
    });

    // 2. Fade in backdrop overlay concurrently
    if (backdropRef.current) {
      tl.to(
        backdropRef.current,
        {
          opacity: 1,
          pointerEvents: "auto",
          duration: 0.35,
          ease,
        },
        "<",
      );
    }

    // 3. Stagger-in nav items
    tl.to(
      itemsRef.current,
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease,
        stagger: 0.02,
      },
      "-=0.15",
    );

    return tl;
  };

  // Build timeline on mount or when tabs count change
  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, tabs]);

  // Synchronize state changes with timeline play/reverse
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;

    if (isOpen) {
      tl.play();
    } else {
      tl.reverse();
    }
  }, [isOpen]);

  // Re-calculate height on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isOpen) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleItemClick = (key: string) => {
    setActiveTab(key);
    setIsOpen(false);
  };

  const setItemRef = (i: number) => (el: HTMLButtonElement | null) => {
    if (el) itemsRef.current[i] = el;
  };

  return (
    <>
      {/* Backdrop Blurry Overlay */}
      <div
        ref={backdropRef}
        className="insight-nav-backdrop"
        onClick={() => setIsOpen(false)}
      />

      <div className={`project-insight-nav-container ${className}`}>
        <div
          ref={navRef}
          className={`project-insight-nav ${isOpen ? "open" : ""}`}
        >
          {/* Top Header Selector */}
          <div className="insight-nav-header" onClick={toggleMenu}>
            <div className="insight-nav-title-group">
              <BarChart2 className="insight-nav-title-icon" />
              <span className="insight-nav-title">Project Insight</span>
              <span className="insight-nav-separator">/</span>
              <span className="insight-nav-active-label">
                {activeTabItem ? activeTabItem.label : ""}
              </span>
            </div>

            <div className="insight-nav-toggle-btn">
              <ChevronDown
                className={`insight-nav-arrow ${isOpen ? "open" : ""}`}
              />
            </div>
          </div>

          {/* Vertical List Content */}
          <div
            ref={contentRef}
            className="insight-nav-content"
            aria-hidden={!isOpen}
          >
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  ref={setItemRef(idx)}
                  type="button"
                  className={`insight-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => handleItemClick(tab.key)}
                >
                  <div className="insight-nav-item-content">
                    <div className="insight-nav-item-left">
                      <Icon className="insight-nav-item-icon" />
                      <span className="insight-nav-item-label">
                        {tab.label}
                      </span>
                    </div>
                    <ChevronRight className="insight-nav-item-arrow" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectInsightNav;
