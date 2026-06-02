const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const path    = require('path');

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/posts',     require('./routes/posts'));
app.use('/api/comments',  require('./routes/comments'));
app.use('/api/likes',     require('./routes/likes'));
app.use('/api/bookmarks', require('./routes/bookmarks'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
