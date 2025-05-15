import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TeamComp, RecommendedItem, RecommendedAugment } from '../../shared/types';

interface RecommendationsState {
  teamComps: TeamComp[];
  recommendedItems: RecommendedItem[];
  recommendedAugments: RecommendedAugment[];
  loading: boolean;
  error: string | null;
}

const initialState: RecommendationsState = {
  teamComps: [],
  recommendedItems: [],
  recommendedAugments: [],
  loading: false,
  error: null,
};

const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTeamComps: (state, action: PayloadAction<TeamComp[]>) => {
      state.teamComps = action.payload;
    },
    setRecommendedItems: (state, action: PayloadAction<RecommendedItem[]>) => {
      state.recommendedItems = action.payload;
    },
    setRecommendedAugments: (state, action: PayloadAction<RecommendedAugment[]>) => {
      state.recommendedAugments = action.payload;
    },
    clearRecommendations: (state) => {
      state.teamComps = [];
      state.recommendedItems = [];
      state.recommendedAugments = [];
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setTeamComps,
  setRecommendedItems,
  setRecommendedAugments,
  clearRecommendations,
} = recommendationsSlice.actions;

export default recommendationsSlice.reducer;
