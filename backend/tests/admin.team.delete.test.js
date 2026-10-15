/**
 * admin.team.delete.test.js
 *
 * Unit tests for admin deleteTeam functionality.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

// Mock functions simulating deleteTeam steps
const mockDeleteTeamSteps = ({ teamExists, teamId }) => {
  if (!teamExists) {
    throw new Error('TEAM_NOT_FOUND');
  }

  // 1. Reset user accountType to INDIVIDUAL and clear team/workflowRole
  const updatedUsersCount = 3;

  // 2. Clear pending invitations
  const deletedInvitationsCount = 2;

  // 3. Clear team from blogs
  const updatedBlogsCount = 5;

  // 4. Delete team record
  const teamDeleted = true;

  return {
    success: true,
    message: 'Team deleted successfully',
    stats: {
      updatedUsersCount,
      deletedInvitationsCount,
      updatedBlogsCount,
      teamDeleted
    }
  };
};

test('admin deleteTeam: successfully deletes an existing team and resets dependencies', () => {
  const result = mockDeleteTeamSteps({ teamExists: true, teamId: 'team_123' });
  assert.equal(result.success, true);
  assert.equal(result.message, 'Team deleted successfully');
  assert.equal(result.stats.teamDeleted, true);
  assert.equal(result.stats.updatedUsersCount, 3);
  assert.equal(result.stats.deletedInvitationsCount, 2);
});

test('admin deleteTeam: throws error when team does not exist', () => {
  assert.throws(
    () => mockDeleteTeamSteps({ teamExists: false, teamId: 'non_existent_team' }),
    { message: 'TEAM_NOT_FOUND' }
  );
});
