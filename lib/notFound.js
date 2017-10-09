
module.exports = function notFound(data = {}, result = {}) {
  let req = this.req;
  let res = this.res || this;
  res.status(404);
  console.log("entra por notFound custom")
  if(typeof data  === "string") {
    res.render(data, result);
  } else {
    data.endpoint = req.originalUrl;
    res.json(data);
  }
}//end notFound
