import "@/styles/theme.css";
import "@/styles/globals.css";
import { DesignProvider } from "./DesignSystem/context/DesignProvider";
import { DEFAULT_THEME, THEMES, type Theme } from "./DesignSystem/theme";
import { cookies, headers } from "next/headers";
import RootShell from "./components/RootShell";

async function getInitialTheme(): Promise<Theme> {
  const SUPPORTED_THEMES = new Set<string>(THEMES as readonly string[]);
  const pickTheme = (value: unknown): Theme =>
    typeof value === "string" && SUPPORTED_THEMES.has(value as string)
      ? (value as Theme)
      : DEFAULT_THEME;
  let cookieTheme: Theme = DEFAULT_THEME;

  try {
    const c = await cookies();
    if (c && typeof (c as any).get === "function") {
      const raw = (c as any).get("gaia.theme")?.value ?? DEFAULT_THEME;
      cookieTheme = pickTheme(raw);
    } else {
      const hdrs = await headers();
      const cookieHeader = (hdrs.get("cookie") as string) ?? "";
      if (cookieHeader) {
        const match = cookieHeader
          .split(";")
          .map((s: string) => s.trim())
          .find((s: string) => s.startsWith("gaia.theme="));
        if (match) {
          const val = match.split("=").slice(1).join("=");
          try {
            cookieTheme = pickTheme(decodeURIComponent(val));
          } catch {
            cookieTheme = pickTheme(val);
          }
        }
      }
    }
  } catch {
    cookieTheme = DEFAULT_THEME;
  }

  return SUPPORTED_THEMES.has(cookieTheme) ? cookieTheme : DEFAULT_THEME;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialTheme = await getInitialTheme();

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      data-gaia-theme={initialTheme}
      suppressHydrationWarning
    >
      <body
        className="overflow-x-hidden gaia-scene-bg"
        suppressHydrationWarning
      >
        <DesignProvider>
        <RootShell>{children}</RootShell>
      </DesignProvider>
      </body>
    </html>
  );
}
