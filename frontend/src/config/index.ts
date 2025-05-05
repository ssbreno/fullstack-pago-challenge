export const config = {
    apiUrl: import.meta.env.VITE_API_URL,
    s3Endpoint: import.meta.env.VITE_S3_ENDPOINT,
  } as const;
  
  export type Config = typeof config;