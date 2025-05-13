/**
 * Type definitions for IPC (Inter-Process Communication) between main and renderer processes
 */

import { GameState, Settings, ScreenPosition } from './types';

/**
 * Base interface for IPC messages
 */
export interface IpcMessage {
  channel: string;
  timestamp?: number;
}

/**
 * Base interface for IPC request messages
 */
export interface IpcRequest extends IpcMessage {
  requestId?: string;
}

/**
 * Base interface for IPC response messages
 */
export interface IpcResponse extends IpcMessage {
  requestId?: string;
  success: boolean;
  error?: string;
}

/**
 * Overlay visibility request
 */
export interface OverlayShowRequest extends IpcRequest {
  channel: 'overlay:show';
}

/**
 * Overlay hide request
 */
export interface OverlayHideRequest extends IpcRequest {
  channel: 'overlay:hide';
}

/**
 * Overlay toggle request
 */
export interface OverlayToggleRequest extends IpcRequest {
  channel: 'overlay:toggle';
}

/**
 * Overlay transparency request
 */
export interface OverlayTransparencyRequest extends IpcRequest {
  channel: 'overlay:set-transparency';
  opacity: number;
}

/**
 * Overlay position request
 */
export interface OverlayPositionRequest extends IpcRequest {
  channel: 'overlay:position';
  position: ScreenPosition;
}

/**
 * Overlay resize request
 */
export interface OverlayResizeRequest extends IpcRequest {
  channel: 'overlay:resize';
  width: number;
  height: number;
}

/**
 * Overlay click-through request
 */
export interface OverlayClickThroughRequest extends IpcRequest {
  channel: 'overlay:set-click-through';
  enabled: boolean;
}

/**
 * Overlay toggle click-through request
 */
export interface OverlayToggleClickThroughRequest extends IpcRequest {
  channel: 'overlay:toggle-click-through';
}

/**
 * Overlay get click-through state request
 */
export interface OverlayGetClickThroughStateRequest extends IpcRequest {
  channel: 'overlay:get-click-through-state';
}

/**
 * Overlay get click-through state response
 */
export interface OverlayGetClickThroughStateResponse extends IpcResponse {
  enabled: boolean;
}

/**
 * Screen capture request
 */
export interface ScreenCaptureRequest extends IpcRequest {
  channel: 'screen:capture';
}

/**
 * Screen capture response
 */
export interface ScreenCaptureResponse extends IpcResponse {
  data?: string; // Base64 encoded image data
}

/**
 * Screen get sources request
 */
export interface ScreenGetSourcesRequest extends IpcRequest {
  channel: 'screen:get-sources';
}

/**
 * Screen source interface
 */
export interface ScreenSource {
  id: string;
  name: string;
  display_id: string;
  thumbnail: string;
}

/**
 * Screen get sources response
 */
export interface ScreenGetSourcesResponse extends IpcResponse {
  sources?: ScreenSource[];
}

/**
 * Screen capture region request
 */
export interface ScreenCaptureRegionRequest extends IpcRequest {
  channel: 'screen:capture-region';
  region: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Screen capture region response
 */
export interface ScreenCaptureRegionResponse extends IpcResponse {
  data?: string; // Base64 encoded image data
}

/**
 * Game state update request
 */
export interface GameStateUpdateRequest extends IpcRequest {
  channel: 'game:state-update';
  gameState: GameState;
}

/**
 * Game state updated notification
 */
export interface GameStateUpdatedNotification extends IpcMessage {
  channel: 'game:state-updated';
  gameState: GameState;
}

/**
 * Settings get request
 */
export interface SettingsGetRequest extends IpcRequest {
  channel: 'settings:get';
}

/**
 * Settings get response
 */
export interface SettingsGetResponse extends IpcResponse {
  settings: Settings;
}

/**
 * Settings save request
 */
export interface SettingsSaveRequest extends IpcRequest {
  channel: 'settings:save';
  settings: Partial<Settings>;
}

/**
 * Settings saved notification
 */
export interface SettingsSavedNotification extends IpcMessage {
  channel: 'settings:saved';
  success: boolean;
  error?: string;
}

/**
 * Settings reset request
 */
export interface SettingsResetRequest extends IpcRequest {
  channel: 'settings:reset';
}

/**
 * Settings reset response
 */
export interface SettingsResetResponse extends IpcResponse {
  settings: Settings;
}

/**
 * App info request
 */
export interface AppInfoRequest extends IpcRequest {
  channel: 'app:info';
}

/**
 * App info response
 */
export interface AppInfoResponse extends IpcResponse {
  version: string;
  environment: string;
}

/**
 * Error report request
 */
export interface ErrorReportRequest extends IpcRequest {
  channel: 'error:report';
  error: {
    message?: string;
    stack?: string;
  };
}
