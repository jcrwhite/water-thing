const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const _ = require('lodash');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// parse an HTML body into a string
app.use(bodyParser.text({ type: 'text/html' }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const formatData = (data) => {
  let count = 249;
  return _.map(_.drop(data.split('+').filter(Boolean)), (d) => {
    count++;
    return {
      x: count,
      y: d.split('%')[0]
    }
  });
}

app.post('/', (req, res) => {
  // console.log(req.body);
  io.emit('data', formatData(req.body));
  res.sendStatus(200);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:3000');
});