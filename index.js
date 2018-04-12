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
// let max = 0;

// const reset = () => {
//   for (let i = 0; i < 10000; i++) {
//     water[i] = {
//       x: i,
//       y: i
//     };
//   }
// }

const noise_floor = [124,123,111,110,113,112,110,111,110,111,112,110,109,114,111,113,112,111,114,113,113,111,111,111,115,111,113,110,110,114,113,111,112,111,113,117,112,118,119,124,134,139,156,174,202,235,269,313,352,388,419,405,383,340,292,264,243,228,217,202,192,189,186,190,196,200,215,223,231,251,258,267,277,280,290,296,294,297,296,299,299,296,303,300,305,310,312,324,325,330,337,341,338,341,340,333,340,341,344,343,347,350,348,350,349,344,348,350,350,350,351,350,356,356,357,362,359,360,362,356,358,355,353,348,346,339,347,347,338,334,334,325,313,309,297,295,287,282,275,271,264,257,250,245,240,237,233,228,220,222,214,211,205,197,201,196,190,189,185,186,183,177,179,175,168,167,164,164,162,157,155,154,153,152,145,146,145,141,142,137,135,135,134,132,131,127,130,128,126,127,124,125,123,122,125,123,119,122,120,119,119,116,119,117,118,116,114,115,118,112,115,115,112,114,113,112,116,114,114,112,113,112,114,114,114,110,116,113,111,114,111,111,114,111,113,110,110,111,110,113,113,110,113,112,111,113,112,111,114,109,111,115,109,113,114,110,113,110,113,111,114,114,110,114,111,113,112,111,110,113,110,110,116,111,114,113,113,113,110,111,112,112,116,111,111,112,114,114,0];

const formatData = (data) => {
  let count = 379;
  let index = -1;
  const data_array = _.drop(data.split('+').filter(Boolean));
  if (data_array.length > 200) {
    data_array.length = 200;
    water.length = 200;
  }
  return _.map(data_array, (d) => {
    count += 1.77;
    index++;
    const normalized = parseInt(d.split('%')[0]) - noise_floor[index] || 0;
    return {
      x: Math.floor(count),
      y: normalized > 0 ? normalized : 0
    };
  });
}

// reset();

// const formatData = (data) => {
//   if (max > 10) {
//     max = 0;
//     reset();
//   }
//   max++;
//   let count = 379;
//   let index = -1;
//   const data_array = _.drop(data.split('+').filter(Boolean));
//   if (data_array.length > 200) {
//     data_array.length = 200;
//     water.length = 200;
//   }
//   _.each(data_array, (d) => {
//     count += 1.77;
//     index++;
//     water[index] = {
//       x: Math.floor(count),
//       y: parseInt(d.split('%')[0]) + water[index].y
//     }
//   });
//   return _.map(water, w => {
//     return {
//       x: w.x,
//       y: (w.y < 100 ? 0 : w.y / max)
//     };
//   });
// }

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