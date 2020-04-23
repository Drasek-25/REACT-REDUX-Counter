# React Redux

In this Redux tutorial we're going to learn how to use Redux with React incrementally – starting with plain React – and a very simple React + Redux example. We'll see why each feature is useful (and when you can skip some).

Then we’ll look at the more advanced topics, one-by-one, until you understand all of it.

## Should You Use Redux?

Should you still use Redux? Is there something better out now, with Hooks or Context or some other library?

Whether or not it makes sense for your app, depends on the app.

Super simple? Only a few bits of state in one or two places? Local component state will probably be great.

Lots of global state, with interactions between disconnected parts of the app? Or a big app that will only get bigger over time? Give Redux a try.

You can always add Redux *later*, too. You don’t have to decide on Day 1. Start simple and add complexity when and where you need it.

## The Benefits of Redux

You already know about props and one-way data flow in React. Data is passed *down* the component tree via props. Given a component like this:

![Counter component](images/counter-component@2x.png)

The `count`, stored in `App`’s state, would be passed down as a prop:

![Passing props down](images/passing-props-down@2x.png)

For data to come back *up* the tree, it needs to flow through a callback function, so that callback function must first be passed *down* to any components that want to call it to pass data up.

![Passing callbacks down](images/passing-callbacks-down@2x.png)

You can think of the data like *electricity*, connected by colored wires to the components that care about it. Data flows down and up through these wires, but the wires can’t be run through thin air – they have to be chained from one component to the next.

## Passing Data Multiple Levels is a Pain

Sooner or later you run into a situation where a top-level container has some data, and a child 4+ levels down needs that data. Here’s an example from Twitter avatars:

[Show Twitter user page]

Let’s pretend the top-level `App` component holds the `user` object in state. The `user` contains the current user’s avatar, handle, and other profile info.

In order to deliver the `user` data to all 3 `Avatar` components, the `user` needs to be woven through a bunch of intermediate components that don’t need the data.

![Sending the user data down to the Avatar components](images/twitter-hierarchy@2x.png)

Getting the data down there is a pain. Also known as “prop-drilling”.

More importantly, it’s not very good software design. Intermediate components are forced to accept and pass along props that they don’t care about. This means refactoring and reusing those components will be harder than it needs to be.

Wouldn’t it be nice if the components that didn’t need the data didn’t have to see it at all?

Redux is one way to solve this problem.

## Passing Data Between Adjacent Components

If you have components that are siblings and need to share data, the way to do that in React is to pull that data *up* into a parent component and pass it down with props.

That can be cumbersome though. Redux can help by giving you one global “parent” where you can store the data, and then you can `connect` the sibling components to the data with React-Redux.

## Use React-Redux to Connect Data to Any Component

Using the `connect` function that comes with `react-redux`, you can plug any component into Redux’s store and pull out the data it needs.

![Connecting Redux to the Avatar components](images/redux-connected-twitter@2x.png)

## Learn Redux, Starting With Plain React

We’re going to take an incremental approach, starting with a plain React app with component state, adding parts of Redux piece-by-piece, and dealing with the errors along the way. Let’s call it “Error-Driven Development” :)

Here is a counter:

![Counter component](images/counter-plain@2x.png)

In this example, the Counter component holds the state, and the App surrounding it is a simple wrapper.

```js
// Counter.js
import React, {useState} from 'react';

const Counter = () => {

  state = { count: 0 }

  increment = () => {
    setCount(count + 1});
  }

  decrement = () => {
    setCount({
      count: this.state.count - 1
    });
  }

  render() {
    return (
      <div>
        <h2>Counter</h2>
        <div>
          <button onClick={this.decrement}>-</button>
          <span>{this.state.count}</span>
          <button onClick={this.increment}>+</button>
        </div>
      </div>
    )
  }
}

export default Counter;
```

As a quick review, here’s how this works:

- The `count` state is stored in the `Counter` component
- When the user clicks “+”, the button’s `onClick` handler is called, which calls the `increment` function.
The `increment` function updates the state with the new count.
Because state was changed, React re-renders the `Counter` component (and its children), and the new counter value is displayed.

## Add Redux To The React App

Install `redux` and `react-redux` with `yarn` or `npm`.

### redux vs react-redux

`redux` gives you a store, and lets you keep state in it, and get state out, and respond when the state changes. But that’s all it does.

It’s actually `react-redux` that lets you connect pieces of the state to React components.

