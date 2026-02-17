"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function ConsoleLogger() {
    const pathname = usePathname();
    const resources = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        const routeStart = performance.now();
        console.group(`🚀 Route Change: ${pathname}`);
        console.log(`🕒 Started at: ${new Date().toLocaleTimeString()}`);
        console.log(`⏱️ Performance monitoring initialized...`);

        // Observe resources loading
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'resource' || entry.entryType === 'navigation') {
                   const resourceEntry = entry as PerformanceResourceTiming;
                   const name = resourceEntry.name.split('/').pop() || resourceEntry.name;
                   
                   // Filter out noisy internal Next.js resources if needed
                   if (!name.includes('webpack') && !name.includes('hot-update')) {
                       // Store duration
                       resources.current.set(name, resourceEntry.duration);
                   }
                }
            });
        });

        try {
            observer.observe({ entryTypes: ["resource", "navigation"] });
        } catch (e) {
            console.warn("PerformanceObserver not supported or error observing");
        }

        return () => {
             const duration = performance.now() - routeStart;
             
             console.log(`🏁 Route ${pathname} hidden after ${(duration / 1000).toFixed(2)}s`);
             
             if (resources.current.size > 0) {
                 const sorted = Array.from(resources.current.entries()).sort((a, b) => a[1] - b[1]);
                 if (sorted.length > 0) {
                    const fastest = sorted[0];
                    const slowest = sorted[sorted.length - 1];
                    
                    console.log(`⚡ Fastest Resource: ${fastest[0]} (${fastest[1].toFixed(2)}ms)`);
                    console.log(`🐌 Slowest Resource: ${slowest[0]} (${slowest[1].toFixed(2)}ms)`);
                    
                    // Show toast only for unusually slow resources (> 500ms) to avoid spam
                    if (slowest[1] > 500) {
                        toast.info(`Performance Alert: ${pathname}`, {
                            description: `Slowest: ${slowest[0]} took ${slowest[1].toFixed(0)}ms`,
                        });
                    }
                 }
             }
             console.groupEnd();
             observer.disconnect();
             // Clear for next route
             resources.current.clear();
        };

    }, [pathname]);

    return null;
}
