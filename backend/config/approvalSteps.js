// APPROVAL CHAIN for Requests (applications).
// Steps run in order. A step can only be decided by a user whose role is in `roles`.
// To add/remove/rename a step, edit this list only (no DB migration needed).
module.exports = [
  {
    stepNumber: 1,
    name: 'Review',
    roles: ['officer', 'secretary', 'staff', 'admin'],
  },
  {
    stepNumber: 2,
    name: 'Final approval',
    roles: ['admin'],
  },
];
