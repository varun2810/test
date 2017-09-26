'use strict';
const Hapi = require('hapi');
const MySQL = require('mysql');
const Joi = require('joi');
const Bcrypt = require('bcrypt');
const path = require('path');
const Fs = require('fs');



// Create a server with a host and port
const server = new Hapi.Server();
const connection = MySQL.createConnection({
     host: 'localhost',
     user: 'root',
     password: '',
     database: 'test'
});

server.connection({ 
    host: 'localhost', 
    port: 8000,
});

connection.connect();


server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply.file('index.html');
    }
});



// Add the route
server.route({
    method: 'GET',
    path: '/users',
    handler: function (request, reply) {
       connection.query('SELECT uid, username, email FROM users',
       function (error, results, fields) {
       if (error) throw error;

       reply(results);
    });
  }
});

server.route({
    method: 'GET',
    path: '/users/{uid}',
    handler: function (request, reply) {
    const uid = request.params.uid;

    connection.query('SELECT uid, username, email FROM users WHERE uid = "' + uid + '"',
    function (error, results, fields) {
       if (error) throw error;

       reply(results);
    });
    },
 config: {
       validate: {
        params: {
        uid: Joi.number().integer()
       }
  }
}
});

server.route({
    method: 'POST',
    path: '/messages',
    handler: function (request, reply) {

    const uid = request.payload.uid;
    connection.query('SELECT * FROM messages WHERE uid_fk = "' + uid + '"',
    function (error, results, fields) {
        if (error) throw error;

        reply(results);
    });
},
config: {
    validate: {
    payload: {
    uid: Joi.number().integer()
}
}
}
});

//delete function
server.route({
    method: 'DELETE',
    path: '/messages/{uid}/{mid}',
    handler: function (request, reply) {
    const uid = request.params.uid;
    const mid = request.params.mid;
    connection.query('DELETE FROM messages WHERE uid_fk = "' + uid + '" AND mid = "' + mid + '"',
    function (error, result, fields) {
       if (error) throw error;

       if (result.affectedRows) {
           reply(true);
       } else {
           reply(false);
       }
});
},
config: {
     validate: {
     params: {
       uid: Joi.number().integer(),
       mid: Joi.number().integer()
      }
     }
}
});


//user signup
 server.route({
    method: 'POST',
    path: '/signup',
    handler: function (request, reply) {
    const username = request.payload.username;
    const email = request.payload.email;
    const password = request.payload.password;

    //Encryption
    var salt = Bcrypt.genSaltSync();
    var encryptedPassword = Bcrypt.hashSync(password, salt);

    //Decrypt
    var orgPassword = Bcrypt.compareSync(password, encryptedPassword);

    connection.query('INSERT INTO users (username,email,password) VALUES ("' + username + '","' + email + '","' + encryptedPassword + '")',
    function (error, results, fields) {
        if (error) throw error;

        reply.file('signup.html');
    });
},
config: {
      validate: {
       payload: {
          username: Joi.string().alphanum().min(3).max(30).required(),
          email: Joi.string().email(),
          password: Joi.string().regex(/^[a-zA-Z0-9]{8,30}$/)
       }
    }
}
});
});


server.route({
    method: 'GET',
    path: '/details',
    handler: function (request, reply) {
       connection.query('SELECT * FROM users',
       function (error, results, fields) {
       if (error) throw error;

       reply.file('details.html');
    });
  }
});















server.start((err) => {
   if (err) {
     throw err;
   }
  console.log('Server running at:', server.info.uri);
});