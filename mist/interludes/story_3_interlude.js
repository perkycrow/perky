import Interlude from '../core/interlude.js'

export default class Interlude3 extends Interlude {
    static visual  = 'contagionVisual'

    static content = {
        fr: 'Contagion est une competence qui revele le veritable potentiel des reactifs de votre preparation. Chargez cette competence en provoquant des combinaisons multiples en une seule action. Lorsqu\'elle est declenchee, Contagion fait evoluer aleatoirement 3 reactifs.',
        en: 'Contagion is a skill that reveals the true potential of the reagents in your mixture. Charge this skill by triggering multiple combinations in a single action. When activated, Contagion randomly evolves 3 reagents.'
    }

    static choices = [{
        type: 'skill',
        id:   'contagion'
    }]
}
