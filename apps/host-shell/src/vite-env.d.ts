/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '@frontend-monorepo-showcase/design-tokens/css/layers';
declare module '@frontend-monorepo-showcase/design-tokens/css';
declare module '@frontend-monorepo-showcase/design-tokens/css/dark';
declare module '@frontend-monorepo-showcase/design-tokens/css/high-contrast';
