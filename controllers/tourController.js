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
exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        // results: tours.length,
        // data: {
        //     tours: tours
        // }
    })
}

exports.getTour = (req, res) => {
    console.log(req.params);

    res.status(200).json({
        status: 'success',
        // data: {
        //     tours
        // }
    })
};

exports.createTour = async (req, res) => {
    try{
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

exports.changeTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            tour: "<Updating...>"
        }
    })
};

exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: 'success',
        data: null
    })
}
