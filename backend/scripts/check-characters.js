const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27019/cosmos-combat?authSource=admin';

async function checkCharacters() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db('cosmos-combat');

        // Check GameBalance
        const balance = await db.collection('gamebalances').findOne({ isActive: true });
        if (balance && balance.characters) {
            console.log('📊 HP en GameBalance:');
            for (const [id, char] of Object.entries(balance.characters)) {
                console.log(`   ${id}: ${char.maxHp} HP`);
            }
        }

        // Check Characters
        const chars = await db.collection('characters').find({}).toArray();
        console.log('\n👤 HP en Characters:');
        chars.forEach(c => {
            console.log(`   ${c.id}: ${c.maxHp} HP`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

checkCharacters();

