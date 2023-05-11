// eventController.js

const Event = require('../models/event');

// Create a new event
exports.createEvent = async (req, res, next) => {
  try {
    const { title, start, end } = req.body;

    // Create a new event object
    const event = new Event({
      title,
      start,
      end
    });

    // Save the event to the database
    await event.save();

    // Send a response to the client
   // res.status(201).json({ success: true, event });
   res.redirect('/')
  } catch (error) {
    next(error);
  }
};




