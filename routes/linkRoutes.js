let express = require('express');
let router = express.Router();
module.exports = router;
const config = require('config');
const shortid = require("shortid")

const Link = require("../models/Link");
let auth = require('../middlware/authMiddlware');

router.post('/generate', [auth],
    async (req, res) => {
        try {

            const baseUrl = config.get('baseURL');
            const {from} = req.body;
            const code = shortid.generate();
            const existing = await Link.findOne({from});
            if (existing) {
                return res.status(500).json({link: existing, message: "эта ссылка уже есть в базе данных"})
                //return res.jsom({link: existing, /*message: "эта ссылка уже естьв базе данных"*/})
            }
            const to = baseUrl + '/t/' + code;
            const link = new Link({
                    from, to, code, owner: req.user.userId
                }
            )
            await link.save()
            res.status(201).json({link})

        } catch (e) {
            console.log(e.message)
            res.status(500).json({message: "Что-то пошло не так, попробуйте сделать иначе"})
        }
    }
)

router.get('/', auth,
    async (req, res) => {
        try {
            const links = await Link.find({owner: req.user.userId})
            res.json(links)
        } catch (e) {
            res.status(500).json({message: "Что-то пошло не так, попробуйте сделать иначе"})
        }
    }
)

router.get('/:id', auth,
    async (req, res) => {
        try {
            const link = await Link.findById(req.params.id)
            res.json(link)
        } catch (e) {
            res.status(500).json({message: "Что-то пошло не так, попробуйте сделать иначе"})
        }
    }
)