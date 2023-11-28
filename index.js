const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000


require("dotenv").config()

const app = express()

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h1i8cb8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {

    const usersCollection = client.db("parcelDB").collection("users")
    const bookingsCollection = client.db("parcelDB").collection("bookings")
    const featuresCollection = client.db("parcelDB").collection("features")
    const reviewsCollection = client.db("parcelDB").collection("reviews")



    // user related api
    app.post('/users', async (req, res) => {
      try {
        const newUser = req.body
        const query = { email: newUser.email }
        console.log(newUser);
        const existingUser = await usersCollection.findOne(query)
        if (existingUser) {
          return res.send({ message: 'User already exist', insertedId: null })
        }
        const result = await usersCollection.insertOne(newUser)
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })

    app.get('/users', async (req, res) => {
      try {
        const role = req.query.role
        // const page = parseInt(req.query.page);
        // const size = parseInt(req.query.size);
        const query = {}
        if (role) {
          query.role = role;
        }
        const cursor = usersCollection.find(query)
        // .skip((page - 1) * size)
        // .limit(size)
        const result = await cursor.toArray()
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })

    app.get('/sortedDeliveryMan', async (req, res) => {
      try {
        const deliveryMan = await usersCollection.find({ role: 'delivery-man' }).sort({ fieldNameToSort: 1 }).toArray();
        res.send(deliveryMan)
      }
      catch (err) {
        console.log(err);
      }
    })

    app.get('/sortedUsers', async (req, res) => {
      try {
        const allUser = await usersCollection.find({ role: 'user' }).sort({ fieldNameToSort: 1 }).toArray();
        res.send(allUser)
      }
      catch (err) {
        console.log(err);
      }
    })
    app.get('/sortedUsersWithPage', async (req, res) => {
      try {
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);
        const cursor = usersCollection.find({ role: 'user' }).sort({ fieldNameToSort: 1 })
          .skip((page - 1) * size)
          .limit(size)
        const result = await cursor
          .toArray();
        console.log(('page', page, 'size', size, 'result', result));
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })

    app.get('/users/:id', async (req, res) => {
      try {
        const id = req.params.id
        console.log(id);
        const query = {
          _id: new ObjectId(id)
        }
        const result = await usersCollection.findOne(query)
        console.log(result);
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })

    app.patch('/users/:id', async (req, res) => {
      try {
        const userInfo = req.body
        const id = req.params.id
        const filter = {
          _id: new ObjectId(id)
        }
        const updatedUserInfo = {
          $set: {
            email: userInfo.email,
            name: userInfo.name,
            role: userInfo.role,
            number: userInfo.number,
          }
        }
        const result = await usersCollection.updateOne(filter, updatedUserInfo)
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })

    // reviews
    app.post('/reviews', async (req, res) => {
      try {
        const review = req.body
        const result = await reviewsCollection.insertOne(review)
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })
    app.get('/reviews', async (req, res) => {
      try {
        // const result = await reviewsCollection.find().toArray()
        // res.send(result)
        const email = req.query.email
        let query = { email: email }

        // Find the user with the given email
        const user = await usersCollection.findOne({ email: email });
        // console.log(user);

        if (!user) {
          return res.status(404).json({ message: 'No Parcel Assigned' });
        }

        // Find bookings where assignedMan matches user's name
        const bookings = await bookingsCollection.findOne({ assignedMan: user.name });
        // console.log(bookings);
        // find the assigned man who is reviewed
        const reviews = await reviewsCollection.find({ dmId: bookings.dmId }).toArray();
        console.log(reviews);

        res.send(reviews);

      }
      catch (err) {
        console.log(err);
      }
    })


    //  pagination
    app.get('/usersCount', async (req, res) => {
      const count = await usersCollection.countDocuments({ role: 'user' });
      res.send({ count })
    })


    // featured item
    app.get('/features', async (req, res) => {
      try {
        const result = await featuresCollection.find().toArray()
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })

    // booking related api
    app.post('/bookings', async (req, res) => {
      try {
        const bookingInfo = req.body
        console.log(bookingInfo);
        const result = await bookingsCollection.insertOne(bookingInfo)
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })
    // app.get('/bookings', async (req, res) => {
    //   try {
    //     const startDate = (req.query.startDate);
    //     const endDate = (req.query.endDate);
    //     const status = (req.query.status);
    //     const email = req.query.email
    //     console.log(email);
    //     let query = {}
    //     // if (email) {
    //     //   query = { email: email };
    //     // }
    //     if (email) {
    //       query = { email: email };
    //       const result = await bookingsCollection.find(query).toArray();
    //       if (result) {
    //         res.send(result);
    //       } else {
    //         const result = await bookingsCollection.findOne(query);
    //         res.send([]);
    //       }
    //     } else {
    //       // If email is not provided, find multiple documents
    //       const result = await bookingsCollection.findOne(query);
    //     }
    //     if (status) {
    //       query = { status: status }
    //     }
    //     if (startDate && endDate) {
    //       query = {
    //         deliveryDate: {
    //           $gte: startDate,
    //           $lte: endDate,
    //         },
    //       };
    //     }
    //     const result = await bookingsCollection.find(query).toArray()
    //     console.log(result);
    //     res.send(result)
    //   }
    //   catch (err) {
    //     console.log(err);
    //   }
    // })

    // getting booked item by email

    app.get('/bookings', async (req, res) => {
      try {
        const startDate = (req.query.startDate);
        const endDate = (req.query.endDate);
        const status = (req.query.status);
        const email = req.query.email
        console.log(email);
        let query = {}
        if (email) {
          query = { email: email };
        }
        if (status) {
          query = { status: status }
        }
        if (startDate && endDate) {
          query = {
            deliveryDate: {
              $gte: startDate,
              $lte: endDate,
            },
          };
        }
        const result = await bookingsCollection.find(query).toArray()
        console.log(result);
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })

    app.get('/bookingsForChart', async (req, res) => {
      try {
        const result = await bookingsCollection.aggregate([
          {
            $group: {
              _id: '$bookingDate',
              bookingCount: { $sum: 1 }
            }
          },
          {
            $sort: {
              _id: 1
            }
          }
        ]).toArray()

        const results = await bookingsCollection.aggregate([
          {
            $group: {
              _id: '$bookingDate',
              bookingCount: { $sum: 1 }
            }
          },
          {
            $sort: {
              _id: 1
            }
          }
        ]).toArray()
        console.log(result);
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })

    app.get('/bookings/:id', async (req, res) => {
      try {
        const id = req.params.id
        console.log(id);
        const query = {
          _id: new ObjectId(id)
        }
        const result = await bookingsCollection.findOne(query)
        console.log(result);
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })

    app.patch('/bookings/:id', async (req, res) => {
      try {
        const updatedBookingInfo = req.body
        const query = {
          assignedMan: updatedBookingInfo.assignedMan,
        }
        console.log('from form', updatedBookingInfo.dmId);
        console.log("query", query);
        const existingMan = await bookingsCollection.findOne(query)
        console.log("DeliveryMan from db", existingMan);
        if (!existingMan) {
          const id = req.params.id
          const filter = {
            _id: new ObjectId(id)
          }
          const updatedBooking = {
            $set: {
              address: updatedBookingInfo.address,
              deliveryDate: updatedBookingInfo.deliveryDate,
              bookingDate: updatedBookingInfo.bookingDate,
              latitude: updatedBookingInfo.latitude,
              longitude: updatedBookingInfo.longitude,
              phone: updatedBookingInfo.phone,
              price: updatedBookingInfo.price,
              receiversName: updatedBookingInfo.receiversName,
              receiversPhone: updatedBookingInfo.receiversPhone,
              type: updatedBookingInfo.type,
              weight: updatedBookingInfo.weight,
              status: updatedBookingInfo.status,
              departureDate: updatedBookingInfo.departureDate,
              dmId: updatedBookingInfo.dmId,
              assignedMan: updatedBookingInfo.assignedMan,
            }
          }
          const result = await bookingsCollection.updateOne(filter, updatedBooking)
          res.send(result)
        }
        else if (existingMan?.dmId !== updatedBookingInfo?.dmId) {
          return res.send({ message: 'dmId already exist', insertedId: null, dmId: existingMan.dmId })
        }
        else {
          const id = req.params.id
          const filter = {
            _id: new ObjectId(id)
          }
          const updatedBooking = {
            $set: {
              address: updatedBookingInfo.address,
              deliveryDate: updatedBookingInfo.deliveryDate,
              bookingDate: updatedBookingInfo.bookingDate,
              latitude: updatedBookingInfo.latitude,
              longitude: updatedBookingInfo.longitude,
              phone: updatedBookingInfo.phone,
              price: updatedBookingInfo.price,
              receiversName: updatedBookingInfo.receiversName,
              receiversPhone: updatedBookingInfo.receiversPhone,
              type: updatedBookingInfo.type,
              weight: updatedBookingInfo.weight,
              status: updatedBookingInfo.status,
              departureDate: updatedBookingInfo.departureDate,
              dmId: updatedBookingInfo.dmId,
              assignedMan: updatedBookingInfo.assignedMan,
            }
          }
          const result = await bookingsCollection.updateOne(filter, updatedBooking)
          res.send(result)
        }
      }
      catch (err) {
        console.log(err);
      }
    })


    app.get('/topRatedDeliveryMan', async (req, res) => {

      const topDeliveryMan = await reviewsCollection.aggregate([
        {
          $group: {
            _id: "$dmId",
            agRating: { $avg: "$rating" },
            totalBookings: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "bookingsCollection",
            localField: "_id",
            foreignField: "dmId",
            as: "bookingInfo"
          }
        },
        {
          $project: {
            _id: 1,
            avgRating: 1,
            totalBookings: 1,
            name: { $arrayElemAt: ["$bookingInfo.assignedMan", 0] }
          }
        },
        {
          $sort: { avgRating: -1, totalBookings: -1 }
        },
        {
          $limit: 5
        }
      ]).toArray();
      res.send(topDeliveryMan)
    })


    app.get('/deliveryman', async (req, res) => {
      const email = req.query.email
      let query = { email: email }

      // Find the user with the given email
      const user = await usersCollection.findOne({ email: email });
      console.log(user);

      if (!user) {
        return res.status(404).json({ message: 'No Parcel Assigned' });
      }

      // Find bookings where assignedMan matches user's name
      const bookings = await bookingsCollection.find({ assignedMan: user.name }).toArray();
      console.log(bookings);

      res.send(bookings);
    });





    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Parcel Management App is running')
})

app.listen(port, () => {
  console.log(`Parcel Management App is running on port ${port}`);
})
