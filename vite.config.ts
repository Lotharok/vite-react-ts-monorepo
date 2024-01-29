import path from "path";
import { defineConfig } from "vite";
import pluginReact from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

const isExternal = (id: string) => !id.startsWith(".") && !path.isAbsolute(id);

export const getBaseConfig = ({ plugins = [], lib }) =>
  defineConfig({
    plugins: [pluginReact(), dts({
      insertTypesEntry: true,
    }), ...plugins],
    build: {
      lib,
      rollupOptions: {
        external: isExternal,
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
            "styled-components": "styled",
          },
        },
      },
    },
  });