# Application

## ActionDispatcher

The `ActionDispatcher` is a central module of the application that facilitates communication between different parts of the system. It functions as a router, but instead of using URLs as input parameters, it simply uses the controller name and action name.

### Key Features

- Registration and management of controllers
- Definition of an active controller for default dispatches
- Execution of actions on the active controller or on a specific controller

### Usage Example

```javascript
const dispatcher = new ActionDispatcher()

dispatcher.register('menu', menuController)
dispatcher.register('game', gameController)

dispatcher.setActive('game')

dispatcher.dispatch('jump')
dispatcher.dispatch('shoot', direction)
```
