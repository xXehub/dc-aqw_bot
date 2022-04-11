import { MongoClient, MongoClientOptions } from 'mongodb';
import BaseCog from './base'

export default class DataBase {
    // Class Metadata
    public description = "The class that contains all mongodb methods"
    public mongoclient
    
    constructor(private base: BaseCog) {
        this.mongoclient = new MongoClient(process.env.MONGOURI!, { useNewUrlParser: true, useUnifiedTopology: true } as MongoClientOptions)   
        this.mongoclient.connect()


    }


    public async dbRead(collection: string, object: Object | Array<Object>, disableLogger=false) {
        const dir = collection.trim().split(".")
        const location = await this.mongoclient.db(dir[0]).collection(dir[1])
        
        // Method
        let result: any;
        if (!Array.isArray(object)) {
            result = await location.findOne(object)
        } else {
            const cursor = await location.find(object)
                .sort({ last_review: -1 })
            result = await cursor.toArray()
        }

        if (!disableLogger) {
            // Log
            if (result) {
                console.log(`[Database]: Found a listing in the collection with the name '${object}':`)
                // console.log(result);
            } else {
                console.log(`[Database]: No listings found with the name '${object}'`)
            }
        }

        // Return
        if (dir[1] == "accounts") {
            delete result._id
        }
        return result
    }


    public async dbInsert(collection: string, object: Object | Array<Object>) {

        const dir = collection.trim().split(".")
        const location = await this.mongoclient.db(dir[0]).collection(dir[1])
        
        // Method
        let result: any;
        if (!Array.isArray(object)) {
            result = await location.insertOne(object);
        } else {
            result = await location.insertMany(object);
        }

        // log
        console.log(`[Database]: ${result.insertedId} new listing created with the following id:`);

        // Return
        return result
    }

    public async dbUpdate(collection: string, query: Object, object: Object) {
        const location = collection.trim().split(".")

        // Method
        const result = await this.mongoclient.db(location[0])
            .collection(location[1])
            .updateOne(query, object,
                { upsert: true });
        // { $set: object }
        // Log
        console.log(`[Database]: ${result.matchedCount} document(s) matched the query criteria.`);
        if (result.upsertedCount > 0) {
            console.log(`[Database]: One document was inserted with the id ${result.upsertedId._id}`);
        } else {
            console.log(`[Database]: ${result.modifiedCount} document(s) was/were updated.`);
        }

        // Return
        return result
    }


    public async dbDelete(collection: string, object: Object | Array<Object>) {

        const dir = collection.trim().split(".")
        const location = await this.mongoclient.db(dir[0]).collection(dir[1])
        let result: any;
        console.log(dir)
        // if (!Array.isArray(object)) {
        result = await location.deleteOne(object);
        // }
        // } else {
        //     const cursor = await location.find(object)
        //         .sort({ last_review: -1 })
        //     result = await cursor.toArray()
        // }

        // Log
        console.log(`[Database]: ${result.deletedCount} document(s) was/were deleted.`);

        // Return
        return result

    }



}