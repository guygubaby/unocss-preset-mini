import type { Preset, SourceCodeTransformer } from 'unocss'
import { presetUni } from '@uni-helper/unocss-preset-uni'
import { toEscapedSelector as e, presetIcons, transformerDirectives, transformerVariantGroup } from 'unocss'

interface IOptions {
  iconCollection?: Record<string, Record<string, string>>
}

const transformerWh: SourceCodeTransformer = {
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

export function presetMini(options: IOptions = {}): Preset {
  const iconCollection = options.iconCollection || {}

  return {
    name: 'uno-preset-mini',
    presets: [
      presetUni({
        uno: true,
        remRpx: false,
        attributify: {
          prefixedOnly: true,
        },
      }),
      presetIcons({
        scale: 1.2,
        extraProperties: {
          'display': 'inline-block',
          'vertical-align': 'middle',
        },
        cdn: 'https://esm.sh/',
        collections: iconCollection,
      }),
    ],
    configResolved(config) {
      config.transformers ||= []
      config.transformers.push(transformerDirectives(), transformerVariantGroup(), transformerWh)
    },
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
    blocklist: [
      'tab',
      'block',
      'container',
      /size-.*/,
    ],
    autocomplete: {
      templates: [
        '(wh|hw)-(full|screen)',
        '(safe-area)-(top|bottom)',
      ],
    },
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
}
