const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal than 40 characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        // required: [true, 'A tour must have a image cover']
    },
    image: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        //longitude and latitude
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    //Step 1: make a reference of the other table
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},
    {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
    }
);

//Virtual properties
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
})

//Virtual populate, want to get the review of a tour through getTour in tourController
//Reference: the model: Review, foreignField: the outside field in the model
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

//Document middleware: runs before .save() and .create()
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true});
    next();
})
//tourSchema.post()

//Query middleware, the method starting with "find", like findOne
tourSchema.pre(/^find/, function(next) {
    this.find({secretTour: {$ne: true}});
    this.start = Date.now();
    next();
})

//Aggregation middleware
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { secretTour: {$ne: true} } });
    console.log(this.pipeline());
    next();
})

//Step2: populate the table with the field
tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    next();
})

//calculate the time to do the query
tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;