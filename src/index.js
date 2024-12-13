const express = require('express');
const connectDB = require('./config/db');

const app = express();

app.use(express.json());

connectDB();

const booksRoute = require('./routes/books');
const authorsRoute = require('./routes/authors');
const membersRoute = require('./routes/members');
const webRoute = require('./routes/web'); 

app.use('/api/books', booksRoute);
app.use('/api/authors', authorsRoute);
app.use('/api/members', membersRoute);

app.use('/api/web', webRoute);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
