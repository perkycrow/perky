# Application

## ActionController

The `ActionController` manages actions and their associated callbacks. It allows registering actions, attaching execution hooks, and invoking them in a controlled manner.

### Key Features

- Registration and management of actions
- Addition of callbacks before and after action execution
- Execution of actions with argument passing

### Usage Example

```javascript
const gameController = new ActionController()

gameController.addAction('jump', height => {
    // Code to make the character jump
})

gameController.beforeAction('jump', height => {
    // Executed before the jump action
    return height <= 10 // Returns false to cancel the action
})

gameController.afterAction('jump', height => {
    // Executed after the jump action
})

gameController.execute('jump', 5)
```

## ActionDispatcher

The `ActionDispatcher` facilitates communication between different parts of the system. It functions as a router, but instead of using URLs as input parameters, it simply uses the controller name and action name.

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

dispatcher.dispatch('jump', 5) // Triggers gameController.execute('jump')
```
