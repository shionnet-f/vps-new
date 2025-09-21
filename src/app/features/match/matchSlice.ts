import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { produceWithPatches, applyPatches, Patch } from 'immer';
import { MatchState, Team, PlayerId, Rotation, initialMatch } from './types';


type HistoryEntry = { redo: Patch[]; undo: Patch[]; label?: string };
type Undoable<T> = { present: T; past: HistoryEntry[]; future: HistoryEntry[] };

const rotateCW = (r: Rotation): Rotation => ({ 1: r[2], 2: r[3], 3: r[4], 4: r[5], 5: r[6], 6: r[1] });

export const initialState: Undoable<MatchState> = {
    present: initialMatch,
    past: [],
    future: [],
};

const slice = createSlice({
    name: 'matchInput',
    initialState,
    reducers: {
        applyWithHistory(state, action: PayloadAction<{ label?: string; mutate: (draft: MatchState) => void; }>) {
            const [next, patches, inverse] = produceWithPatches(state.present, action.payload.mutate);
            if (patches.length === 0) return;
            state.present = next;
            state.past.push({ redo: patches, undo: inverse, label: action.payload.label });
            state.future = [];
        },
        undo(state) {
            const h = state.past.pop();
            if (!h) return;
            state.present = applyPatches(state.present, h.undo);
            state.future.unshift(h);
        },
        redo(state) {
            const h = state.future.shift();
            if (!h) return;
            state.present = applyPatches(state.present, h.redo);
            state.past.push(h);
        },

        rally(state, action: PayloadAction<{ winner: Team }>) {
            const { winner } = action.payload;
            const [next, p, inv] = produceWithPatches(state.present, draft => {
                const serverChange = draft.server !== winner;
                draft.score[winner] += 1;
                if (serverChange) {
                    draft.server = winner;
                    if (winner === 'us') draft.rotation = rotateCW(draft.rotation);
                }
            });
            if (p.length === 0) return;
            state.present = next;
            state.past.push({ redo: p, undo: inv, label: `rally:${winner}` });
            state.future = [];
        },

        toggleTimeout(state, action: PayloadAction<{ team: Team }>) {
            const { team } = action.payload;
            const [next, p, inv] = produceWithPatches(state.present, d => {
                d.timeoutUsed[team] = !d.timeoutUsed[team];
            });
            if (p.length === 0) return;
            state.present = next;
            state.past.push({ redo: p, undo: inv, label: `timeout:${team}` });
            state.future = [];
        },

        bumpCell(state, action: PayloadAction<{ pid: PlayerId; path: ['spike', 'count'] | ['serve', 'point'] | ['serve', 'miss'] }>) {
            const { pid, path } = action.payload;
            const [k1, k2] = path;
            const [next, p, inv] = produceWithPatches(state.present, d => {
                (d.stats[pid][k1] as any)[k2] += 1;
            });
            if (p.length === 0) return;
            state.present = next;
            state.past.push({ redo: p, undo: inv, label: `cell:${pid}.${k1}.${k2}+1` });
            state.future = [];
        },
    }
});

export const { applyWithHistory, rally, toggleTimeout, bumpCell, undo, redo } = slice.actions;
export default slice.reducer;
