/* 基本情報 */
export type Team = 'us' | 'them';
export type RotationPos = 1 | 2 | 3 | 4 | 5 | 6;
export type PlayerId = string;

export type Position = 'WS' | 'OP' | 'M' | 'L' | 'S' | 'PS';
export type Rotation = Record<RotationPos, PlayerId>;

export type StatReception = { A: number; BC: number; miss: number };
export type StatServe = { count: number; point: number; miss: number };
export type StatBlock = { count: number; point: number };
export type StatSpike = { count: number; point: number; miss: number };
export type StatOther = { point: number; miss: number };

/* メタ情報 */
export type MatchMeta = {
    id: string;
    date: string;
    tournamentType: "" | "official" | "practice";
    tournamentName: string;
    venue: string;
    opponent: string;
    recorder: string;
};

/* テーブル情報 */
export type PlayerStats = {
    reception: StatReception;
    serve: StatServe;
    block: StatBlock;
    spike: StatSpike;
    other: StatOther;
};

/* 内部用選手情報型 */
export type Player = {
    id?: string;
    name: string;
    position: Position;
};

/* UI用選手情報型 */
export type PlayerRow = {
    playerId: PlayerId;
    name: string;
    position: Position;
    slot: RotationPos;
    stats: PlayerStats;
};

export type MatchSetState = {
    setNo: number;
    score: { us: number, them: number };
    server: Team;
    rotation: Rotation;
    libero?: string
}

export type MatchState = {
    id: string;
    setNo: number;
    score: { us: number; them: number };
    server: 'us' | 'them';
    rotation: Rotation;
    libero?: PlayerId;
    timeoutUsed: { us: boolean; them: boolean };
    members: Player[];
    stats: Record<PlayerId, PlayerStats>;
    slotOffset: number;
};

// サンプル初期値
export const emptyStats = (): PlayerStats => ({
    serve: { count: 0, point: 0, miss: 0 },
    spike: { count: 0, point: 0, miss: 0 },
    block: { count: 0, point: 0 },
    reception: { A: 0, BC: 0, miss: 0 },
    other: { point: 0, miss: 0 },
});

export const initialMatch: MatchState = {
    id: '',
    setNo: 1,
    score: { us: 0, them: 0 },
    server: 'us',
    rotation: { 1: 'p1', 2: 'p2', 3: 'p3', 4: 'p4', 5: 'p5', 6: 'p6' },
    timeoutUsed: { us: false, them: false },
    members: [],
    stats: { p1: emptyStats(), p2: emptyStats(), p3: emptyStats(), p4: emptyStats(), p5: emptyStats(), p6: emptyStats() },
    slotOffset: 0,
};

export type K1 = keyof PlayerStats;
export type K2<K extends K1> = keyof PlayerStats[K];
export type StatPath =
    | readonly ['reception', keyof StatReception]
    | readonly ['serve', keyof StatServe]
    | readonly ['block', keyof StatBlock]
    | readonly ['spike', keyof StatSpike]
    | readonly ['other', keyof StatOther];

export type StatReceptionKey = keyof PlayerStats['reception'];
export type StatServeKey = keyof PlayerStats['serve'];
export type StatBlockKey = keyof PlayerStats['block'];
export type StatSpikeKey = keyof PlayerStats['spike'];
export type StatOtherKey = keyof PlayerStats['other'];