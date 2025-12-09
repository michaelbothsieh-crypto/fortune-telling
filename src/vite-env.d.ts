// /// <reference types="vite/client" />
// If the above line fails in your environment, use the declarations below and comment out the reference.
// Since the error is explicitly about this line, we provide the manual definitions to ensure build success.

// Augment the global NodeJS namespace to ensure ProcessEnv has API_KEY
// This avoids "redeclare block-scoped variable" error by not redeclaring `process`.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
    [key: string]: string | undefined;
  }
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}