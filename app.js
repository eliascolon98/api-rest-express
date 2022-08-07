const express = require('express');
const app = express();
const Joi = require('@hapi/joi');
// const {logger} = require('./logger');
const morgan = require('morgan');
const config = require('config');
const start_debug = require('debug')('app:inicio');
// const db_debug = require('debug')('app:db');
//Middleware
app.use(express.json());
//Formato para envíos por el head o query string
app.use(express.urlencoded({ extended: true }));
//Formato para envíos archivos, directorios por el body
app.use(express.static('public'));
//Uso de un Middleware de terceros - Morgan

if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    start_debug('Morgan activado');
}

// Trabajos con la base de datos
// db_debug("Conectando a la base de datos...");
// app.use(logger);

//Configuracion de entorno
console.log("Aplication: " + config.get('nombre'));
console.log("Base de datos: " + config.get('configBD.host'));


app.get('/', (req, res) => {
    res.send('Hello World!');
});
const users = [
    { id: 1, name: 'Elias' },
    { id: 2, name: 'John' },
]
app.get('/api/users', (req, res) => {
    res.send(users);
});

app.get('/api/users/:id', (req, res) => {
    let user = userExists(parseInt(req.params.id));
    if (!user) res.status(404).send('User not found');
    res.send(user);
});

app.post('/api/users', (req, res) => {

    const { error, value } = validateUser(req.body.name);
    if (!error) {
        const user = {
            id: users.length + 1,
            name: value.name
        }
        users.push(user);
        res.send(user);
    }else{
        res.status(400).send(error.details[0].message);
    }


});

app.put('/api/users/:id', (req, res) => {
    // let user = users.find(user => user.id === parseInt(req.params.id));
    // if (!user) res.status(404).send('User not found');
    let user = userExists(parseInt(req.params.id));
    if (!user){
        res.status(404).send('User not found');
        return;
    }

    const { error, value } = validateUser(req.body.name);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    user.name = value.name;
    res.send(user);

});

app.delete('/api/users/:id', (req, res) =>{
    let user = userExists(parseInt(req.params.id));
    if (!user){
        res.status(404).send('User not found');
        return;
    }
    const index = users.indexOf(user);
    users.splice(index, 1);
    res.send(user);
});

const userExists = (id) => {
    return users.find(user => user.id === id);
}

const validateUser = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    return (schema.validate({ name: data }));
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port! ${port}`);
});

