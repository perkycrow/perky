import Skill from '../core/skill.js'


export default class MadnessSkill extends Skill {

    static cost = 10

    static title = {
        fr: 'Madness',
        en: 'Madness'
    }

    static description = {
        fr: 'Remplace aleatoirement les reactifs en attente.',
        en: 'Randomly replace the pending reagents.'
    }

    static chargeDescription = {
        fr: 'Se charge a chaque fois que les reactifs en attente sont ajoutes a la preparation.',
        en: 'Charges every time the pending reagents are added to the mixture.'
    }

    trigger (flow) { // eslint-disable-line local/class-methods-use-this -- clean
        flow.enqueue('addCluster')

        return true
    }

}
