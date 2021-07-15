import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState
} from 'recoil'
import { useState } from 'react';


function App() {
  return (
    <RecoilRoot>
        <TodoFilter></TodoFilter>
        <TodoStats></TodoStats>
        <ItemCreator></ItemCreator>
        <TodoList></TodoList>
    </RecoilRoot>
  );
}
let idUnico = 0

const todoListState = atom({
  key: 'todoListState',
  default:[],
})


const todoFilterState = atom({
  key: 'todoFilterState',
  default:'all'
})

const todoFilterSelect = selector({
  key:'todoFilterSelector',
  get:({get}) =>{
    const list = get(todoListState)
    const filter = get(todoFilterState)
    switch(filter){
      case 'all': list.filter(item => item.isCompleted)
        case 'done': return list.filter(item => item.isCompleted)
          case 'notDone': return list.filter(item => !item.isCompleted)
            default: return list
    }

      }
})

const todoStatsSelector = selector({
  key:'todoStatsSelector',
  get: ({get}) => {
    const list = get(todoListState)

    const data = {
      total: list.length,
      toDo: list.filter(item =>!item.isCompleted).length,
      noTodo: list.filter(item =>item.isCompleted).length,
      completedPercentage:  list.length === 0 ? 0: list.filter(item =>item.isCompleted)/ list.length,
    }

    return data
  }
})

function ItemCreator(){
  const [text, setText] = useState('')
  const setNewTodo = useSetRecoilState(todoListState)

  const onChangeText = (event) => {
    setText(event.target.value)
  }
  
  const onClick = () => {
    setNewTodo(oldTodoList => {
         return   [...oldTodoList,
            {
              id:idUnico++, text, isCompleted:false
            }]
        })
    setText('')
  }
  return (
    <div>
      <input value={text} onChange={onChangeText} />
      <button onClick={onClick}>Agregar</button>
    </div>
  )
}

function changeItem(id, todoList, changedItem){
    const index = todoList.findIndex(item => item.id === id)

    return [...todoList.slice(0, index), changedItem, ...todoList.slice(index + 1, todoList.length)]
}

function deleteItem(id, todoList){
  const index = todoList.findIndex(item => item.id === id)

    return [...todoList.slice(0, index),  ...todoList.slice(index + 1, todoList.length)]
}


function TodoList(){
  const todos = useRecoilValue(todoListState)
  return(
    <div>
      {
        todos.map(item => <TodoItem key={item.id} {...item}/>)
      }
    </div>)
}

function TodoItem({id, text, isCompleted}){
    const [todoList, setTodoList] = useRecoilState(todoListState)

    const onChangeTodoItem = (event) => {
        const textValue = event.target.value
        const changedItem = {
          id,
          text: textValue,
          isCompleted
        }
        setTodoList(changeItem(id, todoList, changedItem))
    }

    const onToggleCompleted = () =>{        
        const changedItem = {
            id,
            text,
            isCompleted: !isCompleted
        }
        setTodoList(changeItem(id, todoList, changedItem))
    }

    const onClickDelete= () =>{
      setTodoList(deleteItem(id, todoList))
    }

    return(  
      <div>    
        <input value={text} onChange={onChangeTodoItem} />
        <input type="checkbox"  checked={isCompleted} onChange={onToggleCompleted}/>
        <button onClick={onClickDelete}>x</button>
      </div>
    )
}

function TodoFilter(){
  const [filterState, setFilterState] = useRecoilState(todoFilterState)

  const onSelectedItem = (event) =>{
    const {value} = event.target
    setFilterState(value)
  }
  return(
    <div>
      Filtro:
      <select value={filterState} onChange={onSelectedItem}>
        <option value="all">todos</option>
        <option value="done">realizados</option>
        <option value="notDone">no realizados</option>
      </select>
    </div>
  )
}


function TodoStats(){
  const {total, toDo,notTodo, completedPercentage} = useRecoilValue(todoStatsSelector)
  return(
    <div>
      <span>tareas totales: {total}</span>
      <span>tareas por hacer: {toDo}</span>
      <span>tareas realizadas: {notTodo}</span>
      <span>eficiencia: %{completedPercentage}*100</span>
    </div>
  )
}

export default App;
