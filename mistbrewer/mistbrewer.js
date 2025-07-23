import Application from '../application/application.js'
import GamePlugin from '../game/game_plugin.js'
import ThreePlugin from '../three/three_plugin.js'
import Sprite from '../three/objects/sprite.js'
import ThreeSpritesheet from '../three/three_spritesheet.js'
import SpriteAnimation from '../three/sprite_animation.js'
import SceneManager from './scene_manager.js'
import TitleScene from './title_scene.js'
import GameScene from './game_scene.js'

const manifest = {
    config: {
        name: 'Mistbrewer',
        debug: true
    },
    sourceDescriptors: {
        images: {
            background: {
                url: '/assets/images/background.png',
                tags: ['core']
            },
            title: {
                url: '/assets/images/title.png',
                tags: ['core']
            },
            commencer: {
                url: '/assets/images/commencer.png',
                tags: ['core']
            },
            commencer_hover: {
                url: '/assets/images/commencer_hover.png',
                tags: ['core']
            }
        },
        spritesheets: {
            notebook: {
                url: '/assets/spritesheets/notebook-0.json',
                tags: ['core']
            },
            reagents: {
                url: '/assets/spritesheets/reagents-0.json',
                tags: ['core']
            }
        }
    }
}

export default class Mistbrewer extends Application {
    constructor (params = {}) {
        super({
            ...params,
            plugins: [
                new GamePlugin({
                    fps: params.fps || 60,
                    maxFrameSkip: params.maxFrameSkip || 5
                }),
                new ThreePlugin({
                    backgroundColor: 0x1a1a1a,
                    camera: {
                        type: 'orthographic',
                        width: 20,
                        height: 15,
                        near: 0.1,
                        far: 1000
                    },
                    postProcessing: false
                })
            ]
        })
        
        this.background = null
        this.assetsLoaded = false
        
        // Initialize scene manager
        this.sceneManager = new SceneManager(this)
        this.sceneManager.addScene('title', TitleScene)
        this.sceneManager.addScene('game', GameScene)
        
        this.initGame()
        this.on('update', (deltaTime) => this.updateGame(deltaTime))
        this.on('render', () => this.renderGame())
    }

    async initGame () {
        this.setupCamera()
        await this.loadAssets()
        this.setupBackground()
        this.assetsLoaded = true
        
        console.log('🧪 Mistbrewer initialized')
        console.log('📱 Camera setup complete')
        console.log('🖼️ Background loaded and setup')
        
        // Start with title scene
        await this.sceneManager.switchTo('title')

        // Masquer le loading screen
        hideLoadingScreen()
    }

    async loadAssets () {
        this.on('loader:progress', (loader, progress, {sourceDescriptor}) => {
            console.log(`📦 Loading ${sourceDescriptor.id}... ${Math.round(progress * 100)}%`)
        })

        await this.loadTag('core')
        
        // Test du chargement du spritesheet notebook
        const notebookSpritesheet = this.getSource('spritesheets', 'notebook')
        if (notebookSpritesheet) {
            console.log('✅ Spritesheet notebook chargé avec succès')
            console.log(`📊 Nombre de frames: ${notebookSpritesheet.getFrameCount()}`)
            console.log(`🖼️ Frames disponibles: ${notebookSpritesheet.getFrameNames().join(', ')}`)
            console.log(`🗃️ Images: ${notebookSpritesheet.getImageKeys().join(', ')}`)
            
            // Créer le ThreeSpritesheet
            this.notebookThreeSpritesheet = new ThreeSpritesheet(notebookSpritesheet)
            console.log('🎨 ThreeSpritesheet notebook créé')
            
            // Test de création d'un sprite avec spritesheet
            this.testNotebookSprite()
        } else {
            console.warn('❌ Spritesheet notebook non trouvé')
        }
        
        // Test du chargement du spritesheet reagents
        const reagentsSpritesheet = this.getSource('spritesheets', 'reagents')
        if (reagentsSpritesheet) {
            console.log('✅ Spritesheet reagents chargé avec succès')
            console.log(`📊 Nombre de frames: ${reagentsSpritesheet.getFrameCount()}`)
            console.log(`🖼️ Frames disponibles: ${reagentsSpritesheet.getFrameNames().slice(0, 5).join(', ')}...`)
            console.log(`🗃️ Images: ${reagentsSpritesheet.getImageKeys().join(', ')}`)
            
            // Créer le ThreeSpritesheet
            this.reagentsThreeSpritesheet = new ThreeSpritesheet(reagentsSpritesheet)
            console.log('🎨 ThreeSpritesheet reagents créé')
            
            // Test de création de sprites avec différents reagents
            this.testReagentsSprites()
        } else {
            console.warn('❌ Spritesheet reagents non trouvé')
        }
    }

