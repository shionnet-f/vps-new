'use client';
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { bumpCell, redo, undo, rally, applyWithHistory, toggleTimeout } from "@/lib/features/match/matchSlice";
import { MatchMeta, MatchState, PlayerStats, PlayerRow, Rotation, RotationPos, emptyStats, K1, K2, StatPath } from "@/lib/features/match/types";

type ReceptionKey = keyof PlayerStats['reception'];
type ServeKey = keyof PlayerStats['serve'];
type BlockKey = keyof PlayerStats['block'];
type SpikeKey = keyof PlayerStats['spike'];
type OtherKey = keyof PlayerStats['other'];

const RECEPTION_KEYS = ['A', 'BC', 'miss'] satisfies ReadonlyArray<ReceptionKey>;
const SERVE_KEYS = ['count', 'point', 'miss'] satisfies ReadonlyArray<ServeKey>;
const BLOCK_KEYS = ['count', 'point'] satisfies ReadonlyArray<BlockKey>;
const SPIKE_KEYS = ['count', 'point', 'miss'] satisfies ReadonlyArray<SpikeKey>;
const OTHER_KEYS = ['point', 'miss'] satisfies ReadonlyArray<OtherKey>;


function path<K extends keyof PlayerStats, P extends keyof PlayerStats[K]>(k1: K, k2: P) {
    return [k1, k2] as const; // readonly タプル
}
function deriveRows(state: MatchState): PlayerRow[] {
    const rows: PlayerRow[] = [];
    (Object.keys(state.rotation) as unknown as (keyof Rotation)[])
        .sort((a, b) => Number(a) - Number(b))
        .forEach((pos) => {
            const pid = state.rotation[pos as 1 | 2 | 3 | 4 | 5 | 6];
            const m = state.members.find(x => x.id === pid);
            rows.push({
                playerId: pid,
                name: m?.name ?? '',
                position: m?.position ?? 'WS',
                slot: pos as RotationPos,
                stats: state.stats[pid] ?? emptyStats(),
            });
        });
    return rows;
}

function Cell({ v, onClick }: { v: number; onClick(): void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full h-8 grid place-items-center
                 bg-transparent hover:bg-purple-50
                 text-[11px] leading-tight
                 border-0 focus:outline-none focus:ring-0"
        >
            {v}
        </button>
    );
}

