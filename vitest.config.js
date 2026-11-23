import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Unit / integration tests with mocked APIs. These do NOT exercise the real
// backend — see RELEASE_READINESS_REPORT.md for the manual backend checklist.
export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        include: ["src/**/*.test.{js,jsx}"],
        setupFiles: ["src/test/setup.js"],
        restoreMocks: true,
        clearMocks: true,
    },
});
