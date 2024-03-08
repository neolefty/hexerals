/// <reference types="vitest" />
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
    root: __dirname,
    build: {
        outDir: "../../dist/apps/hexerals",
        reportCompressedSize: true,
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
    cacheDir: "../../node_modules/.vite/hexerals",

    server: {
        port: 4200,
        host: "localhost",
    },

    preview: {
        port: 4300,
        host: "localhost",
    },

    plugins: [
        react(),
        viteTsConfigPaths({
            root: "../../",
        }),
    ],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [
    //    viteTsConfigPaths({
    //      root: '../../',
    //    }),
    //  ],
    // },

    test: {
        reporters: ["default"],
        coverage: {
            reportsDirectory: "../../coverage/apps/hexerals",
            provider: "v8",
        },
        globals: true,
        cache: {
            dir: "../../node_modules/.vitest",
        },
        environment: "jsdom",
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
})
