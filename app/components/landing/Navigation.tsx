"use client";

import { Menu, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../Button";
import { ThemeToggle } from "../ThemeToggle";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
      if (window.innerWidth >= 640) setMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  const getLinkHref = (item: { name: string; href: string }) => {
    if (item.name === "Dashboard") {
    }
    return item.href;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isScrolled ? 1 : 0 }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
        className="pointer-events-none fixed justify-center top-0 left-0 right-0 h-6 bg-gradient-to-b from-[var(--background)] to-transparent z-40"
      />
      <header className="pointer-events-none fixed top-0 left-0 right-0 z-[999] w-full px-0 py-4 flex justify-center">
        <motion.nav
          layout
          initial={{
            width: "800px",
            backgroundColor: "rgba(0, 0, 0, 0)",
          }}
          animate={
            isMobile
              ? { backgroundColor: "rgba(0, 0, 0, 0)", width: "95%" }
              : {
                  width: "1000px",
                  backgroundColor: isScrolled
                    ? "var(--background-secondary)"
                    : "rgba(0, 0, 0, 0)",
                }
          }
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          className="relative max-screen bg-solid sm:backdrop-blur-md  pointer-events-auto flex w-full items-center justify-between gap-6 rounded-full px-4 py-1 transition-colors sm:px-6 sm:pr-4"
        >
          <Link
            className="font-clash-display text-xl text-textPrimary font-medium sm:text-xl"
            href="/"
          >
            QuickQuery
          </Link>

          <div className="flex items-center justify-center gap-4">
            <div className="hidden sm:flex gap-4">
              <Show when="signed-out">
                <SignInButton>
                  <Button>Login</Button>
                </SignInButton>
                <SignUpButton>
                  <Button>Register</Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
              <UserButton />
            </Show>
            </div>
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="sm:hidden p-2 text-textPrimary"
            >
              <Menu size={24} />
            </button>
          </div>
        </motion.nav>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[1001] bg-black/50 backdrop-blur-sm sm:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[1002] w-64 bg-backgroundSecondary border-l border-borderPrimary p-6 sm:hidden flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <p>QuickQuery</p>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-textPrimary hover:bg-hoverPrimary rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <Show when="signed-out">
                  <SignInButton>
                    <Button>Login</Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button>Register</Button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
              <UserButton />
            </Show>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
