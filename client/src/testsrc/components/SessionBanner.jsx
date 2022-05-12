import React, {Component} from "react";
import styled from "styled-components";
import apis from "../api";
import IndependentStopwatch from "./IndependentStopwatch";
import { GermanTranslation } from "../util/german2English"
import xml2js from 'xml2js'
import { ItemList,Item } from "../model";
import api from '../api'
import Form, {
    SimpleItem,
    GroupItem,
  } from "devextreme-react/form";
import "devextreme-react/text-area";
import { Popup, Position } from 'devextreme-react/popup';
// import Button from 'devextreme-react/button';
import { Link } from 'react-router-dom'

import '../styles/SessionBanner.css'

class SessionBanner extends Component{

    constructor(props){
        super(props);

        console.log("[SessionBanner] (constructor) Entered Contructor",localStorage.getItem("stream_start_time"));
        api.getActiveItemList().then(itemlist =>{
            console.log("[RedaktionPage] (constructor) Items Recived from API: ",itemlist.data.data[0].itemlist)
            let itemList = itemlist.data.data[0].itemlist
            this.sessionNumber = itemlist.data.data[0].sessionNumber
            this.sessionStart = itemlist.data.data[0].sessionStart
            this.sessionEnd = itemlist.data.data[0].sessionEnd
            this.numberOfDays = itemlist.data.data[0].numberOfDays
            this.sessionInfo = {
                sessionNumber: this.sessionNumber,
                sessionStart: this.sessionStart,
                sessionEnd: this.sessionEnd,
                numberOfDays: this.numberOfDays,
            }

            api.getUtil().then(util=>{
                /// get active Index
                this.setState({
                    activeIndex: util.data.data[0].activeIndex,
                    // items: itemList,
                    // itemsReady: true,
                })
            })

            api.getStreamInfo().then(result =>{
                // console.log("SessionBanner getStreamInfo API reponse:",result)
                if(result.data.status.streaming === true){
                    // console.log("SessionBanner streaming")
                    this.setState({
                        // streamActive: true,
                        streamActive: false,/// change this in production so that this is true
                        sessionTimeVisible: true,
                    })
                    var changeStreamStatus = this.props.changeStreamStatus
                    changeStreamStatus(true)
                }
                else{
                    // console.log("SessionBanner Not streaming")
                    this.setState({
                        streamActive: false, 
                    })
                    var changeStreamStatus = this.props.changeStreamStatus
                    changeStreamStatus(false)
                }
            })

            this.setState({
                items: itemList,
                itemsReady: true,
                streamActive: false,
                // sessionInfo: this.sessionInfo
                // sessionTime: "0",
            })
        })
        this.state = {
            popupVisible: false,
        }

        // if(localStorage.getItem("stream_start_time")!= null){
        //     console.log("[SessionBanner] Got into the function: ")
            
        //     this.setState({
        //         sessionTimeVisible: true,
        //     })
        //     this.sessionTimeRef = setInterval(()=>{
        //         console.log("[SessionBanner] Interval: ",this.state.sessionTimeVisible)
        //         this.setState({
        //             sessionTime: (new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")))/1000,
                    
        //         })
        //     },1000)
            
            
        // }
        // else{
        //     this.setState({
        //         sessionTimeVisible: false,
        //     },()=>{
        //         console.log("[SessionBanner] falsing: ")
        //     })
        // }
       
        // this.handleOnchange = this.handleOnchange.bind(this);

    }

    
    ///////////////////////////////////////////
    // handleResetSession = () =>{
    //     apis.resetActiveSession().then((response)=>{
    //         if(response.status == 200){
    //             let payload = {
    //                 itemList: [],
    //                 // sessionNumber: this.props.sessionNumber,
    //                 // sessionStart: this.props.sessionStart,
    //                 // sessionEnd: this.props.sessionEnd,
    //                 // numberOfDays: this.props.numberOfDays,
    //             }
    //             apis.createActiveSession(payload).then((res)=>{
    //                 if(res.status == 201){
    //                     console.log("[SessionBanner] (handleResetSession) Successfullt created an empty Active Session")
    //                     var payl = {
    //                         activeIndex: "0",
    //                     }
    //                     apis.updateUtil(payl).then(()=>{
    //                         window.location.reload(true);
    //                     })
                        
