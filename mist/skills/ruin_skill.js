import Skill from '../core/skill.js'


export default class RuinSkill extends Skill {

    static cost = 8

    static title = {
        fr: 'Ruin',
        en: 'Ruin'
    }

    static description = {
        fr: 'Elimine aleatoirement 3 reactifs.',
        en: 'Randomly removes 3 reagents.'
    }

    static chargeDescription = {
        fr: 'Se charge a chaque fois que des reactifs sont combines.',
        en: 'Charges every time reagents are merged.'
    }

    trigger (flow, game) { // eslint-disable-line local/class-methods-use-this -- clean
        const {board, random} = game

        const reagents = board.getReagents({random, count: 3})

        if (reagents.length > 0) {
            flow.enqueue('removeReagents', reagents)
            flow.enqueue('applyRules')
        }

        return true
    }

}
