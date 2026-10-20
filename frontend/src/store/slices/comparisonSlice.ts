import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { NormalizedProduct } from "@/types/product";

interface ComparisonState {
  selectedProducts: NormalizedProduct[];
  notice: string | null;
}

const initialState: ComparisonState = { selectedProducts: [], notice: null };

const comparisonSlice = createSlice({
  name: "comparison",
  initialState,
  reducers: {
    addProduct(state, action: PayloadAction<NormalizedProduct>) {
      const product = action.payload;
      if (state.selectedProducts.some((item) => item.id === product.id)) {
        state.notice = "Este producto ya está en la comparación.";
        return;
      }
      if (state.selectedProducts.length >= 3) {
        state.notice = "Puedes comparar un máximo de 3 productos.";
        return;
      }
      if (state.selectedProducts[0]?.category !== undefined && state.selectedProducts[0].category !== product.category) {
        state.notice = "Solo puedes comparar productos de la misma categoría.";
        return;
      }
      if (product.brand && state.selectedProducts.some((item) => item.brand === product.brand)) {
        state.notice = "Para comparar por marcas, elige un producto de una marca diferente.";
        return;
      }
      state.selectedProducts.push(product);
      state.notice = `${product.name} se agregó a la comparación.`;
    },
    removeProduct(state, action: PayloadAction<string>) {
      state.selectedProducts = state.selectedProducts.filter((product) => product.id !== action.payload);
      state.notice = null;
    },
    clearComparison(state) {
      state.selectedProducts = [];
      state.notice = null;
    },
    clearNotice(state) {
      state.notice = null;
    },
  },
});

export const { addProduct, removeProduct, clearComparison, clearNotice } = comparisonSlice.actions;
export default comparisonSlice.reducer;

