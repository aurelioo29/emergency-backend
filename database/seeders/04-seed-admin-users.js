'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('Admin12345!', 10);

    await queryInterface.bulkInsert('admin_users', [
      {
        id: crypto.randomUUID(),
        full_name: 'Super Admin',
        email: 'superadmin@example.com',
        password_hash: passwordHash,
        role: 'SUPERADMIN',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        full_name: 'Main Dispatcher',
        email: 'dispatcher@example.com',
        password_hash: passwordHash,
        role: 'DISPATCHER',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        full_name: 'System Admin',
        email: 'admin@example.com',
        password_hash: passwordHash,
        role: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('admin_users', {
      email: ['superadmin@example.com', 'dispatcher@example.com', 'admin@example.com'],
    });
  },
};