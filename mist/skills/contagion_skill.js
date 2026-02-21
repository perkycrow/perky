import Skill from '../core/skill.js'


export default class ContagionSkill extends Skill {

    static cost = 6

    static title = {
        fr: 'Contagion',
        en: 'Contagion'
    }

    static description = {
        fr: 'Fait evoluer aleatoirement 3 reactifs.',
        en: 'Randomly evolves 3 reagents.'
    }

    static chargeDescription = {
        fr: 'Se charge lorsqu\'un reactif provoque des combinaisons en cascade.',
        en: 'Charges when a reagent triggers cascade combinations.'
    }

    trigger (flow, game) { // eslint-disable-line local/class-methods-use-this -- clean
        const {board, lab} = game

        const reagents = board.getReagents({
            sort:  indexSorter(lab.reagents),
            count: 3
        })

        if (reagents.length > 0) {
            flow.enqueue('evolveReagents', reagents)
            flow.enqueue('applyRules')
        }

        return true
    }

}


function indexSorter (array) {
    return (a, b) => {
        return array.indexOf(a.name) - array.indexOf(b.name)
    }
}
