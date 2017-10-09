/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const FORMATS = {
  loader: {
    name: 'string'
  }
}

module.exports = {
	_config: { actions: false, rest: false, shortcuts: false },//disable blueprint

  /**
   * `UserController.create()`
   */
  create: function (req, res) {
    let { data } = req.body;    
    res.dispatchModel(Users.create(data));    
  },

  /**
   * `UserController.update()`
   */
  update: function (req, res) {
    let { data } = req.body;    
    let id = req.params.id;
    res.dispatchModel(Users.update(id, data));
  },


  /**
   * `UserController.show()`
   */
  show: function (req, res) {
    let id = req.params.id;
    res.dispatchModel(Users.findOne({id}));   
  },


  /**
   * `UserController.showAll()`
   */
  showAll: function (req, res) {
    let format = req.headers['data-format'];    
    res.dispatchModel(Users.find(),{ }, FORMATS[format]);       
  },


  /**
   * `UserController.remove()`
   */
  remove: function (req, res) {
    let id = req.params.id;
    res.dispatchModel(Users.destroy(id));           
  }
};

