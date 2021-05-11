const MongoClient = require('mongodb').MongoClient;
const lodash = require('lodash');
const fs = require('fs');


// replace these with you connection strings
const urls = [{
    tag : 'secondary-0',
    url : 'mongodb://username:pass@cluster0-shard-00-00.6uksd.mongodb.net:27017?ssl=true&replicaSet=atlas-33jx7e-shard-0&authSource=admin&retryWrites=true&w=majority&readPreference=secondary'
},{
    tag : 'secondary-1',
    url : 'mongodb://username:pass@cluster0-shard-00-01.6uksd.mongodb.net:27017?ssl=true&replicaSet=atlas-33jx7e-shard-0&authSource=admin&retryWrites=true&w=majority&readPreference=secondary'
},{
    tag : 'primary',
    url : 'mongodb://username:pass@cluster0-shard-00-02.6uksd.mongodb.net:27017?ssl=true&replicaSet=atlas-33jx7e-shard-0&authSource=admin&retryWrites=true&w=majority&readPreference=primary'
}];


// Database Name
const dbName = 'admin';
let idx_stats = [];


for (let each_url in urls){

    const client = new MongoClient(urls[each_url].url);
    client.connect(function(err,db) {
        const admin = db.db(dbName).admin();

        admin.listDatabases(async (err, dbs) => {

            for(let val in dbs.databases){
                if(dbs.databases[val].name == "admin" || dbs.databases[val].name == "local" || dbs.databases[val].name == "config"){
                    console.log("Skipping "+ dbs.databases[val].name)
                } else {
                    let collections = await db.db(dbs.databases[val].name).listCollections().toArray();
                    for(let each_collection in collections){
                        let index_stats = await db.db(dbs.databases[val].name).collection(collections[each_collection].name).aggregate([{$indexStats: { }}]).toArray();
                        if(index_stats && index_stats.length>0){
                            index_stats.forEach((each_stat)=>{
                                each_stat['tag'] = urls[each_url].tag;
                                each_stat['collection_name'] = collections[each_collection].name;
                                idx_stats.push(each_stat)
                            })
                        }
                    }
                }
            }
        });
    });
}

setTimeout(()=>{
    console.log("Please wait writing file to disk");
},5000)

setTimeout(()=>{
    let stats = lodash.groupBy(idx_stats,(idx_stat)=>{return idx_stat.collection_name});
    fs.writeFileSync('output.json',JSON.stringify(stats));
    console.log("File written to disk");
    process.exit();
},30000)