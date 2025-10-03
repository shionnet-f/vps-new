import { configureStore, Middleware } from '@reduxjs/toolkit';
import match from '../features/match/matchSlice';
import { enablePatches } from 'immer';
enablePatches();

const historyLogger: Middleware = store => next => action => {
    const ret = next(action);
    const st: any = store.getState();
    const past = st.match?.past, future = st.match?.future;
    if (past && future) {
        const undoLbl = past.at(-1)?.label ?? '(none)';
        const redoLbl = future[0]?.label ?? '(none)';
        console.log(`[hist] ${action.type} → undo:${undoLbl} / redo:${redoLbl} (past:${past.length}, future:${future.length})`);
    }
    return ret;
};

export const store = configureStore({
    reducer: { match },
    middleware: (getDefault) => getDefault().concat(historyLogger)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