That’s right: `redux` knows nothing about React at all.

These libraries are like two peas in a pod, though. 99.999% of the time, when anyone mentions “Redux” in the context of React, they are referring to both of these libraries in tandem. So keep that in mind when you see Redux mentioned on StackOverflow, or Reddit, or elsewhere.

The `redux` library can be used outside of a React app too. It’ll work with Vue, Angular, and even backend Node/Express apps.

## Redux Has One Global Store

We’re going to start by looking at just Redux by itself, and just one piece of it: the store.

We’ve talked about how Redux keeps the state of your app in a single store. And how you can extract parts of that state and plug it into your components as props.

You’ll often see the words “state” and “store” used interchangeably. Technically, the state is the data, and the store is where it’s kept.

So: as step 1 of our refactoring from plain React to Redux, we need to create a store to hold the state.

## Create the Redux Store

Redux comes with a handy function that creates stores, and it’s called `createStore`. Logical enough, eh?

In `index.js`, let’s make a store. Import `createStore` and call it like so:

```js
import { createStore } from 'redux';

const store = createStore();

const App = () => (
  <div>
    <Counter/>
  </div>
);
```

This should fail with the error “Expected the reducer to be a function.”

### The Store Needs a Reducer

So, here’s the thing about Redux: it’s not very smart.

You might expect that by creating a store, it would give your state a nice default value. Maybe an empty object, perhaps?

But no.

Redux makes zero assumptions about the shape of your state. It could be an object, or a number, or a string, or whatever you need. It’s up to you!

We have to provide a function that will return the state. That function is called a **reducer** (we’ll see why in a minute). So let’s make a really simple one, pass it into `createStore`, and see what happens:

```js
function reducer(state, action) {
  console.log('reducer', state, action);
  return state;
}

const store = createStore(reducer);
```

After you make this change, open up the console.

You should see a message logged there, something like this:

`reducer undefined Object { type: @@redux/INIT }`

(the letters and numbers after INIT are randomized by Redux)

Notice how Redux called your reducer at the time you created the store.

Also notice how Redux passed a `state` of `undefined`, and the action was an object with a type property.

We’ll talk more about actions in a minute. For now, let’s go over the reducer.

## What Is a Redux Reducer?

Have you ever used the `reduce` function on an array?

Here’s how it works: You pass it a function, and it calls your function once for each element of the array.

Your function gets called with 2 arguments: the last iteration’s result, and the current array element. It combines the current item with the previous “total” result and returns the new total.

This will make more sense with an example:

```js
var letters = ['r', 'e', 'd', 'u', 'x'];

// `reduce` takes 2 arguments:
//   - a function to do the reducing (you might say, a "reducer")
//   - an initial value for accumulatedResult
var word = letters.reduce(
  function(accumulatedResult, arrayItem) {
    return accumulatedResult + arrayItem;
  },
''); // <-- notice this empty string argument: it's the initial value

console.log(word) // => "redux"
```

The function you pass in to `reduce` could be called a “reducer”… because it reduces a whole array of items down to a single result.

Redux is *basically* a fancy version of Array’s `reduce`. Earlier, you saw how Redux reducers have this signature:

```js
(state, action) => newState
```

Meaning: it takes the current `state`, and an `action`, and returns the `newState`. Looks a lot like the signature of an `Array.reduce` reducer!

```js
(accumulatedValue, nextItem) => nextAccumulatedValue
```

Redux reducers work just like the function you pass to `Array.reduce`. The thing they reduce is actions. They **reduce a set of actions (over time) into a single state.** The difference is that with Array’s `reduce` it happens all at once, and with Redux, it happens over the lifetime of your running app.

## Give the Reducer an Initial State

Remember that the reducer’s job is to take the current `state` and an `action` and return the new state.

It has another job, too: It should return the **initial state** the first time it’s called. This is sort of like “bootstrapping” your app. It’s gotta start somewhere, right?

The idiomatic way to do that is to define an `initialState` variable and use the ES6 default argument syntax to assign it to `state`.

Since we’re going to be moving our `Counter` state into Redux, let’s set up its initial state right now. Inside the `Counter` component our state is represented as an object with a `count`, so we’ll mirror that same shape here.

In `index.js`:

```js
const initialState = {
  count: 0
};

function reducer(state = initialState, action) {
  console.log('reducer', state, action);
  return state;
}
```

If you look at the console again, you’ll see it printed `{count: 0}` as the value for `state`. That’s what we want.

