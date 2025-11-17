import { Skill } from '../../types/game.types';
import './SkillsList.css';

interface SkillsListProps {
    skills: Skill[];
    cooldowns: Record<string, number>;
    onSkillClick: (skill: Skill) => void;
    disabled?: boolean;
}

function SkillsList({ skills, cooldowns, onSkillClick, disabled }: SkillsListProps) {
    if (skills.length === 0) {
        return (
            <div className="skills-list-container">
                <h3>Habilidades</h3>
                <div className="skills-empty">No hay habilidades disponibles</div>
            </div>
        );
    }

    return (
        <div className="skills-list-container">
            <h3>Habilidades ({skills.length})</h3>
            <div className="skills-grid">
                {skills.map((skill) => {
                    const cooldownRemaining = cooldowns[skill.id] || 0;
                    const isOnCooldown = cooldownRemaining > 0;
                    const canUse = !disabled && !isOnCooldown;

                    return (
                        <div
                            key={skill.id}
                            className={`skill-card ${isOnCooldown ? 'on-cooldown' : ''} ${!canUse ? 'disabled' : ''}`}
                            onClick={() => canUse && onSkillClick(skill)}
                        >
                            <div className="skill-header">
                                <h4>{skill.name}</h4>
                                {isOnCooldown && (
                                    <span className="cooldown-badge">
                                        RE: {cooldownRemaining}
                                    </span>
                                )}
                            </div>
                            <p className="skill-description">{skill.description}</p>
                            <div className="skill-stats">
                                {skill.damage && <span className="stat-damage">DAÑO: {skill.damage}</span>}
                                {skill.heal && <span className="stat-heal">CURA: {skill.heal}</span>}
                                {skill.shield && <span className="stat-shield">ESCUDO: {skill.shield}</span>}
                                {skill.cooldown > 0 && (
                                    <span className="stat-cooldown">Reutilización: {skill.cooldown}</span>
                                )}
                                {skill.cost !== undefined && skill.cost > 0 && (
                                    <span className="stat-cost">COSTE: {skill.cost}</span>
                                )}
                            </div>
                            {skill.effects && skill.effects.length > 0 && (
                                <div className="skill-effects">
                                    {skill.effects.map((effect, index) => (
                                        <span key={index} className="effect-badge">
                                            {effect.type} ({effect.duration})
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="skill-target">
                                Objetivo: {skill.targetType === 'all' ? 'Todos los enemigos' : skill.targetType === 'area' ? 'Área' : skill.targetType === 'self' ? 'Sí mismo' : 'Único'}
                                {(skill.targetType === 'all' || skill.targetType === 'area') && (
                                    <span className="area-badge">ÁREA</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default SkillsList;

