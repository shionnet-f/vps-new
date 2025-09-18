/* メタ情報 */
type MatchMeta = {
    date: string;
    tournamentType: "" | "official" | "practice";
    tournamentName: string;
    venue: string;
    opponent: string;
    recorder: string;
};

/* テーブル情報 */
type RotationPos = 1 | 2 | 3 | 4 | 5 | 6;
type PlayerId = string;
type Position = 'WS' | 'OP' | 'M' | 'L' | 'S' | 'PS';
type Rotation = Record<RotationPos, PlayerId>;

type StatReception = { A: number; BC: number; miss: number };
type StatServe = { count: number; point: number; miss: number };
type StatBlock = { count: number; point: number };
type StatSpike = { count: number; point: number; miss: number };
type StatOther = { point: number; miss: number };

type PlayerStats = {
    reception: StatReception;
    serve: StatServe;
    block: StatBlock;
    spike: StatSpike;
    other: StatOther;
};

type PlayerRow = {
    slot: RotationPos;
    position: Position;
    name: string;
    id?: string;
    stats: PlayerStats;
};

type MatchSetState = {
    setNo: number;
    score: { us: number, them: number };
    weServed: boolean;
    rotation: Rotation;
    libero?: string
}
