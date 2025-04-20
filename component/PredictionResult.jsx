import React, { useState, useEffect } from 'react';
import '../src/PredictionResult.css';
import axios from 'axios';

const PredictionResult = ({ league, homeTeam, awayTeam, onBack }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
    
        // 1. Get standings to determine current round (max intPlayed from top 10)
        const standingsResponse = await axios.get(
          `https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=${league.id}&s=2024-2025`
        );
    
        if (!standingsResponse.data?.table) {
          throw new Error('Could not fetch standings data');
        }
    
        // Get current round = max games played by top 10 teams
        const currentRound = Math.max(
          ...standingsResponse.data.table
            .slice(0, 10)
            .map(team => parseInt(team.intPlayed || 0))
        );
    
        if (currentRound === 0) throw new Error('Could not determine current round');
    
        // 2. Fetch last 5 rounds (currentRound-4 to currentRound)
        const allMatches = [];
        for (let round = currentRound; round > currentRound - 5; round--) {
          if (round < 1) break; // Don't fetch round 0 or negative
            
          try {
            const response = await axios.get(
              `https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=${league.id}&r=${round}&s=2024-2025`
            );
            if (response.data?.events) {
              allMatches.push(...response.data.events);
            }
          } catch (err) {
            console.error(`Error fetching round ${round}:`, err);
          }
        }
    
        // 3. Calculate exact goals for each team in these matches
        const calculateGoals = (teamName) => {
          return allMatches.reduce((total, match) => {
            if (match.strHomeTeam === teamName) {
              return total + (parseInt(match.intHomeScore) || 0);
            }
            if (match.strAwayTeam === teamName) {
              return total + (parseInt(match.intAwayScore) || 0);
            }
            return total;
          }, 0);
        };
    
        const homeLast5Goals = calculateGoals(homeTeam.name);
        const awayLast5Goals = calculateGoals(awayTeam.name);
    
        // 4. Get team stats from standings
        const homeStats = standingsResponse.data.table.find(t => t.strTeam === homeTeam.name) || {};
        const awayStats = standingsResponse.data.table.find(t => t.strTeam === awayTeam.name) || {};
        
        // Prepare features for both models
        console.log('Sending to backend:', {
          league: league.key,
          match_data: {
            strHomeTeam: homeTeam.name,
            strAwayTeam: awayTeam.name,
            lastHome5GamesScore: parseInt(homeLast5Goals || 0),
            lastAway5GamesScore: parseInt(awayLast5Goals || 0),
            // Raw stats from API - don't calculate derived features here
            homeGoalsFor: parseInt(homeStats.intGoalsFor || 0),
            homeGoalsAgainst: parseInt(homeStats.intGoalsAgainst || 0),
            homeGD:parseInt(homeStats.intGoalDifference || 0),
            homeWins: parseInt(homeStats.intWin || 0),
            homePlayed: parseInt(homeStats.intPlayed || 1),
            homeRank: parseInt(homeStats.intRank || 0),
            awayGoalsFor: parseInt(awayStats.intGoalsFor || 0),
            awayGoalsAgainst: parseInt(awayStats.intGoalsAgainst || 0),
            awayGD:parseInt(awayStats.intGoalDifference || 0),
            awayWins: parseInt(awayStats.intWin || 0),
            awayPlayed: parseInt(awayStats.intPlayed || 1),
            awayRank: parseInt(awayStats.intRank || 0)
          }
        });
        // In your PredictionResult.jsx, modify the matchData to send only raw data:
        const matchData = {
          strHomeTeam: homeTeam.name,
          strAwayTeam: awayTeam.name,
          lastHome5GamesScore: homeLast5Goals,
          lastAway5GamesScore: awayLast5Goals,
          // Raw stats from API - don't calculate derived features here
          homeGoalsFor: parseInt(homeStats.intGoalsFor || 0),
          homeGoalsAgainst: parseInt(homeStats.intGoalsAgainst || 0),
          homeGD:parseInt(homeStats.intGoalDifference || 0),
          homeWins: parseInt(homeStats.intWin || 0),
          homePlayed: parseInt(homeStats.intPlayed || 1),
          homeRank: parseInt(homeStats.intRank || 0),
          awayGoalsFor: parseInt(awayStats.intGoalsFor || 0),
          awayGoalsAgainst: parseInt(awayStats.intGoalsAgainst || 0),
          awayGD:parseInt(awayStats.intGoalDifference || 0),
          awayWins: parseInt(awayStats.intWin || 0),
          awayPlayed: parseInt(awayStats.intPlayed || 1),
          awayRank: parseInt(awayStats.intRank || 0)
        };

        // Send this to backend
        const predictionResponse = await axios.post('https://flask-production-c9ee.up.railway.app/api/predict', {
          league: league.key,
          match_data: matchData
        });

        setPrediction(predictionResponse.data);

      } catch (err) {
        console.error('Prediction error:', err);
        setError(err.message || 'Failed to generate prediction');
        setPrediction(generateMockPrediction(homeTeam, awayTeam));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [league, homeTeam, awayTeam]);

  const calculateLast5GamesScore = (teamStats) => {
    if (!teamStats) return 0;
    const goalsFor = parseInt(teamStats.intGoalsFor || 0);
    const played = parseInt(teamStats.intPlayed || 1);
    return Math.round((goalsFor / played) * 5);
  };

  const generateMockPrediction = (homeTeam, awayTeam) => {
    const homeScore = (Math.random() * 3).toFixed(1);
    const awayScore = (Math.random() * 3).toFixed(1);
    const winner = Math.random() > 0.6 ? 'home' : (Math.random() > 0.3 ? 'away' : 'draw');

    return {
      combined_prediction: {
        score: `${homeScore}-${awayScore}`,
        winner: winner,
        probability: {
          home: Math.floor(Math.random() * 40) + 30,
          draw: Math.floor(Math.random() * 30) + 10,
          away: Math.floor(Math.random() * 30) + 10
        },
        expected_goals: {
          home: (Math.random() * 3).toFixed(2),
          away: (Math.random() * 2).toFixed(2)
        },
        both_teams_to_score: Math.random() > 0.5,
        over_under: (Math.random() * 2 + 1.5).toFixed(1)
      },
      lastUpdated: new Date().toLocaleString()
    };
  };

  const formatNumber = (value, decimals = 2) => {
    return value ? parseFloat(value).toFixed(decimals) : '0.00';
  };

  const safePrediction = prediction || generateMockPrediction(homeTeam, awayTeam);
  const combinedPrediction = safePrediction.combined_prediction || safePrediction;

  return (
    <div className="prediction-container">
      {serverStatus && (
        <div className="server-status">
          Backend: {serverStatus.status} (v{serverStatus.version || '1.0'})
        </div>
      )}
      <button onClick={onBack} className="back-button">← Back to Teams</button>

      <h2>Match Prediction</h2>
      <h3>{league?.name || 'League'}</h3>

      <div className="teams-display">
        <div className="team-card">
          <img
            src={homeTeam?.logo || 'https://via.placeholder.com/150'}
            alt={homeTeam?.name || 'Home Team'}
            className="team-logo"
            onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
          />
          <h3>{homeTeam?.name || 'Home Team'}</h3>
        </div>

        <div className="vs">vs</div>

        <div className="team-card">
          <img
            src={awayTeam?.logo || 'https://via.placeholder.com/150'}
            alt={awayTeam?.name || 'Away Team'}
            className="team-logo"
            onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
          />
          <h3>{awayTeam?.name || 'Away Team'}</h3>
        </div>
      </div>

      {loading ? (
        <div className="loading">Generating prediction...</div>
      ) : error ? (
        <div className="error-message">
          {error}
          <p>Showing simulated data</p>
        </div>
      ) : (
        <div className="prediction-result fade-in">
          <div className="score-prediction">
            <h4>Score Prediction</h4>
            <div className="score">
              {combinedPrediction.score}
            </div>
          </div>

          <div className="winner-prediction">
            <h4>Predicted Winner</h4>
            <div className="winner">
              {combinedPrediction.winner === 'draw' ? (
                <span>Draw</span>
              ) : (
                <>
                  <img
                    src={combinedPrediction.winner === 'home' ? homeTeam?.logo : awayTeam?.logo}
                    alt="winner"
                    className="winner-logo"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                  />
                  <span>{combinedPrediction.winner === 'home' ? homeTeam?.name : awayTeam?.name}</span>
                </>
              )}
            </div>
          </div>

          <div className="probability-meter">
            <h4>Win Probability</h4>
            <div className="meter">
              <div className="meter-fill home" style={{ width: `${combinedPrediction.probability.home}%` }}>
                {combinedPrediction.probability.home}%
              </div>
              <div className="meter-fill away" style={{ width: `${combinedPrediction.probability.away}%` }}>
                {combinedPrediction.probability.away}%
              </div>
            </div>
          </div>

          <div className="goal-predictions">
            <h4>Goal Predictions</h4>
            <div className="goal-stats">
              <div className="goal-stat">
                <span>Expected Home Goals (xG):</span>
                <span>{formatNumber(combinedPrediction.expected_goals.home)}</span>
              </div>
              <div className="goal-stat">
                <span>Expected Away Goals (xG):</span>
                <span>{formatNumber(combinedPrediction.expected_goals.away)}</span>
              </div>
              <div className="goal-stat">
                <span>Both Teams to Score:</span>
                <span className={combinedPrediction.both_teams_to_score ? 'positive' : 'negative'}>
                  {combinedPrediction.both_teams_to_score ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="goal-stat">
                <span>Over/Under 2.5:</span>
                <span className={combinedPrediction.over_under > 2.5 ? 'positive' : 'negative'}>
                  {combinedPrediction.over_under > 2.5 ? 'Over' : 'Under'} {formatNumber(combinedPrediction.over_under, 1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionResult;