const Session = require('../models/session-model')
const SpeakersList = require('../models/speakers-model')
const ItemList = require('../models/active-session')
const Settings = require('../models/settings')
const Utils = require('../models/utils')
const express = require('express')
const xml2js = require('xml2js');
const xml2json = require('xml2json')
const https = require('https');
const request = require('request');
const { json } = require('body-parser');
const { exec } = require("child_process");
var iconv = require('iconv-lite');
var Buffer = require('buffer').Buffer;
var utf8 = require('utf8')
var axios = require('axios')
const dgram = require('dgram')
var speakers = {};

createSession = (req, res) => {
    const body = req.body

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a session',
        })
    }

    const session = new Session(body.Info.ElectionPeriod.Sessions)
    console.log(session)
    if (!session) {
        return res.status(400).json({ success: false, error: err })
    }

    session
        .save()
        .then(() => {
            console.log("Session Created!")
            return res.status(201).json({
                success: true,
                id: session._id,
                message: 'Session created!',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Session not created!',
            })
        })
}

getSessions = async (req, res) => {
    await Session.find({}, (err, sessions) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!sessions.length) {
            return res
                .status(404)
                .json({ success: false, error: `Session not found` })
        }
        return res.status(200).json({ success: true, data: sessions })
    }).catch(err => console.log(err))
}

deleteAllSession = (req,res) =>{
    Session.remove({},(result)=>{
        return res.status(200).json({
            success: true,
        })
    })
}

createSessionXML = (req, res) => {
    const body = req.body

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a session',
        })
    }
    console.log("XML Recieved: ",body)
    // xml = body;
    // json_session = xml2json.toJson(xml);
    // console.log(JSON.parse(json_session))

    // const session = new Session(body.Info.ElectionPeriod.Sessions)

    // if (!session) {
    //     return res.status(400).json({ success: false, error: err })
    // }

    // session
    //     .save()
    //     .then(() => {
    //         return res.status(201).json({
    //             success: true,
    //             id: session._id,
    //             message: 'Session created!',
    //         })
    //     })
    //     .catch(error => {
    //         return res.status(400).json({
    //             error,
    //             message: 'Session not created!',
    //         })
    //     })
}

getSpeakersList = async (req,res) => {
    options = {
        host: 'www.nilas.niedersachsen.de',
        path: 'starweb/NILAS/abg4ptv.xml',
        encoding: null,
    }

     

    await request.get('https://www.nilas.niedersachsen.de/starweb/NILAS/abg4ptv.xml',options,function(err,ress,body){
        if(err){
            return res.status(400).json({ success: false, error: err })
        }
        if(ress.statusCode === 200 ){
            
            // data = Buffer.from(body, 'binary').toString('binary');
            // buff1 = data.toString('ISO-8859-1')

            xml = iconv.decode(body,'ISO-8859-1')


            json_speakers = xml2json.toJson(xml)
            /// console.log(JSON.parse(json_speakers).Abgeordnetenliste)
            speakers =new SpeakersList(JSON.parse(json_speakers))
            console.log(speakers)
            return res.status(201).json({
                success:true,
                data: speakers
            })
        }
    });



}


updateItemsList = async(req,res) =>{
    const body = req.body
    // console.log("Body recieved: ",body)
    if(!body){
        return res.status(400).json({
            success: false,
            error: "Must provide a body to the Request"
        })
    }
    Session.findOne({sessionNumber: body.sessionNumber}, (err,session) => {
        if(err){
            return res.status(404).json({
                err,
                message: 'Session not found'
            })
        }

        // console.log("Session FOund: ", session)
        session.meetings[body.meetingIndex].items = body.items
        
        session.save().then(()=>{
            return res.status(200).json({
                success: true,
                id: session._id,
                message: "Session updated successfully"
            })
        })
        .catch((err)=>{
            return res.status(400).json({
                error: err,
                message: "Session not Updated"
            })
        })
    })


}




createActiveSession = (req, res) => {
    const body = req.body

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide an Item List',
        })
    }

    const itemList = new ItemList(body)

    if (!itemList) {
        return res.status(400).json({ success: false, error: err })
    }

    itemList
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                id: itemList._id,
                message: 'Item List created!',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Item List not created!',
            })
            // res.set("Access-Control-Allow-Origin", "*").send("error");
        })
}

