import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Person, sequelize, initDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDatabase = async () => {
  try {
    // connect to DB and sync models
    await initDB();

    const dataPath = path.join(__dirname, 'profiles.json');
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const { profiles } = JSON.parse(fileContent);

    console.log(`\x1b[35m[Seeder]\x1b[0m \x1b[34mℹ\x1b[0m Found ${profiles.length} profiles to seed.`);

    // Use ignoreDuplicates to handle already existing unique combinations safely without erroring
    await Person.bulkCreate(profiles, {
      ignoreDuplicates: true,
      returning: false
    });

    console.log('\x1b[35m[Seeder]\x1b[0m \x1b[32m✔\x1b[0m Seeding completed successfully (duplicates ignored/skipped)!');
    
    // Explicitly close the connection so the script exits smoothly
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m[Seeder]\x1b[0m ✘ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
