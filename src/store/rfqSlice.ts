import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RFQItem } from "../interface";

interface RFQState {
    RFQData: RFQItem[];
    EstimationData: RFQItem[];
}

const initialState: RFQState = {
    RFQData: [],
    EstimationData: [],
};

const RFQSlice = createSlice({
    name: "RFQ",
    initialState,
    reducers: {
        addRFQ: (state, action: PayloadAction<RFQItem>) => {
            state.RFQData.push(action.payload);
        },
        addEstimation: (state, action: PayloadAction<RFQItem>) => {
            state.EstimationData.push(action.payload);
        },
        deleteRFQ: (state, action: PayloadAction<string>) => {
            state.RFQData = state.RFQData.filter(
                (rfq) => rfq.id !== action.payload
            );
        },
        deleteEstimation: (state, action: PayloadAction<string>) => {
            state.EstimationData = state.EstimationData.filter(
                (est) => est.id !== action.payload
            );
        },
        updateRFQ: (state, action: PayloadAction<RFQItem>) => {
            const updatedRFQ = action.payload;
            state.RFQData = state.RFQData.map((rfq) =>
                rfq.id === updatedRFQ.id ? updatedRFQ : rfq
            );
        },
        updateEstimation: (state, action: PayloadAction<RFQItem>) => {
            const updatedEstimation = action.payload;
            state.EstimationData = state.EstimationData.map((est) =>
                est.id === updatedEstimation.id ? updatedEstimation : est
            );
        },
        setRFQData: (state, action: PayloadAction<RFQItem[]>) => {
            state.RFQData = action.payload;
        },
        setEstimationData: (state, action: PayloadAction<RFQItem[]>) => {
            state.EstimationData = action.payload;
        },
        showRFQData: (state, action: PayloadAction<RFQItem[]>) => {
            state.RFQData = action.payload;
        },
        showEstimationData: (state, action: PayloadAction<RFQItem[]>) => {
            state.EstimationData = action.payload;
        },
    }
})

export const { setRFQData, setEstimationData } = RFQSlice.actions;
export default RFQSlice.reducer;

