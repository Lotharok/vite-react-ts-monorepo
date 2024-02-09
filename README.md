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

Se debe modificar el archivo **lerna.json** debe de quedar similar a esto:

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

<span id="packageConfigLib"></span>
La configuracion de las **dependencies** generales y las **devDependencies** se deben de bajar al `package.json`
que nos creo **lerna**, hay que modificar el `package.json` de los proyectos que sean librerias agregando la
siguiente seccion:

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

## Storybook Initial Setup

En los proyectos que van a funcionar como librerias de componentes vamos a instalar Storybook.
Ejecutamos el siguiente comando:

```
npx storybook@latest init
```

Nos va a generar el folder `.storybook` con los archivos de configuracion y la carpeta `stories` en
`src`, la cual vamos a eliminar por que vamos a compilar nuestros propios componentes.

Posteriormente vamos a ejecutar el siguiente comando, para poder compilar con Vite los componentes:

```
npx sb init --builder @storybook/builder-vite
```

Se deben de mover todas las dependencias que se hayan agregado al `package.json` global. Podemos
ejecutando simplemente con el comando `yarn storybook`.

La primera vez que vamos a habitar `storybook` en el proyecto general, debemos de ejecutar el comando:

```
npx storybook@latest init
```

En la raiz del proyecto y vamos a modificar el archivo `.torybook\main.ts` con lo siguiente:

```TS
stories: [
  "../packages/*/src/**/*..mdx",
  "../packages/*/src/**/*.stories.@(js|jsx|ts|tsx)"
],
```

Y vamos a remover del `package.json` global los scripts:

```JSON
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
```

## Global Setup

### Common Vite

Se debe de agregar un archivo `vite.config.ts` en la raiz del proyecto lerna. Y se debe de instalar
el paquete **vite-plugin-dts** quedando de la siguiente forma:

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

<span id="viteConfigLib"></span>
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

<span id="tsConfigLib"></span>
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

Para los otros, su `tsconfig.json` tendria la siguiente configuracion:

```JSON
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "moduleResolution": "bundler",
  },
  "include": ["./src"],
}
```

De igual forma para la configuracion de **ESLint** se debe de colocar el archivo `.eslintrc.cjs`
en la raiz del proyecto lerna, y en dado que existan en cada proyecto se deben de eliminar.

### Common Storybook

Para cada proyecto de tipo libreria de componentes vamos a ejecutar los archivos dentro de
`.storybook`.

Para `main.ts` quedaria de la siguiente manera:

```TS
import commonConfigs from "../../../.storybook/main";

const config = {
  ...commonConfigs,
  stories: ["../src/**/*..mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
};

export default config;
```

Para `preview.ts` quedaria de la siguiente manera:

```TS
import preview from "../../../.storybook/preview";

export default preview;
```

Por ultimo agregamos el archivo `preview-head.html`.

```HTML
<script>
  window.global = window;
</script>
```

## Componentes TypeScript para uso general

Para poder agregar componentes o librerias para uso general nos posicionamos nuevamente en la
`packages` y creamos una nuevo proyecto con el siguiente comando:

```
npx create-vite pt-common-js --template vanilla-ts
```

Una vez creado el proyecto ejecutamos la [configuracion](#tsConfigLib) pertinente en el archivo `tsconfig.json`,
la [configuracion](#packageConfigLib) en el archivo `package.json` y la [configuracion](#viteConfigLib).

De igual forma hay que eliminar los archivos que se han configurado de forma global como el `.gitignore`
y los archivos no necesarios como `index.html` o lo que esta en al carpeta `public`.