So that brings us to an important rule about reducers.

**Important Rule of Reducers #1:** Never return undefined from a reducer.

You always want your state to be defined. A defined state is a happy state.

## Dispatch Actions to Change the State

Two new terms at once: we’re going to “dispatch” some “actions.”

### What is a Redux Action?

An action is Redux-speak for a plain object with a property called `type`. That’s pretty much it. Following those 2 rules, this is an action:

```js
{
  type: "add an item",
  item: "Apple"
}
```

This is also an action:

```js
{
  type: 7008
}
```

Here’s another one:

```js
{
  type: "INCREMENT"
}
```

Actions are very free-form things. As long as it’s an object with a `type` it’s fair game.

In order to keep things sane and maintainable, Redux users usually give actions types that are **plain strings**, and often uppercased, to signify that they’re meant to be constant values.

An action object describes a change you want to make (like “please increment the counter”) or an event that happened (like “the request to the server failed with this error”).

Actions, despite their active-sounding name, are boring, inert objects. They don’t really *do* anything on their own.

In order to make an action DO something, you need to **dispatch** it.

## How Redux Dispatch Works

The store we created earlier has a built-in function called `dispatch`. Call it with an action, and Redux will call your reducer with that action (and then replace the state with whatever your reducer returned).

Let’s try it out with our store.

```js
const store = createStore(reducer);
store.dispatch({ type: "INCREMENT" });
store.dispatch({ type: "INCREMENT" });
store.dispatch({ type: "DECREMENT" });
store.dispatch({ type: "RESET" });
```

Add those dispatch calls and check the console.

![redux actions](images/dispatching-redux-actions.png)

Every call to `dispatch` results in a call to your reducer!

Also notice how the state is the same every time? `{count: 0}` never changes.

That’s because our reducer is not acting on those actions. That’s an easy fix though. Let’s do that now.

## Handle Actions in the Redux Reducer

To make actions actually do something, we need to write some code in the reducer that will inspect the `type` of each action and update the state accordingly.

There are a few ways to do this. We'll use a simple `switch` statement, which is straightforward, and a very common way to do it.

Here’s how we’ll handle the actions:

```js
function reducer(state = initialState, action) {
  console.log('reducer', state, action);

  switch(action.type) {
    case 'INCREMENT':
      return {
        count: state.count + 1
      };
    case 'DECREMENT':
      return {
        count: state.count - 1
      };
    case 'RESET':
      return {
        count: 0
      };
    default:
      return state;
  }
}
```

Try this out and take a look at the console.

![reducer undefined Object { type: @@redux/INIT }](images/handling-redux-actions.png)

Hey look at that! The `count` is changing!

We’re about ready to hook this up to React, but let’s talk about this reducer code for a second.

## How to Keep Your Reducers Pure

Another rule about reducers is that they must be pure functions. This means that they can’t modify their arguments, and they can’t have side effects.

**Reducer Rule #2:** Reducers must be pure functions.

A “side effect” is any change to something outside the scope of the function. Don’t change variables outside the scope of the function, don’t call other functions that change things , don’t dispatch actions, and so on.

Technically `console.log` is a side effect, but we’ll allow that one.

The most important thing is this: **don’t modify the `state` argument.**

This means you can’t do `state.count = 0` or `state.items.push(newItem)` or `state.count++`, or any other kind of mutation – not to `state` itself, and not to any of the sub-properties of `state`.

[Immer]

Redux is built on the idea of immutability, because mutating global state is the road to ruin.

Keeping your state in a global object is nice and easy. Everything can access the state because it’s always available.

And then the state starts changing in unpredictable ways and it becomes impossible to find the code that’s changing it.

Redux avoids these problems with some simple rules.

- State is read-only, and actions are the only way to modify it.
- Changes happen one way, and one way only: dispatch(action) -> reducer -> new state.
- The reducer function must be “pure” – it cannot modify its arguments, and it can’t have side effects.

## How to Use Redux with React

At this point we have a lovely little `store` with a `reducer` that knows how to update the `state` when it receives an `action`.

Now it’s time to hook up Redux to React.

To do that, the `react-redux` library comes with 2 things: a component called `Provider`, and a function called `connect`.

By wrapping the entire app with the `Provider` component, *every component* in the app tree will be able to access the Redux store if it wants to.

In `index.js`, import the `Provider` and wrap the contents of `App` with it. Pass the `store` as a prop.

