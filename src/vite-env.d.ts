/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

declare module '*.jsx' {
  const content: unknown;
  export default content;
}
