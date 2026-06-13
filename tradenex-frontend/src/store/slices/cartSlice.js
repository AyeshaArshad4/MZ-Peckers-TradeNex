import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCartApi, addToCartApi, removeFromCartApi, clearCartApi } from '../../api/cart.api';

export const fetchCart    = createAsyncThunk('cart/fetch',  async () => { const { data } = await getCartApi(); return data.data; });
export const addToCart    = createAsyncThunk('cart/add',    async (payload) => { const { data } = await addToCartApi(payload); return data.data; });
export const removeFromCart = createAsyncThunk('cart/remove', async (id) => { const { data } = await removeFromCartApi(id); return data.data; });
export const clearCart    = createAsyncThunk('cart/clear',  async () => { await clearCartApi(); return { items: [], cartTotal: 0 }; });

const cartSlice = createSlice({
  name: 'cart',
  initialState: { cartId: null, items: [], cartTotal: 0, loading: false },
  reducers: {},
  extraReducers: (b) => {
    const setCart = (s, { payload }) => { Object.assign(s, payload); s.loading = false; };
    b
      .addCase(fetchCart.pending,      (s) => { s.loading = true; })
      .addCase(fetchCart.fulfilled,    setCart)
      .addCase(fetchCart.rejected,     (s) => { s.loading = false; })
      .addCase(addToCart.fulfilled,    setCart)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(clearCart.fulfilled,    setCart);
  },
});

export default cartSlice.reducer;