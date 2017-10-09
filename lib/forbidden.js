module.exports = function forbidden(data = {}, result = {}) {
  let req = this.req;
  let res = this.res || this;
  res.status(403);
  if(typeof data  === "string") {
    res.render(data, result);
  } else {
    data.endpoint = req.originalUrl;    
    res.json(data);
  }
}//end forbidden
