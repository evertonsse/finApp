const { request } = require('express');
const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid')
app.use(express.json());

const customers = []



//Middleware de que verifica se conta existe
function verifyIfExistsAccountCPF(request, response, next) {
    const { cpf } = request.headers;

    const customer = customers.find(customer => customer.cpf === cpf);

    if (!customer) {
        return response.status(404).json({ error: "Conta não cadastrada!" })
    }
    request.customer = customer;

    return next();

}


//Retorna o saldo da conta, utiliza o reduce para fazer a interação dos calores
function getBalance(statement) {
    const balance = statement.reduce((acc, operator) => {
        if (operator.type === 'credit') {
            return acc + operator;
        } else {
            return acc - operator;
        }
    }, 0)

    return balance;
}


// Criação da conta
app.post('/account', (request, response) => {
    const { cpf, name } = request.body;

    const customerAlreadyExists = customers.some(
        customer => customer.cpf === cpf);

    if (customerAlreadyExists) {
        return response.status(400).json({ error: "CPF já cadastrado!" });
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return response.status(201).send();
});


// Retorna saldo
app.get('/statement', verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    return response.json(customer.statement);
});


//Realiza depositos
app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {

    const { description, amount } = request.body;

    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        createdAt: new Date(),
        type: "credit"
    };

    customer.statement.push(statementOperation);
    return response.status(201).send();

});


//Realiza retiradas
app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statement);

    if (balance < amount) {
        return response.status(400).json({ error: "Saldo insuficiente!!" })
    }
    const statementOperation = {
        amount,
        createdAt: new Date(),
        type: "debit",
    }

    customer.statement.push(statementOperation)
    return response.status(201).send();


});


//Retorna transferencias de uma data
app.get('/statement/date', verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter(
        (statement) => statement.createdAt.toDateString() ===
            new Date(dateFormat).toDateString()
    );

    return response.json(statement);
});

app.put("/account", verifyIfExistsAccountCPF, (request, response) => {
    const { name } = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send();
})

app.get('/account', verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    return response.json(customer)
})

app.delete('/account', verifyIfExistsAccountCPF, (request, response) => {
const { customer } = request; 

//splice 

customers.splice(customer, 1); 

return response.status(200).json(customers); 


})

app.listen(3333);