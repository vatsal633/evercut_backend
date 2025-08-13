import Booking from "../models/Booking.model.js"

export const getUpcommingBookings = async (date, userId) => {
    let bookings = []

    //getting todays date
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)

    //fetching future day bookings
    if (date > todayStr) {
        bookings = await Booking.find({
            userId: userId,
            date: date
        }).lean()
    }

    //fetching current day bookings after current time
    else if (date == todayStr) {

        const todayBookings = await Booking.find({
            date: todayStr
        }).lean()

        const currentMinutes = now.getHours() * 60 + now.getMinutes()


        bookings = todayBookings.filter(b => {
            if (!b.time) return false

            const [timePart, ampm] = b.time.split(' ')
            const [hoursStr, minutesStr] = timePart.split(":")

            let hours = parseInt(hoursStr, 10)
            const minutes = parseInt(minutesStr, 10)

            if (ampm === 'PM' && hours !== 12) hours += 12
            if (ampm === 'AM' && hours === 12) hours = 0

            const bookingMinutes = hours * 60 + minutes

            return bookingMinutes > currentMinutes
        })

    }

    return bookings
}