/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, CSSResultGroup } from 'lit';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';

import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { WiserZigbeeCardConfig } from './types';
import { customElement, property, state } from 'lit/decorators';
import { formfieldDefinition } from '../elements/formfield';
import { selectDefinition } from '../elements/select';
import { switchDefinition } from '../elements/switch';
import { textfieldDefinition } from '../elements/textfield';

import { fetchHubs } from './data/websockets';

import { CARD_VERSION } from './const';

@customElement('wiser-zigbee-card-editor')
export class WiserZigbeeCardEditor extends ScopedRegistryHost(LitElement) implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: WiserZigbeeCardConfig;
  @state() private _helpers?: any;
  @state() private _hubs?: string[];

  private _initialized = false;

  static elementDefinitions = {
    ...textfieldDefinition,
    ...selectDefinition,
    ...switchDefinition,
    ...formfieldDefinition,
  };

  public setConfig(config: WiserZigbeeCardConfig): void {
    this._config = config;

    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }

    return true;
  }

  get _name(): string {
    return this._config?.name || '';
  }

  get _hub(): string {
    return this._config?.hub || '';
  }

  get _selected_schedule(): string {
    return this._config?.selected_schedule || '';
  }

  get _theme_colors(): boolean {
    return this._config?.theme_colors || false
  }

  get _show_badges(): boolean {
    return this._config?.show_badges || false
  }

  get _display_only(): boolean {
    return this._config?.display_only || false
  }


  get _admin_only(): boolean {
    return this._config?.admin_only || false
  }

  async loadData(): Promise<void> {
    if (this.hass) {
      this._hubs = await fetchHubs(this.hass);
    }
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers || !this._config || !this._hubs) {
      return html``;
    }

    return html`
      ${this.hubSelector()}
      <br>
      <div class="version">
        Version: ${CARD_VERSION}
      </div>
    `;
  }

  private hubSelector() {
    const hubs = (this._hubs ? this._hubs : []);
    if (hubs.length > 1) {
      return html`
        <mwc-select
          naturalMenuWidth
          fixedMenuPosition
          label="Wiser Hub (Optional)"
          .configValue=${'hub'}
          .value=${this._hub ? this._hub : hubs[0]}
          @selected=${this._valueChanged}
          @closed=${(ev) => ev.stopPropagation()}
        >
          ${this._hubs?.map((hub) => {
          return html`<mwc-list-item .value=${hub}>${hub}</mwc-list-item>`;
        })}
        </mwc-select>
      `;
    }
    return html``;
  }

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
    await this.loadData();

  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === '') {
        const tmpConfig = { ...this._config };
        delete tmpConfig[target.configValue];
        this._config = tmpConfig;
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    if (target.configValue === 'hub') {this._config.selected_schedule = ''}
    fireEvent(this, 'config-changed', { config: this._config });
  }

  static styles: CSSResultGroup = css`
    mwc-select,
    mwc-textfield {
      margin-bottom: 16px;
      display: block;
    }
    mwc-formfield {
      padding-bottom: 20px;
      display: flex;
    }
    mwc-switch {
      --mdc-theme-secondary: var(--switch-checked-color);
    }
  `;
}
