import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import cors from 'cors'
import helmet from 'helmet'

import userRoutes from './routes/user.routes'
import authRoutes from './routes/auth.routes'

import React from 'react'
import ReactDOMServer from 'react-dom/server'
import MainRouter from './../client/MainRouter'
import { StaticRouter } from 'react-router-dom'
import { ServerStyleSheets, ThemeProvider } from '@material-ui/styles'
import theme from './../client/theme'

// Comment out to build for production
import devBundle from './devBundle'

const app = express()

// Comment out to build for production
devBundle.compile(app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(compress())
app.use(helmet())
app.use(cors())

import path from 'path'
const CURRENT_WORKING_DIR = process.cwd()
app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')))

import Template from './../template'

app.get('*', (req, res) => {
	const sheets = new ServerStyleSheets()
	const context = {}
	const markup = ReactDOMServer.renderToString(
	  sheets.collect(
			<StaticRouter location={req.url} context={context}>
			  <ThemeProvider theme={theme}>
				<MainRouter />
			  </ThemeProvider>
			</StaticRouter>
		  )
	  )
	  if (context.url) {
		return res.redirect(303, context.url)
	  }
	  const css = sheets.toString()
	  res.status(200).send(Template({
		markup: markup,
		css: css
	  }))
  })

app.use('/', userRoutes)
app.use('/', authRoutes)

app.use((err, req, res, next) => {
	if (err.name === 'UnauthorizedError') {
		res.status(401).json({"error" : err.name + ": " + err.message})
	} else if (err) {
		res.status(400).json({"error" : err.name + ": " + err.message})
		console.log(err)
	}
})

export default app
