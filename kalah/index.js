import Kalah from './kalah'
import manifest from './manifest'
import ApplicationRunner from '../application/application_runner'

const container = document.getElementById('kalah-container')
ApplicationRunner.run(container, Kalah, {manifest})
