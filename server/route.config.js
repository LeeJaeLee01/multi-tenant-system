import router from "../routers/index.js"

export default function (app) {
    app.use('/api', router);
}