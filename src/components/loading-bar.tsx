"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show bar when path changes
    setLoading(true);
    
    // Hide bar after a small delay to simulate completion
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 h-[3px] bg-orange-500 z-[100] transition-all duration-500 ease-out animate-progress shadow-[0_0_10px_#f97316]" />
  );
}
