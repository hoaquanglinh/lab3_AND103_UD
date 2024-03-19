const express = require('express');
const mongoose = require('mongoose');
const Fruits = require('./model/fruits');
const Upload = require('./config/common/upload')
const Users = require('./model/user')
const transporter = require('./config/common/mail');
const app = express();
const port = 3000

// app.use(express.urlencoded())
app.use(express.json());

app.listen(port, () => {
    console.log(`Server đang chạy ở cổng ${port}`)
})

const uri = 'mongodb+srv://slide3:123@sanphams.9silvsv.mongodb.net/Lab'

app.get('/list-fruit', async (req, res) => {
    try {
        await mongoose.connect(uri);
        let fruit = await Fruits.find();
        res.json({
            "status": "200",
            "messenger": "Danh sách fruit",
            "data": fruit
        })
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        res.status(500).send('Lỗi máy chủ nội bộ');
    }
})

app.get('/list-fruit-by-id/:id', async (req, res) => {
    try {
        await mongoose.connect(uri);
        const id = req.params.id
        let data = await Fruits.findById(id).populate('id_distributor');
        res.json({
            "status": "200",
            "messenger": "Danh sách fruit",
            "data": data
        })
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        res.status(500).send('Lỗi máy chủ nội bộ');
    }
})

app.get('/list-fruit-in-price', async (req, res) => {
    try {
        await mongoose.connect(uri);
        const { price_start, price_end } = req.query

        const query = { price: { $gte: price_start, $lte: price_end } }

        const data = await Fruits.find(query, 'name quantity price id_distributor')
            .populate('id_distributor')
            .sort({ quantity: -1 })
            .skip(0)
            .limit(2)

        res.json({
            "status": "200",
            "messenger": "Danh sách fruit",
            "data": data
        })
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        res.status(500).send('Lỗi máy chủ nội bộ');
    }
})

app.get('/list-fruit-by-char', async (req, res) => {
    try {
        await mongoose.connect(uri);
        const query = {
            $or: [
                { name: { $regex: "B" } },
                { name: { $regex: "C" } },
            ]
        }

        const data = await Fruits.find(query, 'name quantity price id_distributor')
            .populate('id_distributor')

        res.json({
            "status": "200",
            "messenger": "Danh sách fruit",
            "data": data
        })
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        res.status(500).send('Lỗi máy chủ nội bộ');
    }
})

app.post('/add-fruit', async (req, res) => {
    await mongoose.connect(uri);
    try {
        const data = req.body;

        const newFruit = new Fruits({
            name: data.name,
            quantity: data.quantity,
            price: data.price,
            status: data.status,
            image: data.image,
            description: data.description,
            id_distributor: data.id_distributor
        })

        const result = await newFruit.save()

        if (result) {
            res.json({
                "status": "200",
                "messenger": "Thêm thành công",
                "data": result,
            });
        } else {
            res.json({
                "status": "400",
                "messenger": "Lỗi, thêm không thành công",
                "data": [],
            });
        }
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        res.status(500).send('Lỗi máy chủ nội bộ');
    }
});

app.delete('/delete-fruit/:id', async (req, res) => {
    try {
        await mongoose.connect(uri);

        let id = req.params.id;
        let result = await Fruits.deleteOne({ _id: id });

        if (result) {
            res.json({
                "status": 200,
                "messenger": "Xóa thành công",
                "data": result
            });
        } else {
            res.json({
                "status": 400,
                "messenger": "Lỗi, xóa không thành công",
                "data": []
            });
        }
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        res.status(500).send('Lỗi máy chủ nội bộ');
    }
});

app.put('/update-fruit/:id', async (req, res) => {
    try {
        await mongoose.connect(uri);

        const id = req.params.id;
        const data = req.body;

        const updateFruit = await Fruits.findByIdAndUpdate(id, data, { new: true });

        if (!updateFruit) {
            return res.status(404).send('Sản phẩm không tồn tại');
        }

        res.json({
            "status": 200,
            "messenger": "Cập nhật thành công",
            "data": updateFruit
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        res.status(500).send('Lỗi máy chủ nội bộ');
    }
});

app.post('/upload-image', Upload.array('image', 5), async (req, res) => {
    await mongoose.connect(uri);

    try {
        const data = req.body;
        const files = req.files;

        console.log(JSON.stringify(data));

        const urlImages = files.map(file => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`);

        const newFruits = new Fruits({
            name: data.name,
            quantity: data.quantity,
            price: data.price,
            status: data.status,
            image: urlImages,
            description: data.description,
            id_distributor: data.id_distributor
        });

        const result = await newFruits.save();

        if (result) {
            res.json({
                "status": "200",
                "messenger": "Thêm thành công",
                "data": result,
            });
        } else {
            res.json({
                "status": "400",
                "messenger": "Lỗi, thêm không thành công",
                "data": [],
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "status": "500",
            "messenger": "Lỗi máy chủ nội bộ",
            "data": [],
        });
    }
});

// gui mail
// app.post('/register', Upload.single('avatar'), async(req,res) => {
//     await mongoose.connect(uri);
//     try {
//         const data = req.body;
//         const file = req.file;
//         const newUser = Users({
//             username: data.username,
//             password: data.password,
//             name: data.name,
//             email: data.email,
//             avatar: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
//         })
//         const result = await newUser.save()
//         if(result){
//             const mailOptions ={
//                 from : "linhhqph43159@gmail.com", //email gửi đi
//                 to : result.email, //email nhận
//                 subject : "Đăng ký thành công", //subject
//                 text : "Cảm ơn bạn đã đăng ký.", //nội dung mail
//              }

//              await transporter.sendMail(mailOptions);  //gửi mail

//              res.json({
//                  "status" : 200,
//                  "messenger" : "Thành thành công",
//                  "data" : result
//              })
//          }else{
//               res.json({
//                   "status" : 400,
//                   "messenger" :"Lỗi ,thêm không thành công",
//                   "data": []
//               })
//           }
//       } catch (error) {
//           console.log(error);
//       }
// })
