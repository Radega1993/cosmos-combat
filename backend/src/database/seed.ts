import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Character } from './schemas/character.schema';
import { Card } from './schemas/card.schema';
import { Skill } from './schemas/skill.schema';
import { GameBalance } from './schemas/game-balance.schema';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const characterModel = app.get<Model<Character>>(getModelToken('Character'));
    const cardModel = app.get<Model<Card>>(getModelToken('Card'));
    const skillModel = app.get<Model<Skill>>(getModelToken('Skill'));
    const gameBalanceModel = app.get<Model<GameBalance>>(getModelToken('GameBalance'));

    console.log('🌱 Starting database seed...');

    // Clear existing data
    await characterModel.deleteMany({});
    await cardModel.deleteMany({});
    await skillModel.deleteMany({});
    await gameBalanceModel.deleteMany({});

    // Seed Cards - Mazo completo según especificaciones
    const cards = [
        // Golpe potenciado (10)
        {
            id: 'golpe-potenciado',
            name: 'Golpe Potenciado',
            type: 'attack',
            cost: 0,
            damage: 0, // +1 daño al siguiente ataque (efecto temporal)
            effects: [{ type: 'power-strike', duration: 1, value: 1 }], // +1 daño siguiente ataque
            targetType: 'self',
            description: 'Aumenta temporalmente la fuerza de tus ataques, infligiendo un mayor daño a los oponentes. (+1 Daño del siguiente ataque)',
            isActive: true,
        },
        // Barrera defensiva (8)
        {
            id: 'barrera-defensiva',
            name: 'Barrera Defensiva',
            type: 'defense',
            cost: 0,
            defense: 1, // -1 daño recibido
            targetType: 'self',
            description: 'Crea una barrera protectora que reduce todo el daño recibido durante el próximo turno. (-1 Daño)',
            isActive: true,
        },
        // Ataque eléctrico (4)
        {
            id: 'ataque-electrico',
            name: 'Ataque Eléctrico',
            type: 'attack',
            cost: 0,
            damage: 1,
            effects: [{ type: 'paralysis', duration: 1 }],
            targetType: 'single',
            description: 'Realiza un ataque elemental eléctrico. (1 daño. Parálisis 1 turno)',
            isActive: true,
        },
        // Ataque fuego (4)
        {
            id: 'ataque-fuego',
            name: 'Ataque Fuego',
            type: 'attack',
            cost: 0,
            damage: 1,
            effects: [{ type: 'burn', duration: 1 }], // Quemadura: descartar carta
            targetType: 'single',
            description: 'Realiza un ataque elemental de fuego. (1 daño. Quemadura: descartas una carta de tu mano)',
            isActive: true,
        },
        // Ataque hielo (4)
        {
            id: 'ataque-hielo',
            name: 'Ataque Hielo',
            type: 'attack',
            cost: 0,
            damage: 1,
            effects: [{ type: 'freeze', duration: 1, value: 1 }], // Congelación: -1 acción
            targetType: 'single',
            description: 'Realiza un ataque elemental de hielo. (1 daño. Congelación: 1 punto de acción)',
            isActive: true,
        },
        // Sanación rápida (6)
        {
            id: 'sanacion-rapida',
            name: 'Sanación Rápida',
            type: 'utility',
            cost: 0,
            heal: 3,
            targetType: 'self',
            description: 'Recupera 3 puntos de vida para mantener tu resistencia en la batalla.',
            isActive: true,
        },
        // Telequinesis (8)
        {
            id: 'telequinesis',
            name: 'Telequinesis',
            type: 'utility',
            cost: 0,
            targetType: 'single',
            description: 'Puedes robar una carta de la mano de otro jugador y añadirla a tu mano.',
            isActive: true,
        },
        // Embate Furioso (3)
        {
            id: 'embate-furioso',
            name: 'Embate Furioso',
            type: 'attack',
            cost: 0,
            damage: 0, // Daño por dado (1 daño por cada tirada > 3)
            targetType: 'all',
            description: 'Realiza un ataque físico a los enemigos. Tira un dado tantas veces como jugadores en juego. Inflige 1 de daño físico a todos por cada tirada superior a 3.',
            isActive: true,
        },
        // Implosión Energética (2)
        {
            id: 'implosion-energetica',
            name: 'Implosión Energética',
            type: 'attack',
            cost: 0,
            damage: 2,
            effects: [{ type: 'stun', duration: 1 }], // Aturdido: no puede jugar cartas
            targetType: 'all',
            description: 'Realiza un ataque de área que afecta a todos los luchadores enemigos. Cada enemigo recibe 2 puntos de daño elemental. Además, todos quedan aturdidos durante 1 turno, lo que les impide jugar cartas en su siguiente turno, solo ataques básicos.',
            isActive: true,
        },
        // Energía Vital (2)
        {
            id: 'energia-vital',
            name: 'Energía Vital',
            type: 'utility',
            cost: 0,
            heal: 4,
            effects: [{ type: 'physical-resistance', duration: 2, value: 1 }, { type: 'action-limit', duration: 2, value: 1 }], // +1 resistencia, solo 1 acción
            targetType: 'self',
            description: 'Recupera 4 puntos de vida. Además, durante los próximos 2 turnos, aumenta tu resistencia al daño +1, pero sólo puedes jugar 1 acción en tu turno.',
            isActive: true,
        },
        // Rayos Cósmicos (3)
        {
            id: 'rayos-cosmicos',
            name: 'Rayos Cósmicos',
            type: 'attack',
            cost: 0,
            damage: 0, // Daño por dado (1 daño por cada tirada > 3)
            targetType: 'all',
            description: 'Realiza un ataque elemental a los enemigos. Tira un dado tantas veces como jugadores en juego. Inflige 1 de daño elemental a todos por cada tirada superior a 3.',
            isActive: true,
        },
        // Escudo reflectante (8)
        {
            id: 'escudo-reflectante',
            name: 'Escudo Reflectante',
            type: 'defense',
            cost: 0,
            shield: 0, // Refleja mitad del daño
            effects: [{ type: 'counter', duration: 1, value: 0.5 }], // Refleja 50% del daño
            targetType: 'self',
            description: 'Crea un escudo que refleja la mitad del daño recibido hacia el atacante. (mínimo 1 de daño)',
            isActive: true,
        },
        // Robo de vida (6)
        {
            id: 'robo-de-vida',
            name: 'Robo de Vida',
            type: 'attack',
            cost: 0,
            damage: 0, // Daño variable, cura igual al daño
            heal: 0, // Cura igual al daño infligido
            targetType: 'single',
            description: 'Absorbe la vitalidad del oponente al realizar un ataque exitoso, curando tus propios puntos de vida.',
            isActive: true,
        },
        // Contraataque (5)
        {
            id: 'contraataque',
            name: 'Contraataque',
            type: 'defense',
            cost: 0,
            effects: [{ type: 'counter', duration: 1, value: 1 }], // Devuelve todo el daño
            targetType: 'self',
            description: 'Responde al ataque enemigo con un golpe certero y preciso, devolviendo el daño al oponente que te atacó.',
            isActive: true,
        },
        // Explosión elemental (6)
        {
            id: 'explosion-elemental',
            name: 'Explosión Elemental',
            type: 'attack',
            cost: 0,
            damage: 1,
            targetType: 'all',
            description: 'Desata una explosión de energía elemental que afecta a todos los luchadores en un área, causando daño elemental (1 daño a todos, no se puede defender).',
            isActive: true,
        },
    ];

    await cardModel.insertMany(cards);
    console.log(`✅ Seeded ${cards.length} unique cards`);

    // Seed Skills - Todas las habilidades según especificaciones
    const skills = [
        {
            id: 'golpe-poderoso',
            name: 'Golpe Poderoso',
            character: 'ironclad', // Asignar a personaje apropiado
            type: 'attack',
            damage: 0, // +1 daño con ataque físico
            effects: [{ type: 'power-strike', duration: 1, value: 1 }],
            cooldown: 2,
            cost: 0,
            targetType: 'self',
            description: 'Permite infligir un +1 daño con su ataque físico. (cada 2 turnos)',
            isActive: true,
        },
        {
            id: 'salto-acrobatico',
            name: 'Salto Acrobático',
            character: 'shadow',
            type: 'defense',
            effects: [{ type: 'dodge', duration: 1, value: 2 }], // +2 esquivar
            cooldown: 0, // 1 solo uso, se reinicia si eliminas oponente
            cost: 0,
            targetType: 'self',
            description: 'Permite saltar y evadir ataques enemigos. (+2 esquivar. 1 solo uso, se reinicia si eliminas un oponente)',
            isActive: true,
        },
        {
            id: 'lanzamiento-fuego',
            name: 'Lanzamiento de Fuego',
            character: 'blaze',
            type: 'attack',
            damage: 0, // Daño a todos
            cooldown: 2,
            cost: 0,
            targetType: 'all',
            description: 'Permite lanzar proyectiles de fuego para dañar a sus oponentes. (daña a todos. Cada 2 turnos)',
            isActive: true,
        },
        {
            id: 'escudo-ardiente',
            name: 'Escudo Ardiente',
            character: 'blaze',
            type: 'defense',
            shield: 0, // Absorbe mitad del daño
            effects: [{ type: 'fire-shield', duration: 1, value: 0.5 }], // Absorbe 50% del daño
            cooldown: 0, // 1 solo uso, se reinicia si eliminas oponente
            cost: 0,
            targetType: 'self',
            description: 'Otorga un escudo temporal que absorbe la mitad del daño recibido (1 solo uso, se reinicia si eliminas un oponente)',
            isActive: true,
        },
        {
            id: 'camuflaje',
            name: 'Camuflaje',
            character: 'shadow',
            type: 'utility',
            effects: [{ type: 'invisibility', duration: 1 }], // Invisible 1 turno
            cooldown: 0, // 1 solo uso, se reinicia si eliminas oponente
            cost: 0,
            targetType: 'self',
            description: 'Permite volverse invisible 1 turno, dificultando que los enemigos lo detecten. (1 solo uso, se reinicia si eliminas un oponente)',
            isActive: true,
        },
        {
            id: 'ataque-furtivo',
            name: 'Ataque Furtivo',
            character: 'shadow',
            type: 'attack',
            damage: 0, // +1 daño, +1 acierto
            effects: [{ type: 'power-strike', duration: 1, value: 1 }, { type: 'accuracy', duration: 1, value: 1 }],
            cooldown: 2,
            cost: 0,
            targetType: 'self',
            description: 'Aumenta la capacidad para realizar ataques sorpresa con mayor precisión y daño. (+1 daño. +1 acierto. cada 2 turnos)',
            isActive: true,
        },
        {
            id: 'descarga-electrica',
            name: 'Descarga Eléctrica',
            character: 'thunder',
            type: 'attack',
            damage: 0, // Daña a todos
            cooldown: 2,
            cost: 0,
            targetType: 'all',
            description: 'Permite liberar una descarga eléctrica para dañar a sus oponentes. (daña a todos. Cada 2 turnos)',
            isActive: true,
        },
        {
            id: 'velocidad-estatica',
            name: 'Velocidad Estática',
            character: 'thunder',
            type: 'utility',
            effects: [{ type: 'extra-action', duration: 1, value: 1 }], // +1 jugada adicional
            cooldown: 3,
            cost: 0,
            targetType: 'self',
            description: 'Aumenta la velocidad durante el combate, lo que le permite moverse más rápidamente. (+1 jugada adicional. cada 3 turnos)',
            isActive: true,
        },
        {
            id: 'inmovilizacion',
            name: 'Inmovilización',
            character: 'frost',
            type: 'attack',
            effects: [{ type: 'action-reduction', duration: 1, value: 1 }], // -1 jugada en el turno
            cooldown: 0, // 1 solo uso, se reinicia si eliminas oponente
            cost: 0,
            targetType: 'single',
            description: 'Inmoviliza al objetivo. (-1 jugada en el turno. 1 solo uso, se reinicia si eliminas un oponente)',
            isActive: true,
        },
        {
            id: 'escudo-hielo',
            name: 'Escudo de Hielo',
            character: 'frost',
            type: 'defense',
            shield: 1,
            cooldown: 0,
            cost: 0,
            targetType: 'self',
            description: 'Crea un escudo de hielo que absorbe el daño recibido (1 daño, 3 turnos)',
            isActive: true,
        },
        {
            id: 'armadura-fortificada',
            name: 'Armadura Fortificada',
            character: 'ironclad',
            type: 'defense',
            effects: [{ type: 'physical-resistance', duration: 0, value: 1 }], // Disminuye daño físico (permanente mientras activa)
            cooldown: 0,
            cost: 0,
            targetType: 'self',
            description: 'Proporciona una armadura resistente que disminuye el daño físico sufrido.',
            isActive: true,
        },
        {
            id: 'contraataque-skill',
            name: 'Contraataque',
            character: 'ironclad',
            type: 'defense',
            effects: [{ type: 'counter', duration: 3, value: 1 }], // Devuelve daño (3 turnos, tirada de 3 o más)
            cooldown: 0,
            cost: 0,
            targetType: 'self',
            description: 'Devuelve el daño antes de ser recibido (3 turnos, tirada de 3 o más)',
            isActive: true,
        },
    ];

    await skillModel.insertMany(skills);
    console.log(`✅ Seeded ${skills.length} skills`);

    // Seed Characters - Actualizados con atributos y mazo completo
    // El mazo completo según especificaciones:
    // Golpe potenciado: 10, Barrera defensiva: 8, Ataque eléctrico: 4, Ataque fuego: 4,
    // Ataque hielo: 4, Sanación rápida: 6, Telequinesis: 8, Embate Furioso: 3,
    // Implosión Energética: 2, Energía Vital: 2, Rayos Cósmicos: 3, Escudo reflectante: 8,
    // Robo de vida: 6, Contraataque: 5, Explosión elemental: 6
    // Total: 10+8+4+4+4+6+8+3+2+2+3+8+6+5+6 = 79 cartas
    const fullDeck = [
        ...Array(10).fill('golpe-potenciado'),
        ...Array(8).fill('barrera-defensiva'),
        ...Array(4).fill('ataque-electrico'),
        ...Array(4).fill('ataque-fuego'),
        ...Array(4).fill('ataque-hielo'),
        ...Array(6).fill('sanacion-rapida'),
        ...Array(8).fill('telequinesis'),
        ...Array(3).fill('embate-furioso'),
        ...Array(2).fill('implosion-energetica'),
        ...Array(2).fill('energia-vital'),
        ...Array(3).fill('rayos-cosmicos'),
        ...Array(8).fill('escudo-reflectante'),
        ...Array(6).fill('robo-de-vida'),
        ...Array(5).fill('contraataque'),
        ...Array(6).fill('explosion-elemental'),
    ];

    const characters = [
        {
            id: 'ironclad',
            name: 'Ironclad',
            description: 'Un guerrero blindado con alta resistencia física',
            maxHp: 100,
            baseStats: {
                attack: 10,
                defense: 5,
                speed: 3,
                dodge: 0,
                accuracy: 0,
            },
            attributes: {
                physicalResistance: 1,
                fireResistance: 0,
                coldResistance: 0,
                paralysisImmunity: false,
            },
            skills: ['golpe-poderoso', 'armadura-fortificada', 'contraataque-skill'],
            deck: fullDeck,
            isActive: true,
        },
        {
            id: 'blaze',
            name: 'Blaze',
            description: 'Maestro del fuego con ataques ardientes',
            maxHp: 80,
            baseStats: {
                attack: 12,
                defense: 3,
                speed: 4,
                dodge: 0,
                accuracy: 0,
            },
            attributes: {
                fireResistance: 2,
                coldResistance: 0,
                physicalResistance: 0,
                paralysisImmunity: false,
            },
            skills: ['lanzamiento-fuego', 'escudo-ardiente'],
            deck: fullDeck,
            isActive: true,
        },
        {
            id: 'frost',
            name: 'Frost',
            description: 'Guerrero del hielo que congela a sus enemigos',
            maxHp: 90,
            baseStats: {
                attack: 9,
                defense: 4,
                speed: 4,
                dodge: 0,
                accuracy: 0,
            },
            attributes: {
                fireResistance: 0,
                coldResistance: 2,
                physicalResistance: 0,
                paralysisImmunity: false,
            },
            skills: ['escudo-hielo', 'inmovilizacion'],
            deck: fullDeck,
            isActive: true,
        },
        {
            id: 'thunder',
            name: 'Thunder',
            description: 'Guerrero eléctrico con velocidad relámpago',
            maxHp: 85,
            baseStats: {
                attack: 11,
                defense: 3,
                speed: 5,
                dodge: 0,
                accuracy: 1,
            },
            attributes: {
                fireResistance: 0,
                coldResistance: 0,
                physicalResistance: 0,
                paralysisImmunity: true,
            },
            skills: ['descarga-electrica', 'velocidad-estatica'],
            deck: fullDeck,
            isActive: true,
        },
        {
            id: 'shadow',
            name: 'Shadow',
            description: 'Asesino sigiloso con ataques críticos',
            maxHp: 90,
            baseStats: {
                attack: 8,
                defense: 4,
                speed: 5,
                dodge: 2,
                accuracy: 1,
            },
            attributes: {
                fireResistance: 0,
                coldResistance: 0,
                physicalResistance: 0,
                paralysisImmunity: false,
            },
            skills: ['salto-acrobatico', 'camuflaje', 'ataque-furtivo'],
            deck: fullDeck,
            isActive: true,
        },
        {
            id: 'strike',
            name: 'Strike',
            description: 'Luchador equilibrado y versátil',
            maxHp: 95,
            baseStats: {
                attack: 9,
                defense: 4,
                speed: 4,
                dodge: 1,
                accuracy: 0,
            },
            attributes: {
                fireResistance: 0,
                coldResistance: 0,
                physicalResistance: 0,
                paralysisImmunity: false,
            },
            skills: ['golpe-poderoso'],
            deck: fullDeck,
            isActive: true,
        },
    ];

    await characterModel.insertMany(characters);
    console.log(`✅ Seeded ${characters.length} characters`);

    // Seed Game Balance - Actualizado con todos los efectos
    const gameBalance = {
        version: '1.0.0',
        game: {
            startingHandSize: 3, // Según reglas: 3 cartas iniciales
            maxHandSize: 10,
            cardsPerTurn: 2, // Según reglas: roba 2 cartas al final del turno
            actionsPerTurn: 2,
            minPlayers: 2,
            maxPlayers: 6,
        },
        characters: {
            ironclad: { maxHp: 100, baseAttack: 10, baseDefense: 5, baseSpeed: 3 },
            blaze: { maxHp: 80, baseAttack: 12, baseDefense: 3, baseSpeed: 4 },
            frost: { maxHp: 90, baseAttack: 9, baseDefense: 4, baseSpeed: 4 },
            thunder: { maxHp: 85, baseAttack: 11, baseDefense: 3, baseSpeed: 5 },
            shadow: { maxHp: 90, baseAttack: 8, baseDefense: 4, baseSpeed: 5 },
            strike: { maxHp: 95, baseAttack: 9, baseDefense: 4, baseSpeed: 4 },
        },
        effects: {
            // Efectos básicos
            burn: {
                discardCard: true, // Quemadura: descartar carta
                maxDuration: 3,
                stackable: true
            },
            paralysis: {
                actionsReduced: 1,
                maxDuration: 2,
                stackable: false,
                curable: true, // Se puede curar con tirada de 6
            },
            freeze: {
                actionsReduced: 1,
                maxDuration: 2,
                stackable: true,
                curable: true, // Se puede curar con tirada de 6
            },
            // Efectos de cartas y habilidades
            'power-strike': {
                damageBonus: 1,
                maxDuration: 1,
                stackable: false
            },
            'fire-shield': {
                damageAbsorption: 0.5,
                maxDuration: 1,
                stackable: false
            },
            invisibility: {
                dodgeBonus: 999, // Muy difícil de alcanzar
                maxDuration: 1,
                stackable: false
            },
            'extra-action': {
                actionsAdded: 1,
                maxDuration: 1,
                stackable: false
            },
            'action-reduction': {
                actionsReduced: 1,
                maxDuration: 1,
                stackable: false
            },
            'physical-resistance': {
                damageReduction: 1,
                maxDuration: 0, // Permanente mientras activo
                stackable: true
            },
            counter: {
                damageReflected: 1,
                maxDuration: 3,
                stackable: false,
                requiresRoll: true, // Requiere tirada de 3 o más
                rollThreshold: 3,
            },
            stun: {
                cannotPlayCards: true,
                maxDuration: 1,
                stackable: false
            },
            'action-limit': {
                maxActions: 1,
                maxDuration: 2,
                stackable: false
            },
            shield: {
                absorption: 10,
                maxDuration: 3,
                stackable: true
            },
        },
        combat: {
            minDamage: 1,
            criticalHitMultiplier: 1.5,
            criticalHitChance: 0.1,
        },
        cards: {
            defaultCost: 0,
            maxCost: 5,
        },
        skills: {
            defaultCooldown: 3,
            minCooldown: 1,
            maxCooldown: 5,
        },
        isActive: true,
    };

    await gameBalanceModel.create(gameBalance);
    console.log('✅ Seeded game balance');

    console.log('🎉 Database seed completed!');
    console.log(`📊 Summary:`);
    console.log(`   - ${cards.length} unique cards`);
    console.log(`   - ${skills.length} skills`);
    console.log(`   - ${characters.length} characters`);
    console.log(`   - Full deck: ${fullDeck.length} cards per character`);
    await app.close();
    process.exit(0);
}

bootstrap().catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
});
