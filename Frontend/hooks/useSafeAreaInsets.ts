"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function useSafeAreaInsets(): SafeAreaInsets {
  const { context } = useMiniKit();

  return {
    top: context?.client?.safeAreaInsets?.top || 0,
    bottom: context?.client?.safeAreaInsets?.bottom || 0,
    left: context?.client?.safeAreaInsets?.left || 0,
    right: context?.client?.safeAreaInsets?.right || 0,
  };
}

export function useSafeAreaStyle() {
  const insets = useSafeAreaInsets();

  return {
    paddingTop: `${insets.top}px`,
    paddingBottom: `${insets.bottom}px`,
    paddingLeft: `${insets.left}px`,
    paddingRight: `${insets.right}px`,
  };
}