    setupBackground () {
        // Get the loaded background image
        const backgroundImage = this.getSource('images', 'background')
        if (!backgroundImage) {
            console.warn('Background image not found')
            return
        }

        // Create sprite from the image
        this.background = new Sprite({source: backgroundImage})

        // Position behind everything else to avoid z-fighting
        this.background.position.set(0, 0, -10)
        
        // Scale to cover the entire view
        this.updateBackgroundScale()
        
        // Add to scene
        this.scene.add(this.background)

        // Listen for resize to update background scale
        this.on('three:resize', () => {
            this.updateBackgroundScale()
        })
    }

    updateBackgroundScale () {
        if (!this.background || !this.camera) {
            return
        }

        // Get container dimensions
        const containerSize = this.getThreeContainerSize()
        const containerAspect = containerSize.width / containerSize.height

        // Get camera view dimensions
        const viewHeight = this.camera.top - this.camera.bottom
        const viewWidth = viewHeight * containerAspect

        // Get background image dimensions
        const backgroundImage = this.getSource('images', 'background')
        if (!backgroundImage) {
            return
        }

        const imageAspect = backgroundImage.width / backgroundImage.height

        // Calculate scale to cover the entire view (like CSS background-size: cover)
        let scaleX
        let scaleY
        if (containerAspect > imageAspect) {
            // Container is wider than image, scale by width
            scaleX = viewWidth / backgroundImage.width
            scaleY = scaleX
        } else {
            // Container is taller than image, scale by height
            scaleY = viewHeight / backgroundImage.height
            scaleX = scaleY
        }

        // Apply the scale to cover the entire view
        this.background.scale.set(
            scaleX * backgroundImage.width,
            scaleY * backgroundImage.height,
            1
        )
    }

    setupCamera () {
        if (!this.camera) {
            console.warn('Camera not available yet')
            return
        }

        this.camera.position.set(0, 0, 10)
        this.camera.lookAt(0, 0, 0)
    }

    updateGame (deltaTime) {
        if (!this.assetsLoaded) {
            return
        }
        
        // Update current scene
        this.sceneManager.update(deltaTime)
        
        this.emit('gameUpdated')
    }

    renderGame () {
        this.render()
    }
    
    testNotebookSprite () {
        console.log('🧪 Test de création d\'un sprite avec spritesheet notebook')
        
        // Créer un sprite depuis le spritesheet
        const notebookSprite = new Sprite({
            spritesheet: this.notebookThreeSpritesheet,
            frame: 'notebook1'
        })
        
        console.log('🔍 Sprite créé:', notebookSprite)
        console.log('🎨 Material:', notebookSprite.material)
        console.log('🖼️ Texture:', notebookSprite.material.map)
        
        // Positionner le sprite
        notebookSprite.position.set(-6, 0, 0)
        notebookSprite.scale.set(2, 2, 1) // Taille plus grande pour être sûr
        
        // Ajouter à la scène
        this.scene.add(notebookSprite)
        
        console.log('📝 Sprite notebook ajouté à la scène')
        console.log('📐 Position:', notebookSprite.position)
        console.log('📏 Scale:', notebookSprite.scale)
        
        // Créer une animation simple avec les pages du notebook
        const frames = ['notebook1', 'notebook2', 'notebook3', 'notebook4']
        const animation = new SpriteAnimation(notebookSprite, frames, {
            fps: 2,
            loop: true,
            autoStart: true
        })
        
        console.log('🎬 Animation notebook créée et démarrée')
        
        // Stocker pour debugging
        this.notebookSprite = notebookSprite
        this.notebookAnimation = animation
        
        // Log des événements d'animation
        animation.on('frameChanged', (frame, index) => {
            console.log(`📖 Page changée: ${frame} (index: ${index})`)
        })
        
        animation.on('loop', () => {
            console.log('🔄 Animation notebook bouclée')
        })
    }

