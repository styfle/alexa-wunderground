// @ts-check
const http = require('http');
const fetch = require('node-fetch');

const HOSTNAME = '0.0.0.0';
const PORT = process.env.PORT || 3012;
const API_KEY = process.env.API_KEY;

const server = http.createServer((req, res) => {
    try {
        let raw = '';
        req.on('data', chunk => { raw += chunk; });
        req.on('end', async () => {
            console.log('ip: ', req.connection.remoteAddress);
            console.log('method: ', req.method);
            console.log('url: ', req.url);
            
            if (raw) {
                console.log('raw data: ', raw);
                const data = JSON.parse(raw);
                const alexaResponse = await getZip(data);
                console.log(alexaResponse);
                const json = JSON.stringify(alexaResponse);
                /*
                let city = 'San Francisco';

                if (isIntent(data, 'WundergroundIntent')) {
                    city = getSlotValue(data, 'city');
                } else if (isIntent(data, 'AMAZON.SearchAction<object@WeatherForecast>')) {
                    city = getSlotValue(data, 'object.location.addressLocality.name');
                }

                const weather = getWeather(city);
                const json = getResponseJSON(weather);
                */
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json;charset=UTF-8');
                res.setHeader('Content-Length', json.length);
                res.end(json);
            } else {
                const obj = { status: 'ok' };
                const json = JSON.stringify(obj);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json;charset=UTF-8');
                res.setHeader('Content-Length', json.length);
                res.end(json);
            }
            console.log('\n');
        });
    } catch (e) {
        const obj = { error: e.message };
        const json = JSON.stringify(obj);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json;charset=UTF-8');
        res.setHeader('Content-Length', json.length);
        res.end(json);
    }
}).listen(PORT, HOSTNAME, () => {
    console.log(`Server running at http://${HOSTNAME}:${PORT}`);
});

function isIntent(data, name) {
    try {
        return (data.request.intent.name === name);
    } catch (e) {
        return false;
    }
}

function getSlotValue(data, slot) {
    return data.request.intent.slots[slot].value;
}

function getState(city) {
    const url = `https://api.wunderground.com/api/${API_KEY}/conditions/q/US/${city}json`;
}

function getForecast(zip) {
    const { lat, lng } = getLatLng(zip);
    const url = `https://api.wunderground.com/api/${API_KEY}/conditions/forecast/q/${lat},${lng}.json`;
}

function getLatLng(zip) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}`;

    const data = {}; // get from response
    return data.results[0].geometry.location;
}

async function getZip(data) {
    const r = await fetch(`${data.context.System.apiEndpoint}/v1/devices/${data.context.System.device.deviceId}/settings/address/countryAndPostalCode`, { 
        method: 'GET', 
        headers: {
            'Authorization': 'Basic ' + data.context.System.apiAccessToken, 
            'Content-Type': 'application/json'
        }
    });
    const obj = await r.json();
    return obj;
}

function getWeather(city) {
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
/*
const https = require('https');
function getAsync(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
            let data = '';
            res.on('data', (d) => { data += d; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    reject(e);
                }
            });
        }).on('error', e => reject(e));
    });
}
*/