const assert = require("assert");
const sinon = require("sinon");
const userControler = require("../api/users/users.controller");
const userModel = require("../api/users/users.module");
const should = require("should");

describe("unit test", () => {
  describe("authorization", () => {
    let sandbox;
    let findByIdStub;
    let actualResult;
    const jwtToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMmJjMmEwNzA2YjdmM2U2OWNhMDRmNSIsImlhdCI6MTU5NjcwNDcxN30.XIK7OCtNZZ3A_LIJvDrfqiEazQG8V6Iae1Pd-96LvSk";
    const id = "5f2bc2a0706b7f3e69ca04f5";
    before(async () => {
      sandbox = sinon.createSandbox();
      findByIdStub = sandbox.stub(userModel, "findById");

      try {
        await userControler.authorize(jwtToken);
      } catch (err) {
        actualResult = err;
      }
    });

    after(() => {
      sandbox.restore();
    });

    it("should call findById", () => {
      sinon.assert.calledOnce(findByIdStub);
      sinon.assert.calledWithExactly(findByIdStub, id);
    });
    it("should throw error", () => {
      should.exists(actualResult instanceof Error);
    });
  });
});
