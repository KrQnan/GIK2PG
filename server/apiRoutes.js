const routes = require('express').Router();
const https = require('https');
const multer = require('multer');
const fs = require('fs');
const dbservice = require('./database');
const mailsender = require('./mailsender');
const images = multer({dest: './public/images/'})

const CLIENT_ID = "974557972870-ai1nmveefp67n6s72poiabj976qbmfi4.apps.googleusercontent.com";
const {OAuth2Client} = require('google-auth-library');
const { restart } = require('nodemon');
const { Router } = require('express');
const client = new OAuth2Client(CLIENT_ID);


async function verify(tkn) {
    const ticket = await client.verifyIdToken({
        idToken: tkn,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];

    return await dbservice.getUserByGid(userid);
}

//PRODUCTS
routes.get('/products', async (req, res) => {
    try {
        const data = await dbservice.getProducts();
        res.send(data);
    }
    catch (err){
        res.send(err);
    }
});

//RATINGS
routes.get('/ratings', async (req,res) => {
    try{
        const data = await dbservice.getRatings();
        res.send(data);
    }
    catch(err){
        res.send(err);
    }
});

//CATEGORIES
routes.get('/categories', async (req, res) => {
    try {
        const data = await dbservice.getCategories();
        res.send(data);
    }
    catch (err){
        res.send(err);
    }
});

//ORDERS
routes.get('/orders', async (req,res) => {
    try{

        if (!req.session.token) {
            res.send({error: "Not logged in"});
            return;
        }
        const user = await verify(req.session.token);

        if (user.length < 1) {
            res.send({error: "Not logged in"});
            return;
        }

        if (user[0].roles != "Admin") {
            res.send({error: "Permision denied"});
            return;
        }


        const orders = await dbservice.getOrders();

        for (let i = 0; i < orders.length; ++i) {
            orders[i].items = await dbservice.getItemsByOrderId(orders[i].ordid);
        }
        
        res.send(orders);
    }
    catch(err){
        res.send(err);
    }
});

//PRODUCT FUNCTIONS
routes.get('/product/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const data = await dbservice.getProductById(id);
        if (data < 1) {
            res.send({error: "Product id " + id.toString() + " not found"});
            return;
        }
        res.send(data);
    }
    catch (err){
        res.send(err);
    }
});

routes.post('/product', images.single('file'), async (req, res) => {
    
    try {
        const uploadedFile = req.file;
        const exts = req.file.originalname.split(".");
        const fileString = uploadedFile.filename;
        const fileEnd = exts[exts.length - 1];
        const fileName = uploadedFile.path + "." + fileEnd;

        await fs.rename(uploadedFile.path, fileName, (err) => {
            if (err) throw err;
        });

        req.body.picture = '/images/' + fileString + '.' + fileEnd;
        await dbservice.addProduct(req.body);
        res.send({message: "Successfully added new product " + req.body.pname.toString()});
    }
    catch (err){
        console.log(err);
        res.send({message: "Could not add product"});
    }
});

routes.post('/product/:pid', images.single('file'), async (req, res) => {
    try {
        if (req.file) {
            const uploadedFile = req.file;
            const exts = req.file.originalname.split(".");
            const fileString = uploadedFile.filename;
            const fileEnd = exts[exts.length - 1];
            const fileName = uploadedFile.path + "." + fileEnd;

            await fs.rename(uploadedFile.path, fileName, (err) => {
                if (err) throw err;
            });

            req.body.picture = '/images/' + fileString + '.' + fileEnd;
        }

        await dbservice.updateProduct(req.params.pid, req.body);

        res.send({message: "Successfully updated new product " + req.body.pname.toString()});

        
      } catch (error) {
        console.log(error);  
        res.send({error: "Could not update product"});
      }

});

routes.delete('/product/:id', async (req, res) => {
    try {
        await dbservice.deleteProduct(req.params.id);
        res.send({message: "Successfully removed the product"});
    }
    catch (err){
        res.send({error: err});
    }
});

routes.get('/deals', async (req, res) => {
    try {
        const deals = await dbservice.getDeals();
        let products = [];
        for (let i = 0; i < deals.length; ++i) {
            let product = await dbservice.getProductById(deals[i].pid);
            if (product.length < 1) continue;
            product = product[0];
            product.discount = deals[i].discount;
            products.push(product);
        }
        res.json(products);
    } 
    catch (error) {
        console.log(error);
    }
});

