"use server";

import { ScreenType } from "../types/ScreenType";
import { headers } from "next/headers";

export async function getDeviceType(): Promise<ScreenType> {
    const userAgent = await headers().then((headers) => headers.get("user-agent") || "");

    if (userAgent.match(/iPhone|Android.*Mobile/)) {
        return "mobile";
    }

    if (userAgent.match(/iPad|Android(?!.*Mobile)/)) {
        return "tablet";
    }

    if (userAgent.match(/Tablet|iPad/)) {
        return "large_tablet";
    }

    return "desktop";
}