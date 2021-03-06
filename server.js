const express = require('express')
const app = express()
const bodyParser = require('body-parser');
//const port = process.env.PORT || 3000
const { body, validationResult } = require('express-validator');

// Set the view engine for the express app
app.set("view engine", "pug")

// For parsing application/json
app.use(bodyParser.json());

// For parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
//form-urlencoded

// Database Connection
const Pool = require('pg').Pool

var connectionParams = null;

/* istanbul ignore if */
if (process.env.DATABASE_URL != null) {
	connectionParams = {
		connectionString: process.env.DATABASE_URL,
		ssl: { rejectUnauthorized: false }
	}
} else {
	connectionParams = {
		user: 'api_user',
		host: 'localhost',
		database: 'api',
		password: 'password',
		port: 5432
	}
}
console.log(connectionParams)
const pool = new Pool(connectionParams)


// App Controls
app.get('/', (req, res) => {

    console.log('Accept: ' + req.get('Accept'))

    pool.query('SELECT VERSION()', (err, version_results) => {
      console.log(err, version_results.rows)

      pool.query('SELECT * FROM team_members', (err, team_members_results) => {
	console.log(err, team_members_results)

	res.render('index', {
			      teamNumber: 4,
			      databaseVersion: version_results.rows[0].version,
			      teamMembers: team_members_results.rows
			    })

      console.log('Content-Type: ' + res.get('Content-Type'))
    })
  })
})

app.post('/', 
	body('first_name')
		.isAlpha()
		.isLength({ min: 1 })
		.withMessage('must be valid'),
	body('last_name')
		.isAlpha()
		.isLength({ min: 1 })
		.withMessage('must be valid'),
	(req, res) => {

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).send({ errors: errors.array() });
		}

		pool.query(`INSERT INTO team_members (first_name, last_name) VALUES ('${req.body.first_name}', '${req.body.last_name}')`, (err, result) => {

			console.log(err, result)

		res.redirect('/')
		})

	})

module.exports = app;