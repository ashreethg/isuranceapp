const express = require("express");
const mysql = require("mysql")
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config({ path: './.env'});

const app = express();

const db =mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

app.use(express.urlencoded({extended:false}));
app.use(express.json());

db.connect((error) =>{
    if(error){
        console.log(error)
    }
    else{
        console.log("My SQL Coneected....")
    }
});

//Arbitrary ID manager since we don't use a database
var index = 5;

// Initializing Destinations Array.. It will behave like a dummy database 
var questions = [{
    "msgid": 1,
    "msgtype": "TEXT",
    "msgContent": "Please provide your Business Name",
    "msgsender" : "BOT",
	"msginputlist" : []
	
}, {
    "msgid": 2,
    "msgtype": "TEXT",
    "msgContent": "Enter your Business Address : Street and Building No.",
    "msgsender" : "BOT",
	"msginputlist" : ["YES","No"]
}, {
    "msgid": 3,
    "msgtype": "TEXT",
    "msgContent": "Enter your Business Address : City and ZipCode",
    "msgsender" : "BOT",
	"msginputlist" : ["YES","No"]
}, {
    "msgid": 4,
    "msgtype": "TEXT",
    "msgContent": " Enter your Business Address : State",
    "msgsender" : "BOT",
	"msginputlist" : ["YES","No"]
}, {
    "msgid": 5,
    "msgtype": "NUMBER",
    "msgContent": "Enter your Business telephone No",
    "msgsender" : "BOT",
	"msginputlist" : ["YES","No"]
}, {
    "msgid": 6,
    "msgtype": "RADIO2",
    "msgContent": " Is your Business location is same as home address?",
    "msgsender" : "BOT",
	"msginputlist" : ["YES","No"]
}, {
    "msgid": 7,
    "msgtype": "CALENDER",
    "msgContent": "From when you what to start your Business Policy",
    "msgsender" : "BOT",
	"msginputlist" : ["YES","No"]
}]

app.get("/destination", (req, res) => {
	console.log("Testing");
	res.send(JSON.stringify(questions));
});

app.get("/", (req, res) => {
    res.send("<h1>Home Page</h1>")
});

app.post("/register",(req,res)=>{
    console.log(req.body);

    const { email,password,first_name,second_name,DOB } = req.body;
    db.query('SELECT email FROM users WHERE email = "'+email+'"',async(error,results,fields)=>{
        if(error){
            console.log(error);
        }
        if(results.length > 0){

            return res.send({
                error:true,
                message: 'Email is in already use'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);
        db.query('INSERT INTO users SET ?',{email: email, password:hashedPassword, first_name:first_name, second_name: second_name, DOB:DOB},(error,results)=>{
            if(error){
                console.log(error);
            }
            else{
                return res.send({
                    error:false,
                    message: 'User register'
                });
            }
        })
    })

    

});


app.post("/login",(req,res)=>{
    

        const {email,password} = req.body;
	
		console.log(req.body);


        db.query('SELECT * FROM users WHERE email = "'+email+'"',async(error,results,fields)=>{
            console.log(results);
			var response = {
					"error": "true",
					"message": "User name and password incorrect",
					"username": null
					}
            if(error){
                console.log(error);
            }
            if( (!results) || !(await bcrypt.compare(password, results[0].password)) ){
				console.log("Fail");
                return res.send(response);
            }
            else{
				console.log("Success");
				response.error = "false";
				response.message = "Login successful";
				response.username = results[0].first_name + " " + results[0].second_name
                return res.send(response);
            }
        })
    

});

app.listen(5000, ()=> {
    console.log("Server started on port 5000");
})