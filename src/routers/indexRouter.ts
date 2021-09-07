import { Router } from "express"

const router = Router()

router.get('/', (_, res) => {
  res.send({ message: 'hello world' })
  res.status(200)
})

router.put("/:test", (req, res) => {
  res.send({ message: req.params.test })
  res.status(200)
})

router.get("/kube", async (_, res) => {
  res.send({ message: "cicd test 1" })
  res.status(200)
})

export default router