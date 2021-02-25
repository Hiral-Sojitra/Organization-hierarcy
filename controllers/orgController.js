var arrayToTree = require('array-to-tree');
var ObjectID = require('mongodb').ObjectID;
const uuid = require('uuid');
const _ = require('lodash');
module.exports = {
    async create(req, res) {
        let body = req.body
        if (!body.orgChartName) {
            return res.status(400).send('orgChartName not found')
        }
        body.users = []
        collection.insert(body, function (err, result) {
            if (err) {
                res.status(400).send({ message: 'Error while creating Organization', error: err })
            }
            console.log("create -> result", result)
            return res.status(200).send({ message: 'Organization added successfully', data: result.ops })
        });
    },
    async edit(req, res) {
        let body = req.body
        if (!body._id) {
            return res.status(400).send('_id not found')
        }
        if (body.userId == body.parentId) {
            return res.status(400).send({ message: 'UserId and parentId never be same' })
        }
        let updateObj = {
            _id: uuid(),
            userId: ObjectID(body.userId),
            parentId: body.parentId ? ObjectID(body.parentId) : null
        }
        collection.updateOne({ _id: ObjectID(body._id) }, { $push: { users: updateObj } }, function (err, result) {
            if (err) {
                return res.status(400).send({ message: 'Error while editing Organization', error: err })
            }
            return res.status(200).send({ message: 'Organization updated successfully' })
        });
    },
    async view(req, res) {
        if(!req.params.id){
            return res.status(400).send('params not found')
        }
        collection.aggregate([{ $match: { "_id": ObjectID(req.params.id) } },
        { $unwind: "$users" },
        {
            $lookup: {
                from: "Users",
                localField: "users.userId",
                foreignField: "_id",
                as: "element"
            }
        },
        { $addFields: { 'temp': { $arrayElemAt: ['$element', 0] } } },
        { $addFields: { 'users.name': '$temp.name', 'users.title': '$temp.title', 'users.email': '$temp.email', 'users.address': '$temp.address' } },
        { $project: { element: 0, temp: 0 } }
        ]).toArray(async function (err, docs) {
            if (err) {
                return res.status(400).send({ message: 'Error while fetching Organization', error: err })
            }
            if (docs.length > 0) {
                let list = []
                _.map(docs, async (doc) => {
                    doc.users.userId = doc.users.userId.toString()
                    doc.users.parentId = doc.users.parentId ? doc.users.parentId.toString() : null
                    list.push(doc.users)
                })
                let response = await arrayToTree(list, {
                    parentProperty: 'parentId',
                    customID: 'userId'
                });
                return res.status(200).send({ message: 'Organization fetched successfully', data: response })
            }
            return res.status(400).send({ message: 'Organization with given id not found.' })
        });
    }

}