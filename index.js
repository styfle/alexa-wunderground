const http = require('http');

const hostname = '0.0.0.0';
const port = process.env.PORT || 3012;

const server = http.createServer((req, res) => {
    console.log('ip: ', req.connection.remoteAddress);
    console.log('method: ', req.method);
    console.log('url: ', req.url);
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        console.log('data: ', data);
        console.log('');
        const weather = getWeather();
        const json = getResponseJSON(weather);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json;charset=UTF-8');
        res.setHeader('Content-Length', json.length);
        res.end(json);
    });
}).listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});

function getWeather() {
    const weather = {
        current: 34,
        high: 35,
        low: 12,
        snow: true,
        rain: false
    };
    return weather;
}

function getResponseJSON(w) {
    let text = `The current temperature is ${w.current} with a high of ${w.high} and low of ${w.low}.`;
    if (w.snow) {
        text += ` It looks like it will snow today so bundle up!`
    } else if (w.rain) {
        text += ` It looks like it will rain today so watch out for puddles!`;
    }
    const o = {
        "version": "1.0",
        "response": {
          "outputSpeech": {
            "type": "PlainText",
            "text": text,
            "ssml": `<speak>${text}</speak>`
          },
          "card": {
            "type": "Standard",
            "title": "Wunderground",
            "content": text,
            "text": text,
            "image": {
              "smallImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Thunder_lightning_Garajau_Madeira_289985700.jpg/720px-Thunder_lightning_Garajau_Madeira_289985700.jpg",
              "largeImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Thunder_lightning_Garajau_Madeira_289985700.jpg/1200px-Thunder_lightning_Garajau_Madeira_289985700.jpg"
            }
          },
          "shouldEndSession": true
        }
      };      
    return JSON.stringify(o);
}