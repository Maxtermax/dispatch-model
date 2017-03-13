module.exports = function notFound(data = {}, result = {}) {
  let req = this.req;
  let res = this.res || this;
  res.status(404);
  if(typeof data  === "string") {
    res.render(data, result);
  } else {
    res.json(data);
  }
}//end notFound