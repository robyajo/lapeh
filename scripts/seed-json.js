
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '../database.json');

async function seed() {
  console.log('🌱 Seeding database.json...');

  let store = {
    users: [],
    roles: [],
    permissions: [],
    user_roles: [],
    role_permissions: [],
    user_permissions: []
  };

  // Load existing if any (optional, but we'll overwrite for seed)
  // if (fs.existsSync(DB_PATH)) {
  //   store = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  // }

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Users
  const usersData = [
    { name: "Super Admin", email: "sa@sa.com", roleSlug: "super_admin" },
    { name: "Admin User", email: "a@a.com", roleSlug: "admin" },
    { name: "Regular User", email: "u@u.com", roleSlug: "user" }
  ];

  for (const u of usersData) {
    const user = {
      id: (store.users.length + 1).toString(),
      uuid: uuidv4(),
      name: u.name,
      email: u.email,
      password: passwordHash,
      created_at: new Date(),
      updated_at: new Date(),
      avatar: null,
      avatar_url: null,
      email_verified_at: null,
      remember_token: null
    };
    store.users.push(user);
    console.log(`Created user: ${user.name}`);
  }

  // 2. Seed Roles
  const rolesData = [
    { name: "Super Admin", slug: "super_admin", description: "Full access to all resources" },
    { name: "Admin", slug: "admin", description: "Administrator" },
    { name: "User", slug: "user", description: "Regular user" }
  ];

  for (const r of rolesData) {
    const role = {
      id: (store.roles.length + 1).toString(),
      name: r.name,
      slug: r.slug,
      description: r.description,
      created_at: new Date(),
      updated_at: new Date()
    };
    store.roles.push(role);
    console.log(`Created role: ${role.name}`);
  }

  // 3. Seed Permissions
  const permissionsData = [
    { name: "Manage Users", slug: "users.manage", description: "Create, update, and delete users" },
    { name: "Create Users", slug: "users.create", description: "Create users" },
    { name: "View Users", slug: "users.view", description: "View users" },
    { name: "Update Users", slug: "users.update", description: "Update users" },
    { name: "Delete Users", slug: "users.delete", description: "Delete users" },
    { name: "Manage Roles", slug: "roles.manage", description: "Create, update, and delete roles" },
    { name: "Manage Permissions", slug: "permissions.manage", description: "Create, update, and delete permissions" },
    { name: "Manage Profiles", slug: "profiles.manage", description: "Manage user profiles" }
  ];

  for (const p of permissionsData) {
    const perm = {
      id: (store.permissions.length + 1).toString(),
      name: p.name,
      slug: p.slug,
      description: p.description,
      created_at: new Date(),
      updated_at: new Date()
    };
    store.permissions.push(perm);
  }
  console.log(`Seeded ${store.permissions.length} permissions`);

  // 4. Link Users to Roles
  for (const u of usersData) {
    const user = store.users.find(x => x.email === u.email);
    const role = store.roles.find(x => x.slug === u.roleSlug);
    if (user && role) {
      store.user_roles.push({
        id: (store.user_roles.length + 1).toString(),
        user_id: user.id,
        role_id: role.id,
        created_at: new Date()
      });
    }
  }

  // 5. Link Roles to Permissions
  // Super Admin -> All Permissions
  const superAdminRole = store.roles.find(r => r.slug === 'super_admin');
  if (superAdminRole) {
    for (const p of store.permissions) {
      store.role_permissions.push({
        id: (store.role_permissions.length + 1).toString(),
        role_id: superAdminRole.id,
        permission_id: p.id,
        created_at: new Date()
      });
    }
  }

  // Admin -> Users.*
  const adminRole = store.roles.find(r => r.slug === 'admin');
  if (adminRole) {
    const adminPerms = store.permissions.filter(p => p.slug.startsWith('users.'));
    for (const p of adminPerms) {
      store.role_permissions.push({
        id: (store.role_permissions.length + 1).toString(),
        role_id: adminRole.id,
        permission_id: p.id,
        created_at: new Date()
      });
    }
  }

  // User -> profiles.manage
  const userRole = store.roles.find(r => r.slug === 'user');
  if (userRole) {
    const userPerms = store.permissions.filter(p => p.slug === 'profiles.manage');
    for (const p of userPerms) {
      store.role_permissions.push({
        id: (store.role_permissions.length + 1).toString(),
        role_id: userRole.id,
        permission_id: p.id,
        created_at: new Date()
      });
    }
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2));
  console.log('✅ Database seeded successfully!');
}

seed().catch(console.error);
