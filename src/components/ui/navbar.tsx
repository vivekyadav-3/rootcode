import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Root<span className="text-orange-500">Code</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/problems"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Problems
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Leaderboard
            </Link>
          </div>
        </div>

        {/* Right Side: Auth & Theme Toggle */}
        <div className="flex items-center gap-4">
          <ModeToggle />
          
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" className="text-sm">
                Log In
              </Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button className="bg-orange-500 text-sm hover:bg-orange-600">
                Sign Up
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/admin/create-problem"
              className="hidden text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 md:block"
            >
              Create Problem
            </Link>
            <Link
              href="/playground"
              className="hidden text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 md:block"
            >
              Playground
            </Link>
            <Link
              href="/profile"
              className="hidden text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 md:block"
            >
              Profile
            </Link>
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;