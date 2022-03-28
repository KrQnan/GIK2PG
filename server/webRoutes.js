const router = require('express').Router();
const viewFolder = __dirname + '/public/html/';

router.get('/', (req,res) => {
    res.sendFile(viewFolder + 'index.html');
});

router.get('/product/:id', (req,res) => {
    res.sendFile(viewFolder + 'product_page.html');
});

router.get('/categories', (req,res) => {
    res.sendFile(viewFolder + 'categories.html');
});

router.get('/user', async (req, res) => {
    res.sendFile(viewFolder + 'user.html');
});

router.get('/about', async (req,res) => {
    res.sendFile(viewFolder + 'about.html');
})

router.get('/cart', (req,res) => {
    res.sendFile(viewFolder + 'shoppingcart.html');
});
module.exports = router;
