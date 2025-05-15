import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState } from '../../shared/types';

interface GameSliceState {
  gameState: GameState | null;
  isGameRunning: boolean;
  lastUpdate: number;
}

const initialState: GameSliceState = {
  gameState: null,
  isGameRunning: false,
  lastUpdate: 0,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameState: (state, action: PayloadAction<GameState>) => {
      state.gameState = action.payload;
      state.isGameRunning = true;
      state.lastUpdate = Date.now();
    },
    clearGameState: (state) => {
      state.gameState = null;
      state.isGameRunning = false;
    },
    updateGameRunning: (state, action: PayloadAction<boolean>) => {
      state.isGameRunning = action.payload;
    },
  },
});

export const { setGameState, clearGameState, updateGameRunning } = gameSlice.actions;
export default gameSlice.reducer;
