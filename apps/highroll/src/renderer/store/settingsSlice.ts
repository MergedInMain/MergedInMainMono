import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_SETTINGS } from '../../shared/constants';
import { Settings } from '../../shared/types';

interface SettingsSliceState extends Settings {
  overlayVisible: boolean;
}

const initialState: SettingsSliceState = {
  ...DEFAULT_SETTINGS,
  overlayVisible: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Settings>) => {
      return { ...state, ...action.payload };
    },
    setOverlayOpacity: (state, action: PayloadAction<number>) => {
      state.overlayOpacity = action.payload;
    },
    setOverlayPosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.overlayPosition = action.payload;
    },
    setOverlaySize: (state, action: PayloadAction<{ width: number; height: number }>) => {
      state.overlaySize = action.payload;
    },
    setCaptureInterval: (state, action: PayloadAction<number>) => {
      state.captureInterval = action.payload;
    },
    setDataRefreshInterval: (state, action: PayloadAction<number>) => {
      state.dataRefreshInterval = action.payload;
    },
    setHotkeys: (state, action: PayloadAction<{ toggleOverlay: string; captureScreen: string }>) => {
      state.hotkeys = action.payload;
    },
    setOverlayVisible: (state, action: PayloadAction<boolean>) => {
      state.overlayVisible = action.payload;
    },
  },
});

export const {
  setSettings,
  setOverlayOpacity,
  setOverlayPosition,
  setOverlaySize,
  setCaptureInterval,
  setDataRefreshInterval,
  setHotkeys,
  setOverlayVisible,
} = settingsSlice.actions;

export default settingsSlice.reducer;
