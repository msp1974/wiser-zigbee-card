/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, PropertyValues, css } from 'lit';
import { customElement, state, query } from 'lit/decorators';
import {
  HomeAssistant,
  LovelaceCardEditor,
  getLovelace,
  hasConfigOrEntityChanged,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types. https://github.com/custom-cards/custom-card-helpers

import type { WiserEventData, WiserZigbeeCardConfig, zigbeeData } from './types';
import { CARD_VERSION, OPTIONS } from './const';
import { localize } from './localize/localize';
import { UnsubscribeFunc } from 'home-assistant-js-websocket';

import './editor';

import { Network } from "vis-network";
import { fetchZigbeeData } from './data/websockets';
import { SubscribeMixin } from './components/subscribe-mixin';
import isEqual from 'lodash/isEqual';


/* eslint no-console: 0 */
console.info(
  `%c  WISER-ZIGBEE-NETWORK-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'wiser-zigbee-card',
  name: 'Wiser Zigbee Card',
  description: 'A card to display Wiser Zigbee network between devices',
});


@customElement('wiser-zigbee-card')
export class WiserZigbeeCard extends SubscribeMixin(LitElement) {

    @state() private config?: WiserZigbeeCardConfig;
    @state() private component_loaded?: boolean = false;
    @state() private zigbeeData?: zigbeeData;

    network?: Network;
    options = OPTIONS
    current_theme = '';

    @query('#mynetwork')  container!: HTMLDivElement | null;

    constructor() {
        super();
        this.initialise();
    }

    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        return document.createElement('wiser-zigbee-card-editor');
    }

    public static getStubConfig(): Record<string, unknown> {
        return {};
    }

    public setConfig(config: WiserZigbeeCardConfig): void {
        if (!config) {
            throw new Error(localize('common.invalid_configuration'));
        }

        if (config.test_gui) {
            getLovelace().setEditMode(true);
        }

        this.config = {
        name: 'Wiser Zigbee Network',
        ...config,
        };
    }

    async initialise(): Promise<boolean> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (await this.isComponentLoaded()) {
            this.component_loaded = true;
            await this.loadData();
        }
        return true
    }

    async isComponentLoaded(): Promise<boolean> {
        while (!this.hass || !this.hass.config.components.includes("wiser")) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        return true
      }


    public hassSubscribe(): Promise<UnsubscribeFunc>[] {
        this.initialise();
        return [
          this.hass!.connection.subscribeMessage((ev: WiserEventData) => this.handleUpdate(ev), {
            type: 'wiser_updated',
          }),
        ];
    }

    private async handleUpdate(ev: WiserEventData): Promise<void> {
        if (ev.event == 'wiser_updated') await this.loadData();
    }

    private async loadData() {
        const newZigbeeData = await fetchZigbeeData( this.hass!, this.config!.hub)
        if (!isEqual(newZigbeeData, this.zigbeeData)) {
            this.zigbeeData = newZigbeeData;
            this.network?.setData(this.zigbeeData)
        }
    }


    public getCardSize(): number {
        return 9;
    }

    protected shouldUpdate(changedProps: PropertyValues): boolean {
        if (this.current_theme != this.hass?.selectedTheme) {
            const priTextColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-text-color')
            this.options.edges.font.color = priTextColor;
            this.network?.setOptions(this.options);
            return true;
        }

        return hasConfigOrEntityChanged(this, changedProps, false);
    }


    protected render(): TemplateResult | void {
        if (this.container) {
            this.network = new Network(this.container!, this.zigbeeData!, this.options);
        }
        return html`
            <ha-card>
                <div class="card-header">
                    <div class="name">
                        ${this.config!.name}
                    </div>
                </div>
                <div class="card-content">
                    <div id="mynetwork"></div>
                </div>
            </ha-card>
        `;
    }

    static style = css`
        #mynetwork {
            width: 600px;
            height: 400px;
            border: 1px solid lightgray;
        }
    `;
}