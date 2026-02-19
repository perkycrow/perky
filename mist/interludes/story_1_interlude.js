import Interlude from '../core/interlude.js'


export default class Interlude1 extends Interlude {

    static visual = 'madnessVisual'

    static content = {
        fr: 'Madness est une competence qui peut vous offrir un avantage inattendu. Une fois chargee, elle transformera de maniere imprevisible les reactifs en attente.',
        en: 'Madness is a skill that can grant you unexpected advantage. Once charged, it will unpredictably transform the pending reagents.'
    }

    static choices = [{
        type:  'skill',
        id:    'madness'
    }]

}
