import * as path from "path";
import { getBaseConfig } from "../../vite.config";

export default getBaseConfig({
  lib: {
    entry: path.resolve(__dirname, "src/index.ts"),
    name: "PtCommon",
    formats: ["es", "umd"],
    fileName: (format) => `pt-common.${format}.js`,
  },
});