/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, PropertyValues, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  LovelaceCardEditor,
  LovelaceCard,
  fireEvent,
  hasConfigOrEntityChanged,
} from "custom-card-helpers"; // This is a community maintained npm module with common helper functions/types. https://github.com/custom-cards/custom-card-helpers
import { is_preview } from "./is-preview";

import type {
  WiserEventData,
  WiserZigbeeCardConfig,
  zigbeeData,
} from "./types";
import { CARD_VERSION, OPTIONS } from "./const";
import { localize } from "./localize/localize";
import { UnsubscribeFunc } from "home-assistant-js-websocket";

import "./editor";

import { Network } from "vis-network";
import { fetchZigbeeData } from "./data/websockets";
import { SubscribeMixin } from "./components/subscribe-mixin";

/* eslint no-console: 0 */
console.info(
  `%c  WISER-ZIGBEE-NETWORK-CARD \n%c  ${localize(
    "common.version",
  )} ${CARD_VERSION}    `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray",
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "wiser-zigbee-card",
  name: "Wiser Zigbee Card",
  description: "A card to display Wiser Zigbee network between devices",
});

declare global {
  interface HASSDomEvents {
    "wiser-zigbee-save-layout": {
      layout_data: any;
    };
  }
}

@customElement("wiser-zigbee-card")
export class WiserZigbeeCard
  extends SubscribeMixin(LitElement)
  implements LovelaceCard
{
  @state() private config?: WiserZigbeeCardConfig;
  @state() private zigbeeData?: zigbeeData;
  @state() private _helpers?: any;

  network?: Network;
  options = OPTIONS;
  current_theme = "";
  need_render = false;
  is_initialised = false;
  is_preview = true;
  layoutData;
  //boundNodeHandler;
  boundDialogClosedHandler;
  container: HTMLElement | null | undefined;

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement("wiser-zigbee-card-editor");
  }

  public static getStubConfig(): Record<string, unknown> {
    return {};
  }

  public setConfig(config: WiserZigbeeCardConfig): void {
    if (!config) {
      throw new Error(localize("common.invalid_configuration"));
    }
    this.config = {
      name: "Wiser Zigbee Network",
      ...config,
    };
    this.loadCardHelpers();
    this.initialise();
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }

  async isComponentLoaded(): Promise<boolean> {
    while (!this.hass || !this.hass.config.components.includes("wiser")) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return true;
  }

  async initialise(): Promise<boolean> {
    if (await this.isComponentLoaded()) {
      if (this.config?.layout_data) {
        this.layoutData = this.config!.layout_data;
      }
    }
    const boundDialogClosedHandler = this._dialog_close.bind(this);
    window.addEventListener("dialog-closed", boundDialogClosedHandler);
    this.loadData();
    return true;
  }

  public hassSubscribe(): Promise<UnsubscribeFunc>[] {
    return [
      this.hass!.connection.subscribeMessage(
        (ev: WiserEventData) => this.handleUpdate(ev),
        {
          type: "wiser_updated",
        },
      ),
    ];
  }

  private _dialog_close(ev) {
    if (this.is_preview && ev.detail.dialog == "hui-dialog-edit-card") {
      this.is_preview = false;
      this.need_render = true;
    }
  }

  private async handleUpdate(ev: WiserEventData): Promise<void> {
    if (ev.event == "wiser_updated") {
      if (this.config!.auto_update && !this.is_preview && this.is_initialised)
        await this.loadData();
    }
  }

  private async loadData() {
    const newZigbeeData = await fetchZigbeeData(this.hass!, this.config!.hub);
    if (this.layoutData) {
      this.zigbeeData = await this.addLayout(newZigbeeData);
    } else {
      this.zigbeeData = newZigbeeData;
    }
    this.need_render = true;
  }

  private async addLayout(zigbeeData: zigbeeData): Promise<zigbeeData> {
    for (let i = 0; i < zigbeeData.nodes.length; i++) {
      if (this.layoutData![zigbeeData.nodes[i].id]) {
        zigbeeData.nodes[i].x = this.layoutData![zigbeeData.nodes[i].id].x;
        zigbeeData.nodes[i].y = this.layoutData![zigbeeData.nodes[i].id].y;
      }
    }

    return zigbeeData;
  }

  public getCardSize(): number {
    return 9;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    this.is_preview = is_preview();

    if (!this.hass || !this.config) {
      return false;
    }

    if (this.need_render == true) {
      return true;
    }

    if (this.is_preview && this.is_initialised) {
      return false;
    }

    if (
      this.hass?.selectedTheme &&
      this.current_theme != this.hass?.selectedTheme
    ) {
      this.current_theme = this.hass.selectedTheme;
      const priTextColor = getComputedStyle(
        document.documentElement,
      ).getPropertyValue("--primary-text-color");
      this.options.edges.font.color = priTextColor;
      this.network?.setOptions(this.options);
      return true;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  private async _initialise_network() {
    await this.loadData();
    this.container = this.shadowRoot?.getElementById("zigbee-network");
    this.network = new Network(this.container!, this.zigbeeData!, this.options);
  }

  protected firstUpdated(): void {
    this._initialise_network();
    this.is_initialised = true;
  }

  protected render(): TemplateResult | void {
    this.need_render = false;
    if (this.zigbeeData && this.network) {
      this.network?.setData(this.zigbeeData);
    }

    return html`
      <ha-card>
        <div class="card-header">
          <div class="name">${this.config!.name}</div>
        </div>
        <div class="card-content">
          <div id="zigbee-network"></div>
        </div>
        ${!this.config!.auto_update || this.is_preview
          ? this.render_card_actions()
          : ``}
      </ha-card>
    `;
  }

  render_card_actions(): TemplateResult {
    return html`
      <div
        class="card-actions"
        style=${this.is_preview
          ? "display: flex; justify-content: space-between"
          : "text-align: right"}
      >
        ${this.is_preview ? this.render_save_layout_button() : ``}
        ${!this.config!.auto_update || this.is_preview
          ? this.render_refresh_button()
          : ``}
      </div>
    `;
  }

  render_refresh_button(): TemplateResult {
    return html`
      <mwc-button @click=${this.refreshClick}>
        ${this.hass!.localize("ui.common.refresh")}
      </mwc-button>
    `;
  }

  render_save_layout_button(): TemplateResult {
    return html`
      <mwc-button @click="${this.saveLayoutClick}">Save Layout</mwc-button>
    `;
  }

  async refreshClick(): Promise<void> {
    await this.loadData();
  }

  async saveLayoutClick(): Promise<void> {
    this.layoutData = this.network?.getPositions();
    this.config!.layout_data = this.layoutData;
    fireEvent(this, "wiser-zigbee-save-layout", {
      layout_data: this.layoutData,
    });
    this.need_render = true;
    await this.loadData();
  }

  static style = css`
    .zigbee-network {
      width: 600px;
      height: 400px;
      border: 1px solid lightgray;
    }
  `;
}