```js
import { Provider } from 'react-redux';

...

const App = () => (
  <Provider store={store}>
    <Counter/>
  </Provider>
);
```

After this, `Counter`, and children of `Counter`, and children of their children, and so on – all of them can now access the Redux store.

But not automatically. We’ll need to use the `connect` function on our components to access the store.

## Prepare the Counter Component for Redux

Right now the `Counter` has local state. We’re going to rip that out, in preparation to get the `count` as a prop from Redux.

Remove the state initialization at the top and the `setCount` calls inside `increment` and `decrement`. Then, replace `count` with `props.count`.

In `Counter.js`:

```js
const Counter = (props) => {
  // const [count, setCount] = useState(0);

  increment = () => {
    /*
    // Remove this
        setCount(count + 1);
    */
  };

  decrement = () => {
    /*
    // Also remove this
        setCount(count - 1);
    });
    */
  };

  render() {
    return (
      <div className="counter">
        <h2>Counter</h2>
        <div>
          <button onClick={decrement}>-</button>
          <span className="count">{
            // Replace state:
            //// count
            // With props:
            props.count
          }</span>
          <button onClick={increment}>+</button>
        </div>
      </div>
    );
  }
}
```

This will leave `increment` and `decrement` empty. We’ll fill them in again soon.

You’ll also notice the count has disappeared – which it should, because nothing is passing a `count` prop to `Counter` yet.

## Connect the Component to Redux

To get the `count` out of Redux, we first need to import the `connect` function at the top of Counter.js:

```js
import { connect } from 'react-redux';
```

Then we need to “connect” the Counter component to Redux at the bottom:

```js
// Add this function:
function mapStateToProps(state) {
  return {
    count: state.count
  };
}

// Then replace this:
// export default Counter;

// With this:
export default connect(mapStateToProps)(Counter);
```

Previously we were exporting the component itself. Now we’re wrapping it with this connect function call, so we’re exporting the connected Counter. As far as the rest of your app is concerned, this looks like a regular component.

And the count should reappear! Except it’s frozen until we reimplement increment/decrement.

## How to Use React Redux connect

You might notice the call looks little weird. Why `connect(mapStateToProps)(Counter)` and not `connect(mapStateToProps, Counter)` or `connect(Counter, mapStateToProps)`? What’s that doing?

It’s written this way because `connect` is a *higher-order function*, which is a fancy way of saying it returns a function when you call it. And then calling *that* function with a component returns a new (wrapped) component.

Another name for this is a *higher-order component* (aka “HOC”).

What `connect` does is hook into Redux, pull out the entire state, and pass it through the `mapStateToProps` function that you provide. This needs to be a custom function because only you know the “shape” of the state you’ve stored in Redux.

## How `mapStateToProps` Works

`connect` passes the entire state to your `mapStateToProps` function as if to say, “Hey, tell me what you need out of this.”

The object you return from `mapStateToProps` gets fed into your component as props. The example above will pass `state.count` as the value of the `count` prop: the keys in the object become prop names, and their corresponding values become the props’ values. So you see, this function literally *defines a mapping from state into props.*

By the way – the name `mapStateToProps` is conventional, but it’s not special in any way. You can shorten it to `mapState` or call it whatever you want. As long as it takes the `state` object and returns an object full of props, you’re good.

### Why not pass the whole state?

In the example above, our state is *already* in the right shape and it seems like maybe `mapStateToProps` is unnecessary. If it essentially copies the argument (`state`) into an object that is identical to the state, what good is it?

In really small examples that might be all it does, but usually you’ll be picking out pieces of data the component needs from a larger collection of state.

And also, without the `mapStateToProps` function, `connect` won’t pass in any state data at all.

You could pass in all of the state, and let the component sort it out. That’s not a great habit to get into though, because the component will need to know the shape of the Redux state to pick out what it needs, and it’ll be harder to change that shape later, if you need.

## Dispatch Redux Actions from a React Component

Now that our Counter is `connect`ed, we’ve got the `count` value. Now how can we dispatch actions to change the count?

Well, `connect` has your back: in addition to passing in the (mapped) state, it also passes in the `dispatch` function from the store!

To dispatch an action from inside the Counter, we can call `props.dispatch` with an action.

Our reducer is already set up to handle the `INCREMENT` and `DECREMENT` actions, so let’s dispatch those from increment/decrement:

```js
increment = () => {
  props.dispatch({ type: "INCREMENT" });
};

decrement = () => {
  props.dispatch({ type: "DECREMENT" });
};
```

