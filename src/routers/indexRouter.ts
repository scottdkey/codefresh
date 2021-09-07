import Router from "koa-router"

const router = new Router()

router.get('/', async (ctx, next) => {
  ctx.body = { message: "hello world" }
  ctx.status = 200
  next()
})

router.put("/:test", async (ctx, next) => {
  ctx.body = { message: ctx.params.test }
  ctx.status = 200
  next()
})

router.get("/kube", async (ctx, next) => {
  ctx.body = { message: "cicd test 1" }
  ctx.status = 200
  next()
})

export default router