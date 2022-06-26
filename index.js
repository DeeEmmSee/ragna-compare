const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use('/scripts', express.static(path.join(__dirname, '/public/scripts')));

// Router
var router = express.Router();
router.get('/', (req, res) => {
	res.sendFile('index.html', {root: path.join(__dirname, '/public')});
});
app.use(router);

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
});