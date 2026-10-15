import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTeamDashboard } from '../src/services/teamService.js';

test('formats team dashboard with owner permissions for the current owner', () => {
  const ownerId = '64b7f1c7c8f8f8f8f8f8f8f1';
  const writerId = '64b7f1c7c8f8f8f8f8f8f8f2';
  const team = {
    _id: '64b7f1c7c8f8f8f8f8f8f8f3',
    name: 'Editorial Team',
    owner: { _id: ownerId, name: 'Owner User', email: 'owner@example.com' },
    members: [
      {
        user: { _id: ownerId, name: 'Owner User', email: 'owner@example.com' },
        workflowRole: 'Publisher',
        isOwner: true,
        status: 'ACTIVE'
      },
      {
        user: { _id: writerId, name: 'Writer User', email: 'writer@example.com' },
        workflowRole: 'Writer',
        isOwner: false,
        status: 'ACTIVE'
      }
    ],
    createdAt: new Date('2026-08-17T00:00:00.000Z'),
    updatedAt: new Date('2026-08-17T01:00:00.000Z')
  };

  const dashboard = formatTeamDashboard(team, ownerId);

  assert.equal(dashboard.name, 'Editorial Team');
  assert.equal(dashboard.currentUser.isOwner, true);
  assert.equal(dashboard.permissions.canInviteMembers, true);
  assert.equal(dashboard.members.length, 2);
  assert.deepEqual(dashboard.pendingInvitations, []);
});

test('Team model pre-save hook generates slug without next is not a function error', async () => {
  const { default: Team } = await import('../src/models/Team.js');
  const team = new Team({
    name: 'Tech Innovators',
    owner: '64b7f1c7c8f8f8f8f8f8f8f1',
    members: [{ user: '64b7f1c7c8f8f8f8f8f8f8f1', workflowRole: 'Writer' }]
  });

  const saveHooks = team.schema.s.hooks._pres.get('save');
  for (const hook of saveHooks) {
    await hook.fn.call(team);
  }

  assert.equal(team.slug, 'tech-innovators');
});
