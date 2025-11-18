/**
 * Script para actualizar los cooldowns de habilidades en MongoDB
 * Ejecutar con: node scripts/update-skills-cooldowns.js
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27019/cosmos-combat?authSource=admin';

const skillsToUpdate = [
    {
        id: 'inmovilizacion',
        cooldown: -1, // Infinito hasta que muera el objetivo específico
    },
    {
        id: 'salto-acrobatico',
        cooldown: -1, // Infinito hasta que muera cualquier oponente
    },
    {
        id: 'escudo-ardiente',
        cooldown: -1, // Infinito hasta que muera cualquier oponente
    },
    {
        id: 'camuflaje',
        cooldown: -1, // Infinito hasta que muera cualquier oponente
    },
];

async function updateSkills() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db('cosmos-combat');
        const skillsCollection = db.collection('skills');

        for (const skillUpdate of skillsToUpdate) {
            const result = await skillsCollection.updateOne(
                { id: skillUpdate.id },
                { $set: { cooldown: skillUpdate.cooldown } }
            );

            if (result.matchedCount === 0) {
                console.log(`⚠️  Skill ${skillUpdate.id} not found`);
            } else if (result.modifiedCount === 0) {
                console.log(`ℹ️  Skill ${skillUpdate.id} already has cooldown ${skillUpdate.cooldown}`);
            } else {
                console.log(`✅ Updated ${skillUpdate.id} cooldown to ${skillUpdate.cooldown}`);
            }
        }

        console.log('\n✅ All skills updated successfully!');
    } catch (error) {
        console.error('❌ Error updating skills:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('✅ Connection closed');
    }
}

updateSkills();


