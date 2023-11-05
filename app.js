import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import { checkAuthentication } from "./views/google_oauth.js";
import _ from "lodash";
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import GoogleStrategy from 'passport-google-oauth2';
import mongodbConnection from "./database/db.js";
// import { MainFormate } from "./database/models/newList.js";
import RecTask from "./database/models/Task.js";

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));

app.set('view engine', 'hbs');

// global varibale for user
var userInfoVariable;

// getting environment variables
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const callbackURL = process.env.CALLBACK_URL;

//  Passport.js for Google sign in
passport.use(new GoogleStrategy.Strategy({
    clientID,
    clientSecret,
    callbackURL,
    passReqToCallback: true,
}, (request, accessToken, refreshToken, profile, done) => {

    userInfoVariable = profile;
    return done(null, profile);

}));

// session setup
app.use(session({
    secret: '?3Yq7v+m6>Bht',
    resave: false,
    saveUninitialized: true,
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// passport setup
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Mongo DB connection!
mongodbConnection();


// SIGN IN ROUTES OF GOOGLE

app.get('/auth/google', passport.authenticate('google', {
    scope: ['email', 'profile'],
}));

app.get("/sign/in", checkAuthentication, (req, res) => {
    res.redirect("/auth/google/success");
})

app.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/auth/google/success',
    failureRedirect: '/auth/google/failure',
}));

app.get('/auth/google/success', (req, res) => {

    // create a session state named userDetail containg all info of userInfoVariable
    req.session.userDetail = userInfoVariable;

    res.redirect("/");
});

app.get('/auth/google/failure', (req, res) => {
    res.send("Welcome to failure page");
});

app.get('/serviceXXX', (req, res) => {
    res.render("service.hbs", {
        outer: [{
            Key1: "ID001",
            Key2: {
                innerKey1: "Myvalue1",
                innerKey2: "Myvalue2"
            },
            Key3: [
                "Myvalue4",
                "Myvalue5"
            ]
        }]
        , items: [
            { item: "cheese", price: 15 },
            { item: "arak", price: 68 },
            { item: "hummus", price: 15 },
            { item: "pita", price: 5 }
        ]
    });
});


app.get('/service', async (req, res) => {
    //console.log('req.session.userDetail: \n',req.session.userDetail)
    try {    
        // const tempRec = await MainFormate.find({});
        const tempRec = await RecTask.find({});
        // console.log('DB status:',tempRec);
    
        res.render("service.hbs", {
            TasksData: tempRec
            });
    
  }
      catch (e) {
        console.log('DB reply-',"ERROR:> " + e);
         res.status(400).send(e);
      }
});


app.post("/TaskAddNew", async (req, res) => {

    // // get data from session state
    // const userDetail = req.session.userDetail;

    // const createItem = _.capitalize(req.body.newList);
    // const createDate = req.body.date;
    // const createTime = req.body.time;

    // get full document from DB having a unique user id and a listTitle

    // check if user have no listTitle in document 


    console.log('POST req.body status: ',req.body);
    if (req.body.ID==='' || req.body.Title===''){
        console.log('Invalid/Empty Entry' );
        // res.status(400).send(e);
        res.redirect("/service");
    }
    else if (req.body._id){
        //REPLACE old record
        try {
            //const tempRec = await RecTask.find({});
            // const tempRec = await recStaff.findByIdAndUpdate(req.params.id, req.body)
            const tempRec = await RecTask.findByIdAndUpdate(req.body._id, req.body)
            console.log('Rec Replaced = ', tempRec)
        
            //console.log('DB status:', tempRec);
            // res.send(tempRec);
            res.redirect("/service");
        }
        catch (e) {
            console.log('DB reply-', "ERROR:> " + e);
            res.status(400).send(e);
        }
    }

    else    {
        //ADD NEW Rec
        try {
            const task = new RecTask({
                ID: req.body.ID,
                Title: req.body.Title,
                Status:req.body.Status
            });
    
            await task.save();
            console.log('Rec Saved = ', task)
    
            // const tempRec = await RecTask.find({});
            //console.log('DB status:', tempRec);
            // res.send(tempRec);
            res.redirect("/service");
        }
        catch (e) {
            console.log('DB reply-', "ERROR:> " + e);
            res.status(400).send(e);
        }
    
    }
})


