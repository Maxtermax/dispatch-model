module.exports = function notAllow(data = {}, result = {}) {
  let req = this.req;
  let res = this.res || this;
  res.status(405);
  if(typeof data  === "string") {
    res.render(data, result);
  } else {
    data.endpoint = req.originalUrl;   
    res.json(data);
  }
}//end notAllow
