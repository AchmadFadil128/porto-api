import { config } from 'dotenv';
config();

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    return;
  }

  try {
    // Dynamically import to ensure environment variables are loaded first
    const { db } = await import('./src/lib/db');
    
    // Test the connection by running a simple query
    const result = await db.execute('SELECT 1 as test');
    
    console.log('✅ Database connection successful!');
    console.log('✅ Connection test result:', (result as any)[0]);
    
    // Check if projects table exists
    try {
      const tableCheck = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'projects'
        ) AS table_exists;
      `);
      
      console.log('✅ Projects table exists:', (tableCheck as any)[0].table_exists);
    } catch (tableError) {
      console.log('⚠️  Could not check for projects table:', (tableError as Error).message);
    }
  } catch (error) {
    console.error('❌ Database connection failed:', (error as Error).message);
    
    // Provide some troubleshooting info based on common errors
    if ((error as Error).message.includes('password authentication failed')) {
      console.log('\\n💡 Troubleshooting tips:');
      console.log('   - Check that your DATABASE_URL has the correct password');
      console.log('   - Verify the PostgreSQL user exists and has the right permissions');
    } else if ((error as Error).message.includes('ECONNREFUSED')) {
      console.log('\\n💡 Troubleshooting tips:');
      console.log('   - Verify PostgreSQL is running on the specified host and port');
      console.log('   - Check that the port number is correct');
    } else if ((error as Error).message.includes('SASL')) {
      console.log('\\n💡 Troubleshooting tips:');
      console.log('   - This is often related to authentication method configuration in PostgreSQL');
      console.log('   - You may need to adjust the pg_hba.conf file or set a password for the user');
    } else {
      console.log('\\n💡 General troubleshooting:');
      console.log('   - Verify your DATABASE_URL format: postgresql://username:password@host:port/database');
      console.log('   - Ensure your PostgreSQL server is accessible');
      console.log('   - Check PostgreSQL authentication configuration');
    }
  }
}

testDatabaseConnection();