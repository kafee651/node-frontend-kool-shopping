const express = require('express');
const session = require('express-session');
const passport = require('passport');
const WebAppStrategy = require('ibmcloud-appid').WebAppStrategy;
const app = express();

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  
  });
app.use(session({
    secret:'123456',
    resave:true,
    saveUninitialized:true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, cb)=> cb(null, user));
passport.deserializeUser((user,cb)=> cb(null, user));
passport.use(new WebAppStrategy({
    tenantId:"9265e7ce-1207-4724-8f5d-67e4511c51e6",
    clientId:"db3a0d34-d810-4d8c-a90c-d44c353bd54e",
    secret:"NzE5ZDZjNWMtZjM1Yy00ZjRhLWFiZDAtZDE1YjFmMTRmMjA5",
    oauthServerUrl:"https://eu-gb.appid.cloud.ibm.com/oauth/v4/9265e7ce-1207-4724-8f5d-67e4511c51e6",
    redirectUri:"http://nodefull-sahal.gamification-d3c0cb24e2b77f6869027abe3de4bca3-0001.sng01.containers.appdomain.cloud/appid/callback"
}));

//Handle Login
app.get('/appid/login',passport.authenticate(WebAppStrategy.STRATEGY_NAME,{
    successRedirect:'/',
    forceLogin:true
}));

//Handle Callback
app.get('/appid/callback', passport.authenticate(WebAppStrategy.STRATEGY_NAME));

// Handle Logout
app.get('/appid/logout', function(req, res){
    WebAppStrategy.logout(req);
    res.redirect('/');
});

//Protect the whole app
//app.use(passport.authenticate(WebAppStrategy.STRATEGY_NAME));
app.use('/api', (req,res,next) =>{
    if(req.user){
        next();
    }
    else{
        res.status(401).send("Unauthorized");
    }
});

app.get('/api/user',(req,res)=>{
   // console.log(req.session[WebAppStrategy.AUTH_CONTEXT]);

    res.json({
        user:{
            name:req.user.name,
            picture:req.user.picture
        }
    });
});
// Serve Static resources
app.use(express.static('./public'));

//Start server
app.listen(port,()=> {
    console.log('Listening on http://localhost:8080');
});

