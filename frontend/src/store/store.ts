import { configureStore } from "@reduxjs/toolkit";
import comparisonReducer from "./slices/comparisonSlice";

export const makeStore = () => configureStore({ reducer: { comparison: comparisonReducer } });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