And now we’re done. The buttons should work again.

### Try this! Add a Reset Button

Here’s a little exercise to try: add a “Reset” button to the counter that dispatches the “RESET” action when clicked.

The reducer is already set up to handle this action, so you should only need to modify Counter.js.

## Action Constants

In most Redux apps, you’ll see **action constants** used in place of plain strings. It’s an extra level of abstraction that can save you some time in the long run.

Action constants help avoid typos, and typos in action names can be a huge pain: no errors, no visible sign that anything is broken, and your actions don’t appear to be doing anything? Could be a typo.

Action constants are easy to write: store your action strings in variables.

A good place to put these is in an `actions.js` file (when your app is small, anyway).

```js
// actions.js
export const INCREMENT = "INCREMENT";
export const DECREMENT = "DECREMENT";
```

Then you can import the action names, and use those instead of writing the strings:

```js
// Counter.js
import React from "react";
import { INCREMENT, DECREMENT } from './actions';

const Counter = () => {

  const [count, setCount] = useState(0);

  increment = () => {
    props.dispatch({ type: INCREMENT });
  };

  decrement = () => {
    props.dispatch({ type: DECREMENT });
  };

  return(
    ...
  )
}
```

## What is a Redux Action Creator?

Up till now we’ve been writing out action objects manually.

What if you had a *function* that would write them for you? No more mis-written actions!

I can tell you think this is crazy. How hard is it to write `{ type: INCREMENT }` without messing up?

As your app grows larger, and you have more than 2 actions, and those actions start to get more complex – passing around more data than just a `type` – action creators can be helpful to have.

Like action constants, they’re not a *requirement* though. This is another layer of abstraction and if you don’t want to bother with it in your app, that’s fine.

I’ll explain what they are anyway, though. You can decide if you want to use them sometimes/always/never.

An **action creator** in Redux terms is a fancy term for a function that returns an action object. That’s all it is.

Here are two of them, returning familiar actions. These go nicely in `actions.js` alongside the action constants, by the way.

```js
// actions.js
export const INCREMENT = "INCREMENT";
export const DECREMENT = "DECREMENT";

export function increment() {
  return { type: INCREMENT };
}

export const decrement = () => ({ type: DECREMENT });
```

I wrote them two different ways – as a `function` and as an arrow – to show that it doesn’t matter how you write them. Pick your fave and go with it.

You’ll notice that the function names are camelCase (well, they would be ifTheyWereLonger) while the action constants are `UPPER_CASE_WITH_UNDERSCORES`. That, too, is just a convention. Helps you know if you’re looking at an action creator function or an action constant. But feel free to name yours how you like. Redux doesn’t care.

Now… what do you do with an action creator? Import it and dispatch it, of course!

```js
// Counter.js
import React from "react";
import { increment, decrement } from './actions';

class Counter extends React.Component {
  state = { count: 0 };

  increment = () => {
    this.props.dispatch(increment()); // << use it here
  };

  decrement = () => {
    this.props.dispatch(decrement());
  };

  return(
    ...
  )
}
```

The key thing is to remember to call the action creator()!

Don’t dispatch(increment) 🚫

Do dispatch(increment()) ✅

Remember that an action creator is a plain old function. Dispatch wants an action *object*, not a function.

Also: you will almost definitely mess this up and be very confused. At least once, probably many times. That’s normal.

## How to Use React Redux `mapDispatchToProps`

Now that you know what an action creator is, we can talk about *one more* level of abstraction.

You know how `connect` passes in a `dispatch` function? And you know how you get really tired of typing `props.dispatch` all the time.

By writing a `mapDispatchToProps` object and passing it to `connect` when you wrap your component, you’ll receive those action creators as `callable props`. Here’s what I mean:

```js
// Counter.js
import React from 'react';
import { connect } from 'react-redux';
import { increment, decrement } from './actions';

const Counter = () => {
  increment = () => {
    // We can call the `increment` prop,
    // and it will dispatch the action:
    this.props.increment();
  }

  decrement = () => {
    this.props.decrement();
  }

  return (
    // ...
  )
}

function mapStateToProps(state) {
  return {
    count: state.count
  };
}

// in this object, keys become prop names,
// and values should be action creator functions.
// They get bound to `dispatch`.
const mapDispatchToProps = {
  increment,
  decrement
};

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
```

This is nice because it saves you from having to call `dispatch` manually.
