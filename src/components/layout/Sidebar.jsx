import React, { useRef, useEffect, useState } from "react";
import {
  HomeIcon,
  UserPlusIcon,
  HistoryIcon,
  UserIcon,
  UsersIcon,
  ShieldIcon,
  QrCodeIcon,
  ScanIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SettingsIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const Sidebar = ({ activeView, onViewChange }) => {
  const { userProfile } = useAuth();
  const scrollContainerRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  const getNavItems = () => {
    if (userProfile?.role === "super_admin") {
      return [
        { id: "dashboard", icon: HomeIcon, label: "Dashboard" },
        { id: "create-estate", icon: UserPlusIcon, label: "Create Estate" },
        { id: "estates", icon: UsersIcon, label: "Estates (Totals/Filters)" },
        { id: "profile", icon: SettingsIcon, label: "Profile" },
      ];
    }

    if (userProfile?.role === "admin") {
      return [
        { id: "dashboard", icon: HomeIcon, label: "Dashboard" },
        { id: "guards", icon: ShieldIcon, label: "Guards" },
        { id: "residents", icon: UserIcon, label: "Residents" },
        { id: "history", icon: HistoryIcon, label: "History" },
        { id: "profile", icon: SettingsIcon, label: "Profile" },
      ];
    }

    if (userProfile?.role === "guard") {
      return [
        { id: "dashboard", icon: HomeIcon, label: "Dashboard" },
        { id: "verify-otp", icon: ScanIcon, label: "Verify OTP" },
        { id: "profile", icon: SettingsIcon, label: "Profile" },
      ];
    }

    if (userProfile?.role === "resident") {
      return [
        { id: "dashboard", icon: HomeIcon, label: "Dashboard" },
        { id: "invite-visitor", icon: UserPlusIcon, label: "Invite Visitor" },
        { id: "my-invites", icon: UsersIcon, label: "My Invites" },
        { id: "profile", icon: SettingsIcon, label: "Profile" },
      ];
    }

    return [{ id: "dashboard", icon: HomeIcon, label: "Dashboard" }];
  };

  const navItems = getNavItems();

  // Check scroll position and update indicators
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll to direction
  const scrollTo = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      checkScrollPosition(); // Check initial position

      // Check on resize
      const handleResize = () => {
        setTimeout(checkScrollPosition, 100);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return (
    <nav className="glass-effect rounded-2xl p-4 lg:p-6 shadow-soft border-0 relative">
      {/* Mobile Scroll Indicators */}
      <div className="lg:hidden">
        {/* Left Scroll Indicator */}
        {showLeftScroll && (
          <button
            onClick={() => scrollTo("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
          >
            <ChevronLeftIcon className="w-4 h-4 text-neutral-600" />
          </button>
        )}

        {/* Right Scroll Indicator */}
        {showRightScroll && (
          <button
            onClick={() => scrollTo("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
          >
            <ChevronRightIcon className="w-4 h-4 text-neutral-600" />
          </button>
        )}
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex flex-row lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-x-visible scrollbar-hide lg:scrollbar-default"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`sidebar-item min-w-[100px] lg:min-w-0 lg:w-full relative ${
                isActive ? "active" : ""
              }`}
              title={item.label}
            >
              <IconComponent className="w-6 h-6 lg:w-8 lg:h-8 mb-2 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-xs lg:text-sm font-semibold text-center leading-tight">
                {item.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Scroll Progress Indicator */}
      <div className="lg:hidden mt-4">
        <div className="w-full bg-neutral-200 rounded-full h-1">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-1 rounded-full transition-all duration-300"
            style={{
              width: scrollContainerRef.current
                ? `${
                    (scrollContainerRef.current.scrollLeft /
                      (scrollContainerRef.current.scrollWidth -
                        scrollContainerRef.current.clientWidth)) *
                    100
                  }%`
                : "0%",
            }}
          />
        </div>
      </div>
    </nav>
  );
};
