import express from 'express';
import bodyParser from 'body-parser';
import { engine } from 'express-handlebars';
import { ContactHandler } from './handlers/contactHandler.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

const contactHandler = new ContactHandler();

app.use(bodyParser.urlencoded({ extended: true }));
app.engine('hbs', engine({ extname: 'hbs' }));
app.set('view engine', 'hbs');
app.set('views', './src/views');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, '/public')));


app.use('/', contactHandler.router);

app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`);
});