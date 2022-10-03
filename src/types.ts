import { LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
  interface HTMLElementTagNameMap {
    'wiser-zigbee-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
}

// TODO Add your configuration elements here for type-checking
export interface WiserZigbeeCardConfig extends LovelaceCardConfig {
    type: string;
    name?: string;
    hub: string;
}

export interface node {
  id: number,
  label: string,
  group: string,
  shape: string
}

export interface edge {
  from: number,
  to: number,
  label: string
}

export interface zigbeeData {
  nodes: node[],
  edges: edge[]
}

enum WiserEvent {
  WiserUpdated = 'wiser_updated'
}

export interface WiserEventData {
  event: WiserEvent;
}