    //                 }
    //                 else{
    //                     console.log("[SessionBanner] (handleResetSession) Unable to create an empty Active Session, response: ",res)
    //                 }
    //             }).catch((error)=>{
    //                 console.log("[SessionBanner] (handleResetSession) Error in createActiveSession API. Error: ",error)
    //             })
    //         }
    //         else{
    //             console.log("[SessionBanner] (handleResetSession) Unable to reset the ACtive session DB. Response:  ",response)
    //         }
    //     }).catch((err)=>{
    //         console.log("[SessionBanner] (handleResetSession) Error in resetActiveSession API. Error: ",err)
    //     })
        
    // }
    // ///////////////////////////////////////////
    // handleImportXML = () =>{
    //     this.setState({
    //         popupVisible: true,
    //     })

    //     // window.open('/importxml','','width=600,height=400,left=200,top=200')
        
    // }

    // fileSelected = (e) =>{
    //     window.location.reload(true);
        
        
    // }

    // handleOnchange = (e) =>{

    //     // Delete all previous sessions
    //     var pXML = this.state.plausibleXML;
    //     apis.deleteAllSession()

    //     // Insert a new session
    //     e.target.files[0].text().then((data)=>{
    //          GermanTranslation.map((obj)=>{
    //             data = data.replaceAll(obj.german,obj.english)
    //          })
    //         let jsonn = new xml2js.Parser({explicitArray: false});
    //         jsonn.parseString(data, (err,res)=>{
    //             var sessionNumber = res.Info.ElectionPeriod.Sessions.sessionNumber
    //             var sessionStart = res.Info.ElectionPeriod.Sessions.sessionStart
    //             var sessionEnd = res.Info.ElectionPeriod.Sessions.sessionEnd
    //             var numberOfDays = res.Info.ElectionPeriod.Sessions.numberOfDays
    //             apis.insertSession(res).then((result)=>{
    //                 if(result.status === 201){
    //                     console.log("Setting pXML true")
    //                     // pXML = true;
    //                     this.setState({
    //                         // plausibleXML:true,
    //                         plausibleSessionNumber : sessionNumber,
    //                         plausibleSessionStart: sessionStart,
    //                         plausibleSessionEnd: sessionEnd,
    //                         plausibleNumberOfDays: numberOfDays,
    //                     })
    //                 }
    //                 else{
    //                     // pXML = false;
    //                     console.log("Setting pXML false")
    //                     this.setState({plausibleXML:false,})
    //                 }
    //                 console.log("[SessionBanner] (handleOnchange) result: ",result)
    //                 apis.getAllSessions().then(session =>{
    //                     let itemList = new ItemList(session.data.data[0])
    //                     itemList.convertItemListToMap();
    //                     itemList.update2DB(sessionNumber,sessionStart,sessionEnd,numberOfDays).then(()=>{
    //                         var payl = {
    //                             activeIndex: "0",
    //                         }
    //                         apis.updateUtil(payl).then((respon)=>{
    //                             // window.location.reload(true);
    //                             console.log("[SessionBanner] (handleOnChange) Updating Utils with response: ",respon)
    //                             this.setState({
    //                                 plausibleXML: true,
    //                             })
                                
    //                         })
    //                         // window.location.reload(true);
    //                     });
    //                 })
    //             }).catch((error)=>{
    //                 this.setState({
    //                     plausibleXML: false,
    //                 })
    //                 console.log("[SessionBanner] (handleOnchange) GOt error while entering XML Session. NOT PLAUSIBLE XML. ERROR: ",error)
    //             });
                
    //         })
            
    //     })
        

    // }


    // popupClose = () =>{
    //     this.setState({
    //         popupVisible: false,
    //     })
    // }
    
    // //////////////////////////////////////////////
    // handleImportActive = () =>{
    //     apis.deleteAllSession()

