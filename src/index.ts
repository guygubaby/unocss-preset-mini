import type { Preset, SourceCodeTransformer } from 'unocss'
import { presetUni } from '@uni-helper/unocss-preset-uni'
import { toEscapedSelector as e, presetIcons as rawPresetIcons, transformerDirectives, transformerVariantGroup } from 'unocss'

export const WHAutoComplete = '(wh|hw)-(full|screen)'

export const transformerWh: SourceCodeTransformer = {
  name: 'wh-transformer',
  enforce: 'pre',
  idFilter(id) {
    return /\.[tj]sx?$/.test(id) || /\.vue$/.test(id)
  },
  // transform wh-xx to w-xx h-xx
  async transform(code) {
    const whReg = /(?:hw|wh)-([^\s'"]+)/g
    const s = code.toString()
    if (!whReg.test(s))
      return

    whReg.lastIndex = 0
    const matched = s.matchAll(whReg)
    for (const match of matched) {
      const [full, value] = match
      const transformed = `w-${value} h-${value}`
      code.update(match.index, match.index + full.length, transformed)
    }
  },
}

export const presetShortcuts: Preset = {
  name: 'uno-preset-shortcuts',
  shortcuts: [
    ['p-base', 'p-20px'],
    ['fc', 'flex justify-center items-center'],

    ['shadow-dim', 'shadow-[0px_2px_10px_0px_rgba(38,44,71,0.16)]'],
    ['shadow-dim1', 'shadow-[0px_2px_4px_0px_rgba(0,14,26,0.06)]'],

    ['text-sm', 'text-12px leading-18px'],
    ['text-base', 'text-14px leading-22px'],
    ['text-lg', 'text-16px leading-24px'],
    ['text-xl', 'text-18px leading-26px'],
    ['text-2xl', 'text-22px leading-34px'],
  ],
}

export const presetSafearea: Preset = {
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

export const presetBgImage: Preset = {
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

export const presetEllipsis: Preset = {
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

interface IOptions {
  useIcon?: boolean
  useCdnIcon?: boolean
  iconCollection?: Record<string, Record<string, string>>
  extraProperties?: Record<string, string>
}

export function presetIcon(options: IOptions = {}): Preset {
  options.useIcon ||= true
  options.useCdnIcon ||= true
  options.iconCollection ||= {}
  options.extraProperties ||= {
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

export function presetMini(options: IOptions = {}): Preset {
  return {
    name: 'uno-preset-mini',
    autocomplete: {
      templates: [
        WHAutoComplete,
      ],
    },
    presets: [
      presetUni({
        uno: true,
        remRpx: true,
        attributify: {
          prefixedOnly: true,
        },
      }),
      presetShortcuts,
      presetSafearea,
      presetEllipsis,
      presetBgImage,
      presetIcon(options),
    ],
    configResolved(config) {
      config.transformers ||= []
      config.transformers.push(transformerDirectives(), transformerVariantGroup(), transformerWh)
    },
    blocklist: [
      'tab',
      'block',
      'container',
      /size-.*/,
    ],
  }
}
