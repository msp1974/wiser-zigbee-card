export const CARD_VERSION = "2.1.1";

export const OPTIONS = {
  autoResize: true,
  height: "500px",
  configure: {
    enabled: false,
  },
  edges: {
    arrows: {
      to: {
        enabled: true,
        scaleFactor: 1,
      },
      middle: {
        enabled: false,
      },
      from: {
        enabled: false,
      },
    },
    color: "#03a9f4",
    smooth: true,
    physics: false,
    width: 2,
    labelHighlightBold: false,
    font: {
      align: "top",
      color: "var(--primary-text-color, #fff)",
      strokeWidth: 0,
      size: 14,
    },
  },
  groups: {
    Controller: {
      color: { background: "#518C43" },
      shape: "circle",
      margin: {
        top: 15,
        right: 10,
        bottom: 15,
        left: 10,
      },
    },
    RoomStat: {
      color: { background: "#B1345C" },
    },
    iTRV: {
      color: { background: "#E48629" },
    },
    SmartPlug: {
      color: { background: "#3B808E" },
    },
    HeatingActuator: {
      color: { background: "#5A87FA" },
    },
    UnderFloorHeating: {
      color: { background: "#0D47A1" },
    },
    Shutter: {
      color: { background: "#4A5963" },
    },
    OnOffLight: {
      color: { background: "#E4B62B" },
    },
    DimmableLight: {
      color: { background: "#E4B62B" },
    },
  },
  interaction: {
    selectable: false,
    selectConnectedEdges: false,
  },
  layout: {
    randomSeed: "1:1",
  },
  nodes: {
    shape: "box",
    size: 25,
    font: {
      size: 14,
      color: "#fff",
    },
    margin: {
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
    },
    borderWidth: 0,
    mass: 1.3,
    chosen: false,
  },
  physics: {
    enabled: false,
  },
};
