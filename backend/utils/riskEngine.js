/**
 * Risk Point Map
 */
const RISK_POINTS = {
  'Tab switched': 2,
  'Window focus lost': 2,
  'Idle inactivity': 1,
  'Multiple IP detected': 5,
  'Network reconnected': 3,
  'Very fast completion': 4
};

/**
 * Calculate dynamic risk score and level from reports
 */
const calculateRisk = (reports) => {
  let score = 0;
  reports.forEach(r => {
    score += RISK_POINTS[r.reason] || 1;
  });

  let level = 'Safe';
  if (score >= 16) level = 'High';
  else if (score >= 9) level = 'Medium';
  else if (score >= 4) level = 'Low';

  return { risk_score: score, risk_level: level };
};

module.exports = { calculateRisk, RISK_POINTS };
