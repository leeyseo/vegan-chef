import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 프론트엔드(5173)에서 /api 호출을 백엔드 프록시(3001)로 전달한다.
// 이렇게 하면 Claude API 키가 브라우저에 노출되지 않는다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