    testReagentsSprites () {
        console.log('🧪 Test de création de sprites avec différents reagents')
        
        // Créer plusieurs sprites avec différentes fleurs (entités distinctes)
        this.flowerSprites = []
        
        // Configuration des sprites - chaque sprite affiche UNE fleur différente
        const flowerConfigs = [
            {position: [-3, 3, 0], flower: 'flower_01.png'},
            {position: [0, 3, 0], flower: 'flower_02.png'},
            {position: [3, 3, 0], flower: 'flower_03.png'},
            {position: [-3, 0, 0], flower: 'flower_04.png'},
            {position: [0, 0, 0], flower: 'flower_05.png'},
            {position: [3, 0, 0], flower: 'flower_06.png'},
            {position: [-3, -3, 0], flower: 'flower_07.png'},
            {position: [0, -3, 0], flower: 'flower_08.png'},
            {position: [3, -3, 0], flower: 'flower_09.png'}
        ]
        
        flowerConfigs.forEach((config, index) => {
            // Debug: Vérifier que la frame existe
            const frame = this.reagentsThreeSpritesheet.getFrame(config.flower)
            if (!frame) {
                console.warn(`❌ Frame ${config.flower} n'existe pas dans le spritesheet !`)
                console.log(`🔍 Frames disponibles: ${this.reagentsThreeSpritesheet.getFrameNames().slice(0, 10).join(', ')}...`)
                return
            }
            
            console.log(`✅ Frame ${config.flower} trouvée: x=${frame.frame.x}, y=${frame.frame.y}, w=${frame.frame.w}, h=${frame.frame.h}`)
            
            // Créer un sprite depuis le spritesheet - CHAQUE sprite affiche UNE fleur
            const flowerSprite = new Sprite({
                spritesheet: this.reagentsThreeSpritesheet,
                frame: config.flower
            })
            
            // Debug: Vérifier les UV coordinates
            console.log(`🔍 Sprite ${index + 1} (${config.flower}):`)
            console.log(`   UV repeat: (${flowerSprite.material.map.repeat.x}, ${flowerSprite.material.map.repeat.y})`)
            console.log(`   UV offset: (${flowerSprite.material.map.offset.x}, ${flowerSprite.material.map.offset.y})`)
            
            // Positionner le sprite
            flowerSprite.position.set(...config.position)
            flowerSprite.scale.set(1, 1, 1) // Les frames font 300x300px, on les réduit
            
            // Ajouter à la scène
            this.scene.add(flowerSprite)
            
            // Stocker pour debugging
            this.flowerSprites.push(flowerSprite)
            
            console.log(`🌸 Sprite fleur ${index + 1} créé: ${config.flower} à la position (${config.position.join(', ')})`)
        })
        
        console.log('🔍 Premier sprite créé:', this.flowerSprites[0])
        console.log('🎨 Material:', this.flowerSprites[0].material)
        console.log('🖼️ Texture:', this.flowerSprites[0].material.map)
        console.log('📐 Dimensions texture:', this.flowerSprites[0].material.map.image.width, 'x', this.flowerSprites[0].material.map.image.height)
        
        console.log('📝 Sprites reagents ajoutés à la scène (entités distinctes)')
        console.log('👁️ Caméra position:', this.camera.position)
        console.log('🎯 Nombre d\'objets dans la scène:', this.scene.children.length)
        
        // Démo du changement vers une autre fleur après 5 secondes
        setTimeout(() => {
            console.log('🎭 Changement de la fleur centrale vers flower_36.png')
            this.flowerSprites[4].setFrame('flower_36.png')
        }, 5000)
    }
}

function hideLoadingScreen () {
    const loadingElement = document.getElementById('loading')
    if (loadingElement) {
        loadingElement.classList.add('hidden')
    }
}

function init () {
    const game = new Mistbrewer({manifest})
    const container = document.getElementById('game-container')

    // Monter le jeu dans le container
    game.mountTo(container)
    
    // Démarrer le jeu
    game.start()
    
    console.log('🎮 Mistbrewer started')
    
    // Exposer pour debugging
    window.mistbrewer = game
}

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
} 