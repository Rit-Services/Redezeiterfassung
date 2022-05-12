const express = require('express')

const SessionCtrl = require('../controllers/session-ctrl')

const router = express.Router()

router.post('/session', SessionCtrl.createSession)          // POST: insert a Session
router.post('/sessionxml',SessionCtrl.createSessionXML)     // POST: insert Session in XML
// router.put('/session/:id', MovieCtrl.updateMovie)
// router.delete('/session/:id', MovieCtrl.deleteMovie)
// router.get('/session/:id', MovieCtrl.getMovieById)
router.get('/sessions', SessionCtrl.getSessions)            // GET: returns all of sessions in MongoDB
router.get('/getspeakers',SessionCtrl.getSpeakersList)      // GET: returns a list of speakers in JSON fromat from url: https://www.nilas.niedersachsen.de/starweb/NILAS/abg4ptv.xml
// router.get('/startobs',SessionCtrl.startOBS)                // GET: Starts OBS Studio using OBS WEB SOCKET JS
// router.get('/startrecording',SessionCtrl.startOBSRecording) // GET: Starts Recording of test scene using OBS STUDIO WEB SOCKET JS
// router.get('/stoprecording',SessionCtrl.stopOBSRecording)   // GET: Stops Recording of test scene using OBS STUDIO WEB SOCKET JS
// router.get('/getinfo',SessionCtrl.getRecordingInfo)         // GET: return the status of recording in OBS Studio.
router.post('/renamefile',SessionCtrl.renameFiles)          // POST: Renames the files. Taken input of previous filename and new filename. Changes Names in C:/OBSVideos
router.post('/updateitemslist', SessionCtrl.updateItemsList)// POST: Update the ItemList

router.post('/createactive', SessionCtrl.createActiveSession)// POST: Makes a new collection of Active session Items list.
router.post('/updateactive',SessionCtrl.updateActiveSession) // POST: Updates the active Session Items List. It takes input of Model ItemList
router.get('/getactive',SessionCtrl.getActiveSession)        // GET: returns the active Session Item list in JSON Format
router.get('/resetactive',SessionCtrl.resetActiveSession)    // GET: It CLears the Active Session Item List in MongoDB
router.get('/deletesessions',SessionCtrl.deleteAllSession)   // GET: It Deletes All Sessions in MongoDB
router.get('/sessionweb',SessionCtrl.getSessionWeb)          // GET: It downloads an XML file for active Session from URL: https://landtag-niedersachsen-tv.im-en.com/transfer-interface/redezeiten-download.php and Updates the ACtive Session Item List.
router.post('/speakersdb',SessionCtrl.updateSpeakerList)     // POST: Saves the Speakers in JSON format in MongoDB. FIrst downlaods the XML file from URL: https://www.nilas.niedersachsen.de/starweb/NILAS/abg4ptv.xml
router.get('/getspeakersdb',SessionCtrl.getSpeakersDB)       // GET: Returns a List of SPeakers in JSON format from MongoDB.
router.post('/util',SessionCtrl.updateUtils)                 // POST: Update the UTIL Collection
router.post('/utilindex',SessionCtrl.updateUtilIndex)        // POST: Update the ACtive Index in Util collection
router.post('/updateparties',SessionCtrl.updateUtilParties)  
router.get('/getutil',SessionCtrl.getUtil)                   // GET: Returns the util collection.
router.get('/startobscontainer',SessionCtrl.startOBS)
router.get('/startobs',SessionCtrl.startOBSRecording)
router.get('/stopobs',SessionCtrl.stopOBSRecording)
router.get('/obsinfo',SessionCtrl.getRecordingInfo)
router.get('/sendtovod',SessionCtrl.sendToVODItemList)
router.post('/startstream',SessionCtrl.startStreamToPlatform)
router.post('/stopstream',SessionCtrl.stopStream)
router.get('/streaminfo',SessionCtrl.getStreamStatus)
router.post('/updatesettings',SessionCtrl.updateSettings)
router.get('/getsettings',SessionCtrl.getSettings)
router.get('/sendudptime',SessionCtrl.sendUDPTime)
router.get('/stopudptime',SessionCtrl.stopUDPTime)
router.post('/sendudpdata',SessionCtrl.sendUDPWithData)

module.exports = router