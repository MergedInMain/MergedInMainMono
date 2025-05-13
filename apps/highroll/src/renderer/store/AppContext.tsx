import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, Settings, TeamComp, ScreenPosition } from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/constants';
import ipcService from '../services/ipc-service';

// Define the state interface
interface AppState {
  gameState: GameState | null;
  settings: Settings;
  recommendedComps: TeamComp[];
  activeTab: string;
  overlayVisible: boolean;
  overlayOpacity: number;
  overlayPosition: ScreenPosition;
  overlaySize: { width: number; height: number };
  isLoading: boolean;
  error: string | null;
  appInfo: { version: string; environment: string } | null;
}

// Define the initial state
const initialState: AppState = {
  gameState: null,
  settings: DEFAULT_SETTINGS as Settings,
  recommendedComps: [],
  activeTab: 'dashboard',
  overlayVisible: false,
  overlayOpacity: 0.8,
  overlayPosition: { x: 0, y: 0 },
  overlaySize: { width: 400, height: 300 },
  isLoading: false,
  error: null,
  appInfo: null,
};

// Define action types
type ActionType =
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'SET_RECOMMENDED_COMPS'; payload: TeamComp[] }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_OVERLAY_VISIBLE'; payload: boolean }
  | { type: 'SET_OVERLAY_OPACITY'; payload: number }
  | { type: 'SET_OVERLAY_POSITION'; payload: ScreenPosition }
  | { type: 'SET_OVERLAY_SIZE'; payload: { width: number; height: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_APP_INFO'; payload: { version: string; environment: string } };

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
    case 'SET_OVERLAY_POSITION':
      return { ...state, overlayPosition: action.payload };
    case 'SET_OVERLAY_SIZE':
      return { ...state, overlaySize: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_APP_INFO':
      return { ...state, appInfo: action.payload };
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

  // Load app info and settings on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Get app info
        const appInfo = await ipcService.getAppInfo();
        dispatch({ type: 'SET_APP_INFO', payload: appInfo });

        // Get settings
        const settings = await ipcService.getSettings();
        dispatch({ type: 'SET_SETTINGS', payload: settings as Settings });
      } catch (error) {
        console.error('Error loading initial data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load initial data' });
      }
    };

    loadInitialData();
  }, []);

  // Set up IPC listeners
  useEffect(() => {
    // Listen for game state updates from the main process
    const unsubscribeGameState = ipcService.onGameStateUpdated((gameState) => {
      dispatch({ type: 'SET_GAME_STATE', payload: gameState });
    });

    // Listen for settings saved events
    const unsubscribeSettings = ipcService.onSettingsSaved((result) => {
      if (result.success) {
        // Reload settings after save
        ipcService.getSettings().then((settings) => {
          dispatch({ type: 'SET_SETTINGS', payload: settings as Settings });
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to save settings' });
      }
    });

    // Clean up listeners on unmount
    return () => {
      unsubscribeGameState();
      unsubscribeSettings();
    };
  }, []);

  // Handle overlay visibility changes
  useEffect(() => {
    if (state.overlayVisible) {
      ipcService.showOverlay();
    } else {
      ipcService.hideOverlay();
    }
  }, [state.overlayVisible]);

  // Handle overlay opacity changes
  useEffect(() => {
    ipcService.setOverlayTransparency(state.overlayOpacity);
  }, [state.overlayOpacity]);

  // Handle overlay position changes
  useEffect(() => {
    ipcService.positionOverlay(state.overlayPosition.x, state.overlayPosition.y);
  }, [state.overlayPosition]);

  // Handle overlay size changes
  useEffect(() => {
    ipcService.resizeOverlay(state.overlaySize.width, state.overlaySize.height);
  }, [state.overlaySize]);

  // Handle error reporting
  useEffect(() => {
    if (state.error) {
      ipcService.reportError(state.error);
    }
  }, [state.error]);

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
