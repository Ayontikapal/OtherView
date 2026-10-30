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
        const list = await getAllInspectionsFromDB();
        if (isMounted) setSavedCount(list.length);
      } catch {
        // IDB unavailable
      }
    }
    loadCount();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

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
    <header className="border-b border-stone-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5 group-hover:scale-105 transition-transform">
              <Eye className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xl tracking-tight text-stone-900">
                  OtherView
                </span>
                <span className="px-2 py-0.5 text-[11px] font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/80">
                  v3.0
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                See the space differently. Design for more people.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-stone-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                  {link.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-700 font-bold">
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
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200/70 rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Demo Mode</span>
            </div>
          )}

          {hasAnalysis && onReset ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-colors cursor-pointer"
              aria-label="Start a new accessibility analysis"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>New Analysis</span>
            </button>
          ) : onLoadDemo ? (
            <button
              type="button"
              onClick={onLoadDemo}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200/80 rounded-lg transition-colors cursor-pointer"
              aria-label="Load pre-analyzed demo entrance photograph"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sample Demo</span>
            </button>
          ) : (
            <Link
              href="/inspect?demo=true"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
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
                  className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors text-xs font-medium text-stone-700 cursor-pointer"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold">
                    {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate font-semibold">
                    {user.name || user.email.split("@")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-stone-200 shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {user.name || "Authenticated User"}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/inspections"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>My Cloud Inspections</span>
                    </Link>

                    <Link
                      href="/inspect"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-stone-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>New Space Inspection</span>
                    </Link>

                    <div className="border-t border-stone-100 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
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
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href={`/signup?redirect=${encodeURIComponent(pathname)}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
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
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
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
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-700 font-bold">
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
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Sample Demo Walkthrough</span>
            </Link>
          )}

          <div className="border-t border-stone-200 pt-2">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-medium text-stone-700 truncate">
                  {user.name || user.email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="text-xs text-rose-600 font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 py-2 text-center text-xs font-semibold text-stone-700 bg-stone-100 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 py-2 text-center text-xs font-semibold text-white bg-indigo-600 rounded-xl"
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
