import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, Settings, TeamComp } from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/constants';

// Define the state interface
interface AppState {
  gameState: GameState | null;
  settings: Settings;
  recommendedComps: TeamComp[];
  activeTab: string;
  overlayVisible: boolean;
  overlayOpacity: number;
  isLoading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: AppState = {
  gameState: null,
  settings: DEFAULT_SETTINGS,
  recommendedComps: [],
  activeTab: 'dashboard',
  overlayVisible: false,
  overlayOpacity: 0.8,
  isLoading: false,
  error: null,
};

// Define action types
type ActionType =
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'SET_RECOMMENDED_COMPS'; payload: TeamComp[] }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_OVERLAY_VISIBLE'; payload: boolean }
  | { type: 'SET_OVERLAY_OPACITY'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Create the context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Create the reducer
const appReducer = (state: AppState, action: ActionType): AppState => {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_RECOMMENDED_COMPS':
      return { ...state, recommendedComps: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_OVERLAY_VISIBLE':
      return { ...state, overlayVisible: action.payload };
    case 'SET_OVERLAY_OPACITY':
      return { ...state, overlayOpacity: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// Create the provider component
interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Set up IPC listeners
  useEffect(() => {
    // Listen for game state updates from the main process
    window.electron.onGameStateUpdated((_, gameState) => {
      dispatch({ type: 'SET_GAME_STATE', payload: gameState });
    });

    // Clean up listeners on unmount
    return () => {
      // No cleanup needed for now
    };
  }, []);

  // Handle overlay visibility changes
  useEffect(() => {
    if (state.overlayVisible) {
      window.electron.showOverlay();
    } else {
      window.electron.hideOverlay();
    }
  }, [state.overlayVisible]);

  // Handle overlay opacity changes
  useEffect(() => {
    window.electron.setOverlayTransparency(state.overlayOpacity);
  }, [state.overlayOpacity]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Create a custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
