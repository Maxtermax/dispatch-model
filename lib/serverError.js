module.exports = function serverError(data = {}, result = {}) {
  let req = this.req;
  let res = this.res || this;
  res.status(500);
  if(typeof data  === "string") {
    res.render(data, result);
  } else {
    res.json(data);
  }
}//end serverError
