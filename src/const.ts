export const CARD_VERSION = '1.0.0';





export const OPTIONS = {
    autoResize: true,
    height: '500px',
    configure: {
      enabled: false,
    },

    edges: {
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 1,
        },
        middle: false,
        from: false,
      },
      physics: false,
      width: 2,
      labelHighlightBold: false,
      font: {align: 'top', color: 'var(--primary-text-color, #fff)' , strokeWidth: 0, size: 14}
    },

    groups: {},

    interaction: {},

    layout: {
      randomSeed: 1,
      improvedLayout: true,
    },

    manipulation: {},

    nodes: {
        shape: 'dot',
        size: 20,
        font: {
            size: 14,
        },
        borderWidth: 2,
        mass: 1.3,
    },

    physics: {
      enabled: false,
    },
  };