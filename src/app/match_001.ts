import { Player, PlayerId, PlayerStats, Rotation } from "@/lib/features/match/types";

export const players: Player[] = [
    { id: 'p1', name: 'Sato', position: 'WS' },
    { id: 'p2', name: 'Kato', position: 'OP' },
    { id: 'p3', name: 'Ito', position: 'M' },
    { id: 'p4', name: 'Abe', position: 'S' },
    { id: 'p5', name: 'Ono', position: 'WS' },
    { id: 'p6', name: 'Endo', position: 'M' },
    { id: 'L1', name: 'Libero', position: 'L' },
];

export const members: Player[] = [
    { id: 'p1', name: 'Sato', position: 'WS' },
    { id: 'p2', name: 'Kato', position: 'OP' },
    { id: 'p3', name: 'Ito', position: 'M' },
    { id: 'p4', name: 'Abe', position: 'S' },
    { id: 'p5', name: 'Ono', position: 'WS' },
    { id: 'p6', name: 'Endo', position: 'M' },
    { id: 'p7', name: 'Member1', position: 'WS' },
    { id: 'p8', name: 'Member2', position: 'OP' },
    { id: 'p9', name: 'Member3', position: 'M' },
    { id: 'p11', name: 'Member4', position: 'S' },
    { id: 'p12', name: 'Member5', position: 'WS' },
    { id: 'L1', name: 'Member6', position: 'L' },
    { id: 'L2', name: 'Member7', position: 'L' },
];


const emptyStats = (): PlayerStats => ({
    reception: { A: 0, BC: 0, miss: 0 },
    serve: { count: 0, point: 0, miss: 0 },
    block: { count: 0, point: 0 },
    spike: { count: 0, point: 0, miss: 0 },
    other: { point: 0, miss: 0 },
});


const stats: Record<PlayerId, PlayerStats> =
    Object.fromEntries(players.map(p => [p.id, emptyStats()]));

const rotation: Rotation = {
    1: 'p1',
    2: 'p2',
    3: 'p3',
    4: 'p4',
    5: 'p5',
    6: 'p6',
};

export type MatchState = {
    id: string;
    setNo: number;
    score: { us: number; them: number };
    server: 'us' | 'them';
    rotation: Rotation;
    libero?: PlayerId;
    timeoutUsed: { us: boolean; them: boolean };
    players: Player[];
    stats: Record<PlayerId, PlayerStats>;
};

export const match001: MatchState = {
    id: 'match-001',
    setNo: 1,
    score: { us: 0, them: 0 },
    server: 'us',
    rotation,
    libero: 'L1',
    timeoutUsed: { us: false, them: false },
    players,
    stats,
};