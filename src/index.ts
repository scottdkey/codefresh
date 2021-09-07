import Koa from "koa"
import bodyParser from "koa-bodyparser"
import indexRouter from "./routers/indexRouter"




const app = new Koa()
app.use(bodyParser())

app.use(indexRouter.routes())

export const server = app.listen(3000, () => {
  console.log(`listening on port ${3000}`)
})