/**
 * Pre-defined "computer" team for MI vs CSK (match 2).
 * 1 WK, 5 BAT, 3 AR, 2 BOWL. Captain & Vice-captain from high scorers.
 */
export const COMPUTER_TEAM_MATCH2 = {
  playerIds: [
    202, // I Kishan (WK)
    201, // R Sharma (BAT) - C
    208, // R Gaikwad (BAT) - VC
    203, // S Yadav (BAT)
    209, // D Conway (BAT)
    213, // T David (BAT)
    204, // H Pandya (AR)
    206, // R Jadeja (AR)
    214, // S Curran (AR)
    205, // J Bumrah (BOWL)
    210, // M Pathirana (BOWL)
  ],
  captainId: 201,   // R Sharma
  viceCaptainId: 208, // R Gaikwad
} as const;
