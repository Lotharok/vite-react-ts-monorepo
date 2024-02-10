# React + TypeScript + Vite

## Lerna Initial Setup

El Primer paso es configurar el proyecto de lerna, crear el folder del
proyecto y dentro del folder correr el siguiente comando:

```BASH
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

```BASH
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

```BASH
npx storybook@latest init
```

Nos va a generar el folder `.storybook` con los archivos de configuracion y la carpeta `stories` en
`src`, la cual vamos a eliminar por que vamos a compilar nuestros propios componentes.

Posteriormente vamos a ejecutar el siguiente comando, para poder compilar con Vite los componentes:

```BASH
npx sb init --builder @storybook/builder-vite
```

Se deben de mover todas las dependencias que se hayan agregado al `package.json` global. Podemos
ejecutando simplemente con el comando `yarn storybook`.

La primera vez que vamos a habitar `storybook` en el proyecto general, debemos de ejecutar el comando:

```BASH
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

```BASH
npx create-vite pt-common-js --template vanilla-ts
```

Una vez creado el proyecto ejecutamos la [configuracion](#tsConfigLib) pertinente en el archivo `tsconfig.json`,
la [configuracion](#packageConfigLib) en el archivo `package.json` y la [configuracion](#viteConfigLib).

De igual forma hay que eliminar los archivos que se han configurado de forma global como el `.gitignore`
y los archivos no necesarios como `index.html` o lo que esta en al carpeta `public`.

## Mock Api

Se va a utilizar mswjs para poder probar nuestro front sin necesidad del backend. Lo primero es instalar como
devDependencies `msw`, lo hacemos en el `package.json` global.

Una vez instalado el paquete ejecutamos proseguimos a configurar el worker de msw en la raiz de cada proyecto
del tipo demo, ejecutando el siguiente comando:

```BASH
npx msw init public
```

Lo siguiente seria configurar el mock service, crearemos una nueva carpeta llamada `mocks`, y dentro de esta dos carpetas mas
`data` donde estaran las respustas mockeadas y `handlers` donde se configurara los request intercepatados.

Vamos a agregar los siguientes archivos:

1. `./mocks/browser.ts` el cual tendra la configuracion general del mock service.

```TS
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers/index.ts";

export const worker = setupWorker(...handlers);
```

2. `./handlers/index.ts` el cual tendra el exportado de todos los servicios a mockear

```TS
import { service1 } from "./service1.ts";
import { service2 } from "./service2.ts";

export const handlers = [...service1, ...service2];
```

3. `./handlers/serviceXX.ts` es la definicion del servicio a mockear [Documentacion](https://mswjs.io/docs/basics/intercepting-requests)

```TS
import { http, HttpResponse } from "msw";
import { jsonActivities } from "../data/activities.ts";

export const service1 = [
   http.get("https://activity.com.mx/v2/rates", () => {
      return HttpResponse.json(jsonActivities);
   }),
];
```

4. `./data/XXX.ts` seria los datos que van a regresar los servicios mockeados.

```TS
export const jsonActivities = [
   {
      id: 1,
      uri: "uri-ejemplo",
      name: "Catamarán a Isla Mujeres con barra libre y snorkel",
   },
];
```

Al final vamos a tener una estructura similar:

```
├── .storybook
├── mocks
│   ├── data
│   │   └── data1.ts
│   ├── handlers
│   │   ├── service1.ts
│   │   └── index.ts
│   └── browser.ts
├── packages
├── .eslintrc.cjs
├── .gitignore
├── lerna.json
├── package.json
├── tsconfig.build.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

Por ultimo para configurar nuestra aplicacion para ocupar el mock tenemos que modificar el archivo
`main.tsx` de nuestro proyecto.

```TS
async function deferRender() {
  if (import.meta.env.VITE_USE_MOCKS !== "true") {
    return;
  }

  const { worker } = await import("./mocks/browser.ts");
  return worker.start();
}

deferRender().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
```