    //     apis.getSessionWeb().then(data => {
    //         // console.log(data.data.data)
    //         var xmldata = data.data.data
    //         GermanTranslation.map((obj)=>{
    //             xmldata = xmldata.replaceAll(obj.german,obj.english)
    //          })
    //         let jsonn = new xml2js.Parser({explicitArray: false});
    //         jsonn.parseString(xmldata, function(err,res){
    //             // console.log("Got Latest session:",res);
    //             var sessionNumber = res.Info.ElectionPeriod.Sessions.sessionNumber
    //             var sessionStart = res.Info.ElectionPeriod.Sessions.sessionStart
    //             var sessionEnd = res.Info.ElectionPeriod.Sessions.sessionEnd
    //             var numberOfDays = res.Info.ElectionPeriod.Sessions.numberOfDays

    //             // new $ sign handling

    //             apis.insertSession(res).then(()=>{
    //                 apis.getAllSessions().then(session =>{
    //                     let itemList = new ItemList(session.data.data[0])
    //                     itemList.convertItemListToMap();
    //                     itemList.update2DB(sessionNumber,sessionStart,sessionEnd,numberOfDays).then(()=>{
    //                         // window.location.reload(true);
    //                         var payl = {
    //                             activeIndex: "0",
    //                         }
    //                         apis.updateUtil(payl).then(()=>{
    //                             window.location.reload(true);
    //                         })
    //                     });
    //                 })
    //             })

    //         })
    //     });
    // }

    // //////////////////////////////////////////////
    // handleSpeakersImport =() =>{
    //     apis.getAllSpeakers().then(data =>{
    //         console.log(data.data.data.Abgeordnetenliste);
    //         var payload = {
    //             Abgeordnetenliste: data.data.data.Abgeordnetenliste,
    //         }
    //         apis.updateSpeakerList(payload).then(response =>{
    //             window.location.reload(true);
    //         })
    //     })
    // }

    // ////////////////////////////////

    // addTOPClicked = (e,index) =>{
    //     let emptyItem = new Item();
    //     emptyItem = emptyItem.toMap();
    //     this.setState({
    //         // popupVisible: true,
    //         newTOPVisible: true,
    //         emptyItem: emptyItem,
    //         newItemIndex: index,
    //     })
    // }

    // addNewTOP = () =>{
    //     console.log("[SessionBanner] (addNewTOP) this.state.emptyItem: ",this.state.emptyItem)

    //     this.setState({
    //         emptyItem: this.state.emptyItem,
    //         popupVisible: false,
    //     })
    //     var newIndexNumber = this.state.emptyItem.itemNumber
    //     var item_duration = parseInt(this.state.emptyItem.itemDuration) * 60
    //     var ItemObj = new Item();
    //     if(this.state.blankSelected){
    //         var BlankItemObj = new Item(" ","0","00:00");
    //         BlankItemObj.setItemNumber("außerhalb der","TO")
    //         BlankItemObj.setConsultationType("Blanko")
    //         BlankItemObj = BlankItemObj.toMap();
    //         // console.log("New created:",ItemObj)
    //         // ItemObj.fromMap(this.state.emptyItem)
    //         this.addTOPpopupClose();
    //         var ItemListToUpdate = new ItemList()
    //         ItemListToUpdate.fromList(this.state.items)
    //         ItemListToUpdate.insertAt(BlankItemObj,parseInt(newIndexNumber))
    //         // console.log("ItemList update: ",ItemListToUpdate)
    //         ItemListToUpdate.update2DB(this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays).then(() =>{
    //             window.location.reload(true);
    //         })
    //     }
    //     if(this.state.unterSelected){
    //         ItemObj.fromMap(this.state.emptyItem)
    //         this.addTOPpopupClose();
    //         ItemObj.setDuration(item_duration)
    //         ItemObj.setItemNumber("außerhalb der","TO")
    //         ItemObj.setConsultationType("Unterrichtung")
    //         this.addTOPpopupClose();
    //         ItemObj.giveTimeOnPercentageSeats();
    //         ItemObj = ItemObj.toMap();
    //         var ItemListToUpdate = new ItemList()
    //         ItemListToUpdate.fromList(this.state.items)
    //         console.log("[SessionBanner] (addNewTOP) ItemList created: ",ItemListToUpdate);
    //         ItemListToUpdate.insertAt(ItemObj,parseInt(newIndexNumber) )
    //         // console.log("UPDATING ITEMLIST: ",ItemListToUpdate)
    //         // console.log("UPDATING ITEMLIST with session Number: ",this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays)
    //         ItemListToUpdate.update2DB(this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays).then(() =>{
    //             window.location.reload(true);
    //         })
    //     }

