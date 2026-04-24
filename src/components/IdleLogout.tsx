"use client";

import { useEffect, useRef, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";

const IDLE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 Hours (match server-side maxAge)
const STORAGE_KEY = "msbp_last_activity";
const CHECK_INTERVAL = 60 * 1000; // Check every 1 minute

export default function IdleLogout() {
    const { data: session } = useSession();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Update last activity timestamp in localStorage
    const updateActivity = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }, []);

    // Check if user has been idle too long
    const checkIdle = useCallback(() => {
        if (!session) return;

        const lastActivity = localStorage.getItem(STORAGE_KEY);
        if (!lastActivity) {
            updateActivity();
            return;
        }

        const elapsed = Date.now() - parseInt(lastActivity, 10);
        if (elapsed >= IDLE_TIMEOUT) {
            console.log(`User idle for ${Math.round(elapsed / 60000)} minutes, signing out...`);
            localStorage.removeItem(STORAGE_KEY);
            signOut({ callbackUrl: "/login?reason=idle" });
        }
    }, [session, updateActivity]);

    useEffect(() => {
        if (!session) return;

        // Activity events — update timestamp on user interaction
        const events = [
            "mousedown",
            "mousemove",
            "keypress",
            "scroll",
            "touchstart",
            "click"
        ];

        // Initialize activity timestamp
        updateActivity();

        // Throttle activity updates (max once per 30 seconds to reduce writes)
        let lastWrite = 0;
        const throttledUpdate = () => {
            const now = Date.now();
            if (now - lastWrite > 30000) {
                lastWrite = now;
                updateActivity();
            }
        };

        // Check idle on tab refocus — this is the KEY fix for sleep/background
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                checkIdle();
            }
        };

        // Periodic check as fallback (every 1 min)
        intervalRef.current = setInterval(checkIdle, CHECK_INTERVAL);

        // Add listeners
        events.forEach(event => {
            window.addEventListener(event, throttledUpdate);
        });
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Also check immediately on mount (in case returning from sleep)
        checkIdle();

        // Cleanup
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            events.forEach(event => {
                window.removeEventListener(event, throttledUpdate);
            });
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [session, updateActivity, checkIdle]);

    return null; // This component doesn't render anything
}
