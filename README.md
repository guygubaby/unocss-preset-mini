# Unocss Preset Mini

## Introduction
Unocss Preset Mini is a preset support uniapp mini program.

## Install
To get started with Unocss Preset Mini, follow these simple steps:

### 1. Install Unocss
```bash
pnpm i -D unocss
```

### 2. Install Unocss Preset Mini
```bash
pnpm i -D @bryce-loskie/unocss-preset-mini
```

### 3. Configure Unocss to use the Mini preset.
In your project's Unocss configuration file (usually named ),
import the preset and add it to the section:`unocss.config.js`

```ts
// uno.config.ts
import { presetMini } from '@bryce-loskie/unocss-preset-mini'
import { defineConfig } from 'unocss'

export default defineConfig({
  presets: [
    presetMini(),
    // ...custom presets
  ],
})
```

### 4. More rules

1. `wh-xx / hw-xx` -> `w-xx h-xx`

2. `fc` -> `flex justify-center items-center`

3. `safe-area-top / safe-area-bottom`

4. `ellipsis-[number]`

## License

[MIT](./LICENSE) License &copy; 2024-PRESENT [guygubaby](https://github.com/guygubaby/unocss-preset-mini)
