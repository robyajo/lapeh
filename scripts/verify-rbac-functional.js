
// const fetch = require('node:fetch'); // Or native fetch in Node 18+

const BASE_URL = 'http://localhost:8000/api';
let TOKEN = '';
let USER_ID = '';
let ROLE_ID = '';
let PERMISSION_ID = '';

async function request(method, endpoint, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json();
    return { status: res.status, data };
  } catch (err) {
    console.error(`Error requesting ${endpoint}:`, err.message);
    return null;
  }
}

async function run() {
  console.log('🚀 Starting RBAC Functional Verification...');

  // 0. Login as Super Admin
  console.log('\n0️⃣  Logging in as Super Admin...');
  const saLogin = await request('POST', '/auth/login', {
    email: 'sa@sa.com',
    password: 'string'
  });

  let SA_TOKEN = '';
  if (saLogin?.status === 200) {
    console.log('✅ SA Login successful');
    SA_TOKEN = saLogin.data.data.token;
  } else {
    console.error('❌ SA Login failed:', JSON.stringify(saLogin?.data));
    process.exit(1);
  }

  // 1. Register User
  console.log('\n1️⃣  Registering User (Tester)...');
  const regRes = await request('POST', '/auth/register', {
    email: 'testrbac@example.com',
    name: 'RBAC Tester',
    password: 'password123',
    confirmPassword: 'password123'
  });
  
  if (regRes?.status === 200 || regRes?.status === 201) {
    console.log('✅ Registered successfully');
    USER_ID = regRes.data.data.id;
  } else if (regRes?.status === 422 && regRes.data.message.includes('Validation error')) {
     console.log('ℹ️  User might already exist, trying login to get ID...');
     // Login to get ID
     const loginRes = await request('POST', '/auth/login', {
        email: 'testrbac@example.com',
        password: 'password123'
      });
      if (loginRes?.status === 200) {
        const meRes = await request('GET', '/auth/me', null, loginRes.data.data.token);
        USER_ID = meRes.data.data.id;
        console.log('✅ Got existing User ID');
      }
  } else {
    console.error('❌ Registration failed:', JSON.stringify(regRes?.data));
  }

  // 2. Login (as Tester) - to verify later
  console.log('\n2️⃣  Logging in as Tester...');
  const loginRes = await request('POST', '/auth/login', {
    email: 'testrbac@example.com',
    password: 'password123'
  });

  if (loginRes?.status === 200) {
    console.log('✅ Login successful');
    TOKEN = loginRes.data.data.token;
  } else {
    console.error('❌ Login failed:', JSON.stringify(loginRes?.data));
    process.exit(1);
  }

  // 3. Create Role (Using SA Token)
  console.log('\n3️⃣  Creating Role "tester-role"...');
  const roleRes = await request('POST', '/rbac/roles', {
    name: 'Tester Role',
    slug: 'tester-role',
    description: 'Role for automated testing'
  }, SA_TOKEN);

  if (roleRes?.status === 201 || roleRes?.status === 200) {
    console.log('✅ Role created');
    ROLE_ID = roleRes.data.data.id;
  } else if (roleRes?.status === 422) { // Duplicate?
     console.log('ℹ️  Role might already exist.');
     const listRes = await request('GET', '/rbac/roles', null, SA_TOKEN);
     const found = listRes.data.data.find(r => r.slug === 'tester-role');
     if (found) {
        ROLE_ID = found.id;
        console.log('✅ Found existing role');
     } else {
        console.error('❌ Could not create or find role');
        process.exit(1);
     }
  } else {
    console.error('❌ Create role failed:', JSON.stringify(roleRes?.data));
    process.exit(1);
  }

  // 4. Create Permission (Using SA Token)
  console.log('\n4️⃣  Creating Permission "test.exec"...');
  const permRes = await request('POST', '/rbac/permissions', {
    name: 'Test Execute',
    slug: 'test.exec',
    description: 'Permission to execute tests'
  }, SA_TOKEN);

  if (permRes?.status === 201 || permRes?.status === 200) {
    console.log('✅ Permission created');
    PERMISSION_ID = permRes.data.data.id;
  } else if (permRes?.status === 422) {
     const listRes = await request('GET', '/rbac/permissions', null, SA_TOKEN);
     const found = listRes.data.data.find(p => p.slug === 'test.exec');
     if (found) {
        PERMISSION_ID = found.id;
        console.log('✅ Found existing permission');
     } else {
        console.error('❌ Could not create or find permission');
        process.exit(1);
     }
  } else {
    console.error('❌ Create permission failed:', JSON.stringify(permRes?.data));
    process.exit(1);
  }

  // 5. Assign Permission to Role (Using SA Token)
  console.log('\n5️⃣  Assigning Permission to Role...');
  const assignP2R = await request('POST', '/rbac/roles/assign-permission', {
    roleId: ROLE_ID,
    permissionId: PERMISSION_ID
  }, SA_TOKEN);

  if (assignP2R?.status === 200) {
    console.log('✅ Permission assigned to role');
  } else {
    console.error('❌ Assign permission failed:', JSON.stringify(assignP2R?.data));
  }

  // 6. Assign Role to User (Using SA Token)
  console.log('\n6️⃣  Assigning Role to User...');
  const assignR2U = await request('POST', '/rbac/users/assign-role', {
    userId: USER_ID,
    roleId: ROLE_ID
  }, SA_TOKEN);

  if (assignR2U?.status === 200) {
    console.log('✅ Role assigned to user');
  } else {
    console.error('❌ Assign role failed:', JSON.stringify(assignR2U?.data));
  }

  // 7. Verify via Profile (Using Tester Token)
  console.log('\n7️⃣  Verifying Profile...');
  const profile = await request('GET', '/auth/me', null, TOKEN);
  console.log('👤 User Profile:', JSON.stringify(profile.data.data));
  
  // 8. Cleanup (Using SA Token)
  console.log('\n8️⃣  Cleaning up...');
  
  const delRole = await request('DELETE', `/rbac/roles/${ROLE_ID}`, null, SA_TOKEN);
  if (delRole?.status === 200) console.log('✅ Role deleted');
  else console.error('❌ Delete role failed', JSON.stringify(delRole?.data));

  const delPerm = await request('DELETE', `/rbac/permissions/${PERMISSION_ID}`, null, SA_TOKEN);
  if (delPerm?.status === 200) console.log('✅ Permission deleted');
  else console.error('❌ Delete permission failed');

  console.log('\n🎉 Verification Complete!');
}

run();