routes.delete('/deal/:id', async (req, res) => {
    try {
        await dbservice.deleteDealByPid(req.params.id);
        res.send({message: "Successfully removed the deal from the product"});
    }
    catch (err){
        res.send({error: err});
    }
});

routes.get('/deal/:id', async (req, res) => {
    try {
        const deal = await dbservice.getDealByPid(req.params.id);
        if (deal.length < 1) {
            res.send({error: "No deal found"});
            return;
        }
        res.json(deal);
        
    } 
    catch (error) {
        console.log(error);
        res.send({error: error});
    }
});

routes.post('/deal/:id', async (req, res) => {
    const pid = req.params.id;
    const discount = req.body.discount;
    try {
        const deal = await dbservice.getDealByPid(pid);

        if (deal.length < 1) {
            await dbservice.addDeal(pid, discount);
        }
        else {
            await dbservice.updateDealByPid(pid, discount);
        }
        
        res.send({message: "Successfully added a new deal"});
    }
    catch (err){
        res.send({error: "Could not add the deal"});
    }
});

// RATING FUNCTIONS
routes.get('/rating/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const data = await dbservice.getRatingById(id);
        if (data < 1) {
            res.send({error: "Rating id " + id.toString() + " not found"});
            return;
        }
        res.send(data);
    }
    catch (err) {
        res.send(err);
    }
});

routes.get('/ratings/product/:id', async (req, res) => {
    const id = req.params.id;
    try{
        const data = await dbservice.getRatingsByProduct(id);
        if (data.length < 1) {
            res.send({error: "Ratings in Product id " + id.toString() + " not found"});
            return;
        }
        res.send(data);
    }
    catch (err){
        res.send(err);
    }
});

routes.get("/ratings/user/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const data = await dbservice.getRatingsByUserId(id);

        res.send(data);
    }
    catch (err) {

    }
});

routes.post('/rating', async (req,res) => {
    const body = req.body;
    try{
        await dbservice.addRating(body);
        res.send({message: "Your rating was added!"});
    }
    catch (err){
        res.send({message: "Could not add rating"});
    }
});

routes.put('/rating/:ratid', async (req,res) => {
    const body = req.body;
    try{
        await dbservice.updateRating(req.params.ratid, req.body);
        res.send({message: "You updated the rating"});
    }
    catch (err){
        res.send({message:"Could not update rating"});
    }
});

routes.delete('/rating/:id', async (req,res) => {
    try{
        await dbservice.deleteRating(req.params.id);
        res.send({message: "Your rating was deleted"});
    }
    catch (err){
        res.send(err);
    }
});


//CATEGORY FUNCTIONS
routes.get('/categories/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const data = await dbservice.getCategoryById(id);
        if (data < 1) {
            res.send({error: "Category id " + id.toString() + " not found"});
            return;
        }
        res.send(data);
    }
    catch (err){
        res.send(err);
    }
});

routes.get('/products/category/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const data = await dbservice.getProductsByCategory(id);
        if (data < 1) {
            res.send({error: "Products in Category id " + id.toString() + " not found"});
            return;
        }
        res.send(data);
    }
    catch (err){
        res.send(err);
    }
});