updateActiveSession =  async(req,res) =>{
    const body = req.body
    // console.log("Body recieved: ",body)
    if(!body){
        return res.status(400).json({
            success: false,
            error: "Must provide a body to the Request"
        })
    }
    
    
    ItemList.findOne({}, (err,itemList) => {
        if(err){
            return res.status(500).json({
                err,
                message: 'Item List not found'
            })
        }


        if(!itemList){
            // var itemlistObj = new ItemList(body)
            // itemlistObj.save().then(() => {
            //     return res.status(201).json({
            //         success: true,
            //         id: itemList._id,
            //         message: 'New Item List created!',
            //     })
            // })
            // .catch(error => {
            //     return res.status(400).json({
            //         error,
            //         message: 'Item List Not found and  not created!',
            //     })
            //     // res.set("Access-Control-Allow-Origin", "*").send("error");
            // })
            return res.status(404).json({
                        message: 'Item List Not found!',
                    })
        }
        else{

            itemList.itemlist = body.itemlist
            itemList.sessionNumber = body.sessionNumber
            itemList.sessionStart = body.sessionStart
            itemList.sessionEnd =  body.sessionEnd
            itemList.numberOfDays = body.numberOfDays
            
            itemList.save().then(()=>{
                return res.status(200).json({
                    success: true,
                    id: itemList._id,
                    message: "Item List updated successfully"
                })
            })
            .catch((err)=>{
                return res.status(404).json({
                    error: err,
                    message: "Item List not Updated"
                })
            })
        }
    } )
        


}


getActiveSession = async (req, res) => {
    await ItemList.find({}, (err, listitems) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!listitems.length) {
            return res
                .status(404)
                .json({ success: false, error: `List Items not found` })
        }
        return res.status(200).json({ success: true, data: listitems })
    }).catch(err => console.log(err))
}

resetActiveSession = async (req, res) => {
    await ItemList.findOneAndDelete({}, (err, itemlist) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }

        if (!itemlist) {
            return res
                .status(404)
                .json({ success: false, error: `Movie not found` })
        }

        return res.status(200).json({ success: true, data: itemlist })
    }).catch((err) => {
        console.log(err)
        return res.status(500).json({ success: false, error: err })
    })
}

startOBS = async (req,res) =>{

    // const OBSWebSocket = require('obs-websocket-js');
    // const obs = new OBSWebSocket();

    // obs.connect({
    //     address: 'localhost:4445',
    //     password: 'Moi@2468'
    // })
    // .then(() => {
    //     console.log(`Success! We're connected & authenticated.`);

    //     // return res.status(400).json({success:false, error:"OBS already started"});
    //     // return res.status(200).json({success:tru, error:"OBS started"});
    // })
    // .catch(err => { // Promise convention dicates you have a catch on every chain.
    //     console.log(err);
    //     exec('cd "C:/Program Files/obs-studio/bin/64bit" & obs64 --minimize-to-tray', (error,stdout,stderr)=>{
    //         if(error){
    //             console.log(`error: ${error.message}`);
    //             return res.status(400).json({success:false, error:error.message});
    //         }
    //         if(stderr){
    //             console.log(`stderr: ${stderr}`);
    //             return res.status(400).json({success:false, error:stderr});
    //         }
    //         console.log(`stdout: ${stdout}`);
    //         return res.status(200).json({success:true, message:'OBS start successfull!'});
    //     })
    //     return res.status(200).json({success:true, message:'OBS start successfull!'});
    //     // return res.status(400).json({success:false, error:"OBS already started"});
    // });

  exec('docker exec -it obs2 /bin/bash -c ',(error,stdout,stderr)=>{
    if(error){

    }
    if(stderr){
        console.log(`stderr: ${stderr}`);
           return res.status(400).json({success:false, error:stderr});
    }
    console.log(`stdout: ${stdout}`);
    return res.status(200).json({success:true, message:'OBS start successfull!'});
  });
}


startOBSRecording = async(req,res) =>{
    const OBSWebSocket = require('obs-websocket-js');
    const obs = new OBSWebSocket();

    obs.connect({
        address: 'localhost:4445',
        password: 'Moi@2468'
    })
    .then(() => {
        console.log(`Success! We're connected & authenticated.`);
        console.log("Getting GETRECORDING Result.")
        obs.send('GetRecordingStatus');
        console.log("Got GETRECORDING Result.")
    })
    .then(data => {
        // console.log(`${data.scenes.length} Available Scenes!`);

        // data.scenes.forEach(scene => {
            
        //     console.log(`Scene: ${scene.name}`);
        // });
        console.log(data);
        console.log("Sending Start Recording REequest.")
        return obs.send('StartRecording')
    })
    .then(data => {
        console.log('After start request:', data);
        return res.status(200).json({success:true, message:'start Recording successfull!', data:data});
    })
    .catch(err => { // Promise convention dicates you have a catch on every chain.
        console.log(err);
        return res.status(400).json({success:false, error:err});
    });

}

