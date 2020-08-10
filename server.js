const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const moment = require("moment");
const path = require("path");
const serveStatic = require("serve-static");

const app = express();
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(cors());
// serve static files from whatever our root directory is
app.use(serveStatic(__dirname + "/dist"));

const mongodb_conn_module = require("./mongodbConnModule");
var db = mongodb_conn_module.connect();

const Transaction = require("./transaction"); // change to const and see what happens
let oneMonthAgo = moment().subtract(1, "month").startOf("day").toISOString();
let sevenDaysAgo = moment().subtract(7, "days").startOf("day").toISOString();
let yesterdayDate = moment().subtract(1, "days").startOf("day").toISOString();
let todayDate = moment().startOf("day").toISOString();

app.get("/", async (req, res) => {
  const {
    filter,
    bankId, // add the bank ID to url if i click on the bank ?filter='7 days'&bankId=823
  } = req.query;
  let query = {};
  console.log("inside overview \n");
  // get query and filter parameters
  if (filter) {
    switch (filter) {
      case "today":
        query = {
          date: {
            $gt: todayDate,
          },
        };
        break;

      case "yesterday":
        query = {
          date: {
            $gt: yesterdayDate,
          },
        };
        break;

      case "week":
        query = {
          date: {
            $gt: sevenDaysAgo,
          },
        };
        break;

      case "month":
        query = {
          date: {
            $gt: oneMonthAgo,
          },
        };
        break;

      case "all":
        query = {};
        break;
      default:
        query = {
          date: {
            $gt: todayDate,
          },
        };
        break;
    }
  } else {
    query = {
      date: {
        $gt: todayDate,
      },
    };
  }
  if (bankId) {
    query.account = bankId;
  }

  // // get all transactions
  // let allTransactions = await Transaction.find(query, function (
  //   error,
  //   transactions
  // ) {
  //   if (error) {
  //     console.log(error);
  //   }
  // });

  // get credit transactions
  query.type = "credit";
  let creditTrans = await Transaction.find(query, function (
    error,
    transactions
  ) {
    if (error) {
      console.log(error);
    }
  });

  // get debit transactions
  query.type = "debit";
  let debitTrans = await Transaction.find(query, function (
    error,
    transactions
  ) {
    if (error) {
      console.log(error);
    }
  });

  // calculate total credit and debit amounts
  let creditAmount = 0;
  let debitAmount = 0;
  if (creditTrans.length > 0) {
    creditAmount = creditTrans
      .reduce((previous, current) => {
        return previous + current.amount;
      }, 0)
      .toFixed(2);
  }

  if (debitTrans.length > 0) {
    let dA = debitTrans.reduce((previous, current) => {
      return previous + current.amount;
    }, 0);
    let dC = debitTrans.reduce((previous, current) => {
      return previous + current.commission;
    }, 0);
    debitAmount = (dA + dC).toFixed(2);
  }

  res.send({
    transactions: {
      payments: debitAmount,
      earnings: creditAmount,
      paymentsTransactions: debitTrans,
      earningsTransactions: creditTrans
    },
  });
});

// app.get('/:id', (req, res) => {
// 	console.log("yo checknig me \n")
// 	var db = req.db;
// 	Transaction.findById(req.params.id, function (error, transaction) {
// 	  if (error) { console.error(transaction); }
// 	  res.send(transaction);
// 	})
// })




// app.get('/posts', (req, res) => {
//   Post.find({}, 'title description', function (error, posts) {
// 	  if (error) { console.error(error); }
// 	  res.send({
// 			posts: posts
// 		})
// 	}).sort({_id:-1})
// })

// app.post('/add_post', (req, res) => {
// 	var db = req.db;
// 	var title = req.body.title;
// 	var description = req.body.description;
// 	var new_post = new Post({
// 		title: title,
// 		description: description
// 	})

// 	new_post.save(function (error) {
// 		if (error) {
// 			console.log(error)
// 		}
// 		res.send({
// 			success: true
// 		})
// 	})
// })

// app.put('/posts/:id', (req, res) => {
// 	var db = req.db;
// 	Post.findById(req.params.id, 'title description', function (error, post) {
// 	  if (error) { console.error(error); }

// 	  post.title = req.body.title
// 	  post.description = req.body.description
// 	  post.save(function (error) {
// 			if (error) {
// 				console.log(error)
// 			}
// 			res.send({
// 				success: true
// 			})
// 		})
// 	})
// })

// app.delete('/posts/:id', (req, res) => {
// 	var db = req.db;
// 	Post.remove({
// 		_id: req.params.id
// 	}, function(err, post){
// 		if (err)
// 			res.send(err)
// 		res.send({
// 			success: true
// 		})
// 	})
// })

// app.get('/post/:id', (req, res) => {
// 	var db = req.db;
// 	Post.findById(req.params.id, 'title description', function (error, post) {
// 	  if (error) { console.error(error); }
// 	  res.send(post)
// 	})
// })
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("app.js server is live on port: ", port);
});
