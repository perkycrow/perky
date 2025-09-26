import {html} from 'lit'
import PerkyComponent from '../../application/perky_component'


export default class PerkyGate extends PerkyComponent {

    static tagName = 'perky-gate'

    static properties = {
        title: {type: String},
        showInstructions: {type: Boolean}
    }

    static css = `
        perky-gate {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        perky-gate .gate-title {
            font-family: 'Arial', sans-serif;
            font-size: 4rem;
            font-weight: 700;
            color: #ffffff;
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
            margin-bottom: 2rem;
            letter-spacing: 0.2em;
        }

        perky-gate .gate-instructions {
            font-family: 'Arial', sans-serif;
            font-size: 1.2rem;
            font-weight: 400;
            color: #cccccc;
            text-align: center;
            opacity: 0;
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% {
                opacity: 0.6;
            }
            50% {
                opacity: 1;
            }
        }

        @media (max-width: 768px) {
            perky-gate .gate-title {
                font-size: 2.5rem;
                margin-bottom: 1.5rem;
            }
            
            perky-gate .gate-instructions {
                font-size: 1rem;
            }
        }
    `


    constructor () {
        super()
        this.title = 'Game'
        this.showInstructions = false
    }


    render () {
        return html`
            <div class="gate-title">${this.title}</div>
            ${this.showInstructions ? html`
                <div class="gate-instructions">Press any key to start</div>
            ` : ''}
        `
    }

}


PerkyGate.define()
