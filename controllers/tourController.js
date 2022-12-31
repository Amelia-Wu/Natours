// const fs = require('fs');
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

// //Param middleware
// exports.checkID = (req, res, next, val) => {
//     console.log(`Tour ID is: ${val}`);
//
//     //convert the string(id) to number
//     const id = req.params.id * 1;
//     //if the tour does not exist
//     if(id > tours.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID'
//         });
//     }
//     next();
// }

const Tour = require('./../models/tourModel');

//Route Handlers
exports.getAllTours = async (req, res) => {
    try {
        const tours = await Tour.find();
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        //Tour.findOne({ _id: req.params.id })

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
};

exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
};

exports.changeTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    } catch (err) {

    }
};

exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: 'success',
        data: null
    })
}