    //     if(this.state.firstSelected){
    //         ItemObj.fromMap(this.state.emptyItem)
    //         this.addTOPpopupClose();
    //         ItemObj.setDuration(item_duration)
    //         ItemObj.setItemNumber("außerhalb der","TO")
    //         ItemObj.setConsultationType("erste Beratung")
    //         this.addTOPpopupClose();
    //         ItemObj.giveTimeOnPercentageSeats();
    //         ItemObj = ItemObj.toMap();
    //         var ItemListToUpdate = new ItemList()
    //         ItemListToUpdate.fromList(this.state.items)
    //         ItemListToUpdate.insertAt(ItemObj,parseInt(newIndexNumber))
    //         // console.log("UPDATING ITEMLIST: ",ItemListToUpdate)
    //         // console.log("UPDATING ITEMLIST with session Number: ",this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays)
    //         ItemListToUpdate.update2DB(this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays).then(() =>{
    //             window.location.reload(true);
    //         })
    //     }

    //     if(this.state.lastSelected){
    //         ItemObj.fromMap(this.state.emptyItem)
    //         this.addTOPpopupClose();
    //         ItemObj.setDuration(item_duration)
    //         ItemObj.setItemNumber("außerhalb der","TO")
    //         ItemObj.setConsultationType("abschlieBende Beratung")
    //         this.addTOPpopupClose();
    //         ItemObj.giveTimeOnPercentageSeats();
    //         ItemObj = ItemObj.toMap();
    //         var ItemListToUpdate = new ItemList()
    //         ItemListToUpdate.fromList(this.state.items)
    //         console.log("items:",this.state.items)
    //         ItemListToUpdate.insertAt(ItemObj,parseInt(newIndexNumber))
    //         // console.log("UPDATING ITEMLIST: ",ItemListToUpdate)
    //         // console.log("UPDATING ITEMLIST with session Number: ",this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays)
    //         ItemListToUpdate.update2DB(this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays).then(() =>{
    //             window.location.reload(true);
    //         })
    //     }
        
        


    // }
    // addTOPpopupClose = () =>{
    //     this.setState({
    //         newTOPVisible: false,
    //         unterSelected: false,
    //         firstSelected: false,
    //         lastSelected: false,
    //         blankSelected: false,
    //     })
    // }

    // getStopwatchFuntions = (startBtn,stopBtn,pauseBtn,time) =>{
    //     this.stopwatchStartBtn = startBtn
    //     this.stopwatchStopBtn = stopBtn
    //     this.stopwatchPauseBtn = pauseBtn
    //     console.log("[SessionBanner] (getStopwatchFunctions) got time:" + time )
    //     var stopwatchFuntionsToRedaktionPage = this.props.getStopwatchFuntions
    //     stopwatchFuntionsToRedaktionPage(this.stopwatchStartBtn,this.stopwatchStopBtn,this.stopwatchPauseBtn,time)
    // }

