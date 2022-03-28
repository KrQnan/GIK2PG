const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const dbPromise = (async () => {
    return open ({
        filename: './database.db',
        driver: sqlite3.Database
    });
})();

//PRODUCTS
const getProducts = async () => {
    try{
        const dbCon = await dbPromise;
        const questions = await dbCon.all('SELECT * FROM Product');
        return questions;
    }
    catch(error){
        throw new Error(error.message);
    }

};

//RATINGS
const getRatings = async () => {
    try{
        const dbCon = await dbPromise;
        const ratings = await dbCon.all('SELECT * FROM Rating')
        return ratings;
    }
    catch(error){
        throw new Error(error.message);
    }
}

//CATEGORIES
const getCategories = async () => {
    try{
        const dbCon = await dbPromise;
        const questions = await dbCon.all('SELECT * FROM Category');
        return questions;
    }
    catch(error){
        throw new Error(error.message);
    }
};

//ORDERS
const getOrders = async () => {
    try{
        const dbCon = await dbPromise;
        const questions = await dbCon.all('SELECT * FROM orders');
        return questions;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const addOrder = async (cusid) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.all('INSERT INTO Orders (cusid, date) VALUES(?, date("now"))', [cusid]);
        const ordid = await dbCon.all('SELECT seq FROM sqlite_sequence WHERE name = "Orders"');
        return ordid;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getOrderById = async (id) => {

    try{
        const dbCon = await dbPromise;
        const questions = await dbCon.all('SELECT * FROM Orders WHERE ordid=?', [id]);
        return questions;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const updateOrder = async (ordid, data) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.all('UPDATE Orders SET cusid=? WHERE ordid=?', [data.cusid, ordid]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const deleteOrder = async (id) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.all('DELETE FROM Orders WHERE ordid = ?', [id]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

//PRODUCT FUNCTIONS
const getProductById = async (id) => {

    try{
        const dbCon = await dbPromise;
        const questions = await dbCon.all('SELECT * FROM Product WHERE pid=?', [id]);
        return questions;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const addProduct = async (data) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.all('INSERT INTO Product (pname, pdescription, price, picture, catid) Values(?,?,?,?,?)', [data.pname, data.pdescription, data.price, data.picture, data.catid]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const updateProduct = async (pid, data) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.all('UPDATE Product SET pname=?, pdescription=?, price=?, picture=?, catid=? WHERE pid=?', [data.pname, data.pdescription, data.price, data.picture, data.catid, pid]);
    }
    catch(error){
        throw new Error(error.message);
    }
};
const deleteProduct = async (id) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.run('DELETE FROM Product WHERE pid = ?', [id]);
    }
    catch(error){
        throw new Error(error.message);
    }
};
// DEAL FUNCTIONS
const getDeals = async () => {
    try {
        const dbcon = await dbPromise;
        const deals = await dbcon.all('SELECT * FROM Deals');
        return deals;
    }
    catch (error) {
        throw new Error(error.message);
    }
};

const deleteDeal = async (id) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.run('DELETE FROM Deals WHERE dealid = ?', [id]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const deleteDealByPid = async (id) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.run('DELETE FROM Deals WHERE pid = ?', [id]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getDealByPid = async (pid) => {
    try {
        const dbcon = await dbPromise;
        const deal = await dbcon.all('SELECT * FROM Deals WHERE pid = ?', [pid]);
        return deal;
    }
    catch (error) {
        throw new Error(error.message);
    }
};

const updateDealByPid = async (pid, discount) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.all('UPDATE Deals SET discount=?, date=date("now") WHERE pid=?', [discount, pid]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const addDeal = async (pid, discount) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.all('INSERT INTO Deals (discount, pid, date) Values(?,?, date("now"))', [discount, pid]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

// RATING FUNCTIONS
const getRatingById = async (id) =>{
    try{
        const dbCon = await dbPromise;
        const rating = await dbCon.all('SELECT * FROM Rating WHERE ratid = ?', [id]);
        return rating;
    }
    catch(error){
        throw new Error(error.message)
    }
};

const getRatingsByProduct = async (id) =>{
    try{
        const dbCon = await dbPromise;
        const ratings = await dbCon.all('SELECT * FROM Rating WHERE pid = ?', [id]);
        return ratings;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getRatingsByUserId = async (id) =>{
    try{
        const dbCon = await dbPromise;
        const ratings = await dbCon.all('SELECT * FROM Rating WHERE userid = ?', [id]);
        return ratings;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const addRating = async (data) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.all('INSERT INTO Rating (score,comment,pid,userid) Values(?,?,?,?)', [data.score, data.comment, data.pid, data.userid])
    }
    catch(error){
        throw new Error(error.message);
    }
}

const updateRating = async (ratid, data) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.all('UPDATE Rating SET score=?, comment=? WHERE ratid=?', [data.score, data.comment, ratid]);
    }
    catch{
        throw new Error(error.message)
    }
}

const deleteRating = async (id) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.all('DELETE FROM Rating WHERE ratid = ?', [id]);
    }
    catch (error) {
        throw new Error(error.message);
    }
}

//CATEGORY FUNCTIONS
const getCategoryById = async (id) => {
    try{
        const dbCon = await dbPromise;
        const category = await dbCon.all('SELECT * FROM Category WHERE catid = ?', [id]);
        return category;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getProductsByCategory = async (id) => {
    try{
        const dbCon = await dbPromise;
        const products = await dbCon.all('SELECT * FROM Product WHERE catid = ?', [id]);
        return products;
    }
    catch(error){
        throw new Error(error.message);
    }
};

//USER FUNCTIONS
const createUser = async (data) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.all('INSERT INTO User (gUserId, roles, cusid) VALUES (?,?,?)', 
        [data.gUserid, data.roles, data.cusid]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getAllUsers = async () => {
    try{
        const dbCon = await dbPromise;
        const users = await dbCon.all('SELECT * FROM User');
        return users;
    }
    catch(error) {
        throw new Error(error.message);
    }
};

const getAllCustomers = async () => {
    try{
        const dbCon = await dbPromise;
        const customers = await dbCon.all('SELECT * FROM Customer');
        return customers;
    }
    catch(error) {
        throw new Error(error.message);
    }
};


const updateCustomer = async (cusid, data) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.all('UPDATE Customer SET first_name=?, last_name=?, address=?, email=? WHERE cusid=?', [data.first_name, data.last_name, data.address, data.email, cusid]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const deleteCustomer = async (id) => {
    try{
        const dbCon = await dbPromise;
        await dbCon.all('DELETE FROM Customer WHERE cusid = ?', [id]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getUserByGid = async (gid) => {
    try{
        const dbCon = await dbPromise;
        const products = await dbCon.all('SELECT * FROM User WHERE gUserid = ?', [gid]);
        return products;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getUserById = async (id) => {
    try{
        const dbCon = await dbPromise;
        const user = await dbCon.all('SELECT * FROM User WHERE Userid = ?', [id]);
        return user;
    }
    catch(error){
        throw new Error(error.message);
    }
}

const createCustomer = async (data) => {
    try {
        const dbCon = await dbPromise;
        await dbCon.all('INSERT INTO Customer (first_name, last_name, address, email) VALUES (?,?,?,?)', 
        [data.first_name, data.last_name, data.address, data.email]);
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getCustomerByEmail = async (email) => {
    try{
        const dbCon = await dbPromise;
        const customer = await dbCon.all('SELECT * FROM Customer WHERE email = ?', 
        [email]);
        return customer;
    }
    catch(error){
        throw new Error(error.message);
    }
};

const getCustomerById = async (id) => {
    try {
        const dbcon = await dbPromise;
        const customer = await dbcon.all('SELECT * FROM Customer WHERE cusid = ?',
        [id]);
        return customer;
    }
    catch (error) {
        throw new Error(error.message);
    }
};

const getCustomerByUserId = async (id) => {
    try {
        const dbcon = await dbPromise;
        const customer = await dbcon.all('SELECT * FROM Customer WHERE cusid = (SELECT cusid FROM User WHERE userid = ?)',
        [id]);
        return customer;
    }
    catch (error) {
        throw new Error(error.message);
    }
};

const getOrderByCustomerId = async (id) => {
    try{
        const dbCon = await dbPromise;
        const order = await dbCon.all('SELECT * FROM Orders WHERE cusid = ?', [id]);
        return order;
    }
    catch (error) {
        throw new Error(error.message);
    }
}

const getOrderByUserId = async (id) => {
    try{
        const dbCon = await dbPromise;
        const order = await dbCon.all('SELECT * FROM Orders WHERE cusid = (SELECT cusid FROM User WHERE userid = ?)', [id]);
        return order;
    }
    catch (error) {
        throw new Error(error.message);
    }
}

const getItemsByOrderId = async (id) => {
    try {
        const dbcon = await dbPromise;
        const items = await dbcon.all('SELECT * FROM LineItem WHERE ordid = ?', [id]);
        return items;
    }
    catch (error) {
        throw new Error(error.message);
    }
};

const addItemToOrderById = async (ordid, item) => {
    try {
        const dbcon = await dbPromise;
        await dbcon.all('INSERT INTO LineItem (quantity, price, pid, ordid) VALUES(?, ?, ?, ?)', [item.quantity, item.price, item.pid, ordid]);
    }
    catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    //PRODUCT
    getProducts:getProducts,
    getProductById:getProductById,
    addProduct:addProduct,
    updateProduct:updateProduct,
    deleteProduct:deleteProduct,
    //DEALS
    getDeals:getDeals,
    getDealByPid:getDealByPid,
    deleteDeal:deleteDeal,
    deleteDealByPid:deleteDealByPid,
    updateDealByPid:updateDealByPid,
    addDeal:addDeal,
    //CATEGORIES
    getCategories:getCategories,
    getCategoryById:getCategoryById,
    getProductsByCategory:getProductsByCategory,
    //RATINGS
    getRatings:getRatings,
    getRatingById:getRatingById,
    getRatingsByProduct:getRatingsByProduct,
    getRatingsByUserId:getRatingsByUserId,
    addRating:addRating,
    deleteRating: deleteRating,
    updateRating:updateRating,
    //User
    createUser:createUser,
    getUserByGid:getUserByGid,
    getUserById:getUserById,
    getAllUsers:getAllUsers,
    // Customer
    createCustomer:createCustomer,
    getCustomerByEmail:getCustomerByEmail,
    getCustomerById:getCustomerById,
    getCustomerByUserId:getCustomerByUserId,
    updateCustomer:updateCustomer,
    getAllCustomers:getAllCustomers,
    deleteCustomer:deleteCustomer,
    //Orders
    getOrders:getOrders,
    addOrder:addOrder,
    getOrderById:getOrderById,
    getOrderByUserId:getOrderByUserId,
    updateOrder:updateOrder,
    getOrderByCustomerId:getOrderByCustomerId,
    deleteOrder:deleteOrder,
    // LineItem
    getItemsByOrderId:getItemsByOrderId,
    addItemToOrderById:addItemToOrderById,
}
