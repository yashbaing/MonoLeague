/**
 * Player photo URLs: ICC website (primary) and Wikimedia (fallback).
 * ICC: official headshots from https://www.icc-cricket.com (images.icc-cricket.com).
 * Wikimedia: CC-licensed from commons.wikimedia.org / en.wikipedia.org.
 */

const ICC_IMAGE_BASE =
  'https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/13203';

/** ICC player IDs from ICC website (e.g. T20 World Cup 2026 squad pages). */
const ICC_PLAYER_IDS: Record<string, number> = {
  // India (from ICC T20 WC 2026 squad)
  'S Yadav': 11803,
  'H Pandya': 63751,
  'J Bumrah': 63755,
  'K Yadav': 63187,
  'I Kishan': 64712,
  // Australia
  'S Smith': 4308,
  'M Marsh': 10094,
  'T Head': 62023,
  'C Green': 66870,
  // England
  'J Buttler': 9782,
  'A Rashid': 4661,
  'J Archer': 64254,
  'P Salt': 65632,
  'S Curran': 65584,
  // South Africa
  'Q de Kock': 28035,
  'D Miller': 5313,
  'K Rabada': 63611,
  'K Maharaj': 48607,
  'A Nortje': 63641,
  'A Markram': 64219,
  'M Jansen': 69409,
  // Pakistan
  'B Azam': 59429,
  'S Afridi': 66833,
  'S Khan': 65739,
  'F Ashraf': 64321,
  'N Shah': 69956,
  // New Zealand
  'D Conway': 13177,
  'J Neesham': 10172,
  'M Santner': 57903,
  'M Henry': 60544,
  'L Ferguson': 63719,
  'G Phillips': 65295,
  // Zimbabwe
  'S Raza': 25422,
  'B Muzarabani': 67784,
  'R Burl': 58070,
};

/** Fallback: Wikimedia Commons / Wikipedia URLs when no ICC ID. */
const WIKIMEDIA_PLAYER_IMAGES: Record<string, string> = {
  'R Sharma': 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Rohit_Sharma_tight_crop.png',
  'V Kohli': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Virat_Kohli_portrait.jpg',
  'R Pant': 'https://upload.wikimedia.org/wikipedia/commons/9/99/Rishabh_Pant_%2829693622367%29.jpg',
  'H Pandya': 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Hardik_Pandya_%28cropped_2%29.jpg',
  'Hardik Pandya': 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Hardik_Pandya_%28cropped_2%29.jpg',
  'J Bumrah': 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Jasprit_Bumrah_%282%29.jpg',
  'S Yadav': 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Suryakumar_Yadav_%282%29.jpg',
  'R Jadeja': 'https://upload.wikimedia.org/wikipedia/commons/2/2c/PM_Shri_Narendra_Modi_with_Ravindra_Jadeja_%28Cropped%29.jpg',
  'S Iyer': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Shreyas_Iyer_2021.jpg',
  'MS Dhoni': 'https://upload.wikimedia.org/wikipedia/commons/c/c9/MS_Dhoni.jpg',
  'I Kishan': 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Ishan_Kishan.jpg',
  'R Gaikwad': 'https://upload.wikimedia.org/wikipedia/commons/2/27/Ruturaj_Gaikwad.jpeg',
  'D Warner': 'https://upload.wikimedia.org/wikipedia/commons/2/2c/DAVID_WARNER_%2811704782453%29.jpg',
  'S Smith': 'https://upload.wikimedia.org/wikipedia/commons/4/40/Steve_Smith_%2848094026552%29.jpg',
  'P Cummins': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Pat_Cummins_fielding_Ashes_2021_%28cropped%29.jpg',
  'M Starc': 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Mitchell_Starc_2.jpg',
  'M Labuschagne': 'https://upload.wikimedia.org/wikipedia/commons/5/53/Day_4_of_the_3rd_Test_of_the_2019_Ashes_at_Headingley_%2848631113862%29_%28Marnus_Labuschagne_cropped%29.jpg',
  'J Root': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Joe_Root_HIP1487_%28cropped%29.jpg',
  'J Bairstow': 'https://upload.wikimedia.org/wikipedia/commons/4/49/2_05_Bairstow_out.jpg',
  'B Stokes': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Ben_Stokes_raising_his_bat%2C_Ashes_2019.jpg',
  'J Buttler': 'https://upload.wikimedia.org/wikipedia/commons/0/01/Jos_Buttler_in_2023.jpg',
  'Q de Kock': 'https://upload.wikimedia.org/wikipedia/commons/6/67/QUINTON_DE_KOCK_%2815681398316%29.jpg',
  'K Rabada': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Rabada.jpg',
  'S Hasan': 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Shakib_Al_Hasan_%284%29_%28cropped%29.jpg',
  'K Williamson': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Kane_Williamson_in_2019.jpg',
  'T Boult': 'https://upload.wikimedia.org/wikipedia/commons/2/23/2018.02.03.22.23.14-AUSvNZL_T20_AUS_innings%2C_SCG_%2839533156665%29.jpg',
  'B Azam': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Babar_azam_2023.jpg',
  'M Rizwan': 'https://upload.wikimedia.org/wikipedia/commons/a/af/M_Rizwan.jpg',
  'S Afridi': 'https://upload.wikimedia.org/wikipedia/commons/7/78/Shaheen_Afridi_%282%29.jpg',
};

export function getIccPlayerImageUrl(iccPlayerId: number): string {
  return `${ICC_IMAGE_BASE}/${iccPlayerId}.png`;
}

/**
 * Returns a player photo URL: ICC official image when available, else Wikimedia, else undefined (use DiceBear/initials).
 */
export function getPlayerImageUrl(playerName: string): string | undefined {
  const name = playerName.trim();
  const iccId = ICC_PLAYER_IDS[name];
  if (iccId != null) {
    return getIccPlayerImageUrl(iccId);
  }
  return WIKIMEDIA_PLAYER_IMAGES[name];
}
