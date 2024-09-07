import { HomeAssistant } from "custom-card-helpers";
import { zigbeeData } from "../types";

export const fetchHubs = (hass: HomeAssistant): Promise<string[]> =>
  hass.callWS({
    type: "wiser/hubs",
  });

export const fetchZigbeeData = (
  hass: HomeAssistant,
  hub: string,
): Promise<zigbeeData> =>
  hass.callWS({
    type: "wiser/zigbee",
    hub: hub,
  });