//LOGIN FUNCTIONS
routes.post('/login', async (req, res) => {

    const token = req.body.token;
    async function verify(tkn) {
        const ticket = await client.verifyIdToken({
            idToken: tkn,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];

        let user = await dbservice.getUserByGid(userid);


        if (user.length < 1) {

            let customer = await dbservice.getCustomerByEmail(payload.email);

            if (customer.length < 1) {
                customer = {
                    first_name: payload.given_name,
                    last_name: payload.family_name,
                    address: null,
                    email: payload.email
                }
                await dbservice.createCustomer(customer);
                customer = await dbservice.getCustomerByEmail(customer.email);
            }

            user = {
                gUserid: userid,
                roles: "Customer",
                cusid: customer[0].cusid
            }

            admin = {
                gUserid: userid,
                roles: "Admin"
            }
            
            await dbservice.createUser(user);
        }
        // If request specified a G Suite domain:
        // const domain = payload['hd'];

        return user;
    }
    try {
        const user = await verify(token);
        req.session.token = token;
        res.send({message: "Logged in", user: user});

    } catch(err) {
        res.send({error: "Could not login"})
    }
});

routes.get("/logout", async (req, res) => {
    try {
        if (!req.session.token) {
            res.send({error: "Not logged in"});
            return;
        }
        req.session.destroy();
        res.send({message: "of"});
    }
    catch (error) {
        console.log(error);
        res.send({error: error});
    }
});

// Users and customers
routes.get("/users", async (req, res) => {
  try {
    const users = await dbservice.getAllUsers();

    if (users.length < 1) {
        res.send({error: "Could not find users"});
    }

    res.send(users);
  } catch (error) {
        console.log(error);
        res.send({
        status: "Någonting gick fel vid hämtning av användare",
        });
    }
});

routes.get('/customer/:id', async (req, res) => {
    try {
        const customer = await dbservice.getCustomerById(req.params.id);
        if (customer.length < 1) {
            res.send({error: "Could not find cusomer with cusid " + req.params.id});
            return;
        }
        res.send(customer);
    }
    catch (err){
        res.send(err);
    }
});

routes.get('/customer/user/:id', async (req, res) => {
    try {
        const customer = await dbservice.getCustomerByUserId(req.params.id);
        if (customer.length < 1) {
            res.send({error: "Could not find cusomer with userid " + req.params.id});
            return;
        }
        res.send(customer);
    }
    catch (err){
        res.send({error: err});
    }
});

routes.delete('/customer/:id', async (req, res) => {
    try {
        await dbservice.deleteCustomer(req.params.id);
        res.send({message: "Successfully removed the Customer"});
    }
    catch (err){
        res.send(err);
    }
});

routes.put('/customer/:cusid', async (req, res) => {
    const body = req.body;
    try {
        await dbservice.updateCustomer(req.params.cusid, req.body);

        res.send({message: "Successfully updated the Customer " + body.first_name.toString()});
    }
    catch (err){
        console.log(err)
        res.send({message: "Could not update customer"});
    }
});

routes.get("/customers", async (req, res) => {
    try {
      const customers = await dbservice.getAllCustomers();
  
      if (customers.length < 1) {
          res.send({error: "Could not find customers"});
      }
  
      res.send(customers);
    } catch (error) {
      console.log(error);
      res.send({
        status: "Någonting gick fel vid hämtning av customers",
      });
    }
  });

routes.get("/user", async (req, res) => {
    try {
        if (!req.session.token) {
            res.send({error: "Not logged in"});
            return;
        }
        const user = await verify(req.session.token);

        if (user.length < 1) {
            res.send({error: "Not logged in"});
            return;
        }
        res.send(user);

    } catch(err) {
        res.send({error: "Not logged in"});
    }
});


routes.get('/user/:id', async (req,res) => {
    const id = req.params.id;
    try{
        const data = await dbservice.getUserById(id);
        if (data < 1) {
            res.send({error: "User id " + id.toString() + " not found"})
        }
        res.send(data);
    }
    catch(err) {
        res.send(err);
    }
})

//ORDER FUNCTIONS
routes.get('/order/:id', async (req, res) => {
    const id = req.params.id;
    try {
        let order = await dbservice.getOrderById(id);

        if (order.length < 1) {
            res.send({error: "Order id " + id.toString() + " not found"})
            return;
        }

        order[0].items = await dbservice.getItemsByOrderId(id);

        res.send(order);
    }
    catch (err){
        res.send(err);
    }
});

routes.get('/orders/customer/:id', async (req, res) => {
    const id = req.params.id;
    try{
        let orders = await dbservice.getOrderByCustomerId(id);
        if (orders.length < 1) {
            res.send({error: "Orders in customer id " + id.toString() + " not found"});
            return;
        }
        for (let i = 0; i < orders.length; ++i) {
            orders[i].items = await dbservice.getItemsByOrderId(orders[i].ordid);
        }

        res.send(orders);
    }
    catch(err){
        res.send(err);
    }
});

routes.get('/orders/user/:id', async (req, res) => {
    const id = req.params.id;
    try{
        let orders = await dbservice.getOrderByUserId(id);
        if (orders.length < 1) {
            res.send({error: "Orders in user id " + id.toString() + " not found"});
            return;
        }

        for (let i = 0; i < orders.length; ++i) {
            orders[i].items = await dbservice.getItemsByOrderId(orders[i].ordid);
        }
        res.send(orders);
    }
    catch(err){
        res.send(err);
    }
});

routes.get('/orders/customer/:email', async (req, res) => {
    const email = req.params.email;
    try{
        const email = await dbservice.getCustomerByEmail(email);
        if (email.length < 1 ){
            res.send({error: "Orders in customer email " + email + " not found"});
        }
        res.send(email);
    }
    catch(err){
        res.send(err);
    }
});

routes.post('/order', async (req, res) => {
    const body = req.body;
    try{
        let customer = await dbservice.getCustomerByEmail(body.info.email);

        if (customer.length != 1) {
            await dbservice.createCustomer(body.info);
            customer = await dbservice.getCustomerByEmail(body.info.email);

            if (customer.length != 1) {
                res.send({error: "Could not get or add customer with email " + body.info.email});
                return;
            }
        }

        const ordid = await dbservice.addOrder(customer[0].cusid);

        if (ordid.length != 1) {
            res.error({error: "Could not add order"});
            return;
        }

        let items = [];

        for (let i = 0; i < body.items.length; ++i) {
            let item;
            if (body.items[i].product.discount != undefined) {
                item = {
                    quantity: body.items[i].amount,
                    price: body.items[i].product.price * (1 - body.items[i].product.discount),
                    pid: body.items[i].product.pid,
                    pname: body.items[i].product.pname
                }
            }
            else {
                item = {
                    quantity: body.items[i].amount,
                    price: body.items[i].product.price,
                    pid: body.items[i].product.pid,
                    pname: body.items[i].product.pname 
                }
            }
            await dbservice.addItemToOrderById(ordid[0].seq, item);
            items.push(item);
        }
        await mailsender.sendComfirmation(customer[0].email, customer[0].first_name, items);
        res.send({message: "Successfully added a new order"})
    }
    catch(err){
        console.log(err);
        res.send({error: err});
    }

});

routes.put('/order/:ordid', async (req, res) => {
    const body = req.body;
    try{
        await dbservice.updateOrder(req.params.ordid, req.body);
        res.send({message: "Successfully updated the order"})
    }
    catch(err){
        console.log(err)
        res.send({message: "Could not update order"})
    }
});

routes.delete('/order/:id', async (req, res) => {
    try{
        await dbservice.deleteCustomer(req.params.id);
        res.send({message: "Successfully removed the Order"})
    }
    catch (err){
        res.send(err);
    }
});

routes.post("/testmail", async (req, res) => {
    try {
        await mailsender.sendComfirmation(req.body.email, req.body.name, req.body.items);
        res.send({message: "Confirmation email send to client"});
    }
    catch(error) {
        console.log(error);
        res.send({error: error});
    }
})


//KLARNA
const KLARNA_USERNAME = 'PK51979_4fec2ec2bfc6';
const KLARNA_PASSWORD = 'L5a7aiE2VZIgSSnP';
const KLARNA_BASE_URL = 'api.playground.klarna.com';

routes.post('/klarna', async (req, res) => {
    const body = req.body;

    let orderItems = [];

    for (let i = 0; i < body.items.length; ++i) {
        let lineitem = body.items[i];

        let item;

        if (lineitem.product.discount != undefined) {
            item = {
                "type": "physical",
                "name": lineitem.product.pname,
                "quantity": parseInt(lineitem.amount),
                "unit_price": lineitem.product.price * 100,
                "tax_rate": 0,
                "total_tax_amount": 0,
                "total_amount": (lineitem.product.price * (1 - lineitem.product.discount)) * lineitem.amount * 100,
                "total_discount_amount": ((lineitem.product.price * lineitem.product.discount) * lineitem.amount) * 100
            }
        }
        else {
            item = {
                "type": "physical",
                "name": lineitem.product.pname,
                "quantity": parseInt(lineitem.amount),
                "unit_price": lineitem.product.price * 100,
                "tax_rate": 0,
                "total_tax_amount": 0,
                "total_amount": lineitem.product.price * lineitem.amount * 100,
                "total_discount_amount": 0,
            }
        }
        

        orderItems.push(item);
    }

    let content = {
        "purchase_country": "SE",
        "purchase_currency": "SEK",
        "locale": "en-SE",
        "order_amount": body.totalAmount * 100,
        "order_tax_amount": 0,
        "order_lines": orderItems,
        "custom_payment_method_ids": ["DIRECT_DEBIT", "BANK_TRANSFER", "CARD", "INVOICE"],
        "billing_address": body.billingAddress,
    }

    const options = {
        hostname: KLARNA_BASE_URL,
        path: "/payments/v1/sessions",
        method: "POST",
        headers: {
            "Authorization": "Basic " + Buffer.from(KLARNA_USERNAME + ":" + KLARNA_PASSWORD).toString("base64"),
            "Content-Type": 'application/json',
        }
    }

    let request = https.request(options, async (responce) => {
        responce.on('data', async (d) => {
            res.send({client_token: JSON.parse(d).client_token});
        });
    });
    
    request.write(JSON.stringify(content));
    request.end();
});

module.exports = routes;