var videoInfo = {};

renameFiles = async(req,res) =>{
    var previousName = req.body.previousName;
    var newName = req.body.newName;
    previousName = previousName.replace("/","\\");
    previousName = previousName.replace("/","\\");
    console.log(previousName);

    command = 'Ren "'+ previousName +'" "'+ newName + '"';
    console.log(command)

    exec(command, (error,stdout,stderr)=>{
        if(error){
            console.log(`error: ${error.message}`);
            return res.status(400).json({success:false, error:error.message});
            
        }
        if(stderr){
            console.log(`stderr: ${stderr}`);
            return res.status(400).json({success:false, error:stderr});
        }
        console.log(`stdout: ${stdout}`);
        return res.status(200).json({success:true, message:'successfully changed name!'});
    })
    
}

stopOBSRecording = async(req,res) =>{
    const OBSWebSocket = require('obs-websocket-js');
    const obs = new OBSWebSocket();
    

    obs.connect({
        address: 'localhost:4445',
        password: 'Moi@2468'
    })
    .then(() => {
        console.log(`Success! We're connected & authenticated.`);

        return obs.send('GetRecordingStatus');
    })
    .then(data => {
        
        // console.log(data);
        videoInfo=data;
        return obs.send('StopRecording')
    })
    .then(data => {
        console.log('After stop request:', data);
        console.log('Video Info', videoInfo);

        return res.status(200).json({success:true, message:'stop Recording successfull!', data:data, videoinfo:videoInfo,});
    })
    .catch(err => { // Promise convention dicates you have a catch on every chain.
        console.log(err);
        return res.status(400).json({success:false, error:err});
    });
}

getRecordingInfo = async(req,res) =>{
    const OBSWebSocket = require('obs-websocket-js');
    const obs = new OBSWebSocket();

    obs.connect({
        address: 'localhost:4445',
        password: 'Moi@2468'
    })
    .then(() => {
        console.log(`Success! We're connected & authenticated.`);

        return obs.send('GetRecordingStatus');
    })
    .then(data => {
        
        console.log(data);
        return res.status(200).json({success:true, data:data});
    })
    .catch(err => { // Promise convention dicates you have a catch on every chain.
        console.log(err);
        return res.status(400).json({success:false, error:err});
    });
    

}



getSessionWeb = async(req,res) =>{
    options = {
        host: 'https://landtag-niedersachsen-tv.im-en.com',
        path: '/transfer-interface/redezeiten-download.php'
    }

     

    await request.get('https://landtag-niedersachsen-tv.im-en.com/transfer-interface/redezeiten-download.php',options,function(err,ress,body){
        if(err){
            return ress.status(400).json({ success: false, error: err })
        }
        
        // console.log("BODY", body)
        if(ress.statusCode === 200 ){
            xml = body;
            // console.log(xml)

            // console.log(xml2json.toJson(xml))
            // jsondata = xml2json.toJson(xml)
            // console.log(JSON.parse(json_speakers))
            
            return res.status(201).json({
                success:true,
                data: xml,
            })
        }
    });
}

updateSpeakerList = async(req,res) =>{

    SpeakersList.remove({},(result)=>{
        console.log("Cleaned SPeaker List!")
    })


    const body = req.body
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Speaker List',
        })
    }

    // const session = new Session(body.Info.ElectionPeriod.Sessions)
    const speakerlist = new SpeakersList(body)
    if (!speakerlist) {
        return res.status(400).json({ success: false, error: err })
    }

    speakerlist
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                id: speakerlist._id,
                message: 'Speaker List updated',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Speaker List not created!',
            })
        })
}

getSpeakersDB = async(req,res) =>{
    SpeakersList.find({}, (err, speakerlist) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        console.log(speakerlist.length)
        if (speakerlist.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: `SpeakerList not found` })
        }
        // else{
            // return res.status(200).json({ success: true, data: speakerlist })
        // }
        return res.status(200).json({
            success: false,
            data: speakerlist
        })
        
    })
    // .catch((err) => {
    //     console.log(err)
    //     return res
    //             .status(500)
    //             .json({ success: false, error: err })
    // })
}


