const mongoose = require('mongoose');

const runCronTasks = async () => {
  try {
    // Task 1: Health Check
    const comp = require('../model/index'); 
    await comp.Test.find({});
    console.log("System is healthy 💪💪💪");

    // Task 2: Update Overdue Borrows
    const now = new Date();
    const result = await comp.Borrow.updateMany(
      { status: 'borrowed', endTime: { $lt: now } },
      { $set: { status: 'late' } }
    );
    if (result.nModified > 0) {
      console.log(`Updated ${result.nModified} overdue borrow records to 'late' at ${now}`);
    } 
  } catch (error) {
    console.error('Error in cron tasks:', error);
    console.log("System is broken 😰😰😰");
  }
};

module.exports = { runCronTasks };