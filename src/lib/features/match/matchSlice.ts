import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { produceWithPatches, applyPatches, Patch } from 'immer';
import { MatchState, Team, PlayerId, Rotation, initialMatch, StatPath, PlayerStats } from './types';

import type { RootState, AppDispatch } from "@/lib/store";

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
        _applyPatches(
            state,
            action: PayloadAction<{ label?: string; patches: Patch[]; inverse: Patch[] }>
        ) {
            const { patches, inverse, label } = action.payload;
            if (patches.length === 0) return;
            state.present = applyPatches(state.present, patches);
            state.past.push({ redo: patches, undo: inverse, label });
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
                    if (winner === 'us') {
                        draft.rotation = rotateCW(draft.rotation);
                        draft.slotOffset = ((draft.slotOffset ?? 0) + 1) % 6;
                    }
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

        bumpCell(state, action: PayloadAction<{ pid: PlayerId; path: StatPath }>) {
            const { pid, path } = action.payload;
            const k1 = path[0] as keyof PlayerStats;
            const k2 = path[1] as keyof PlayerStats[typeof k1];
            const [next, patches, inversePatches] = produceWithPatches(
                state.present,
                (draft) => {
                    (draft.stats[pid][k1] as any)[k2] += 1;
                }
            );

            if (patches.length === 0) return;
            state.present = next;
            state.past.push({
                redo: patches,
                undo: inversePatches,
                label: `cell:${pid}.${String(k1)}.${String(k2)}+1`,
            });
            state.future = [];
        },
    }
});

export const applyWithHistory =
    (args: { label?: string; mutate: (draft: MatchState) => void }) =>
        (dispatch: AppDispatch, getState: () => RootState) => {
            const present = getState().match.present;
            const [_, patches, inverse] = produceWithPatches(present, args.mutate);
            dispatch(_applyPatches({ label: args.label, patches, inverse }));
        };


export const { _applyPatches, rally, toggleTimeout, bumpCell, undo, redo } = slice.actions;
export default slice.reducer;
