const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const Twilio = require('twilio');
const request = require('request');

const sid = process.env.SID;
const authToken = process.env.AUTH_TOKEN;

const client = new Twilio(sid,authToken);

app.use(bodyparser.urlencoded({extended:false}));

app.get('/',(req,res)=>{
    res.send('heya...');
});

app.post('/incoming',(req,res)=>{
    
    var baseUrl = 'https://api.duckduckgo.com/?skip_disambig=1&format=json&pretty=1&q=';
    var query = req.body.Body;

    request(baseUrl+query,(err,response,body)=>{
        if(err){
            console.log(err);
        }else{
            body = JSON.parse(body);

            var reply =(body["Abstract"] || body["AbstractURL"])? body["Abstract"]+"\n\nFind more info here:"+body["AbstractURL"]:'Sorry we found no answers to that query!';

            console.log(reply);

            client.messages.create({
                to:req.body.From,
                from:req.body.To,
                body:reply
            }).then(message=>{
                console.log('Reply sent. SID ='+message.sid);
            }).catch(err=>{
                console.log(err);
            });
        }
    });

    res.end();
});

const port = process.env.PORT || 8080;

app.listen(port,()=>{
    console.log('server started on port '+port);
});
