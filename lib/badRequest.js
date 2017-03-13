module.exports = function badRequest(data = {}, result = {}) {
  let req = this.req;
  let res = this.res || this;
  res.status(400);
  if(typeof data  === "string") {
    res.render(data, result);
  } else {
    res.json(data);
  }
}//end badRequest