updateUtils = async(req,res) =>{
    Utils.remove({},(res)=>{
        console.log("Updating Utils collection")
    })
    const body = req.body
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Utils',
        })
    }

    // const session = new Session(body.Info.ElectionPeriod.Sessions)
    console.log("updateUtil",body)
    const utils = new Utils(body)
    console.log("UTIL: ",utils)
    if (!utils) {
        return res.status(400).json({ success: false, error: err })
    }

    utils
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                id: utils._id,
                message: 'Utils updated',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Utils not created!',
            })
        })

}

getUtil = async(req,res) =>{
    console.log("getUtil function")
    try{
        Utils.find({}, (err, util) => {
            if (err) {
                return res.status(400).json({ success: false, error: err })
            }
            // if (!util) {
            //     return res
            //         .status(404)
            //         .json({ success: false, error: `SpeakerList not found` })
            // }
            else{
            return res.status(200).json({ success: true, data: util })
            }
        })
    }
    catch(err) {
        console.log(err)
        res.status(500).json({
            success: false,
            error: err
        })
    }
}

updateUtilParties = async(req,res) =>{
    const body = req.body
    
    if(!body.LR || !body.SPD || !body.CDU || !body.greens || !body.FDP){
        return res.status(400).json({
            success: false,
            error: `Invalid Arguments`
        })
    }
    await Utils.findOneAndUpdate({},{
        LR:body.LR,
        SPD: body.SPD,
        CDU: body.CDU,
        greens: body.greens,
        FDP: body.FDP
    })
    .catch(err => {
            console.log(err)
            return res.status(500).json({
                success: false,
                error: err,
            })
        })
    
    return res.status(200).json({
        success: true,
    })
}

