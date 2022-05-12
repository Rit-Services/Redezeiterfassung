#!/bin/bash

mongo <<EOF
var config = {
    "_id": "rs",
    "version": 1,
    "members": [
        {
            "_id": 1,
            "host": "192.168.18.31:27018",
            "priority": 3
        },
        {
            "_id": 2,
            "host": "192.168.18.31:27019",
            "priority": 2
        },
        {
            "_id": 3,
            "host": "192.168.18.31:27020",
            "priority": 1
        }
    ]
};
rs.initiate(config, { force: true });
rs.status();
EOF

sleep 50

mongo <<EOF
   use admin;
   admin = db.getSiblingDB("admin");
   admin.createUser(
     {
	user: "admin",
        pwd: "ritservices2022",
        roles: [ { role: "root", db: "admin" },{ "role" : "clusterAdmin", "db" : "admin" },{ role: "userAdminAnyDatabase", db: "admin" } ]
     });
     db.getSiblingDB("admin").auth("admin", "ritservices2022");
     rs.status();
     use landtag-demo;
     db.createUser({
         user: "realmodus",
         pwd: "ritservices2022",
         roles: [{role: "dbAdmin", db: "landtag-demo"},{role: "root", db: "admin"}]
     })
     use landtag-demo-test;
     db.createUser({
         user: "testmodus",
         pwd: "ritservices2022",
         roles: [{role: "dbAdmin", db: "landtag-demo-test"},{role: "root", db: "admin"}]
     })
EOF