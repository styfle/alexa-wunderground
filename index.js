// @ts-check
const http = require('http');

const hostname = '0.0.0.0';
const port = process.env.PORT || 3012;

const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
        console.log('ip: ', req.connection.remoteAddress);
        console.log('method: ', req.method);
        console.log('url: ', req.url);
        
        if (raw) {
            console.log('raw data: ', raw);
            const data = JSON.parse(raw);
            // TODO: do stuff with data
        }
        console.log('\n');
        
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
    const f = {
        "date": {
            "epoch": "1514160000",
            "pretty": "7:00 PM EST on December 24, 2017",
            "day": 24,
            "month": 12,
            "year": 2017,
            "yday": 357,
            "hour": 19,
            "min": "00",
            "sec": 0,
            "isdst": "0",
            "monthname": "December",
            "monthname_short": "Dec",
            "weekday_short": "Sun",
            "weekday": "Sunday",
            "ampm": "PM",
            "tz_short": "EST",
            "tz_long": "America/New_York"
        },
        "period": 1,
        "high": {
            "fahrenheit": "31",
            "celsius": "-1"
        },
        "low": {
            "fahrenheit": "16",
            "celsius": "-9"
        },
        "conditions": "Snow",
        "icon": "snow",
        "icon_url": "http://icons.wxug.com/i/c/k/snow.gif",
        "skyicon": "",
        "pop": 70,
        "qpf_allday": {
            "in": 0.1,
            "mm": 3
        },
        "qpf_day": {
            "in": 0.1,
            "mm": 3
        },
        "qpf_night": {
            "in": 0,
            "mm": 0
        },
        "snow_allday": {
            "in": 1,
            "cm": 2.5
        },
        "snow_day": {
            "in": 1,
            "cm": 2.5
        },
        "snow_night": {
            "in": 0,
            "cm": 0
        },
        "maxwind": {
            "mph": 20,
            "kph": 32,
            "dir": "WSW",
            "degrees": 244
        },
        "avewind": {
            "mph": 13,
            "kph": 21,
            "dir": "WSW",
            "degrees": 244
        },
        "avehumidity": 94,
        "maxhumidity": 0,
        "minhumidity": 0
    };
    f.icon_url = `https://icons.wxug.com/i/c/v4/${f.icon}.svg`;
    f.high.fahrenheit
    f.snow_allday.in
    return f;
}

function getResponseJSON(f) {
    const title = f.date.pretty;
    let text = `High of ${f.high.fahrenheit} and low of ${f.low.fahrenheit}.`;
    if (f.snow_allday && f.snow_allday.in) {
        text += ` It's going to snow ${f.snow_allday.in} inches today!`
    } else if (f.rain_allday && f.rain_allday.in) {
        text += ` It looks like it will rain ${f.rain_allday.in} today so watch out for puddles!`;
    }
    const o = {
        "version": "1.0",
        "shouldEndSession": true,
        "response": {
            "outputSpeech": {
                "type": "SSML",
                "ssml": `<speak>${text}</speak>`
            },
            "card": {
                "type": "Standard",
                "title": title,
                "content": text,
                "text": text,
                "image": {
                    "smallImageUrl": f.icon_url,
                    "largeImageUrl": f.icon_url
                }
            }
        }
    };
    return JSON.stringify(o);
}