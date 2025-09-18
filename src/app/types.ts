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
