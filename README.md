Dispatch Model
===================
Is a simple custom response express method develop by [me](https://github.com/maxtermax) , to dispatch query to a web api, easy, clean, fast and beautiful code, it works great in with [waterline mongodb driver](https://github.com/vanetix/waterline) and [sailsjs](http://sailsjs.com/) but in the shorly future should work with just expressjs and some mysql driver for nodejs:

Instalation
-------------

    npm install dispatch-model --save

or

    git clone https://github.com/Maxtermax/dispatch-model.git



Usage with sails js
-------------
Follow this steps:

 1. Inside the directory responses add a new response file:
```
    //dispatchModel.js
     module.exports = require('dispatch-model');
```

**note**:  `dispatchModel.js` is just a generic name you can call this response file whereaver you want.

 2. Add a model with some schema for example:
```
    //User.js
   module.exports = {
    attributes: {
     firstName: 'string',
     lastName: 'string'
   }
  }
```

 3. Let the magic begin
 Inside some controller now can dispatch the User model like that:
```
module.exports = {
  serve: function(req, res) {
    let query = User.create({firstName: "john", lastName: "doe"});
    res.dispatchModel(query);
  }//end serve method
}//end UserController
```
the `dispatchModel` is now aviable for use, this take some arguments for dispatch some query, the first one is a **Promise**  that is usually a query from the database that return a result, with this code you would get:
```
{
  "data": {
  "firstName": "john",
  "lastName": "doe",
  "createdAt": "2017-03-10T02:51:15.184Z",
  "updatedAt": "2017-03-10T02:51:15.184Z",
  "id": 34
  },
  "status": 200
}
```
Dispatch model, wrap an transform the data for you in this schema:
firt all response that get success in his query must return and json object with **data** as main attribute that represent the result of **query** in the database, and **status** that represent the status of response from the web API.



Response cases
-------------
Dispatch model, **must** take as first argument some **Promise** that return some kind a information, and can also get a **second** argument which is is usable to transform the response.

As second argument **responseCases** can transform the data depend on manies escenarios like:

 - **success**
   - **notFound**
 - **errors**
   - **notFound**
   - **notAllow**
   - **forbidden**
   - **badRequest**
   - **conflict**
   - **serverError**

```
module.exports = {
// UserController.js
  serve: function(req, res) {
       let responseCases = {
          success: {
          omit: ['lastName'],
          status: 201 //change status to created
          }
       }
    let query = User.create({firstName: "john", lastName: "doe"});
    res.dispatchModel(query, responseCases);
  }//end serve method
}//end UserController
```
In case of **success** indicate that will return something like:

```
{
  "data": {
    "firstName": "john",
    "createdAt": "2017-03-10T03:32:05.771Z",
    "updatedAt": "2017-03-10T03:32:05.771Z",
    "id": 36
    },
  "status": 200
}
```



The **success** option can get few attibutes like:

Attribute      | Required | Type
--------       | -----    | ----
omit           | false    | array
pick           | false    | array
authentication | false    | boolean
session        | false    | json
status         | false    | integer

The **errors** option can get a few arguments like:

Attribute      | Required | Type
--------       | -----    | ----
**notFound**        | false    | json
**notAllow**        | false    | json
**forbidden**       | false    | json
**badRequest**       | false    | json
**conflict**       | false    | json
**serverError**       | false    | json
**otherwise**      | false | json

**Note:**   To trigger any of this **errors responses**, the **Promise** argument must **throw**  an [error](https://nodejs.org/api/errors.html#errors_new_error_message) with a **message** called the same way that the error.

The **otherwise** is special and represent a generic error that **is not contemplated**  in the default errors responses list of  **dispatchModel** , this mean that you que used like a kind a **custom response error.**

All of them take as schema to response this:

Attribute      | Required | Type
--------       | -----    | ----
details        | false    | string
status         | false    | integer
map            | false    | Function
**generic attribute** | false | json

 **Success**

 - **omit**: list of attributes that you wanna omit of the query response
```
  showAll: function(req, res) {
    let responseCases = {
      success: {
        omit: ['firstName']
      }
    }
    let query = User.find({});
    res.dispatchModel(query, responseCases);
  },//end showAll
```
return :
```
{
  "data": [
    {
      "lastName": "doe",
      "createdAt": "2017-03-10T04:20:21.710Z",
      "updatedAt": "2017-03-10T04:20:21.710Z",
      "id": 38
    }
  ],
  "status": 200
}
```

 - **pick**: list of attributes that you wanna pick of the query response
```
module.exports = {
  serve: function(req, res) {
    let responseCases = {
      success: {
       pick: ['firstName']
      }
    }

    let query = User.find({});
    res.dispatchModel(query, responseCases);
  }//end serve
}
```
 return :
```
{
  "data": [
    {
    "firstName": "john"
    }
  ],
  "status": 200
}
```

 - **authentication**:  boolean attributes that indicate that yout wanna save some
 - **session**: object that represent information that you wanna store in the session, for example:

```
module.exports = {
  createAndAuth: function(req, res) {
    let responseCases = {
      success: {
        authentication: true,
        session: {
          firstName: true
        }
      }
    }

    let query = User.create({firstName: "john", lastName: "doe"});
    res.dispatchModel(query, responseCases);
  }//end createAndAuth
}
```
this code will create a user and save a session with the **firstName**  and now is avaible in **req.session.firstName**

**Note:**  When wanna use **session** you must use **authentication**  setted in **true**

### TODO: COMPLETE DOCUMENTATION
