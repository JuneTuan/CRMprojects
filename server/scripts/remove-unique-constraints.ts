import mysql from 'mysql2/promise';

export const removePhoneEmailUniqueConstraint = async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Password01',
    database: 'crm_system',
  });

  try {
    console.log('Database connected');

    try {
      await connection.query(`
        ALTER TABLE customer 
        DROP INDEX customer_phone
      `);
      console.log('Dropped unique index on phone');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('Index customer_phone does not exist, skipping...');
      } else {
        throw error;
      }
    }

    try {
      await connection.query(`
        ALTER TABLE customer 
        DROP INDEX customer_email
      `);
      console.log('Dropped unique index on email');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('Index customer_email does not exist, skipping...');
      } else {
        throw error;
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
};

removePhoneEmailUniqueConstraint()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });