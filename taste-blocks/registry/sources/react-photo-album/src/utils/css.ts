export function cssClass(suffix?: string) {
  return ["react-photo-album", suffix].filter(Boolean).join("--");
}

export function cssVar(suffix: string) {
  return `--${cssClass(suffix)}`;
}