app.post("/TaskDelete", async (req, res) => {
    try {
        //const id = req.params.id;
        const rec = await RecTask.findOneAndDelete({ _id: req.body._id });
        console.log('Rec Deleted = ', rec)

        res.status(201).send(rec);
    
        //console.log('DB status:', tempRec);
        // res.send(tempRec);

        // const tempRec = await RecTask.find({});
        // res.render("service.hbs", {
        //     TasksData: tempRec
        //     });


        // res.redirect("/service?username=jhadd24");
        // res.redirect('/');

    }
    catch (e) {
        console.log('DB reply-', "ERROR:> " + e);
        res.status(400).send(e);
    }
})





app.get('/serviceX', (req, res) => {

    res.render("service.hbs", {
        Data: [
            {
                _id: 101,
                name: 'First List Option Number 1',
                listData: [
                    { name: 'item1', savedDate: 'item1Date', savedTime: 'item1Time' },
                    { name: 'item2', savedDate: 'item2Date', savedTime: 'item2Time' },
                    { name: 'item3', savedDate: 'item3Date', savedTime: 'item3Time' },
                    { name: 'item4', savedDate: 'item4Date', savedTime: 'item4Time' },
                    { name: 'item5', savedDate: 'item1Date', savedTime: 'item5Time' }
                ]
            },
            {
                _id: 102,
                name: 'Second List Option Number 2',
                listData: [
                    { name: 'item1', savedDate: 'item1Date', savedTime: 'item1Time' },
                    { name: 'item2', savedDate: 'item2Date', savedTime: 'item2Time' }
                ]
            },
            {
                _id: 103,
                name: 'Third List Option Number 3',
                listData: [
                    { name: 'item1', savedDate: 'item1Date', savedTime: 'item1Time' },
                    { name: 'item2', savedDate: 'item2Date', savedTime: 'item2Time' },
                    { name: 'item3', savedDate: 'item3Date', savedTime: 'item3Time' }
                ]
            },
            {
                _id: 104,
                name: 'Fourth List Option Number 4',
                listData: [
                    { name: 'item1', savedDate: 'item1Date', savedTime: 'item1Time' },
                    { name: 'item2', savedDate: 'item2Date', savedTime: 'item2Time' },
                    { name: 'item3', savedDate: 'item3Date', savedTime: 'item3Time' },
                    { name: 'item4', savedDate: 'item4Date', savedTime: 'item4Time' }
                ]
            }

        ]

    });
});



// ==============================================================
//-----------[        Data GET - All Records        ]
// ==============================================================
// router.get('/DB-Rec', async (req, res) => {
//   console.log("get request");

//   try {
//     const tempRec = await recUser.find({});
//     console.log(tempRec);

//     res.send(tempRec);
//   }
//   catch (e) {
//     console.log("ERROR" + e);
//     res.status(400).send(e);
//   }
// });


app.get("/ManualEntry", async (req, res) => {
    //console.log('req.session.userDetail: \n',req.session.userDetail)
    try {
        const task = new RecTask({
            // ID: Number(103),
            ID: 103,
            Title: '3rd Dummy Entry'
        });

        await task.save();
        // res.redirect("/");


        // const tempRec = await MainFormate.find({});
        const tempRec = await RecTask.find({});
        console.log('DB status:', tempRec);

        res.send(tempRec);
    }
    catch (e) {
        console.log('DB reply-', "ERROR:> " + e);
        res.status(400).send(e);
    }
})

app.get("/SimpleWorking", async (req, res) => {
    //console.log('req.session.userDetail: \n',req.session.userDetail)
        res.render("home.hbs")
})

app.get("/", async (req, res) => {
    //console.log('req.session.userDetail: \n',req.session.userDetail)
    const userDetail = req.session.userDetail;

    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = daysOfWeek[new Date().getDay()];
    const time = (today.getHours() > 9 ? today.getHours() > 12 ? today.getHours() - 12 : today.getHours() : "0" + today.getHours()) + " : " + (today.getMinutes() > 9 ? today.getMinutes() : "0" + today.getMinutes());


    if (userDetail !== null && userDetail !== undefined && typeof userDetail === 'object') {

        // res.render("home.hbs")
        res.render("home.hbs", {
            userDetail:userDetail,
            userName:userDetail.displayName,
            userEmail:userDetail.email,
            userPic:userDetail.PhotoURL

            // sub: '101299453244032604290',
            // id: '101299453244032604290',
            // displayName: 'Mufakhar',
            // given_name: 'Mufakhar',
            // email: 'bizappsintl@gmail.com',
            // picture: 'https://lh3.googleusercontent.com/a/ACg8ocIr2e3EylbP1vgmvNzOg6Bihe-QOJleTDyBeQOidOZk=s96-c',
          
        })
    }
        else {
            res.redirect("/sign/in");
        }
    
})

