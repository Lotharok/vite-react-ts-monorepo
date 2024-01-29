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
│   └── vite-env.d.ts
├── tsconfig.json
└── vite.config.ts
```

