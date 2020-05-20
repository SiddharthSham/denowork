import { Application, Router } from 'https://deno.land/x/oak/mod.ts'

const env = Deno.env.toObject()
const PORT = env.PORT || 8000
const HOST = env.HOST || '127.0.0.1'

interface Todo {
  title: string
  task: string
  done: boolean
}

let todos: Array<Todo> = [
  {
    title: 'Hello',
    task: 'World',
    done: false
  },
  {
    title: 'Learn',
    task: 'Deno',
    done: false
  },
]

export const getTodos = ({ response }: { response: any }) => {
  response.body = todos
}

export const getTodo = ({
  params,
  response,
}: {
  params: {
    title: string
  }
  response: any
}) => {
  const todo = todos.filter(todo => todo.title === params.title)
  if (todo.length) {
    response.status = 200
    response.body = todo[0]
    return
  }

  response.status = 400
  response.body = { msg: `Cannot find todo ${params.title}` }
}

export const addTodo = async ({
  request,
  response,
}: {
  request: any
  response: any
}) => {
  const body = await request.body()
  const { title, task, done }: { title: string; task: string, done: boolean } = body.value
  todos.push({
    title: title,
    task: task,
    done: done
  })

  response.body = { msg: 'OK' }
  response.status = 200
}

export const updateTodo = async ({
  params,
  request,
  response,
}: {
  params: {
    title: string
  }
  request: any
  response: any
}) => {
  const temp = todos.filter((existingTodo) => existingTodo.title === params.title)
  const body = await request.body()
  const { task }: { task: string } = body.value

  if (temp.length) {
    temp[0].task = task
    response.status = 200
    response.body = { msg: 'OK' }
    return
  }

  response.status = 400
  response.body = { msg: `Cannot find todo ${params.title}` }
}

export const removeTodo = ({
  params,
  response,
}: {
  params: {
    title: string
  }
  response: any
}) => {
  const lengthBefore = todos.length
  todos = todos.filter((todo) => todo.title !== params.title)

  if (todos.length === lengthBefore) {
    response.status = 400
    response.body = { msg: `Cannot find todo ${params.title}` }
    return
  }

  response.body = { msg: 'OK' }
  response.status = 200
}

const router = new Router()
router
  .get('/todos', getTodos)
  .get('/todos/:title', getTodo)
  .post('/todos', addTodo)
  .put('/todos/:title', updateTodo)
  .delete('/todos/:title', removeTodo)

const app = new Application()

app.use(router.routes())
app.use(router.allowedMethods())

console.log(`Listening on port ${PORT}...`)

await app.listen(`${HOST}:${PORT}`)