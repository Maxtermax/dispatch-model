Dispatch Model
===================
Is a simple custom response express method develop by [me](https://github.com/maxtermax) , member of [HACKDO FOUNDATION.](http://hackdo.co/)

To dispatch query to a web api, easy, clean, fast and **beautiful code**, it works great with [waterline mongodb driver, localDisk ](https://github.com/vanetix/waterline) and [sailsjs](http://sailsjs.com/) and [mongoose](http://mongoosejs.com/) but must be tested with mysql driver for nodejs:

Instalation
-------------

    npm install dispatch-model --save

or

    git clone https://github.com/Maxtermax/dispatch-model.git


Setup with sails js
-------------
Follow this steps:

 1. Inside the directory responses add a new response file:
```javascript
    //api/responses/dispatchModel.js
     module.exports = require('dispatch-model');
```

**Note:**:  `dispatchModel.js` is just a generic name you can call this response file whereaver you want.

 2. Add a model with some schema for example:
```javascript
    //api/models/User.js
   module.exports = {
    attributes: {
     firstName: 'string',
     lastName: 'string'
   }
  }
```

Setup with express js
-------------
Follow this steps:

 1. In you express app configuration add

```javascript
const dispatchModel = require('dispatch-model');

app.use("*",(req, res, next)=> {
  res.dispatchModel = dispatchModel;
  next();
});
```

 Now let the magic begin inside some controller now can dispatch the User model like that:
``` javascript
module.exports = {
  serve: function(req, res) {
    let query = User.create({firstName: "john", lastName: "doe"});
    res.dispatchModel(query);
  }//end serve method
}//end UserController
```



the `dispatchModel` is now aviable for use, this take some arguments for dispatch some query, the first one is a **Promise**  that is usually a query from the database that return a result, with this code you would get:
```javascript
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

Exmaple:
```javascript
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

```javascript
{
  "data": {
    "firstName": "john",
    "createdAt": "2017-03-10T03:32:05.771Z",
    "updatedAt": "2017-03-10T03:32:05.771Z",
    "id": 36
    },
  "status": 201
}
```

## Success

The **success** option can get few attibutes like:

Attribute      | Required | Type
--------       | -----    | ----
**omit**           | false    | array
**pick**           | false    | array
**authentication** | false    | boolean
**session**        | false    | json
**status**         | false    | integer
**map**            | false    | Function
**beforeResponse** | false    | Function
**afterResponse**  | false    | Function
**view**           | false    | string


 - **omit**: list of attributes that you wanna omit of the query response
```javascript
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
```javascript
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
```javascript
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
```javascript
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

```javascript
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

**Note:**  When wanna use **session** you must use **authentication**  set in **true**

 - **status**
  Status is usable for indicate the status code of the response in the web api, this can use in all cases.
```javascript
module.exports = {
  serve: function(req, res) {
    let responseCases = {
      success: {
       status: 202 //change the default status code to 203 Accepted
      }
    }

    let query = User.find({});
    res.dispatchModel(query, responseCases);
  }//end serve
}
```
return:
```javascript
{
  "data": [
    {
      "firstName": "john"
    }
  ],
  "status": 202
}
```

 - **map**
This option can be used for map the response of the query to the database, example:

```javascript
module.exports = {
  showAll: function(req, res) {
    let responseCases = {
      success: {
         map: function(data, next) {
           data.fullName = data.firstName+" "+data.lastName;
           return data;
         }
      }
    }
    let query = User.find({});
    res.dispatchModel(query, responseCases);
  }//end showAll
}
```
return:
```javascript
{
  "data": [
    {
      "firstName": "john",
      "lastName": "doe",
      "fullName": "john doe"
    }
  ],
  "status": 200
}
```

 - **beforeResponse**
This method can be used for do something before response, this is called when the query to the database is done, example:

```javascript
module.exports = {
  showAll: function(req, res) {
    let responseCases = {
      success: {
         beforeResponse: function(partialData, next) {
            let owner = partialData.data.id;
            Pets.find({owner}).then(function(pet) {
              //do some with you pet
              next();
            })
            .catch((error)=>{
             error.message === "customError" next(new Error("customError")) ? next(new Error("serverError"))
           }
      },
      errors: {
        customError: {
           details: "my custom error detail",
           status: 400
        }
      }
    }
    let query = User.find({});
    res.dispatchModel(query, responseCases);
  }//end showAll
}
```
**Note:**  You **must**  call **next** method to continue the process otherwise it never response, in case that something go wrong you can throw and **error** that will be **catched** by the error cases.


In case of **success**  return:

```javascript
{
  "data": [
    {
      "firstName": "john",
      "lastName": "doe"
    }
  ],
  "status": 200
}
```


In case of **customError**  return:

```javascript
{
  "data": null,
  "details": "my custom error detail",
  "status":  400
}
```

In case of **serverError**  return:

```javascript
{
  "data": null,
  "details": "Internal server error.",
  "status":  500
}
```

 - **afterResponse**
This method can be used for do something after response, this is called when the response is done, example:

```javascript
module.exports = {
  showAll: function(req, res) {
    let responseCases = {
      success: {
         afterResponse: function(data) {
           console.log("data response was: ", data);
         }
      }
    }
    let query = User.find({});
    res.dispatchModel(query, responseCases);
  }//end showAll
}
```

 - **view**
Asuming that you has set some templete engine like [handlebar](http://handlebarsjs.com/) now you can response by **render** a view, with the data of the database to render as you need, example:

```javascript
module.exports = {
  showAll: function(req, res) {
    let responseCases = {
      success: {
         view: "path/to/template"
      }
    }
    let query = User.find({});
    res.dispatchModel(query, responseCases);
  }//end showAll
}
```
**Note:** the **view** option can be used in all cases, and must be equal to the path of you template, this change depend of the **template engine**




## Errors
The **errors** option can get a few arguments like:
Attribute       | Required | Type
--------        | -----    | ----
**notFound**    | false    | json
**notAllow**    | false    | json
**forbidden**   | false    | json
**badRequest**  | false    | json
**conflict**    | false    | json
**serverError** | false    | json
**otherwise**   | false    | json


**Note:**   To trigger any of this **errors responses**, the **Promise** argument must **throw**  an [error](https://nodejs.org/api/errors.html#errors_new_error_message) with a **message** called the same way that the error.

The **otherwise** is special and represent a generic error that **is not contemplated**  in the default errors responses list of  **dispatchModel** , this mean that you que used like a kind a **custom response error.**

All of them take as schema to response this:

Attribute             | Required | Type
--------              | -----    | ----
details               | false    | string
status                | false    | integer
**generic attribute** | false | json

All the errors cases return the same schema, unless that you use a **generic attribute** to add something, example:

```javascript
  showAll: function(req, res) {
    let responseCases = {
      errors: {
        notFound: {
          details: "my custom message for notFound",
          myGenerictData: "Hola mundo"
        },
        otherwise: {
          myCustomError: {
            details: "my custom message",
            status: 304
          }
        }
      }
    }
    let query = User.beHappy({});
    res.dispatchModel(query, responseCases);
  },//end showAll
```
In case of  **notFound** return:

```javascript
{
  "data": null
  "details": "my custom message for notFound"
  "status": 404,
  "myGenerictData": "Hola mundo"
}
```
**Note:**  the **notFound** can be use inside of **success** too.


In case of  **myCustomError** return:

```javascript
{
  "data": null
  "details": "my custom message"
  "status":  304
}
```

**Note:** in case that dispatchModel get a unexpected error, that was not set in any where, it will response with a **204** **No content**


So this is all for now, be in touch if you have some issue or want to contribute to this project.
