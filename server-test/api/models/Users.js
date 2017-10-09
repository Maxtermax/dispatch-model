/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  badRequest: function() {
    return (
      new Promise((resolve, reject) => {
        const error = new Error('badRequest'); 
        return reject(error);
      }) 
    )
  },
  conflict: function() {
    return (
      new Promise((resolve, reject) => {
        const error = new Error('conflict'); 
        error.code = 11000;
        return reject(error);
      }) 
    )
  },  
  notFound: function() {
    return (
      new Promise((resolve, reject) => {
        const error = new Error('notFound'); 
        return reject(error);
      }) 
    )
  },  
  forbidden: function() {
    return (
      new Promise((resolve, reject) => {
        const error = new Error('forbidden'); 
        return reject(error);
      }) 
    )
  },  
  serverError: function() {
    return (
      new Promise((resolve, reject) => {
        const error = new Error('serverError'); 
        return reject(error);
      }) 
    )
  },  
  attributes: {

    name : { type: 'string' },

    age : { type: 'integer' },

    cc: { type: 'string' },

    pets : { 
      collection: 'pets',
      via: 'owner'
    }
  }
}

