import { base } from 'grommet'
import { deepMerge } from "grommet/utils"

const baselineFontSizes = [
  14, // text,
  18, // l1,
  16, // l2,
  14, // l3,
  12,
]

const sizeScales = new Map([
  ['xxsmall', 0.75],
  ['xsmall', 0.8],
  ['small', 0.9],
  ['medium', 1],
  ['large', 1.2],
  ['xlarge', 1.333],
])

function fontSize(level, size) {
  return {
    size: `${baselineFontSizes[level] * sizeScales.get(size)}px`,
    height: '125%',
    maxWidth: '100%',
  }
}

const headingFonts = new Map([
  [
    1,
    {
      family:
        "'Raleway', sans-serif"
    },
  ],
])

const theme = deepMerge(base, {
  name: 'Site Theme',
  rounding: 4,
  spacing: 24,
  defaultMode: 'light',
  global: {
    ...base.global,
    colors: {
      ...base.global.colors,
      brand: {
        light: 'hsl(227,90%,15%)',
        dark: 'hsl(227,90%,85%)',
      },
      'nav-background': {
        light: 'hsla(0,0%,100%,0.8)',
        dark: 'hsla(0,0%,0%,0.8)'
      },
      'card-header': 'hsla(0,50%,0%, 0.05)',
      'text-weak': {
        dark: 'hsla(0,0%,100%,0.8)',
        light: 'hsla(0,0%,0%,0.8)'
      },
      'text-xweak': {
        dark: 'hsla(0,0%,100%,0.6)',
        light: 'hsla(0,0%,0%,0.6)'
      },
      'tab-color': {
        light: 'hsl(227,90%,40%)',
        dark: 'hsl(227,90%,60%)',
      },
      'tab-color-active': {
        light: 'hsl(14,100%,30%)',
        dark: 'hsl(14,100%,70%)',
      },
      'map-head': {
        light: 'hsl(197,100%,70%)',
        dark: 'hsl(197,100%,30%)',
      },
      'link-note-head': {
        light: 'hsla(43,60%,50%, 0.5)',
        dark: 'hsla(43,100%,20%, 0.5)',
      },
      'link-note-back': {
        light: 'hsl(43,100%,80%)',
        dark: 'hsl(43,60%,15%)',
      },
      'tag-background': 'hsla(0,0%,50%,0.5)',
      background: {
        dark: '#111111',
        light: '#FFFFFF',
      },
      'background-back': {
        dark: '#111111',
        light: '#EEEEEE',
      },
      'background-front': {
        dark: '#222222',
        light: '#FFFFFF',
      },
      'background-contrast': {
        dark: '#FFFFFF11',
        light: '#11111111',
      },
      text: {
        dark: '#EEEEEE',
        light: '#333333',
      },
      'map-header': {
        light: 'hsla(214,90%,50%,0.5)',
        dark: 'hsla(214,90%,50%,0.5)',
      },
      'markdown-header': {
        light: 'hsla(214,10%,70%,0.5)',
        dark: 'hsla(214,10%,30%,0.5)',
      },
      'image-header': {
        light: 'hsla(214,10%,70%,0.25)',
        dark: 'hsla(214,10%,30%,0.25)',
      },
      'custom-tab-head-background': {
        light: 'hsl(0,0%,75%)',
        dark: 'hsl(0,0%,25%)',
      },
      'custom-tab-fill': {
        light: 'hsl(0,0%,100%)',
        dark: 'hsl(0,0%,0%)',
      },
      'navigation-palette': {
        light: 'hsl(0,0%,75%)',
        dark: 'hsl(0,0%,25%)',
      },
      'text-reverse': {
        light: 'hsla(0,0%,100%, 80%)',
        dark: 'hsla(0,0%,0%, 80%)',
      },
      'modal-background': {
        light: 'rgba(0,0,0,0.25)',
        dark: 'rgba(255,255,255,0.25)'
      },
      'modal-popup': {
        light: 'white',
        dark: 'black'
      },
      anchor: {
        light: 'hsl(205,100%,30%)',
        dark: 'hsl(205,100%,70%)',
      },
      'text-strong': {
        dark: '#FFFFFF',
        light: '#000000',
      },
      border: {
        dark: '#444444',
        light: '#CCCCCC',
      },
      control: 'brand',
      'active-background': 'background-contrast',
      'active-text': 'text-strong',
      'selected-background': 'brand',
      'selected-text': 'text-strong',
      'status-critical': '#a82c2c',
      'status-info': 'hsl(205,61%,22%)',
      'status-warning': '#FFAA15',
      'status-ok': '#008658',
      'status-unknown': '#CCCCCC',
      'status-disabled': '#CCCCCC',
      'status-critical-light': {
        dark: 'hsl(0,58%,25%)',
        light: 'hsl(0,58%,75%)'
      },
      'status-warning-light': {
        dark: 'hsl(38,100%,25%)',
        light: 'hsl(38,100%,75%)',
      },
      'status-ok-light': {
        dark: 'hsl(159,100%,20%)',
        light: 'hsl(159,100%,70%)',
      },
      'status-info-light': {
        dark: 'hsl(235,60%, 20%)',
        light: 'hsl(235,60%,80%)',
      },
      'graph-0': 'brand',
      'graph-1': 'status-warning',
      'section-head': '#44000c',
    },
    font: {
      family: '"San Francisco" ,"Helvetica Neue", Helvetica, sans-serif',
    },
    active: {
      background: 'active-background',
      color: 'active-text',
    },
    hover: {
      background: 'active-background',
      color: 'active-text',
    },
    selected: {
      background: 'selected-background',
      color: 'selected-text',
    },
  },
  button: {
    padding: { horizontal: '1em', vertical: '2px' },
    border: {
      width: '1px',
      radius: '3px'
    },
    size: {
      small: {
        border: {
          radius: '4px'
        }
      },
      medium: {
        border: {
          radius: '5px'
        }
      },
      large: {
        pad: {
          horizontal: '1.5em', vertical: '0.5em'
        },
        border: {
          radius: '10px'
        }
      }
    }
  },
  chart: {},
  diagram: {
    line: {},
  },
  meter: {},
  tip: {
    content: {
      background: {
        color: 'background',
      },
      elevation: 'none',
      round: false,
    },
  },
  layer: {
    background: {
      dark: '#111111',
      light: '#FFFFFF',
    },
  },
  heading: {
    font: {
      family: "'Raleway', sans-serif",
      height: '120%',
    },
    level: [1, 2, 3, 4, 5].reduce((memo, level) => {
      return {
        ...memo,
        [level]: {
          font: headingFonts.has(level) ? headingFonts.get(level) : {},
          small: fontSize(level, 'small'),
          medium: fontSize(level, 'medium'),
          large: fontSize(level, 'large'),
          xlarge: fontSize(level, 'xlarge'),
        },
      }
    }, {}),
  },
  paragraph: 'small,medium,large,xlarge'.split(',').reduce((memo, size) => {
    return { ...memo, [size]: fontSize(0, size) }
  }, {}),
  text: 'xxsmall,xxsmall,small,medium,large,xlarge'.split(',')
    .reduce((memo, size) => {
      return { ...memo, [size]: fontSize(0, size) }
    }, {}),
  breakpoints: {
    small: {
      value: 768,
      borderSize: {
        xsmall: '1px',
        small: '2px',
        medium: '3px',
        large: '4px',
        xlarge: '6px',
      },
      edgeSize: {
        none: '0px',
        hair: '1px',
        xxsmall: '2px',
        xsmall: '3px',
        small: '4px',
        medium: '7px',
        large: '10px',
        xlarge: '20px',
      },
      size: {
        xxsmall: '24px',
        xsmall: '48px',
        small: '96px',
        medium: '192px',
        large: '384px',
        xlarge: '768px',
        full: '100%',
      },
    },
    medium: {
      value: 1024,
      borderSize: {
        xsmall: '1px',
        small: '2px',
        medium: '4px',
        large: '6px',
        xlarge: '8px',
      },
      edgeSize: {
        none: '0px',
        hair: '1px',
        xxsmall: '2px',
        xsmall: '4px',
        small: '6px',
        medium: '10px',
        large: '15px',
        xlarge: '24px',
      },
      size: {
        xxsmall: '24px',
        xsmall: '48px',
        small: '96px',
        medium: '192px',
        large: '384px',
        xlarge: '768px',
        full: '100%',
      },
    },
    large: {
      value: 1200,
      size: {
        xxsmall: '24px',
        xsmall: '48px',
        small: '96px',
        medium: '192px',
        large: '384px',
        xlarge: '768px',
        full: '100%',
      },
    },
    xlarge: {
      value: 1536,
    },
  },
  tab: {
    ...base.tab,
    color: "dark-4",
    active: {
      color: 'tab-color-active',
      text: {
        weight: 800
      }
    },
    border: {
      ...base.tab.border,
      color: 'tab-color',
      size: '1px',
      active: {
        color: 'tab-color-active',
      }
    }
  },
  tag: {
    round: false,
    border: {
      xsmall: "0px",
      small: "1px",
      medium: "2px",
      large: "2px",
      xlarge: "3px",
    }
  }
})

export default theme
