"use client";

import { darkTheme, lightTheme } from "@/app/theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import React, { createContext, useContext, useMemo, useState } from "react";

type ColorMode = "light" | "dark";

interface ColorModeContextValue {
  mode: ColorMode;
  toggle: () => void;
}

export const ColorModeContext = createContext<ColorModeContextValue>({
  mode: "dark",
  toggle: () => {},
});

export function useColorMode() {
  return useContext(ColorModeContext);
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ColorMode>("dark");

  const colorModeValue = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      toggle: () => setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [mode],
  );

  const theme = mode === "light" ? lightTheme : darkTheme;

  return (
    <ColorModeContext.Provider value={colorModeValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
