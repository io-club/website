---
title: "React.StrictMode导致的LocalStorage不可用"
author: "Lyra"
---

今天在进行react-hook与ts练习中发现项目无法进行正常从`LocalStorage`中读取,经过仔细排查并没发现读取和写入`Localstorage`部分的bug,自己都麻了,通过`console.log`发现react渲染了两次组件,使Localstorage几乎不可用

于是在上网搜索是什么原理导致的组件多次渲染,

最后发现这些怪相的发生是 `React.StrictMode`,`useReduer`和`useEffect`一起导致的结果

我们一起来看看今天的例子吧

![开摆](https://cdn.jsdelivr.net/gh/lyra-planet/image/image/202209042330459.png)


## 函数组件的例子

我们从项目主文件开始看起

**./index.js**

```typescript
import React, { ReactElement,useCallback,useReducer,useState,useEffect } from 'react'
import { FC } from 'react'
import TdInput from './Input'
import TdList from './List'
import { todoReducer } from './reducer'
import { ITodo,IState,IAction, ACTION_TYPE } from './Typings'

function init (initTodoList:ITodo[]):IState{
    return{
        todoList: initTodoList
    }
}


const TodoList: FC = ():ReactElement => {

    // const [todoList, settodoList] = useState<ITodo[]>([])

    const [state,dispatch]=useReducer(todoReducer,[],init)
    
    useEffect(() => {
        console.log('init')
        console.log(JSON.parse(localStorage.getItem('todolist') as string))
        const todoList = JSON.parse(localStorage.getItem('todolist') as string)
        dispatch({
            type: ACTION_TYPE.INIT_TODOLIST,
            payload:todoList
        })
        console.log('over')
        console.log(state.todoList)
    }, [])
    useEffect(()=>{
        console.log('start')
        localStorage.setItem('todolist',JSON.stringify(state.todoList))
    },[state.todoList])

    const addTodo=useCallback((todo:ITodo)=>{
       dispatch({
        type:   ACTION_TYPE.ADD_TODO,
        payload: todo
       })
        },[])
    const removeTodo=useCallback((id:number)=>{
       dispatch({
        type:   ACTION_TYPE.REMOVE_TODO,
        payload: id
       })
        },[])
    const toggleTodo=useCallback((id:number)=>{
       dispatch({
        type:   ACTION_TYPE.TOGGLE_TODO,
        payload: id
       })
        },[])
    
    return(
        <div className='todo-list'>
            <TdInput
            addTodo={addTodo}
            todoList={state.todoList}
            />
            <TdList
            todoList={state.todoList}
            removeTodo={removeTodo}
            toggleTodo={toggleTodo}
            />
        </div>
    )
}

export default TodoList
```

**./reducers.ts**

```typescript
import { ACTION_TYPE, IAction, IState, ITodo } from "./Typings";

function todoReducer(state:IState,actions:IAction):IState{
    const {type,payload} = actions;

    switch (type) {
        case ACTION_TYPE.INIT_TODOLIST:
            console.log("reducer")
            console.log(payload)
            return{
                todoList:payload as ITodo[]
            }      
        case ACTION_TYPE.ADD_TODO:
            return{
                ...state,
                todoList:[...state.todoList,payload as ITodo]
            }
        case ACTION_TYPE.REMOVE_TODO:
            return{
                todoList:state.todoList.filter(todo=>todo.id!=payload)
            }
        case ACTION_TYPE.TOGGLE_TODO:
            return{
                todoList:state.todoList.map(todo=>{
                    return todo.id===payload ?{
                        ...todo,
                        completed:!todo.completed
                    }:{
                        ...todo
                    }
                })
            }      
           
        default:
            return{
                ...state
            }
    }
}

export {
    todoReducer
}
```

存储并无问题,问题出在读取,于是我们在简单使用后进行刷新,以下是`console.log`出的状态



![image-20220904172530839](https://cdn.jsdelivr.net/gh/lyra-planet/image/image/202209042330776.png)

我们不难发现组件进行了二次渲染

先来理一下顺序

```
 useEffect(() => {
        console.log('init')
        console.log(JSON.parse(localStorage.getItem('todolist') as string))
        const todoList = JSON.parse(localStorage.getItem('todolist') as string)
        dispatch({
            type: ACTION_TYPE.INIT_TODOLIST,
            payload:todoList
        })
        console.log('over')
        console.log(state.todoList)
    }, [])
    useEffect(()=>{
        console.log('start')
        localStorage.setItem('todolist',JSON.stringify(state.todoList))
    },[state.todoList])
```

组件挂载首先调用了第一个useEffect,todoList初次从Localstorage取得数据,此时会进入reducer来给state.todoList赋值,之后进入了下个useEffect,但此时state.todoList并未被赋值,因为```localStorage.setItem('todolist',JSON.stringify(state.todoList))```会给Localstorage进行赋值,导致这时local存储的数组为空,React.StrictMode这时会进行二次渲染,因为第二次Localstorage为空,所以TodoList也被赋空数组,这时第一次的初始化操作结束,state.todoList被赋正确的值,但紧接着第二次初始化操作给state.todoList赋空数组,最后localstorage的数据也就没得到



## 什么会渲染两次呢?

我们从使用 `React.StrictMode` 中获得的好处之一是，它帮助我们检测到渲染期生命周期的预期之外的副作用。

这些生命周期有：

- `constructor`
- `componentWillMount` (或者 UNSAFE_componentWillMount)
- `componentWillReceiveProps` (或者 UNSAFE_componentWillReceiveProps)
- `componentWillUpdate` (或者 UNSAFE_componentWillUpdate)
- `getDerivedStateFromProps`
- `shouldComponentUpdate`
- `render`
- `setState` 更新函数 (第一个参数)

所有这些方法都被调用不止一次，所以避免副作用是十分重要的。如果我们无视这个原则，就有可能造成状态不一致问题或者内存泄漏。

`React.StrictMode` 不能马上检测到副作用，但是它可以通过故意调用一些关键函数两次，来帮助我们发现副作用。

这些函数有:

- 类组件 `constructor`、`render` 以及 `shouldComponentUpdate` 方法
- 类组件静态 `getDerivedStateFromProps` 方法
- 方法组件的方法体
- 状态更新函数 (`setState` 的第一个参数)
- 传给 `useState`、`useMemo`、或 `useReducer` 的函数

这个行为肯定对性能有一些影响，但我们不应该担心，因为它只在开发而不是生产环境中发生。

这就是我们只有在开发环境下使用带 React.useState 的组件函数，才可以成功复现渲染两次的原因。Cheers!!

如果你需要继续深入研究 React.StrictMode，你可以阅读 [官方文档](https://link.juejin.cn?target=https%3A%2F%2Freactjs.org%2Fdocs%2Fstrict-mode.html)。



## 修正后的例子

这时我们知道了原因,把React.StrictMode删除,我们可以发现组件就渲染了一次,数据也能正常获取

```typescript
import ReactDOM from 'react-dom/client';

import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode> 
);

reportWebVitals();
```

在简单使用后进行刷新,以下是`console.log`出的状态

![img2](https://cdn.jsdelivr.net/gh/lyra-planet/image/image/202209042330035.png)

数据可以正常读取了!🤗

> 如果发现译文存在错误或其他需要改进的地方，欢迎在下方评论区指正,也可QQ联系我进行修改





## 引用

[[译\]我的 React 组件会渲染两次，我快疯了 - 掘金 (juejin.cn)](https://juejin.cn/post/6858508463274885134)