updateUtilIndex = async(req,res) =>{
    const body = req.body
    // console.log("Body recieved: ",body)
    if(!body){
        return res.status(400).json({
            success: false,
            error: "Must provide a body to the Request"
        })
    }
    
    
    Utils.findOne({}, (err,util) => {
        console.log("UTILLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL:",util)
        if(err){
            return res.status(404).json({
                err,
                message: 'Util not found'
            })
        }

        if(!util){
            // no util found
            console.log("No util found")
            var utilObj = new Utils({
                activeIndex: "0"
            })
            utilObj.save().then(()=>{
                return res.status(200).json({
                    success: true,
                    id: util._id,
                    message: "Util ACtive Index updated successfully"
                })
            })
        }

        else{

            util.activeIndex = body.activeIndex
            
            util.save().then(()=>{
                return res.status(200).json({
                    success: true,
                    id: util._id,
                    message: "Util ACtive Index updated successfully"
                })
            })
            .catch((err)=>{
                return res.status(404).json({
                    error: err,
                    message: "Util ACtive Index not Updated"
                })
            })
        }
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

startStreamToPlatform = async(req,res) =>{
    const OBSWebSocket = require('obs-websocket-js');
    const obs = new OBSWebSocket();

    const body = req.body

    obs.connect({
        address: '10.15.28.160:4445',
        password: 'ritservices2022'
    })
    .then(async()=> {
        console.log(`Success! We're connected & authenticated.`);


        if(!body.meetingNumber || !body.sessionNumber){
            return res.status(404).json({
                status: false,
                message: "Invalid Parameters given!"
            })
        }

        
        var streamingKey = `session${body.sessionNumber}_meeting${body.meetingNumber}`

        /// Removing Space characters and ':' from streaing key
        streamingKey = streamingKey.replace(/\s+/g,'_')
        streamingKey = streamingKey.replace(':','_')
        // console.log(streamingKey)

        var api = axios.create({
            baseURL: 'http://10.15.28.160:3999/api'
        })

        var settingsResponse = await api.get(`/getsettings`)

        // var url = `rtmp://62.113.210.252/seisakustik-live?seisakustik795gDL`

        var url = settingsResponse.data.data.streamingIP

        console.log(streamingKey)
        
        /// Changing the settings in OBS to the settings that we want.
        /// Main is `url` which contains the info on server
        /// `streamingKey` is basically the name of the file thaat we want.
        var changingSetting = await obs.send(
            'SetStreamSettings',
            {
                type: 'rtmp_custom',
                settings: {
                    server: url,
                    key: streamingKey,
                    use_auth: false,
                    save: true,
                }
            }
        )

        /// First we will check if there is already a stream active. If there isn't this part will just pass
        /// otherwise if there is a stream already happening It will wait a second and and see again.
        /// It will repeat checking for 10 times. If it isn't free even after 10th try it will let it go.
        /// This basically gives it a chance to complete the stopStream.
        for(let i=0;i<10;i++){
            let streamStatus = await obs.send('GetStreamingStatus')
            if(streamStatus.streaming === false){
                break
            }
            console.log("")
            await sleep(1000)
        }


        var streamResponse = await obs.send('StartStreaming')
        
    
        return res.status(200).json({
            success: true,
            data: streamResponse,
        })
    })
    .catch(err => { // Promise convention dicates you have a catch on every chain.
        console.log(err);
        return res.status(500).json({success:false, message:'OBS unable to start'});
        
    });
}

stopStream = async(req,res) =>{
    const OBSWebSocket = require('obs-websocket-js');
    const obs = new OBSWebSocket();

    const body = req.body

    obs.connect({
        address: '10.15.28.160:4445',
        password: 'ritservices2022'
    })
    .then(async()=>{
        await obs.send('StopStreaming')
        return res.status(200).json({
            success: true,
        })
    })
    .catch((error)=>{
        return res.status(500).json({
            success: false,
            error: error,
        })
    })
}


sendToVODItemList = async (req,res) =>{
    const body = req.body
    // console.log("Body recieved: ",body)
    if(!body){
        return res.status(400).json({
            success: false,
            error: "Must provide a body to the Request"
        })
    }

    ItemList.findOne({}, async(err,itemList) => {
        if(err){
            return res.status(404).json({
                err,
                message: 'Session not found'
            })
        }

        var result = {
            sessionNumber: itemList.sessionNumber,
            sessionStart: itemList.sessionStart,
            sessionEnd: itemList.sessionEnd,
            numberOfDays: itemList.numberOfDays,
            meetings:[],
        }

        var tempmeetings = []
        var tempItems = []

        var tempDate = ""
        for(var i=0;i<itemList.itemlist.length;i++){
            if(itemList.itemlist[i].meetingDate != tempDate && itemList.itemlist[i].meetingDate != "-1"){
                if(tempmeetings.length != 0){ /// if tempmeeting length isnt zero then it adds itemslist to the last index of tempmeeting
                    // console.log(tempmeetings[tempmeetings.length - 1])
                    tempmeetings[tempmeetings.length - 1].items = [...tempItems]
                }
                tempmeetings.push({
                    meetingDate: itemList.itemlist[i].meetingDate,
                    meetingNumber: itemList.itemlist[i].meetingNumber,
                })
                tempDate = itemList.itemlist[i].meetingDate
                tempItems = []
                tempItems.push(itemList.itemlist[i])
            }
            else{
                tempItems.push(itemList.itemlist[i])
            }
        }
        tempmeetings[tempmeetings.length - 1].items = [...tempItems] /// for last meeting


        result.meetings = [...tempmeetings]
        // var sessionToSend = JSON.stringify(result)

        

        var api = axios.create({
            baseURL: 'http://10.15.28.160:3999/api'
        })

        var settingsResponse = await api.get(`/getsettings`)
        var apiKey = settingsResponse.data.data.apiKey
        console.log(apiKey)

        
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        var clientServerOptions = {
            uri: 'https://h2967275.stratoserver.net/api/time-meta', /// Just link it to API of the server of VOD.
            body: JSON.stringify(result),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+ apiKey
            }
        }
        request(clientServerOptions, function (error, response) {
            // console.log(response.statusCode)
            if(error){
                return res.status(400).json({
                    success: false,
                    error: error
                })
            }
            if(response.statusCode === 201){
                return res.status(200).json({
                    success: true,
                    message: "Data sent to VOD Platform"
                })
            }
            else{
                return res.status(response.statusCode).json({
                    success: false,
                    response: response
                })
            }
            
        });

    })
}

getStreamStatus = async(req,res) =>{
    const OBSWebSocket = require('obs-websocket-js');
    const obs = new OBSWebSocket();
    // console.log("Executing getStreamStaus")
    obs.connect({
        address: '10.15.28.160:4445',
        password: 'ritservices2022'
    })
    .then(async() => {
        // console.log(`Success! We're connected & authenticated.`);

        var streamingStatus = await obs.send('GetStreamingStatus');
        // console.log(streamingStatus)
        return res.status(200).json({
            status: streamingStatus,
        })
    })
    .catch((error)=>{
        return res.status(500).json({
            success: false,
            error: error,
        })
    })
}


updateSettings = async(req,res) =>{
    const body = req.body
    if(!body.streamingIP || !body.apiKey || !body.adminPassword){
        return res.status(400).json({
            error: "Invalid Parameters! Missing streaminIP or apiKey"
        })
    }
    Settings.findOne({},(err,setting)=>{
        if(err){
            return res.status(500).json({
                error: err
            })
        }
        if(!setting){
            console.log("length 0")

            var settingsItem = new Settings(body)
            settingsItem.save().then(()=>{
                return res.status(200).json({
                    message: "Settings Created"
                })
            })
            .catch((err)=>{
                return res.status(500).json({
                    message: "Unable to create the settings Item",
                    error: err
                })
            })
            
        }
        else{
            
            setting.streamingIP = body.streamingIP
            setting.apiKey = body.apiKey
            setting.adminPassword = body.adminPassword

            setting.save().then(()=>{
                return res.status(200).json({
                    message: "Settings Updated!"
                })
            })
            .catch((err)=>{
                return res.status(500).json({
                    message: "Unable to update the settings",
                    error: err
                })
            })
        }
    })
}

getSettings = async(req,res) =>{
    Settings.findOne({},(err,setting)=>{
        if(err){
            return res.status(500).json({
                error: err
            })
        }
        if(!setting){
            return res.status(404).json({
                message: "Not found"
            })
        }
        else{
            return res.status(200).json({
                success: true,
                data: setting
            })
        }
    })
}

var TimeUDPRef = null
sendUDPTime = async(req,res) =>{
    const sock = dgram.createSocket("udp4");
    
    var broadcastAddress = '10.15.28.255'
    // var broadcastAddress = '0.0.0.0'
    this.dateOptions = {  year: 'numeric', month: 'numeric', day: 'numeric' };

    TimeUDPRef = setInterval(function(){
        // new Date().toLocaleDateString('de-DE',this.dateOptions)
        var jsonObject = {
            date: new Date().toLocaleDateString('de-DE',this.dateOptions),
            time: new Date().toLocaleTimeString([],{hour: '2-digit', minute:'2-digit',second: '2-digit'})
        }
        jsonObject = JSON.stringify(jsonObject)
        jsonObject = jsonObject.toString()
        sock.send(jsonObject, 0, jsonObject.length, 5001, broadcastAddress, (err, bytes) => {
            if (err) {
              console.log("Error:" + err.message, err);
              res.status(500).json({
                error: err
            })
            } else {
              console.log("Sent bytes:", bytes);
            //   res.status(200).json({
            //     success: true,
            //     });
            }
      
            // sock.close();
        });

    },1000)
    
    res.status(200).json({
        success: true,
    });
}


stopUDPTime = async(req,res) =>{
    console.log("Clearing Interval")
    clearInterval(TimeUDPRef);
    res.status(200).json({
        success: true,
    });
}



sendUDPWithData = async(req,res) =>{
    const sock = dgram.createSocket("udp4");
    var broadcastAddress = '10.15.28.255';
    var jsonObject = req.body
    console.log(jsonObject)
    jsonObject = JSON.stringify(jsonObject)
    jsonObject = jsonObject.toString()
    sock.send(jsonObject, 0, jsonObject.length, 5002, broadcastAddress, (err, bytes) => {
        if (err) {
          console.log("Error:" + err.message, err);
          res.status(500).json({
              error: err
          })
        } else {
          console.log("Sent bytes:", bytes);
          res.status(200).json({
            success: true,
          });
        }
  
        // sock.close();
    });

    
    

}

module.exports = {
    createSession,
    createSessionXML,
    deleteAllSession,
    getSessions,
    getSpeakersList,
    updateItemsList,
    startOBS,
    startOBSRecording,
    stopOBSRecording,
    getRecordingInfo,
    renameFiles,
    createActiveSession,
    updateActiveSession,
    getActiveSession,
    resetActiveSession,
    getSessionWeb,
    updateSpeakerList,
    getSpeakersDB,
    updateUtils,
    getUtil,
    updateUtilIndex,
    updateUtilParties,
    sendToVODItemList,
    startStreamToPlatform,
    stopStream,
    getStreamStatus,
    updateSettings,
    getSettings,
    sendUDPTime,
    stopUDPTime,
    sendUDPWithData
}