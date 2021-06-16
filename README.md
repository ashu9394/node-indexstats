# node-indexstats

To run this project 
1. Do npm install 
2. Change the connection string to your atlas cluster replicasets in the `urls` array also , edit the readpreference to the correct node for primary and secondary
3. Replace database name in the index.js file as per your the database name in your cluster
4. To run use `node index.js`
5. The output will be generated as an output.json file in the same directory 

`Please note that the code will fail in case you have created any kind of views in you collection, you would have to add conditions in the code to skip views in case you currently have them` 
