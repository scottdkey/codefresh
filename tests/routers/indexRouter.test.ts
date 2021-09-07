import { server } from "../../src/index"

import chai, { should as Should, expect } from 'chai'
import chaiHttp from "chai-http"
const should = Should()
chai.use(chaiHttp)


describe("index router tests", () => {
  it("Get the index endpoint", async () => {
    chai.request(server).get('/').end((err, res) => {
      should.not.exist(err)
      expect(res.status).to.equal(200)
      expect(res.body.message).to.equal("hello world")
    })

  })

  it("Send data to test endpoint", async () => {
    const testString = "this is a test"
    chai.request(server).put(`/${testString}`).end((err, res) => {
      should.not.exist(err)
      expect(res.status).to.equal(200)
      expect(res.body.message).to.equal(testString)
    })

  })

  it("Test the changing endpoint", async () => {
    chai.request(server).get('/kube').end((err, res) => {
      should.not.exist(err)
      expect(res.status).to.equal(200)
      expect(res.body.message).to.equal("cicd test 1")
    })

  })

})

