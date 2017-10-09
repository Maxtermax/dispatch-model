const _ = require('lodash');

let formato =  {
  name: "string",
  childs:[
    {
      name: "string",
      pets: [
        {
          name: "string"
        }
      ]
    }
  ]
}

let data = {
  name: "john",
  age: 41,
  childs: [
    {
      name: "hijo",
      age: 10,     
      pets: [
        {
          name: "fifo",
          age: 7          
        }
      ]
    }
  ]
}

let arr = "";
function te(keys, formato) {
  console.log(keys, 'keys')
  for(let i = 0; i < keys.length; i++) {
    let current = keys[i];
    if(_.isArray(formato[current])) {
      console.log(current)     
      //let b = formato[current];
    }
  }
}

let keys = _.keys(formato);
te(keys, formato)