    startStream = () =>{
        var tempItem = this.state.items[this.props.activeIndex]
        if(tempItem.meetingNumber === -1){
            var meetingNumber = this.state.items[parseInt(this.props.activeIndex)+1].meetingNumber
        }
        else{
            var meetingNumber = tempItem.meetingNumber
        }
        
        var payload = {
            sessionNumber: this.sessionNumber,
            meetingNumber: meetingNumber
        }
        console.log("[SessionBanner] (startStream) startStream with payload",payload)
        api.startStream(payload).then((result)=>{
            console.log(result)
            this.setState({
                streamActive: true,
            })
            var changeStreamStatus = this.props.changeStreamStatus
            changeStreamStatus(true)
        })
        .catch((error)=>{
            ///TODO: Add popup which warns stream not started
            this.setState({
                streamActive: true,
            })
            var changeStreamStatus = this.props.changeStreamStatus
            changeStreamStatus(true)
        })
        localStorage.setItem("stream_start_time",new Date().getTime())
        this.setState({
            sessionTimeVisible: true,
        })
        this.sessionTimeRef = setInterval(()=>{
            this.setState({
                sessionTime: (new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")))/1000,
            })
        },1000)

        api.startUDPTime();
        

    }

    stopStream = () =>{
        api.stopStream().then(()=>{
            this.setState({
                streamActive: false,
            })
            var changeStreamStatus = this.props.changeStreamStatus
            changeStreamStatus(false)
        })
        .catch((error)=>{
            this.setState({
                streamActive: false,
            })
            var changeStreamStatus = this.props.changeStreamStatus
            changeStreamStatus(false)
        })
        localStorage.setItem("stream_start_time",null)

        clearInterval(this.sessionTimeRef)
        this.setState({
            sessionTime: 0,
            sessionTimeVisible: false,
        })
        // var handleSetStreamStartTime = this.props.handleSetStreamStartTime
        // handleSetStreamStartTime(-1)
        api.stopUDPTime();
        
    }

    render(){
        return (
            <SessionWrapper style={{marginTop:`${this.props.hover?'0px':'85px'}`}} >
                {/* <TabBtnSpacer>&nbsp;</TabBtnSpacer> */}
                <SessionInfoWrapper>
                    <SessionNumber>
                        {this.props.sessionNumber}. Plenarsitzung
                    </SessionNumber>
                    <BtnWrap>
                        {this.state.streamActive === false ?
                         <RecBtn onClick={this.startStream}>
                            <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="green" class="bi bi-play-fill" viewBox="0 0 16 16">
                            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                            </svg></div>
                            START</RecBtn>

                            :<RecBtn>
                            <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="green" class="bi bi-play-fill" viewBox="0 0 16 16">
                            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                            </svg></div>
                            START</RecBtn>
                        }

                        
                        <StopBtn onClick={this.stopStream}>
                            <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="red" className="bi bi-stop-fill" viewBox="0 0 16 16">
                            <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
                            </svg></div>
                            STOP</StopBtn>

                        {
                            this.state.sessionTimeVisible ?
                                <SessionTime>
                                    {timeFormatSec(String(this.state.sessionTime))}
                                </SessionTime>
                            :null
                        }
                    </BtnWrap>
                    {this.props.sessionStart?
                        <StartDate>
                        {convertDate(this.props.sessionStart)} bis {convertDate(this.props.sessionEnd)}
                        </StartDate>
                    :null}
                    
                </SessionInfoWrapper>
                {/* <TimerWrapper>
                    <IndependentStopwatch getStopwatchFuntions={this.getStopwatchFuntions}/>
                </TimerWrapper> */}

                {/* <TabBtnWrapperTrailing>
                    <TabBtnTrailing onClick={(e)=>this.addTOPClicked(e,this.props.activeIndex+1)}>
                       <AddTOPText>
                        neuer BG
                       </AddTOPText>
                    </TabBtnTrailing>
                </TabBtnWrapperTrailing> */}

        
                {/* <Popup
                            width={600}
                            height={240}
                            showTitle={true}
                            title="XML-Datei auswählen"
                            closeOnOutsideClick={true}
                            visible={this.state.popupVisible}
                            onHiding={() => {this.popupClose()}} >
                                <input type="file" onChange={this.handleOnchange} style={{float: "left"}}/>
                                {this.state.plausibleXML ?
                                    <div className="import-btn font-link" onClick={this.fileSelected}>Absenden</div>
                                :
                                    this.state.plausibleXML === false ?
                                        <div className="import-btn-negative font-link">Absenden</div>
                                        :
                                        <div className="import-btn-disable font-link" >Absenden</div>
                                }
                                {this.state.plausibleXML === false?
                                <div>Unglaubwürdig XML!</div>:null}

                                {
                                    this.state.plausibleXML === true?
                                    <div style={{float: "left"},{clear:"left"}}>
                                        <div>Plenarsitzung: {this.state.plausibleSessionNumber}</div>
                                        <div>Start: {this.state.plausibleSessionStart}</div>
                                        <div>Ende: {this.state.plausibleSessionEnd}</div>
                                        <div>Sitzungstage: {this.state.plausibleNumberOfDays}</div>
                                    </div>:null
                                }

                </Popup> */}

                {/* <Popup
                            width={700}
                            height={330}
                            showTitle={true}
                            title="Neuer TOP hinzufügen"
                            closeOnOutsideClick={true}
                            visible={this.state.newTOPVisible}
                            onHiding={() => {this.addTOPpopupClose()}} > 
                                <AddTOPOptionWrapper>
                                    {this.state.unterSelected? 
                                        <AddTOPOption style={{paddingTop: "15px",paddingBottom:"15px",backgroundColor: "#08435C"}} >
                                            Unterrichtung
                                        </AddTOPOption>
                                        :
                                        <AddTOPOption 
                                            style={{paddingTop: "15px",paddingBottom:"15px"}} 
                                            onClick={()=>{
                                                var tempItem = this.state.emptyItem
                                                tempItem.itemDuration = 5
                                                this.setState({
                                                    unterSelected: true,
                                                    firstSelected: false,
                                                    lastSelected: false,
                                                    blankSelected: false,
                                                    emptyItem: tempItem,
                                                    })
                                                }}>
                                            Unterrichtung
                                        </AddTOPOption>
                                    }
                                    
                                    {this.state.firstSelected?
                                        <AddTOPOption style={{backgroundColor: "#08435C"}}>
                                        erste <br/> Beratung
                                        </AddTOPOption>
                                        :
                                        <AddTOPOption 
                                            onClick={()=>{
                                                var tempItem = this.state.emptyItem
                                                tempItem.itemDuration = 26
                                                this.setState({
                                                    firstSelected: true,
                                                    unterSelected: false,
                                                    lastSelected: false,
                                                    blankSelected: false,
                                                    emptyItem: tempItem,
                                                },()=>{
                                                    console.log("firstSelected")
                                                    })
                                                }
                                            }>
                                        erste <br/> Beratung
                                        </AddTOPOption>
                                    }
                                    {this.state.lastSelected?
                                        <AddTOPOption style={{backgroundColor: "#08435C"}}>
                                        abschließende Beratung
                                        </AddTOPOption>
                                        :<AddTOPOption 
                                            onClick={()=>{
                                                var tempItem = this.state.emptyItem
                                                tempItem.itemDuration = 26
                                                this.setState({
                                                    lastSelected: true,
                                                    unterSelected: false,
                                                    firstSelected: false,
                                                    blankSelected: false,
                                                    emptyItem: tempItem,
                                                    },()=>{
                                                        console.log("lastSelected")
                                                        })
                                                    }
                                                }>
                                        abschließende Beratung
                                        </AddTOPOption>
                                    }
                                    {this.state.blankSelected?
                                        <AddTOPOption style={{paddingTop: "15px",paddingBottom:"15px",backgroundColor: "#08435C"}}>
                                        Blanko
                                        </AddTOPOption>
                                        :<AddTOPOption style={{paddingTop: "15px",paddingBottom:"15px"}} 
                                            onClick={()=>{
                                                var tempItem = this.state.emptyItem
                                                tempItem.itemDuration = 5
                                                this.setState({
                                                    blankSelected: true,
                                                    lastSelected: false,
                                                    unterSelected: false,
                                                    firstSelected: false,
                                                    emptyItem: tempItem,
                                                    })
                                                }
                                            }>
                                            Blanko
                                        </AddTOPOption>
                                    }
                                </AddTOPOptionWrapper>
                                
                                <Form
                                    id="form"
                                    formData={this.state.emptyItem}
                                >
                                    <GroupItem >
                                        <SimpleItem dataField="subjectOfItems[0].title" label={{text:"Beratungsgegenstand 1"}} />
                                    </GroupItem>

                                    <GroupItem colCount={3}>
                                        <GroupItem>
                                            <SimpleItem dataField="itemDuration" label={{text:"TOP Dauer (Minuten)",}}/>
                                            <SimpleItem dataField="itemNumber" label={{text:"Position"}} />
                                        </GroupItem>
                                        {/* <GroupItem>
                                            <SimpleItem dataField="itemNumber" label={{text:"Index"}} />
                                        </GroupItem>
                                         <GroupItem>
                                            <div className="setting-btn" onClick={this.handleSettingClick}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
                                                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                                                </svg>
                                            </div>
                                            
                                            {this.state.settingButton ?
                                            <div>
                                                
                                                <Form
                                                id="party-percentages"
                                                formData={this.state.percentages}>
                                                    <SimpleItem  dataField="LR" label={{text:"LR",}} />
                                                    <SimpleItem  dataField="SPD" label={{text:"SPD",}} />
                                                    <SimpleItem  dataField="CDU" label={{text:"CDU",}} />
                                                    <SimpleItem  dataField="greens" label={{text:"Die Grunen",}} />
                                                    <SimpleItem  dataField="FDP" label={{text:"FDP",}} />
                                                    
                                                </Form>
                                                <div className="save-percentage-btn" onClick={this.savePartyPercentages}>
                                                    <Button id="bp" text="Save %" type="success" />
                                                </div>
                                            </div>    
                                            :null}
                                        </GroupItem> 
                                    </GroupItem>
                                    <GroupItem>
                                        <div onClick={()=>{this.addNewTOP()}}>
                                            <Button
                                            id="button"
                                            text="Absenden"
                                            type="success"
                                            useSubmitBehavior={true}
                                            />
                                        </div>
                                    </GroupItem>
                                </Form>
                </Popup> */}
            </SessionWrapper>

        )
    }

    
}
export default SessionBanner

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////    STYLED FUNCTIONAL COMPONENTS         ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

const SessionWrapper = styled.div.attrs({className: "session-wrapper", id: "sessionbanner1"})`
    float: left;
    width: 100%;
    height: 20%;
    overflow: hidden;
    margin-top:85px;

`

const TabBtnWrapper = styled.div.attrs({className:"tab-btn-wrapper"})`
    float: left;
    width: 10%;
    height: 100%;
    align-content: center;
    justify-content: center;
    text-align: center;
`

const TabBtnSpacer = styled.div.attrs({})`
    float: left;
    width: 5%;
    height: 100%;
`

const TabBtnWrapperTrailing = styled.div.attrs({className:"tab-btn-wrapper"})`
    float: left;
    width: 6%;
    height: 100%;
    align-content: center;
    justify-content: center;
    text-align: center;
`

const TabBtn = styled.div.attrs({className: "session-tab font-fill hoverpointer"})`

    flaot: left;
    width: 25%;
    height: 25%;
    background-color: #08435C;
    border-radius: 4px;
    padding: 5px;
    margin: auto;
    margin-top: 8px;

    color:white;
    font-size: 7px;



`

const TabBtnTrailing = styled.div.attrs({className: "session-tab font-fill hoverpointer"})`

    flaot: left;
    width: 70%;
    height: 160px;
    background-color: #08435C;
    border-radius: 4px;
    padding: 5px;
    margin: auto;
    margin-top: 8px;

    color:white;
    font-size: 17px;



`

const SessionInfoWrapper = styled.div.attrs({className: "session-info-wrapper"})`
    float:left;
    width: 90%;
    display: inline-block;
    height: 100%;
    background-color: #EDEFF1;
    border-radius: 10px;
    margin-top: 8px;
    margin : 10px;
    margin-right: 17px;
    border: 1px solid #08435C;
    padding-bottom: 20px;

`

const SessionNumber = styled.div.attrs({className: "session-number font-link"})`

    padding: 5px;
    margin-left: 25px;
    font-size: 36px;
    line-height: 46px;
    color: #081D34;
    float:right;

    padding-top: 25px;

    width:50%;


`

const NumberDays = styled.div.attrs({className: "number-days font-link hide-onhover"})`
    font-size: 36px;
    line-height: 46px;
    padding: 5px;
    color: #081D34;
    float:left;

    display: none;

`

const BtnWrap = styled.div.attrs({className: "session-btn-wrapper"})`
    width: 40%;
    float: left;
    margin-left: 25px;
    padding: 5px;
    margin: 34px 25px 34px 25px;
    margin-bottom: 5px;

`

const RecBtn = styled.div.attrs({className: "session-rec-btn font-link hoverpointer"})`

    width: 60px;
    height: 60px;
    background: #08435C;
    border-radius: 10px;
    color: white;
    text-align: center;

    margin: 10px;
    float: left;

`

const StopBtn = styled.div.attrs({className: "session-stop-btn font-link hoverpointer"})`

    width: 60px;
    height: 60px;
    background: #08435C;
    border-radius: 10px;
    color: white;
    text-align: center;

    margin: 10px;
    float: left;

`

const PauseBtn = styled.div.attrs({className: "session-pause-btn font-link hoverpointer"})`

    width: 60px;
    height: 60px;
    background: #08435C;
    border-radius: 10px;
    color: white;
    text-align: center;

    margin: 10px;
    float: left;

`

const StartDate = styled.div.attrs({className: "start-date font-link"})`
    font-size: 22px;
    line-height: 28px;
    color: #081D34;
    float:right;
    width: 50%;
    padding: 10px;

    

`

const SessionTime = styled.div.attrs({className: "font-link"})`
    float: left;
    font-size: 25px;
    text-align: center;
    margin: 10px;
    padding-left: 25px;
    padding-top: 15px;
`

const EndDate = styled.div.attrs({className: "end-date font-link hide-onhover"})`
    font-size: 22px;
    line-height: 28px;
    color: #081D34;
    float:left;
    width: 25%;
    padding:10px;

    display: none;

`

const TimerWrapper = styled.div.attrs({className: "seesion-info-wrapper"})`
    float:left;
    width: 30%;
    display: inline-block;
    height: 100%;
    background-color: #EDEFF1;
    border-radius: 10px;
    margin-top: 8px;
    border: 1px solid #08435C;


`

// const AddTOPOption = styled.div.attrs({className:"add-top-option"})`

//     border-radius: 5px;
//     width: 20%;
//     margin: 5px;
//     background-color: #5C778E;
//     color: white;
//     text-align: center;
//     padding: 5px;
//     margin: auto;
// `

// const AddTOPOptionWrapper = styled.div.attrs({className: "add-top-options-wrapper font-link"})`

//     width: 100%;
//     margin: 5px;
//     display: flex;

// `

const AddTOPText = styled.div.attrs({})`
    position: relative;
    top: 45%;
`

 


//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//xxxxxxxxxxxxxxxxxxxxxxxxx   END OF STYLED FUNCTIONAL COMPONENTS      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////             UTILIY  FUNCTIONS           ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////


function convertDate(date){
    var data = date.split('-')
    return data[2] + "." + data[1] + "." + data[0]
}

function zeroPad(number, size = 2) {
    let s = String(number);
    while (s.length < size) { s = '0' + s;}
    return s;
  }

function timeFormatSec(remaining) {

    if(remaining < 0){
  
        remaining *= -1;
        const hh = parseInt( remaining / 3600, 10 );
  
        remaining %= 3600;
  
        const mm = parseInt( remaining / 60, 10 );
        const ss = parseInt( remaining % 60, 10 );
  
  
    return `- ${ zeroPad( hh ) }:${ zeroPad( mm ) }:${ zeroPad( ss ) }`;
  
    }else{
        const hh = parseInt( remaining / 3600, 10 );
  
        remaining %= 3600;
  
        const mm = parseInt( remaining / 60, 10 );
        const ss = parseInt( remaining % 60, 10 );
  
  
        return `${ zeroPad( hh ) }:${ zeroPad( mm ) }:${ zeroPad( ss ) }`;
    }
    
    
  }
  