app.get("/x", async (req, res) => {
    // getting value from userDetail state
    const userDetail = req.session.userDetail;

    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = daysOfWeek[new Date().getDay()];
    const time = (today.getHours() > 9 ? today.getHours() > 12 ? today.getHours() - 12 : today.getHours() : "0" + today.getHours()) + " : " + (today.getMinutes() > 9 ? today.getMinutes() : "0" + today.getMinutes());

    // parrent if to check user login 
    if (userDetail !== null && userDetail !== undefined && typeof userDetail === 'object') {

        // get full document from DB by id
        const userCompleteList = await MainFormate.findOne({ _id: Number(userDetail.sub) });

        // child if > checking if user have no any inbuild document then it will create
        if (!userCompleteList) {

            const item1 = new MainFormate({

                _id: Number(userDetail.sub),
                main: [{
                    name: "Todo list",
                    listData: [
                        {
                            name: "...",
                            savedDate: dayName,
                            savedTime: time

                        }
                    ]
                }]
            });

            await item1.save();
            res.redirect("/");

            // child else >
        } else {

            // if user have document then this will render to ejs
            //*** res.render("index.ejs", { 
            res.render("home.hbs", {
                listTitle: _.capitalize(userCompleteList.main[0].name),
                array: userCompleteList.main[0].listData,
                mainArray: userCompleteList.main,
                publishDate: userCompleteList.main[0].listData[0].savedDate,
                publishTime: userCompleteList.main[0].listData[0].savedTime
            })
        }

        // parrent else when user is not loggen in then to redirect to sign in page  
    } 
    
    else {
        res.redirect("/sign/in");
    }

})

// to stop request went through this route
app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
});

app.post("/create", async (req, res) => {

    // get data from session state
    const userDetail = req.session.userDetail;

    const createItem = _.capitalize(req.body.newList);
    const createDate = req.body.date;
    const createTime = req.body.time;

    // get full document from DB having a unique user id and a listTitle
    const userCompleteList = await MainFormate.find({
        _id: Number(userDetail.sub),
        "main.name": createItem
    });

    // simple js object
    const newListObject = {

        name: createItem,
        listData: [
            {
                name: "...",
                savedDate: createDate,
                savedTime: createTime
            }
        ]
    };

    // check if user have no listTitle in document 
    if (userCompleteList.length === 0) {

        // push created simple object to document
        await MainFormate.findOneAndUpdate({ _id: Number(userDetail.sub) }, { $push: { "main": newListObject } });

    }
    res.redirect("/" + createItem);

})

app.get("/:newList", async (req, res) => {

    // getting data from session 
    const userDetail = req.session.userDetail;

    const listName = req.params.newList;

    // to get document without array brackets "[]" (findOne)
    const userCompleteList = await MainFormate.findOne({ _id: Number(userDetail.sub), "main.name": listName });

    // to get full array with brackets "[]" (find)
    const userCompleteFullArray = await MainFormate.find({ _id: Number(userDetail.sub), "main.name": listName });

    // function to get seleted object by listTitle
    const getDynamicObj = (arra) => {
        return arra.find(item => item.name === listName)
    }

    //  check if listTitle in URL is correct by finding that listTitle from DB if do not get Ans then
    if (userCompleteList.length !== 0) {

        res.render("index.ejs", {
            listTitle: getDynamicObj(userCompleteList.main).name,
            array: getDynamicObj(userCompleteList.main).listData,
            mainArray: userCompleteFullArray[0].main,
            publishDate: getDynamicObj(userCompleteList.main).listData[0].savedDate,
            publishTime: getDynamicObj(userCompleteList.main).listData[0].savedTime
        });

        //  check if listTitle in URL is NOT correct
    } else {
        res.render("index.ejs", {
            listTitle: "",
            array: [],
            mainArray: [],
            publishDate: "",
            publishTime: ""
        });
    }

})

