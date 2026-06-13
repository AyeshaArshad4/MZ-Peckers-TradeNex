import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, registerApi, logoutApi } from '../../api/auth.api';

const loadFromStorage = (key, fallback = null) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

export const loginUser = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await loginApi(creds);
    return data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Login failed'); }
});

export const registerUser = createAsyncThunk('auth/register', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await registerApi(formData);
    return data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Registration failed'); }
});

const save = (user, access, refresh) => {
  localStorage.setItem('tn_user',    JSON.stringify(user));
  localStorage.setItem('tn_access',  access);
  localStorage.setItem('tn_refresh', refresh);
};

const clear = () => {
  localStorage.removeItem('tn_user');
  localStorage.removeItem('tn_access');
  localStorage.removeItem('tn_refresh');
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:         loadFromStorage('tn_user'),
    accessToken:  localStorage.getItem('tn_access'),
    refreshToken: localStorage.getItem('tn_refresh'),
    loading:      false,
    error:        null,
  },
  reducers: {
    setTokens(state, { payload }) {
      state.accessToken  = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      localStorage.setItem('tn_access',  payload.accessToken);
      localStorage.setItem('tn_refresh', payload.refreshToken);
    },
    logoutUser(state) {
      state.user = null; state.accessToken = null; state.refreshToken = null;
      clear();
    },
    clearError(state) { state.error = null; },
  },
  extraReducers: (b) => {
    b
      .addCase(loginUser.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.user         = payload.user;
        s.accessToken  = payload.accessToken;
        s.refreshToken = payload.refreshToken;
        save(payload.user, payload.accessToken, payload.refreshToken);
      })
      .addCase(loginUser.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(registerUser.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s) => { s.loading = false; })
      .addCase(registerUser.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; });
  },
});

export const { setTokens, logoutUser, clearError } = authSlice.actions;
export default authSlice.reducer;