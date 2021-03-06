"use strict";

/** Routes for Lunchly */

const express = require("express");

const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

const router = new express.Router();

/** Homepage: show list of customers. */

router.get("/", async function (req, res, next) {
  const customers = await Customer.all();
  return res.render("customer_list.html", { customers });
});

/** Form to add a new customer. */

router.get("/add/", async function (req, res, next) {
  return res.render("customer_new_form.html");
});

/** Handle adding a new customer. */

router.post("/add/", async function (req, res, next) {
  const { firstName, lastName, phone, notes } = req.body;
  const customer = new Customer({ firstName, lastName, phone, notes });
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

router.get("/top10/", async function (req, res, next) {
  let customers = await Customer.getTop10();

  return res.render("top_10.html", { customers });
});

/** Show a customer, given their ID. */
router.get("/reservations/:resid/edit", async function (req, res, next) {
  const reservation = await Reservation.getReservation(req.params.resid);
  return res.render("reservation_edit_form.html", { reservation });
});

router.get("/:id/", async function (req, res, next) {
  if (!parseInt(req.params.id)) {
    //throw a 404 error
  }

  const customer = await Customer.get(req.params.id);

  const reservations = await customer.getReservations();

  return res.render("customer_detail.html", { customer, reservations });
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  res.render("customer_edit_form.html", { customer });
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);
  customer.firstName = req.body.firstName;
  customer.lastName = req.body.lastName;
  customer.phone = req.body.phone;
  customer.notes = req.body.notes;
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function (req, res, next) {
  const customerId = req.params.id;
  const startAt = new Date(req.body.startAt);
  const numGuests = req.body.numGuests;
  const notes = req.body.notes;

  const reservation = new Reservation({
    customerId,
    startAt,
    numGuests,
    notes,
  });
  await reservation.save();

  return res.redirect(`/${customerId}/`);
});

router.post("/search", async function (req, res, next) {
  const searchName = req.body.searchName;
  const fullName = searchName.split(" ");
  const firstName = fullName[0];
  const lastName = fullName[1];

  let customer = await Customer.searchByName(firstName, lastName);
  if (Array.isArray(customer)) {
    return res.render("searchCustomers.html", { customer });
  }
  let customerId = customer.id;
  if (customerId) {
    return res.redirect(`/${customerId}/`);
  }
});

module.exports = router;
