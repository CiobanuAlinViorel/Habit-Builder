"use client";

import { useEffect, useState } from "react";
import { ScreenType } from "../types/ScreenType";

export default function useDeviceScreen(): ScreenType {

    const [size, setSize] = useState<{ width: number, height: number }>({
        width: 0,
        height: 0
    });

    useEffect(() => {
        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return size.width < 768 ? "mobile" : size.width < 1024 ? "tablet" : size.width < 1280 ? "large_tablet" : "desktop";
}