"use strict";

/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           ORDER BY last_name, first_name`
    );
    return results.rows.map((c) => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers
           WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** get top 10 customers by most reservations */

  static async getTop10() {
    const cusResults = await db.query(
      `SELECT id,
                  first_name AS "firstName",
                  last_name  AS "lastName",
                  phone,
                  notes
           FROM customers`
    );
    console.log(cusResults)

    const resResults = await db.query(
      `SELECT customer_id, count(*)
      FROM reservations
      GROUP BY customer_id
      ORDER BY count(*) DESC
      LIMIT 10`
    );

    const reservations = resResults.rows
    console.log("class reservations:", reservations)

    return reservations

    // for (let r of reservations) {

    // }

    // [{customer_id: 54, count:6},{customer_id} ]

    // customer.reservations = reservations
    // return results.rows.map((c) => new Customer(c));
  }

  /** search for customer by name */

  static async searchByName(firstName, lastName = "") {
    let customer = undefined;
    if (firstName && lastName) {
      const results = await db.query(
        `SELECT id,
                    first_name AS "firstName",
                    last_name  AS "lastName",
                    phone,
                    notes
            FROM customers
            WHERE LOWER(first_name) = $1
            AND LOWER(last_name) = $2`,
        [firstName.toLowerCase(), lastName.toLowerCase()]
      );
      customer = results.rows[0];
    } else {
      const results = await db.query(
        `SELECT id,
                    first_name AS "firstName",
                    last_name  AS "lastName",
                    phone,
                    notes
            FROM customers
            WHERE LOWER(first_name) = $1
            OR LOWER(last_name) = $1`,
        [firstName.toLowerCase()]
      );
      customer = results.rows;
      return customer;
    }

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** make full name */
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers
             SET first_name=$1,
                 last_name=$2,
                 phone=$3,
                 notes=$4
             WHERE id = $5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }
}

module.exports = Customer;
