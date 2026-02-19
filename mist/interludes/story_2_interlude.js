import Interlude from '../core/interlude.js'


export default class Interlude2 extends Interlude {

    static visual = 'ruinVisual'

    static content = {
        fr: 'Ruin est une competence puissante qui permet d\'eliminer des reactifs. Chargez cette competence en combinant des reactifs dans votre preparation. Une fois activee, Ruin eliminera aleatoirement 3 reactifs.',
        en: 'Ruin is a powerful skill that allows you to eliminate reagents. Charge this skill by combining reagents in your mixture. Once activated, Ruin will randomly remove 3 reagents.'
    }

    static choices = [{
        type: 'skill',
        id:   'ruin'
    }]

}
