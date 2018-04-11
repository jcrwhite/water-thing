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

let water = [];
let max = 0;

const reset = () => {
  for (let i = 0; i < 10000; i++) {
    water[i] = {
      x: i,
      y: i
    };
  }
}

reset();

const formatData = (data) => {
  if (max > 10) {
    max = 0;
    reset();
  }
  max++;
  let count = 339;
  let index = -1;
  water = _.map(_.drop(data.split('+').filter(Boolean)), (d) => {
    count += 1.77;
    index++;
    return {
      x: Math.floor(count),
      y: parseInt(d.split('%')[0]) + water[index].y
    }
  });
  return _.map(water, w => {
    return {
      x: w.x,
      y: (w.y / max)
    };
  });
}

/**
 * % Difference from max value
 */
// const formatData = (data) => {
//   if (max > 1000000) {
//     reset();
//   }
//   max = 0;
//   let count = -1;
//   water = _.map(_.drop(data.split('+').filter(Boolean)), (d) => {
//     count++;
//     return {
//       x: count,
//       y: parseInt(d.split('%')[0]) + water[count].y
//     }
//   });
//   console.log(water);
//   return _.map(_.each(water, w => {
//     max = w.y > max ? w.y : max;
//   }), m => {
//     return {
//       x: m.x,
//       y: (m.y / max)
//     };
//   });
// }

app.post('/', (req, res) => {
  // console.log(formatData(req.body));
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