import React, { useState, useEffect } from 'react';
import type { PinballMapLocation, PracticeSession } from '../types';
import { getLeagueStats, getPracticeSessions, getSettings } from '../supabaseUtils';
import { getPinballMapLocations } from '../services/pinballMapService';

interface MachineInsight {
  machine: string;
  winRate: number;
  gamesPlayed: number;
  nearbyVenues: Array<{ venue: string; distance?: number }>;
  practiceTime: number; // minutes practiced in last 30 days
  recommendation: 'urgent' | 'high' | 'medium' | 'low';
}

export const Insights: React.FC = () => {
  const [insights, setInsights] = useState<MachineInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyPracticeTime, setWeeklyPracticeTime] = useState(0);
  const [selectedMachine, setSelectedMachine] = useState<MachineInsight | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const [leagueStats, practiceSessions, settings] = await Promise.all([
        getLeagueStats(),
        getPracticeSessions(),
        getSettings(),
      ]);

      // Get current season stats
      const currentSeason = leagueStats.length > 0 ? leagueStats[0] : null;
      
      if (!currentSeason) {
        setLoading(false);
        return;
      }

      // Calculate weekly practice time (last 7 days)
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentSessions = practiceSessions.filter(s => 
        s.status === 'completed' && 
        s.startTime >= sevenDaysAgo &&
        s.endTime
      );
      
      const totalWeeklyMinutes = recentSessions.reduce((sum, session) => {
        if (session.endTime) {
          return sum + Math.floor((session.endTime - session.startTime) / 60000);
        }
        return sum;
      }, 0);
      
      setWeeklyPracticeTime(totalWeeklyMinutes);

      // Calculate practice time per machine (last 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const recentPracticeSessions = practiceSessions.filter(s => 
        s.startTime >= thirtyDaysAgo
      );
      
      const machinePracticeTime = new Map<string, number>();
      recentPracticeSessions.forEach(session => {
        session.games.forEach(game => {
          const current = machinePracticeTime.get(game.table) || 0;
          // Estimate 5 minutes per game played
          machinePracticeTime.set(game.table, current + 5);
        });
      });

      // Get venues with machines
      const venueResult = await getPinballMapLocations(
        settings.location.city,
        settings.location.state,
        settings.location.radius,
        false,
        settings.location.useGeolocation,
        settings.location.lastKnownLat,
        settings.location.lastKnownLon
      );

      // Build machine insights from league stats
      const machineInsights: MachineInsight[] = currentSeason.machineStats
        .map(machine => {
          const gamesPlayed = machine.wins + machine.losses;
          const practiceTime = machinePracticeTime.get(machine.machine) || 0;
          
          // Find venues with this machine
          const nearbyVenues = venueResult.locations
            .filter(venue => 
              venue.machines.some(m => 
                m.name.toLowerCase().includes(machine.machine.toLowerCase()) ||
                machine.machine.toLowerCase().includes(m.name.toLowerCase())
              )
            )
            .map(venue => ({
              venue: venue.name,
              distance: venue.distance,
            }))
            .sort((a, b) => (a.distance || 999) - (b.distance || 999));

          // Calculate recommendation priority
          let recommendation: 'urgent' | 'high' | 'medium' | 'low';
          if (machine.winRate < 0.3 && gamesPlayed >= 3 && practiceTime < 15) {
            recommendation = 'urgent';
          } else if (machine.winRate < 0.4 && gamesPlayed >= 2) {
            recommendation = 'high';
          } else if (machine.winRate < 0.5) {
            recommendation = 'medium';
          } else {
            recommendation = 'low';
          }

          return {
            machine: machine.machine,
            winRate: machine.winRate,
            gamesPlayed,
            nearbyVenues,
            practiceTime,
            recommendation,
          };
        })
        .filter(m => m.recommendation !== 'low') // Only show machines needing work
        .sort((a, b) => {
          // Sort by priority
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.recommendation] - priorityOrder[b.recommendation];
        });

      setInsights(machineInsights);
      setLoading(false);
    } catch (error) {
      console.error('Error loading insights:', error);
      setLoading(false);
    }
  };

  const getPriorityColor = (recommendation: string) => {
    switch (recommendation) {
      case 'urgent': return { bg: 'rgba(255, 0, 102, 0.2)', border: '#ff0066', text: '#ff0066' };
      case 'high': return { bg: 'rgba(255, 165, 0, 0.2)', border: '#ffa500', text: '#ffa500' };
      case 'medium': return { bg: 'rgba(255, 215, 0, 0.2)', border: '#ffd700', text: '#ffd700' };
      default: return { bg: 'rgba(139, 0, 255, 0.2)', border: 'var(--neon-purple)', text: 'var(--neon-purple)' };
    }
  };

  const getPriorityLabel = (recommendation: string) => {
    switch (recommendation) {
      case 'urgent': return '🔴 Urgent';
      case 'high': return '🟠 High Priority';
      case 'medium': return '🟡 Medium Priority';
      default: return '🟣 Low Priority';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="font-mono animate-pulse" style={{ color: 'var(--neon-cyan)' }}>
          ANALYZING YOUR PERFORMANCE...
        </p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto">
        <div className="card-synthwave rounded-lg p-6 shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ 
            color: 'var(--neon-cyan)',
            textShadow: '0 0 10px var(--neon-cyan)'
          }}>No Insights Yet</h2>
          <p style={{ color: 'var(--neon-purple)' }}>
            Play some league games and practice sessions to see personalized insights and recommendations!
          </p>
        </div>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-4">
      <h2 className="text-2xl font-bold" style={{ 
        color: 'var(--neon-cyan)',
        textShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan)'
      }}>💡 Insights & Recommendations</h2>

      {/* Weekly Summary */}
      <div className="card-synthwave rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ 
          color: 'var(--neon-magenta)',
          textShadow: '0 0 10px var(--neon-magenta)'
        }}>This Week's Progress</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="stat-card rounded p-4">
            <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>Practice Time</div>
            <div className="text-2xl font-bold" style={{ 
              color: 'var(--neon-cyan)',
              textShadow: '0 0 10px var(--neon-cyan)'
            }}>
              {formatTime(weeklyPracticeTime)}
            </div>
          </div>
          <div className="stat-card rounded p-4">
            <div className="text-sm" style={{ color: 'var(--neon-purple)' }}>Machines to Focus</div>
            <div className="text-2xl font-bold" style={{ 
              color: 'var(--neon-yellow)',
              textShadow: '0 0 10px var(--neon-yellow)'
            }}>
              {insights.length}
            </div>
          </div>
        </div>
      </div>

      {/* Machine Insights */}
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const colors = getPriorityColor(insight.recommendation);
          const isExpanded = selectedMachine?.machine === insight.machine;

          return (
            <div 
              key={insight.machine} 
              className="card-synthwave rounded-lg p-4 shadow-lg cursor-pointer transition hover:scale-[1.02]"
              onClick={() => setSelectedMachine(isExpanded ? null : insight)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono" style={{ color: 'var(--neon-purple)' }}>
                      #{index + 1}
                    </span>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--neon-cyan)' }}>
                      {insight.machine}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      className="px-2 py-1 text-xs rounded border-2"
                      style={{
                        background: colors.bg,
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                    >
                      {getPriorityLabel(insight.recommendation)}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--neon-purple)' }}>
                      {(insight.winRate * 100).toFixed(0)}% win rate • {insight.gamesPlayed} games
                    </span>
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--neon-cyan)' }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t-2" style={{ borderColor: 'rgba(139, 0, 255, 0.3)' }}>
                  {/* Practice Stats */}
                  <div className="mb-4">
                    <div className="text-sm font-semibold mb-2" style={{ color: 'var(--neon-cyan)' }}>
                      Practice Stats (Last 30 Days)
                    </div>
                    <div className="stat-card rounded p-3">
                      <div className="flex justify-between items-center">
                        <span style={{ color: 'var(--neon-purple)' }}>Time Practiced:</span>
                        <span className="font-bold" style={{ color: 'var(--neon-cyan)' }}>
                          {formatTime(insight.practiceTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mb-4">
                    <div className="text-sm font-semibold mb-2" style={{ color: 'var(--neon-cyan)' }}>
                      💡 Recommendation
                    </div>
                    <div className="rounded p-3" style={{
                      background: colors.bg,
                      border: `2px solid ${colors.border}`,
                    }}>
                      <p className="text-sm" style={{ color: colors.text }}>
                        {insight.recommendation === 'urgent' && 
                          `Critical: Win rate under 30%. Schedule focused practice ASAP.`}
                        {insight.recommendation === 'high' && 
                          `High priority: Win rate under 40%. Add to next practice session.`}
                        {insight.recommendation === 'medium' && 
                          `Room for improvement: Win rate under 50%. Practice when available.`}
                      </p>
                    </div>
                  </div>

                  {/* Nearby Venues */}
                  {insight.nearbyVenues.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mb-2" style={{ color: 'var(--neon-cyan)' }}>
                        📍 Where to Practice
                      </div>
                      <div className="space-y-2">
                        {insight.nearbyVenues.slice(0, 3).map((venue, idx) => (
                          <div 
                            key={idx}
                            className="stat-card rounded p-3 flex justify-between items-center"
                          >
                            <span style={{ color: 'var(--neon-cyan)' }}>{venue.venue}</span>
                            {venue.distance && (
                              <span className="text-sm" style={{ color: 'var(--neon-purple)' }}>
                                {venue.distance.toFixed(1)} mi
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {insight.nearbyVenues.length === 0 && (
                    <div className="text-sm text-center py-3" style={{ color: 'var(--neon-purple)' }}>
                      No nearby venues found with this machine
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};