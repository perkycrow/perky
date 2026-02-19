import Adventure        from '../core/adventure.js'
import skillFactory     from '../factories/main_skill_factory.js'
import artifactFactory  from '../factories/main_artifact_factory.js'

import Chapter1         from '../chapters/story_1_chapter.js'
import Interlude1       from '../interludes/story_1_interlude.js'
import Chapter2         from '../chapters/story_2_chapter.js'
import Interlude2       from '../interludes/story_2_interlude.js'
import Chapter3         from '../chapters/story_3_chapter.js'
import Interlude3       from '../interludes/story_3_interlude.js'
import Chapter4         from '../chapters/story_4_chapter.js'
import Chapter5         from '../chapters/story_5_chapter.js'
import Chapter6         from '../chapters/story_6_chapter.js'
import Chapter7         from '../chapters/story_7_chapter.js'
import Chapter8         from '../chapters/story_8_chapter.js'
import Chapter9         from '../chapters/story_9_chapter.js'
import Chapter10        from '../chapters/story_10_chapter.js'
import CutScene1        from '../cut_scenes/story_1_cut_scene.js'


export default class StoryAdventure extends Adventure {

    static skillFactory    = skillFactory
    static artifactFactory = artifactFactory
    static id              = 'story'

    static steps = [
        CutScene1,
        Chapter1,
        Interlude1,
        Chapter2,
        Interlude2,
        Chapter3,
        Interlude3,
        Chapter4,
        Chapter5,
        Chapter6,
        Chapter7,
        Chapter8,
        Chapter9,
        Chapter10
    ]

}
