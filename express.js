// blog_app/index.js
const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");

const { dbConnect } = require('./config/dbConnect');

const PORT = process.env.PORT || 3000;

/* Get all routes */
const userRouter = require('./src/routes/user.routes');
const taskRouter = require('./src/routes/tasks.routes');
const subTasksRouter = require('./src/routes/subTasks.routes');

const app = express();

/* Establish DB connection */
dbConnect();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));

app.use('/user', userRouter);
app.use('/task', taskRouter);
app.use('/subTask', subTasksRouter);

app.get('/debug', (req, res) => {
  res.send("hello world");
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