export default function MatchInputTable() {
    const [meta, setMeta] = useState<MatchMeta>({
        id: '',
        date: '',
        tournamentType: "",
        tournamentName: '',
        venue: '',
        opponent: '',
        recorder: ''
    })

    const dispatch = useAppDispatch();
    const present = useAppSelector(s => s.match.present);
    const canUndo = useAppSelector(s => s.match.past.length > 0);
    const canRedo = useAppSelector(s => s.match.future.length > 0);
    const rows = deriveRows(present);
    const score = present.score
    const server = present.server

    function getVal<K extends keyof PlayerStats, P extends keyof PlayerStats[K]>(
        pid: string, k1: K, k2: P
    ): number {
        // UI読み取り専用なので any 経由でOK
        return ((present.stats[pid]?.[k1] as any)?.[k2] ?? 0) as number;
    }

    // const r1 = (n: number) => Math.round(n * 10) / 10;
    // function totalPlus(s: MatchState, pid: string) {
    //     const ps = s.stats[pid]; if (!ps) return 0;
    //     return ps.serve.point + ps.block.point + ps.spike.point + ps.other.point;
    // }
    // function totalMinus(s: MatchState, pid: string) {
    //     const ps = s.stats[pid]; if (!ps) return 0;
    //     return ps.serve.miss + ps.spike.miss + ps.other.miss + ps.reception.miss;
    // }
    // function totalNet(s: MatchState, pid: string) { return totalPlus(s, pid) - totalMinus(s, pid); }

    const metaClass = 'h-10 w-full rounded-md border border-gray-300 bg-[#D9D9D9] px-3 text-sm outline-none focus:ring-2 focus:ring-purple-300'
    const tableBorder = 'border border-[#6D28D9]/40';


    return (
        <main className="text-black">
            {/* メタ情報 */}
            <section className="w-full max-w-screen-lg mx-auto px-4 py-4">
                {/* 1段目（Date / 試合タイプ / 記入者） */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex flex-col">
                        <span className="text-xs text-gray-600 mb-1">Date</span>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={meta.date}
                            onChange={(e) => setMeta({ ...meta, date: e.target.value })}
                            className={metaClass}
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-xs text-gray-600 mb-1">試合タイプ</span>
                        <select
                            id="tournament-type"
                            name="tournamentType"
                            value={meta.tournamentType}
                            onChange={(e) =>
                                setMeta({
                                    ...meta,
                                    tournamentType: e.target.value as MatchMeta['tournamentType'],
                                })
                            }
                            className={metaClass}
                        >
                            <option value="">-</option>
                            <option value="official">official</option>
                            <option value="practice">practice</option>
                        </select>
                    </label>

                    <label className="flex flex-col">
                        <span className="text-xs text-gray-600 mb-1">記入者</span>
                        <input
                            type="text"
                            id="recorder"
                            name="recorder"
                            value={meta.recorder}
                            onChange={(e) => setMeta({ ...meta, recorder: e.target.value })}
                            className={metaClass}
                        />
                    </label>
                </div>

                {/* 2段目（大会名 / 会場名 / 対戦相手） */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex flex-col">
                        <span className="text-xs text-gray-600 mb-1">大会名</span>
                        <input
                            type="text"
                            id="tournament-name"
                            name="tournamentName"
                            value={meta.tournamentName}
                            onChange={(e) => setMeta({ ...meta, tournamentName: e.target.value })}
                            className={metaClass}
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-xs text-gray-600 mb-1">会場名</span>
                        <input
                            type="text"
                            id="venue"
                            name="venue"
                            value={meta.venue}
                            onChange={(e) => setMeta({ ...meta, venue: e.target.value })}
                            className={metaClass}
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="text-xs text-gray-600 mb-1">対戦相手</span>
                        <input
                            type="text"
                            id="opponent"
                            name="opponent"
                            value={meta.opponent}
                            onChange={(e) => setMeta({ ...meta, opponent: e.target.value })}
                            className={metaClass}
                        />
                    </label>
                </div>
                <h2 id="scorebar-heading" className="sr-only">スコア操作</h2>

                <div className="flex items-center gap-4 py-5">
                    {/* 左：セット番号 + 学校名 + スコア */}
                    <div className="flex-[3_3_0%] min-w-0
                  flex items-center gap-3 sm:gap-4 px-3 py-2
                  rounded-md border border-gray-400/60 bg-gray-200/60">
                        <span className="inline-flex items-center justify-center
                 w-10 h-10 md:w-12 md:h-12
                 rounded bg-white border border-gray-400/60
                 text-base md:text-xl font-bold">
                            1
                        </span>

                        <div className="flex items-baseline gap-3 md:gap-4">
                            <span className="font-semibold text-base md:text-xl">
                                {server === "us" ? "◎" : ""}鳥野高校
                            </span>

                            <output aria-live="polite" className="font-extrabold text-2xl md:text-4xl leading-none">
                                {score.us} <span className="text-gray-600 font-semibold text-xl md:text-2xl">-</span> {score.them}
                            </output>

                            <span className="font-semibold text-base md:text-xl">
                                {server === "them" ? "◎" : ""}
                                {meta.opponent}
                            </span>
                        </div>
                        <div
                            role="group"
                            aria-label="得点加算"
                            className="ml-auto flex gap-2 rounded-full border border-purple-400 p-1 bg-white"
                        >
                            <button
                                className="px-4 py-1.5 rounded-full bg-purple-700 text-white hover:bg-purple-800"
                                onClick={() => dispatch(rally({ winner: 'us' }))}
                            >
                                us +1
                            </button>
                            <button
                                className="px-4 py-1.5 rounded-full border border-purple-700 text-purple-700 hover:bg-gray-200"
                                onClick={() => dispatch(rally({ winner: 'them' }))}
                            >
                                them +1
                            </button>
                        </div>
                    </div>

                    {/* 右：Undo/Redo（上に小さなラベル） */}
                    <div className="flex-[1_1_0%] min-w-[220px] flex items-end justify-end gap-3 ">
                        <figure className="text-center">
                            <figcaption className="text-[11px] text-gray-600 mb-1">1つ戻る</figcaption>
                            <button type="button" aria-label="1つ戻る"
                                className="px-8 py-2 rounded-md border border-gray-400/60 bg-gray-200/70 hover:bg-gray-300 font-bold"
                                onClick={() => dispatch(undo())} disabled={!canUndo}>
                                ＜＜
                            </button>
                        </figure>
                        <figure className="text-center">
                            <figcaption className="text-[11px] text-gray-600 mb-1">1つ進む</figcaption>
                            <button type="button" aria-label="1つ進む"
                                onClick={() => dispatch(redo())} disabled={!canRedo}
                                className="px-8 py-2 rounded-md border border-gray-400/60 bg-gray-200/70 hover:bg-gray-300 font-bold">
                                ＞＞
                            </button>
                        </figure>
                    </div>
                </div>

                {/* 区切り線 */}
                <hr className="mt-3 border-gray-400/40" />
            </section>

            <section className="mt-4">
                <div className="w-full max-w-screen-lg mx-auto overflow-x-auto
                        [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <table
                        className="
                            w-full table-fixed border-collapse font-bold text-[11px]
                            [&>thead>tr]:h-8 [&>tbody>tr>td]:p-0 [&>tbody>tr>td]:h-8
                          "
                    >
                        <colgroup>
                            <col className="w-7" />
                            <col className="w-11" />
                            <col className="w-24" />
                            <col className="w-10" span={3} />
                            <col className="w-10" span={3} />
                            <col className="w-9" span={2} />
                            <col className="w-10" span={3} />
                            <col className="w-9" span={2} />
                        </colgroup>

                        <thead>
                            <tr className="bg-[#6D28D9] text-white h-8">
                                <th className={tableBorder} rowSpan={2}>順</th>
                                <th className={tableBorder} rowSpan={2}>ポジ</th>
                                <th className={tableBorder} rowSpan={2}>名前</th>

                                <th className={tableBorder} colSpan={3}>レセプション</th>
                                <th className={tableBorder} colSpan={3}>サーブ</th>
                                <th className={tableBorder} colSpan={2}>ブロック</th>
                                <th className={tableBorder} colSpan={3}>スパイク</th>
                                <th className={tableBorder} colSpan={2}>その他</th>
                            </tr>
                            <tr className="bg-[#D9D9D9] text-[#6D28D9] h-8 text-[11px]">
                                {/* レセプション */}
                                <th className={tableBorder}>A</th>
                                <th className={tableBorder}>BC</th>
                                <th className={tableBorder}>ミスP</th>
                                {/* サーブ */}
                                <th className={tableBorder}>回</th>
                                <th className={tableBorder}>P</th>
                                <th className={tableBorder}>ミス</th>
                                {/* ブロック */}
                                <th className={tableBorder}>回</th>
                                <th className={tableBorder}>P</th>
                                {/* スパイク */}
                                <th className={tableBorder}>回</th>
                                <th className={tableBorder}>P</th>
                                <th className={tableBorder}>ミス</th>
                                {/* その他 */}
                                <th className={tableBorder}>P</th>
                                <th className={tableBorder}>ミス</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[#D9D9D9] text-center">
                            {rows.map(r => (
                                <tr key={r.playerId} className="align-middle">
                                    {/* 順/ポジ/名前 */}
                                    {/* 順/ポジ/名前 */}
                                    <td className={`h-8 ${tableBorder}`}>{r.slot}</td>

                                    {/* ポジション：select 即時保存 */}
                                    <td className={`h-8 ${tableBorder} p-0`}>
                                        <select
                                            className="w-full h-8 bg-white text-[11px] outline-none focus:ring-2 focus:ring-purple-300"
                                            value={r.position}
                                            onChange={(e) => {
                                                const pos = e.target.value as 'WS' | 'OP' | 'M' | 'L' | 'S' | 'PS';
                                                dispatch(applyWithHistory({
                                                    label: `position:${r.playerId}=${pos}`,
                                                    mutate: (draft) => {
                                                        // members になければ作成（最小）
                                                        const idx = draft.members.findIndex(m => m.id === r.playerId);
                                                        if (idx === -1) {
                                                            draft.members.push({ id: r.playerId, name: r.name ?? '', position: pos });
                                                        } else {
                                                            draft.members[idx].position = pos;
                                                        }
                                                    }
                                                }));
                                            }}
                                        >
                                            {(['WS', 'OP', 'M', 'L', 'S', 'PS'] as const).map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* 名前：input（blurで保存して履歴1件に） */}
                                    <td className={`h-8 ${tableBorder} p-0`}>
                                        <input
                                            type="text"
                                            defaultValue={r.name}
                                            className="w-full h-8 px-2 bg-white text-[11px] outline-none focus:ring-2 focus:ring-purple-300"
                                            onBlur={(e) => {
                                                const name = e.target.value;
                                                if (name === r.name) return; // 変化なしなら何もしない
                                                dispatch(applyWithHistory({
                                                    label: `name:${r.playerId}=${name}`,
                                                    mutate: (draft) => {
                                                        const idx = draft.members.findIndex(m => m.id === r.playerId);
                                                        if (idx === -1) {
                                                            // 既存行の表示値を尊重して新規作成
                                                            draft.members.push({ id: r.playerId, name, position: r.position });
                                                        } else {
                                                            draft.members[idx].name = name;
                                                        }
                                                    }
                                                }));
                                            }}
                                        />
                                    </td>

                                    {/* レセプション A / BC / ミスP */}
                                    {RECEPTION_KEYS.map(k => (
                                        <td key={k} className={`${tableBorder} p-0`}>
                                            <Cell
                                                v={getVal(r.playerId, 'reception', k)}
                                                onClick={() => dispatch(bumpCell({ pid: r.playerId, path: path('reception', k) }))}
                                            />
                                        </td>
                                    ))}

                                    {/* サーブ 回 / P / ミス */}
                                    {SERVE_KEYS.map(k => (
                                        <td key={k} className={`${tableBorder} p-0`}>
                                            <Cell
                                                v={getVal(r.playerId, 'serve', k)}
                                                onClick={() => dispatch(bumpCell({ pid: r.playerId, path: path('serve', k) }))}
                                            />
                                        </td>
                                    ))}


                                    {/* ブロック 回 / P */}
                                    {BLOCK_KEYS.map(k => (
                                        <td key={k} className={`${tableBorder} p-0`}>
                                            <Cell
                                                v={getVal(r.playerId, 'block', k)}
                                                onClick={() => dispatch(bumpCell({ pid: r.playerId, path: path('block', k) }))}
                                            />
                                        </td>
                                    ))}


                                    {/* スパイク 回 / P / ミス */}
                                    {SPIKE_KEYS.map(k => (
                                        <td key={k} className={`${tableBorder} p-0`}>
                                            <Cell
                                                v={getVal(r.playerId, 'spike', k)}
                                                onClick={() => dispatch(bumpCell({ pid: r.playerId, path: path('spike', k) }))}
                                            />
                                        </td>
                                    ))}


                                    {/* その他 P / ミス */}
                                    {OTHER_KEYS.map(k => (
                                        <td key={k} className={`${tableBorder} p-0`}>
                                            <Cell
                                                v={getVal(r.playerId, 'other', k)}
                                                onClick={() => dispatch(bumpCell({ pid: r.playerId, path: path('other', k) }))}
                                            />
                                        </td>
                                    ))}

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <section className="text-black max-w-screen-lg mx-auto px-4 py-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-semibold
                 hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    >
                        選手交代
                    </button>
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-red-300 bg-white text-sm font-semibold text-red-700
                 hover:bg-red-50 active:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                        タイムアウト
                    </button>
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-semibold
                 hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    >
                        要約
                    </button>
                    <div className="ms-auto" />
                    <button
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-md border border-transparent bg-purple-700 text-white text-sm font-semibold
                 hover:bg-purple-800 active:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm"
                    >
                        保存
                    </button>
                </div>
            </section>

        </main >
    )
};