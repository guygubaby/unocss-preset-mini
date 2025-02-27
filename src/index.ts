import type { Preset } from 'unocss'
import { presetUni } from '@uni-helper/unocss-preset-uni'
import {
  toEscapedSelector as e,
  presetWind3,
  presetIcons as rawPresetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

function presetWh(): Preset {
  return {
    name: 'uno-preset-wh',
    autocomplete: {
      templates: [
        '(wh|hw)-(full|screen)',
      ],
    },
    rules: [
      [/(?:hw|wh)-([^\s'"]+)$/, ([, name], { rawSelector }) => {
        const selector = e(rawSelector)

        const isFull = name === 'full'
        if (isFull) {
          return `
            ${selector} {
              width: 100%;
              height: 100%;
            }
          `
        }

        const isScreen = name === 'screen'
        if (isScreen) {
          return `
            ${selector} {
              width: 100vw;
              height: 100vh;
            }
          `
        }

        // name is $foo / $gap
        const isVariable = name.startsWith('$')
        if (isVariable) {
          const val = name.slice(1)
          return `
            ${selector} {
              width: var(--${val});
              height: var(--${val});
            }
          `
        }

        // name is [10px] / [2rem]
        const isNumerable = name.startsWith('[') && name.endsWith(']')
        if (isNumerable) {
          const val = name.slice(1, -1)
          return `
            ${selector} {
              width: ${val};
              height: ${val};
            }
          `
        }

        const numerableVal = Number(name)
        const isNumber = !Number.isNaN(numerableVal)
        const val = isNumber ? `${numerableVal / 4}rem` : name

        return `
            ${selector} {
              width: ${val};
              height: ${val};
            }
          `
      }],
    ],
  }
}

interface IOptions {
  useShortcuts?: boolean
  useIcon?: boolean
  useCdnIcon?: boolean
  iconCollection?: Record<string, Record<string, string>>
  extraProperties?: Record<string, string>
}

function presetShortcuts(options: IOptions = {}): Preset {
  options.useShortcuts ??= true
  return {
    name: 'uno-preset-shortcuts',
    shortcuts: options.useShortcuts
      ? [
          ['p-base', 'p-20px'],
          ['fc', 'flex justify-center items-center'],

          ['shadow-dim', 'shadow-[0px_2px_10px_0px_rgba(38,44,71,0.16)]'],
          ['shadow-dim1', 'shadow-[0px_2px_4px_0px_rgba(0,14,26,0.06)]'],

          ['text-sm', 'text-12px leading-20px'],
          ['text-base', 'text-14px leading-22px'],
          ['text-lg', 'text-16px leading-24px'],
          ['text-xl', 'text-18px leading-28px'],
          ['text-2xl', 'text-22px leading-34px'],
          ['text-3xl', 'text-26px leading-34px'],
        ]
      : [],
  }
}

function presetSafearea(): Preset {
  return {
    name: 'uno-preset-safearea',
    rules: [
      [
        /^safe-area-(top|bottom)$/,
        ([_, name], { rawSelector }) => {
          const selector = e(rawSelector)

          return `
            ${selector} {
              padding-${name}: constant(safe-area-inset-${name});
              padding-${name}: env(safe-area-inset-${name});
            }
          `
        },
      ],
    ],
    autocomplete: {
      templates: [
        '(safe-area)-(top|bottom)',
      ],
    },
  }
}

function presetBgImage(): Preset {
  return {
    name: 'uno-preset-bg-image',
    rules: [
      [/^bg-image$/, ([, _]) => {
        return {
          'background-size': '100% 100%',
          'background-repeat': 'no-repeat',
          'background-position': 'center',
        }
      }],
    ],
  }
}

function presetEllipsis(): Preset {
  return {
    name: 'uno-preset-ellipsis',
    autocomplete: {
      templates: [
        'ellipsis-(2|3|4|5|6|7|8|9|10)',
      ],
    },
    rules: [
      [/^ellipsis-(\d+)/, ([, lineCount], { rawSelector }) => {
        const selector = e(rawSelector)
        return `
        ${selector} {
          display: -webkit-box;
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-line-clamp: ${lineCount};
          line-break: anywhere;
          -webkit-box-orient: vertical;
        }
      `
      }],
    ],
  }
}

function presetIcon(options: IOptions = {}): Preset {
  options.useIcon ??= true
  options.useCdnIcon ??= true
  options.iconCollection ??= {}
  options.extraProperties ??= {
    'display': 'inline-block',
    'vertical-align': 'middle',
  }
  const iconCollection = options.iconCollection || {}

  const presets: Preset[] = []
  const icon = rawPresetIcons({
    scale: 1.2,
    extraProperties: options.extraProperties,
    cdn: options.useCdnIcon ? 'https://esm.sh/' : undefined,
    collections: iconCollection,
  })

  if (options.useIcon)
    presets.push(icon)

  return {
    name: 'uno-preset-my-icon',
    presets,
  }
}

/**
 * preset for web
 */
export function presetWeb(options: IOptions = {}): Preset {
  return {
    name: 'uno-preset-web',
    presets: [
      // @ts-expect-error ignore
      presetWind3(),
      presetShortcuts(options),
      presetSafearea(),
      presetEllipsis(),
      presetBgImage(),
      presetIcon(options),
      presetWh(),
    ],
    transformers: [
      transformerDirectives(),
      transformerVariantGroup(),
    ],
  }
}

/**
 * preset for uni app
 */
export function presetMini(options: IOptions = {}): Preset {
  return {
    name: 'uno-preset-mini',
    presets: [
      presetUni({
        uno: true,
        remRpx: true,
        attributify: {
          prefixedOnly: true,
        },
      }),
      presetShortcuts(),
      presetSafearea(),
      presetEllipsis(),
      presetBgImage(),
      presetIcon(options),
      presetWh(),
    ],
    blocklist: [
      'tab',
      'block',
      'container',
      /size-.*/,
    ],
  }
}
