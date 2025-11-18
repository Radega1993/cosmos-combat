const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27019/cosmos-combat?authSource=admin';

// Valores correctos de HP
const correctHpValues = {
    ironclad: 22,
    blaze: 18,
    frost: 15,
    thunder: 17,
    shadow: 16,
    strike: 20,
};

async function updateCharacterHp() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db('cosmos-combat');
        const charactersCollection = db.collection('characters');
        const gameBalancesCollection = db.collection('gamebalances');

        // Actualizar HP en Characters
        console.log('📝 Updating HP in Characters collection...');
        for (const [characterId, correctHp] of Object.entries(correctHpValues)) {
            const result = await charactersCollection.updateOne(
                { id: characterId },
                { $set: { maxHp: correctHp } }
            );

            if (result.modifiedCount > 0) {
                console.log(`   ✅ Updated ${characterId}: maxHp = ${correctHp}`);
            } else if (result.matchedCount > 0) {
                console.log(`   ℹ️  ${characterId}: HP already correct (${correctHp})`);
            } else {
                console.log(`   ⚠️  ${characterId}: Character not found`);
            }
        }

        // Actualizar HP en GameBalance
        console.log('\n📝 Updating HP in GameBalance collection...');
        const balance = await gameBalancesCollection.findOne({ isActive: true });

        if (balance) {
            let updated = false;
            const updateFields = {};

            // GameBalance puede tener characters como objeto
            if (balance.characters && typeof balance.characters === 'object') {
                for (const [characterId, correctHp] of Object.entries(correctHpValues)) {
                    if (balance.characters[characterId]) {
                        updateFields[`characters.${characterId}.maxHp`] = correctHp;
                        updated = true;
                        console.log(`   ✅ Will update ${characterId} in GameBalance: maxHp = ${correctHp}`);
                    }
                }
            }

            if (updated) {
                await gameBalancesCollection.updateOne(
                    { _id: balance._id },
                    { $set: updateFields }
                );
                console.log('   ✅ GameBalance saved');
            } else {
                console.log('   ⚠️  No characters found in GameBalance to update');
            }
        } else {
            console.log('   ⚠️  No active GameBalance found');
        }

        console.log('\n✅ All HP values updated successfully!');

        // Mostrar resumen
        console.log('\n📊 Summary of HP values:');
        for (const [characterId, correctHp] of Object.entries(correctHpValues)) {
            const char = await charactersCollection.findOne({ id: characterId });
            if (char) {
                console.log(`   ${characterId}: ${char.maxHp} HP`);
            }
        }

    } catch (error) {
        console.error('❌ Error updating HP:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n✅ Connection closed');
    }
}

updateCharacterHp();

