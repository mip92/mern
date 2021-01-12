let express = require('express');
let router = express.Router();
module.exports = router;
let {check, validationResult} = require('express-validator');
const config = require('config');
let jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require("../models/User");


///api/auth/register
router.post('/register',
    [
        check('email', 'Некорректный email').isEmail(),
        check('password', "Минимальная длина пароля 6 символов")
            .isLength({min: 6})
    ],
    async (req, res) => {
        try {
            //console.log("body", req.body)
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "password или email не удовлетворяют требованиям",
                })
            }
            const {email, password} = req.body
            const candidate = await User.findOne({email})
            if (candidate) {
                return res.status(400).json({message: "Пользователь с таким email уже зарегестрирован"})
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            const user = new User({
                email,
                password: hashedPassword
            })
            await user.save()
            res.status(201).json({message: "Пользователь создан успешно"})

        } catch (e) {
            res.status(500).json({message: "Что-то пошло не так, попробуйте сделать иначе"})
        }
    })

///api/auth/login
router.post('/login',
    [
        check('email', 'Введит коректный email').normalizeEmail().isEmail(),
        check('password', 'введите пароль').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "проверьте password или email",
                })
            }
            const {email, password} = req.body;
            const user = await User.findOne({email})
            if (!user) {
                return res.status(400).json({
                    message: "Пользователь с таким email не зарегестрирован",
                })
            }
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).json({
                    message: "Пароль неверный, попробуйте снова",
                })
            }
            const token = jwt.sign({userId:user.id},
                config.get('jwtSecret'),
                {expiresIn: '1h'}
                )
            res.json({token, userId: user.id})
        } catch (e) {
            res.status(500).json({message: "Что-то пошло не так, попробуйте сделать иначе"})
        }
    })


