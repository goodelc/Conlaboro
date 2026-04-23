import request from './request'

export function getLeaderboard(sortBy) {
  return request.get(`/leaderboard?sort=${sortBy || 'xp'}`)
}
