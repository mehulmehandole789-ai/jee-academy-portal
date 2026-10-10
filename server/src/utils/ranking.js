/**
 * Calculates standard competition ranking for a list of test attempts.
 * Equal scores receive identical rank; following rank skips accordingly (1, 2, 2, 4).
 * Ties are NEVER broken by submission speed.
 * 
 * @param {Array} attempts - List of finalized test attempts with `score` property
 * @returns {Array} - The attempts with `batchRank` populated
 */
export const calculateCompetitionRankings = (attempts) => {
  if (!attempts || attempts.length === 0) return [];

  // Sort descending by score
  const sorted = [...attempts].sort((a, b) => b.score - a.score);

  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      sorted[i].batchRank = 1;
    } else if (sorted[i].score === sorted[i - 1].score) {
      sorted[i].batchRank = sorted[i - 1].batchRank;
    } else {
      sorted[i].batchRank = i + 1;
    }
  }

  return sorted;
};
