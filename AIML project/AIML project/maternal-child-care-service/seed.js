process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.eekqogtjecqfrzrafugu:MOH200424Kaduwela@aws-1-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  await client.connect();
  console.log("Connected to DB.");

  try {
    await client.query(`
      INSERT INTO users (id, name, email, password, role) 
      VALUES 
        (2, 'Midwife Perera', 'midwife.perera@moh.gov.lk', 'password123', 'MIDWIFE'), 
        (3, 'Midwife Kumari', 'midwife.kumari@moh.gov.lk', 'password123', 'MIDWIFE') 
      ON CONFLICT (email) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO midwife_profiles (user_id, gn_division) 
      VALUES 
        (2, 'Malabe East'), 
        (3, 'Kaduwela') 
      ON CONFLICT (user_id) DO NOTHING;
    `);

    await client.query("SELECT pg_catalog.setval('users_id_seq', (SELECT MAX(id) FROM users));");
    console.log('Seeded Midwives successfully');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

seed();
