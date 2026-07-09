declare module 'virtual:autoguide' {
  export const bundleBase: string;
  export const manifest: Record<string, unknown> | null;
  const payload: {
    bundleBase: string;
    manifest: Record<string, unknown> | null;
    outputDir: string;
  };
  export default payload;
}