app.post("/", async (req, res) => {

    // get data from session state
    const userDetail = req.session.userDetail;

    const listName = req.body.listTitle;
    const newItem = req.body.new_note;

    // query to delete a particular or specific listTile object by its name
    await MainFormate.updateOne({ _id: Number(userDetail.sub), "main.name": listName }, { $push: { "main.$.listData": { "name": newItem } } }); // Push the new object into the listData array

    res.redirect("/" + listName)

});

app.post("/delete", async (req, res) => {

    // get data from session state
    const userDetail = req.session.userDetail;

    const itemId = req.body.delete;
    const listName = req.body.listTitle;

    // query to delete a particular or specific listTile object by its name
    await MainFormate.updateOne({ _id: Number(userDetail.sub), "main.name": listName }, { $pull: { "main.$.listData": { _id: itemId } } }); // Pull the object by its _id

    res.redirect("/" + listName);

});

app.post("/deleteOneList", async (req, res) => {

    // get data from session state
    const userDetail = req.session.userDetail;

    const listName = req.body.listName;

    // check if listTitle is NOT selected "Todo list" which comes to delete
    if (listName !== "Todo list") {

        // query to delete a particular or specific listTile object by its name
        await MainFormate.updateOne({ _id: Number(userDetail.sub) }, { $pull: { "main": { name: listName } } });

        // check if listTitle which is selected is equal to "Todo list"
    } else if (listName === "Todo list") {

        // query to delete a all the items of "Todo list" object by its name
        await MainFormate.updateOne({ _id: Number(userDetail.sub) }, { $pull: { "main.0.listData": { name: { $ne: "..." } } } });
    }

    res.redirect("/");

})

app.post("/deleteAll", async (req, res) => {

    // get data from session state
    const userDetail = req.session.userDetail;

    const searchQuery = req.body.deleteAll;

    // check to confirm from client side to delete All listTiltes
    if (searchQuery === "delete") {

        // query to delete a all the listTiles of document instead of one "Todo list"
        await MainFormate.updateOne({ _id: Number(userDetail.sub) }, { $pull: { main: { name: { $ne: "Todo list" } } } }); // Remove elements with a name other than "Todo list"

        // query to delete a all the items of "Todo list" object instead of one object which is first containg Date and time
        await MainFormate.updateOne({ _id: Number(userDetail.sub) }, { $pull: { "main.0.listData": { name: { $ne: "..." } } } });


        res.redirect("/");
    }
})


app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})





// {_id: 101,
//     main: [{
//         name: 'First List Option Number 1',
//         listData: [
//             { name: 'item1', savedDate: 'item1Date', savedTime: 'item1Time' },
//             { name: 'item2', savedDate: 'item2Date', savedTime: 'item2Time' },
//             { name: 'item3', savedDate: 'item3Date', savedTime: 'item3Time' },
//             { name: 'item4', savedDate: 'item4Date', savedTime: 'item4Time' },
//             { name: 'item5', savedDate: 'item1Date', savedTime: 'item5Time' }
//         ]
//     }]},
//     {_id: 102,
//         main: [{
//             name: 'Second List Option Number 2',
//             listData: [
//                 { name: 'item1', savedDate: 'item1Date', savedTime: 'item1Time' },
//                 { name: 'item2', savedDate: 'item2Date', savedTime: 'item2Time' }
//             ]
//         }]},
//         {_id: 103,
//             main: [{
//                 name: 'Third List Option Number 3',
//                 listData: [
//                     { name: 'item1', savedDate: 'item1Date', savedTime: 'item1Time' },
//                     { name: 'item2', savedDate: 'item2Date', savedTime: 'item2Time' },
//                     { name: 'item3', savedDate: 'item3Date', savedTime: 'item3Time' }
//                 ]
//             }]},
//             {_id: 104,
//                 main: [{
//                     name: 'Fourth List Option Number 4',
//                     listData: [
//                         { name: 'item1', savedDate: 'item1Date', savedTime: 'item1Time' },
//                         { name: 'item2', savedDate: 'item2Date', savedTime: 'item2Time' },
//                         { name: 'item3', savedDate: 'item3Date', savedTime: 'item3Time' },
//                         { name: 'item4', savedDate: 'item4Date', savedTime: 'item4Time' }
//                     ]
//                 }]}

