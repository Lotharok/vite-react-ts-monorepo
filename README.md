# React + TypeScript + Vite

## Lerna Initial Setup
El Primer paso es configurar el proyecto de lerna, crear el folder del 
proyecto y dentro del folder correr el siguiente comando:

```
npx lerna init
```

Esto va a crear la estructua esencial para lerna, con los siguientes 
archivos `lerna.json, package.json` y se debe de tener una carpeta vacia
llamada `packages` si no esta crearla.

Se debe modificar el archivo __lerna.json__ debe de quedar similar a esto:

```JSON
{
  "$schema": "node_modules/lerna/schemas/lerna-schema.json",
  "packages": ["packages/*"],
  "npmClient": "yarn",
  "version": "independent"
}
```

## Vite Initial Setup
Una vez teniendo esto nos posicionamos en la carpeta `packages` y empezamos a crear
nuestros proyectos, para este ejemplo crearemos dos uno que se pueda exportar como libreria
y otro para poder utilizarlo.

Ejecutamos el siguiente comando:

```
npx create-vite pt-common --template react-ts
```
Donde `pt-common` es el nombre de tu proyecto y `react-ts` indica que va a ser un proyecto de React en TypeScript.

Esto nos va a crear la siguiente estructura:

```
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── public
│   └── vite.svg
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── assets
│   │   └── react.svg
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

Para los proyectos que van a funcionar como librerias solo vamos a dejar la siguiente estructura:

```
├── package.json
├── src
    ├── components
    │   └── index.tsx
    ├── index.tsx
│   └── vite-env.d.ts
├── tsconfig.json
└── vite.config.ts
```

La configuracion de las devDependencies se deben de bajar al `package.json` que nos creo __lerna__, 
hay que modificar el `package.json` de los proyectos que sean librerias agregando la siguiente seccion:

```JSON
"files": [
    "dist"
  ],
  "main": "./dist/pt-common.umd.js",
  "module": "./dist/pt-common.es.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/pt-common.es.js",
      "require": "./dist/pt-common.umd.js"
    }
  },
  ```

  lo cual va a indicar como va a ser exportado al momento de compilarlo.

## Global Setup

Se debe de agregar un archivo `vite.config.ts` en la raiz del proyecto lerna. Y se debe de instalar
el paquete __vite-plugin-dts__ quedando de la siguiente forma:

```TS
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
  ```

  Y dentro de los proyectos que estan en packages tenemos que modificar su archivo `vite.config.ts` para 
  que herede del general, quedando de la siguiente manera:

```TS
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
```

Se deben de agregar los archivos `tsconfig.json, tsconfig.node.json, tsconfig.build.json` con la configuracion de compilacion de TypeScript.

Dentro de proyectos que estan en packages y que seran de tipo libreria hay que modificar su `tsconfig.json` con la siguiente configuracion:

```JSON
{
    "extends": "../../tsconfig.build.json",
    "compilerOptions": {
      "declarationDir": "./dist",
      "rootDir": "./src",
      "baseUrl": "./"
    },
    "include": ["./src"]
  }
```