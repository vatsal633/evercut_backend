import mongoose from "mongoose";


const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",    
      
    },

    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services",
        
    },
    
    salonist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },

    shopId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"BarberSetup",
        required:true,
    },

    date: {
        type: Date,
        required: true
    },

    time: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        default: 0
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }



}, { timestamps: true })

const Booking = mongoose.model("Booking", bookingSchema)
export default Booking