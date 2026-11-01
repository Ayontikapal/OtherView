"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Eye,
  RotateCcw,
  Compass,
  Bookmark,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { getAllInspectionsFromDB, isIndexedDBAvailable } from "@/lib/storage/indexed-db";
import { useAuth } from "@/lib/auth/auth-context";

interface AppHeaderProps {
  onLoadDemo?: () => void;
  onReset?: () => void;
  hasAnalysis?: boolean;
  isDemo?: boolean;
}

export function AppHeader({
  onLoadDemo,
  onReset,
  hasAnalysis = false,
  isDemo = false,
}: AppHeaderProps) {
  const pathname = usePathname();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Load saved count
  useEffect(() => {
    let isMounted = true;
    async function loadCount() {
      if (!isIndexedDBAvailable()) return;
      try {
        const list = await getAllInspectionsFromDB(user?.$id);
        if (isMounted) setSavedCount(list.length);
      } catch {
        // IDB unavailable
      }
    }
    loadCount();
    return () => {
      isMounted = false;
    };
  }, [pathname, user]);

  const navLinks = [
    { href: "/inspect", label: "Inspect", icon: Compass },
    {
      href: "/inspections",
      label: "Saved Inspections",
      icon: Bookmark,
      badge: savedCount !== null && savedCount > 0 ? savedCount : undefined,
    },
  ];

  return (
    <header className="border-b border-[#c3b8e3]/15 bg-[#141221]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#1e1a33] border border-[#e85d63]/30 flex items-center justify-center text-[#e85d63] shadow-md group-hover:scale-105 transition-transform">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-[#fdf9f4]">
                  OtherView
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#e85d63]/10 text-[#e85d63] rounded-full border border-[#e85d63]/30">
                  AI Review
                </span>
              </div>
              <p className="text-xs text-[#a9a1c6] hidden sm:block">
                See the space differently. Design for more people.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-[#c3b8e3]/15">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-[#1e1a33] text-[#fdf9f4] border border-[#c3b8e3]/30"
                      : "text-[#a9a1c6] hover:text-[#fdf9f4] hover:bg-[#1e1a33]/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#e85d63]" />
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#141221] text-[#c3b8e3] border border-[#c3b8e3]/20 font-mono font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isDemo && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold text-[#eca541] bg-[#eca541]/10 border border-[#eca541]/30 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#eca541] animate-pulse" />
              <span>Demo Mode</span>
            </div>
          )}

          {hasAnalysis && onReset ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#fdf9f4] bg-[#1e1a33] hover:bg-[#282343] border border-[#c3b8e3]/20 rounded-xl transition-colors cursor-pointer"
              aria-label="Start a new accessibility analysis"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#a9a1c6]" />
              <span>New Analysis</span>
            </button>
          ) : onLoadDemo ? (
            <button
              type="button"
              onClick={onLoadDemo}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#eca541] bg-[#1e1a33] hover:bg-[#282343] border border-[#eca541]/30 rounded-xl transition-colors cursor-pointer"
              aria-label="Load pre-analyzed demo entrance photograph"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#eca541]" />
              <span>Sample Demo</span>
            </button>
          ) : (
            <Link
              href="/inspect?demo=true"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#eca541] bg-[#1e1a33] hover:bg-[#282343] border border-[#eca541]/30 rounded-xl transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#eca541]" />
              <span>Sample Demo</span>
            </Link>
          )}

          {/* User Account Controls */}
          {!authLoading && (
            user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-[#c3b8e3]/20 bg-[#1e1a33] hover:bg-[#282343] transition-colors text-xs font-medium text-[#fdf9f4] cursor-pointer"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-6 h-6 rounded-lg bg-[#e85d63] text-[#141221] flex items-center justify-center text-[11px] font-bold">
                    {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate font-semibold">
                    {user.name || user.email.split("@")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#a9a1c6]" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#1e1a33] border border-[#c3b8e3]/20 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#c3b8e3]/10">
                      <p className="text-xs font-bold text-[#fdf9f4] truncate">
                        {user.name || "Authenticated User"}
                      </p>
                      <p className="text-[11px] text-[#a9a1c6] truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/inspections"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#a9a1c6] hover:text-[#fdf9f4] hover:bg-[#141221] transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-[#e85d63]" />
                      <span>My Inspections</span>
                    </Link>

                    <Link
                      href="/inspect"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-[#a9a1c6] hover:text-[#fdf9f4] hover:bg-[#141221] transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#6ee7b7]" />
                      <span>New Space Inspection</span>
                    </Link>

                    <div className="border-t border-[#c3b8e3]/10 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#e85d63] hover:bg-[#e85d63]/10 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/login?redirect=${encodeURIComponent(pathname)}`}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#a9a1c6] hover:text-[#fdf9f4] hover:bg-[#1e1a33] rounded-xl transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href={`/signup?redirect=${encodeURIComponent(pathname)}`}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-[#141221] bg-[#e85d63] hover:bg-[#d64b51] rounded-xl shadow-md transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )
          )}

          {/* Mobile menu toggle button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#a9a1c6] hover:text-[#fdf9f4] hover:bg-[#1e1a33] rounded-xl"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#c3b8e3]/15 bg-[#141221] px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                  isActive
                    ? "bg-[#1e1a33] text-[#fdf9f4] border border-[#c3b8e3]/30"
                    : "text-[#a9a1c6] hover:bg-[#1e1a33]/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#e85d63]" />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#1e1a33] text-[#c3b8e3] border border-[#c3b8e3]/20 font-mono font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          {!hasAnalysis && (
            <Link
              href="/inspect?demo=true"
              onClick={() => {
                setMobileMenuOpen(false);
                onLoadDemo?.();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#eca541] bg-[#eca541]/10 border border-[#eca541]/30"
            >
              <Sparkles className="w-4 h-4 text-[#eca541]" />
              <span>Sample Demo Walkthrough</span>
            </Link>
          )}

          <div className="border-t border-[#c3b8e3]/15 pt-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-medium text-[#fdf9f4] truncate">
                  {user.name || user.email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="text-xs text-[#e85d63] font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 py-2 text-center text-xs font-semibold text-[#fdf9f4] bg-[#1e1a33] rounded-xl border border-[#c3b8e3]/20"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 py-2 text-center text-xs font-bold text-[#141221] bg-[#e85d63] rounded-xl shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
