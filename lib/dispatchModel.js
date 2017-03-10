const notAllow = require('./notAllow.js');
const utils = require('./utils.js');

module.exports = function dispatchModel(Query, options = {}) {
  let req = this.req;
  let res = this.res;
  options.success = options.success || {};
  options.errors = options.errors || {};
  options.errors.notFound = options.errors.notFound || {};
  options.errors.serverError = options.errors.serverError || {};
  options.errors.forbidden = options.errors.forbidden || {};
  options.errors.badRequest = options.errors.badRequest || {};
  options.errors.conflict = options.errors.conflict || {};
  options.errors.notAllow = options.errors.notAllow || {};

  const notFound = _.extend({details: `Resource not found.`, status: 404}, options.errors.notFound);
  const serverError = _.extend({details: `Internal server error.`, status: 500}, options.errors.serverError);
  const forbidden = _.extend({details: `Action forbidden.`, status: 403}, options.errors.forbidden);
  const badRequest = _.extend({details: `Bad request`, status: 400}, options.errors.badRequest || {});
  const conflict = _.extend({status: 409, details: `Resource in conflict`}, options.errors.conflict);
  const notAllow = _.extend({status: 405, details: `Action not allow`}, options.errors.notAllow);

  return (
		Query.then(function(docs) {
      let response = {
        data: docs,
        status: options.success.status || 200
      }
      function dispatch(error) {
        if(error) throw error;
        if(docs) {
          const saveId = docs.id;
          const saveRol = docs.rol;
          if(options.success.hasOwnProperty('pick')) {
            let picks = [];
            let tmpPick = {};
            /*
              Pick a few attributes of query response
            */
            if(_.isArray(response.data)) {
              //In case that response have multiples objects
              if(response.data.length) {
                _.each(options.success.pick, (pick)=> {
                  _.each(response.data, (doc)=> {
                    if(doc.hasOwnProperty(pick)){
                      tmpPick[pick] = doc[pick];
                    }
                  });
                });
                picks.push(tmpPick);
                response.data = picks;
              }
            } else {
              //In case that response have a single objects
              _.each(options.success.pick, (pick)=> {
                if(response.data.hasOwnProperty(pick)) tmpPick[pick] = response.data[pick];
              });
              response.data = tmpPick;
            }
          };//end pick

          if(options.success.hasOwnProperty('omit')) {
            if(_.isArray(response.data)) {
              utils.remove(options.success.omit || [], response.data, options.success.omit.unless);
            } else {
              _.each(options.success.omit || [], (to_omit)=> delete response['data'][to_omit]);
            }
          };//end omit

          if(options.success.hasOwnProperty('map')) {
            if(_.isArray(response.data)) {
              response.data = response.data.map(options.success.map);
            } else {
              response.data = [response.data].map(options.success.map)[0];
            }
          };//end if map

          res.status(options.success.status || 200);
          if(options.success.hasOwnProperty('view')) {
            res.view(options.success.view, response.data);
          } else {
            if(options.success.hasOwnProperty('notFound') && (response.data.length === 0 || response.data === null)) {
              response.data = null;
              _.extend(response, {error: options.success.notFound, status: 404});
              if(options.success.notFound.hasOwnProperty('view')) return res.notFound(options.success.notFound.view, response.error);//Render view in case of error
              return res.notFound(response);
              /*
                Response in case of notFound
              */
            }
            if(options.success.authentication === true) {
              let session = options.success.session;
              if(session) {
                if(session.userId) req.session.userId = saveId;
                if(session.id) req.session.id = saveId;
                if(session.rol) req.session.rol = saveRol;
                _.each(Object.keys(session),(data)=> {
                  if(req.session[data]) return;//ignore if already have the attribute
                  if(response.data[data]) req.session[data] = response.data[data];
                });
              };//end save data in the session

              req.session.authenticated = true;
              req.session.save((err)=> {
                if(err) throw new Error("serverError");
                res.json(response);
              });
            } else {
             res.json(response);
            }
          }
        } else {
          if(options.errors.hasOwnProperty('notFound') && options.errors.notFound.hasOwnProperty('view')) return res.view(options.errors.notFound.view, response.data);
          res.notFound({error: notFound});
        }
      }//end dispatch
      if(!options.success.hasOwnProperty('beforeResponse') && !options.success.hasOwnProperty('afterResponse')) return dispatch();
      if(options.success.hasOwnProperty('beforeResponse')) options.success.beforeResponse(response, dispatch);
      if(options.success.hasOwnProperty('afterResponse')) {
        if(!options.success.hasOwnProperty('beforeResponse')) dispatch();
        options.success.afterResponse(response);
      }
  	})
  	.catch(function(err) {

       function dispatchError() {

        const response = {data: null};
        if(err.code === 11000 || (err.hasOwnProperty('originalError') && err.originalError.code === 11000)) {
          _.extend(response, {error: conflict});
          res.status(409);
          return res.json(response);
          /*
            Response in case of resource conflict
          */
        }

        if(err.message === "successButNotFound") {
          _.extend(response, {error: options.success.notFound, status: 404});
          if(options.success.notFound.hasOwnProperty('view')) return res.notFound(options.success.notFound.view, response.error);//Render view in case of error
          return res.notFound(response);
          /*
            Response in case of notFound
          */
        }

        if(err.message === "notFound") {
          _.extend(response, {error: notFound});
          if(options.errors.notFound.hasOwnProperty('view')) return res.notFound(options.errors.notFound.view, response.error);//Render view in case of error
          return res.notFound(response);
          /*
            Response in case of notFound
          */
        }

        if(err.message === "badRequest") {
          _.extend(response, {error: badRequest});
          if(options.errors.badRequest.hasOwnProperty('view')) return res.badRequest(options.errors.badRequest.view, response.error);//Render view in case of error
          return res.badRequest(response);
          /*
            Response in case of badRequest
          */
        }

        if(err.message === "forbidden" || err.invalidAttributes) {
          _.extend(response, {error: forbidden});
          if(options.errors.forbidden.hasOwnProperty('view')) return res.forbidden(options.errors.forbidden.view, response.error);//Render view in case of error
          return res.forbidden(response);
          /*
            Response in case of forbidden
          */
        }

        if(err.message === "notAllow") {
          delete response.data;
          _.extend(response, {error: notAllow});
          //TODO MAKE A VIEW OPTION WHEN NOT ALLOW
  //        if(options.errors.notAllow.hasOwnProperty('view')) return res.notAllow(options.errors.notAllow.view, response.error);//Render view in case of error
          return res.notAllow(response);
          /*
            Response in case of notAllow
          */
        }


        if(err.message === "serverError") {
          _.extend(response, {error: serverError});
          if(options.errors.serverError.hasOwnProperty('view')) return res.serverError(options.errors.serverError.view, response.error);//Render view in case of error
          return res.serverError(response);
          /*
            Response in case of serverError
          */
        }

        if(options.errors.hasOwnProperty("otherwise") && options.errors.otherwise.hasOwnProperty(err.message)) {
          let custom = options.errors.otherwise[err.message];
          _.extend(response, {error: custom});
          if(custom.hasOwnProperty('view')) return res.serverError(custom.view, response.error);//Render view in case of error
          res.status(custom.status || 500);
          return res.json(response);
          /*
            Custom error
          */
        }

        /*
          Response with json format with no content
        */
        res.status(204);
        console.log(err, "error");
        return res.json(response);
      }//end dispatchError

      if(!options.errors.hasOwnProperty('beforeResponse') && !options.errors.hasOwnProperty('afterResponse')) return dispatchError();
      if(options.errors.hasOwnProperty('beforeResponse')) options.errors.beforeResponse(response.data, dispatchError);
      if(options.errors.hasOwnProperty('afterResponse')) {
        if(!options.errors.hasOwnProperty('beforeResponse')) dispatchError();
        options.errors.afterResponse(response.data);
      }
  	})
  )
    /*
      @params
        *Query<Promise>: Promise to execute
         options<Object>: Options that use to response depend of result
      Description: `Execute a Query and response depend of @options or not`
      Return<Promise>
    */
}//end dispatch model
