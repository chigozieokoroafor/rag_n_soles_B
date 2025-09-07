const express = require("express")
const cors = require("cors")
const { errorHandler } = require("./src/errorHandler/errorHandler")
const { success, notFound } = require("./src/errorHandler/statusCodes")
const { sync } = require("./src/db/sync")
// const { createDatabaseIfNotExists } = require("./src/db/base")
const { baseRouter } = require("./src/routes/baseRouter")
const { adminRouter } = require("./src/routes/adminRouter")
const { createAdmin } = require("./src/db/querys/admin")

// const compression = require("compression")


const app = express()

app.use(cors(
    {
        origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "https://rags-and-soles.netlify.app", "https://rags-n-soles.vercel.app"]
    }
))

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.use("/api", baseRouter)
app.use("/admin", adminRouter)

app.use("/", (req, res) => {
    console.log(req.url)
    return notFound(res, `Path not found : ${req.url}`)
    // (res, {}, `Welcome to TekNova. Kindly note path specified not found {} `)
})


app.use(errorHandler)

const port = process.env.PORT ?? 9500

// createDatabaseIfNotExists().then(() => {
sync().then(() => {
    createAdmin().then(() => {
        app.listen(port, () => {
            console.log("running:::", port)
        })
    }
    ).catch((error) => {
        console.log("unable to create admin")
        console.log(error)
    })
}).catch((error) => {
    console.log("unable to sync")
    console.log(error)
})
// }).catch((db_create_error) => {
//     console.log("unable to createDb:::")
//     console.log(db_create_error)
// })