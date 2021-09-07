import Express from "express"
import indexRouter from "./routers/indexRouter"




const app = Express()

app.use(indexRouter)

export const server = app.listen(3000, () => {
  console.log(`listening on port ${3000}`)
})