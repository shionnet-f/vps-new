'use client'

import { RotationPos, PlayerId, Team, Rotation, PlayerStats } from "@/app/types";
import { MatchState, match001, members } from "@/app/match_001";

type Command<S> = { kind: string; apply(s: S): S; revert(s: S): S };

// 交代
function subCommand(pos: RotationPos, inPlayer: PlayerId, before: PlayerId): Command<MatchState> {
    return {
        kind: 'playerchange',
        apply: s => ({ ...s, rotation: { ...s.rotation, [pos]: inPlayer } }),
        revert: s => ({ ...s, rotation: { ...s.rotation, [pos]: before } }),
    };
}

// TO
function timeoutCommand(team: Team, before: boolean): Command<MatchState> {
    return {
        kind: 'timeout.toggle',
        apply: s => ({ ...s, timeoutUsed: { ...s.timeoutUsed, [team]: !before } }),
        revert: s => ({ ...s, timeoutUsed: { ...s.timeoutUsed, [team]: before } }),
    };
}

// ラリー
function rallyCommand(winner: Team): Command<MatchState> {
    let snap: { score: MatchState['score']; rotation: Rotation; server: Team } | null = null;
    const rotate = (r: Rotation) => ({ 1: r[2], 2: r[3], 3: r[4], 4: r[5], 5: r[6], 6: r[1] });
    return {
        kind: 'score.rally',
        apply: s => {
            if (!snap) snap = { score: s.score, rotation: s.rotation, server: s.server };
            const serverChange = s.server !== winner;
            const nextScore = { ...s.score, [winner]: s.score[winner] + 1 };
            const nextServer = serverChange ? winner : s.server;
            const nextRotation = (serverChange && winner === 'us') ? rotate(s.rotation) : s.rotation;
            return { ...s, score: nextScore, rotation: nextRotation, server: nextServer };
        },
        revert: s => snap ? { ...s, score: snap.score, rotation: snap.rotation, server: snap.server } : s,
    };
}

// セルの変化
type K1 = keyof PlayerStats;
type K2<K extends K1> = keyof PlayerStats[K];
function tableCommand<K extends K1, P extends K2<K>>(pid: PlayerId, path: [K, P]): Command<MatchState> {
    const [k1, k2] = path;
    return {
        kind: 'table.inc',
        apply: s => {
            const ps = s.stats[pid];
            const after = (ps[k1][k2] as number) + 1;
            return { ...s, stats: { ...s.stats, [pid]: { ...ps, [k1]: { ...ps[k1], [k2]: after } as any } } };
        },
        revert: s => {
            const ps = s.stats[pid];
            const after = Math.max(0, (ps[k1][k2] as number) - 1);
            return { ...s, stats: { ...s.stats, [pid]: { ...ps, [k1]: { ...ps[k1], [k2]: after } as any } } };
        },
    };
}



const cmdArry: MatchState[] = []

const subClickhandle = () => {
    const subObj = subCommand(3, 'p7', 'p3');
    cmdArry.push(subObj);
    console.log(cmdArry)
}
const toClickhandle = () => {
    const subObj = timeoutCommand('us', true);
    cmdArry.push(subObj);
    console.log(cmdArry)
}
const scoreClickhandle = () => {
    const subObj = rallyCommand('us');
    cmdArry.push(subObj);
    console.log(cmdArry)
}
const cellClickhandle = () => {
    const subObj = tableCommand('p2', ['spike', 'count']);
    cmdArry.push(subObj);
    console.log(cmdArry)
}


export default function inputPage() {
    return (
        <>
            <h1 className="text-black">こんにちは</h1>
            <button onClick={subClickhandle} className="border border-indigo-600 text-black">選手交代ボタン</button>
            <p></p>
            <button onClick={toClickhandle} className="border border-indigo-600 text-black">TOボタン</button>
            <p></p>
            <button onClick={scoreClickhandle} className="border border-indigo-600 text-black">ラリーボタン</button>
            <p></p>
            <button onClick={cellClickhandle} className="border border-indigo-600 text-black">セル内ボタン</button>
        </>
    )
};