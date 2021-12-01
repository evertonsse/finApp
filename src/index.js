const express = require('express');
const app = express();
app.use(express.json());


/* 
CPF - strin
name - string
id - uuid
statement - []
*/


app.post('/account', (request, response) => {
    const {cpf, name} = request.body; 
    
})

app.listen(3333);