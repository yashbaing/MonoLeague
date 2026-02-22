export type Role = 'WK' | 'BAT' | 'AR' | 'BOWL';

export interface Player {
  id: number;
  name: string;
  role: Role;
  credit: number;
  teamId: 0 | 1; // 0 = teamA, 1 = teamB
}

// matchId -> players
export const mockPlayers: Record<number, Player[]> = {
  1: [
    { id: 101, name: 'R Sharma', role: 'BAT', credit: 10, teamId: 0 },
    { id: 102, name: 'V Kohli', role: 'BAT', credit: 10, teamId: 0 },
    { id: 103, name: 'R Pant', role: 'WK', credit: 9, teamId: 0 },
    { id: 104, name: 'H Pandya', role: 'AR', credit: 9, teamId: 0 },
    { id: 105, name: 'J Bumrah', role: 'BOWL', credit: 9, teamId: 0 },
    { id: 106, name: 'D Warner', role: 'BAT', credit: 9, teamId: 1 },
    { id: 107, name: 'S Smith', role: 'BAT', credit: 9, teamId: 1 },
    { id: 108, name: 'A Carey', role: 'WK', credit: 8, teamId: 1 },
    { id: 109, name: 'M Marsh', role: 'AR', credit: 9, teamId: 1 },
    { id: 110, name: 'P Cummins', role: 'BOWL', credit: 9, teamId: 1 },
    { id: 111, name: 'S Yadav', role: 'BAT', credit: 8, teamId: 0 },
    { id: 112, name: 'K Yadav', role: 'BOWL', credit: 8, teamId: 0 },
    { id: 113, name: 'R Jadeja', role: 'AR', credit: 8, teamId: 0 },
    { id: 114, name: 'S Iyer', role: 'BAT', credit: 8, teamId: 0 },
    { id: 115, name: 'M Starc', role: 'BOWL', credit: 8, teamId: 1 },
    { id: 116, name: 'M Labuschagne', role: 'BAT', credit: 8, teamId: 1 },
    { id: 117, name: 'T Head', role: 'BAT', credit: 8, teamId: 1 },
    { id: 118, name: 'C Green', role: 'AR', credit: 7, teamId: 1 },
  ],
  2: [
    { id: 201, name: 'R Sharma', role: 'BAT', credit: 10, teamId: 0 },
    { id: 202, name: 'I Kishan', role: 'WK', credit: 8, teamId: 0 },
    { id: 203, name: 'S Yadav', role: 'BAT', credit: 9, teamId: 0 },
    { id: 204, name: 'H Pandya', role: 'AR', credit: 9, teamId: 0 },
    { id: 205, name: 'J Bumrah', role: 'BOWL', credit: 10, teamId: 0 },
    { id: 206, name: 'R Jadeja', role: 'AR', credit: 10, teamId: 1 },
    { id: 207, name: 'MS Dhoni', role: 'WK', credit: 9, teamId: 1 },
    { id: 208, name: 'R Gaikwad', role: 'BAT', credit: 9, teamId: 1 },
    { id: 209, name: 'D Conway', role: 'BAT', credit: 8, teamId: 1 },
    { id: 210, name: 'M Pathirana', role: 'BOWL', credit: 9, teamId: 1 },
    { id: 211, name: 'T Boult', role: 'BOWL', credit: 8, teamId: 1 },
    { id: 212, name: 'K Yadav', role: 'BOWL', credit: 8, teamId: 0 },
    { id: 213, name: 'T David', role: 'BAT', credit: 7, teamId: 0 },
    { id: 214, name: 'S Curran', role: 'AR', credit: 8, teamId: 1 },
    { id: 215, name: 'N Wadhera', role: 'BAT', credit: 7, teamId: 0 },
  ],
};
