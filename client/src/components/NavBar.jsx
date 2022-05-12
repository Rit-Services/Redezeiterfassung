import React, { Component } from 'react'
import styled from 'styled-components'

import { ItemList,Item } from "../model";
import apis from "../api";
import { GermanTranslation } from "../util/german2English"
import api from '../api'
import CurrentTime from './CurrentTime';
import xml2js from 'xml2js'

import Form, {
    SimpleItem,
    GroupItem,
    ButtonItem,
  } from "devextreme-react/form";
import { PatternRule, RequiredRule, AsyncRule } from 'devextreme-react/validator';
import List from 'devextreme-react/list'
import "devextreme-react/text-area";
import { Popup, Position } from 'devextreme-react/popup';
// import Button from 'devextreme-react/button';


import Logo from '../assets/landtag.png'
import '../styles/fonts.css'
import { Link } from 'react-router-dom'
import { SessionBanner } from '.';







class NavBar extends Component {

    constructor(props){
        super(props)

        window.onscroll = this.scrollFuntion; 
        window.onload = this.scrollFuntion;

        this.buttonOptions = {
            id:"button",
            text:"Absenden",
            type:"success",
            useSubmitBehavior:true,
        }

        this.passwordButtonOptions = {
            id:"pwdbutton",
            text:"Ja",
            type:"success",
            useSubmitBehavior:true,
        }

        

        this.passwordOptions = {
            mode: 'password',
          };

        
        this.dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
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
                })
            })

            this.setState({
                items: itemList,
                itemsReady: true,
                validationReasons: [],
                // sessionInfo: this.sessionInfo
            })
        })

        this.state = {
            popupVisible: false,
            stopwatchNavbar: true,
            isRunning: false,
            time: 0,
            consultationTypeSelectionError: false,
            // items: this.props.itemList,
            currDate: new Date().toLocaleDateString('de-DE',this.dateOptions),
            unterSelected: false,
            firstSelected: false,
            lastSelected: false,
            blankSelected: false,
            pauseSelected: false,
            unterbrechungSelected: false,
            importActiveClicked: false,
            importActiveResult: "Herunterladen ...",
            importActiveBtn: "Absenden",
            passwordItem: "",
            
        }

        

        this.neinButtonOptions = {
            id:"neinbutton",
            text:"Nein",
            // type:"failure",
            type: "success",
            useSubmitBehavior:false,
            onClick: ()=>{
                this.setState({
                    adminPanelClicked: false,
                })
            }
        }
    }

    scrollFuntion = () =>{
        if(document.documentElement.scrollTop > 190){
            this.setState({
                stopwatchNavbar: true,
            })
            // this.stopwatchStart = this.props.stopwatchStartBtn
            // this.stopwatchStop = this.props.stopwatchStopBtn
            // this.stopwatchPause = this.props.stopwatchPauseBtn
            // console.log("[NavBar] (getStopwatchFunctions) got functions: "+ this.stopwatchStart)
        }
        else{
            this.setState({
                stopwatchNavbar: false,
            })
        }
    }

    handleImportXML = () =>{
        this.setState({
            popupVisible: true,
        })

        // window.open('/importxml','','width=600,height=400,left=200,top=200')
        
    }

    fileSelected = (e) =>{
        window.location.reload(true);
        
        
    }

    handleOnchange = (e) =>{

        // Delete all previous sessions
        var pXML = this.state.plausibleXML;
        apis.deleteAllSession()

        // Insert a new session
        e.target.files[0].text().then((data)=>{
             GermanTranslation.map((obj)=>{
                data = data.replaceAll(obj.german,obj.english)
             })
            let jsonn = new xml2js.Parser({explicitArray: false});
            jsonn.parseString(data, (err,res)=>{
                var sessionNumber = res.Info.ElectionPeriod.Sessions.sessionNumber
                var sessionStart = res.Info.ElectionPeriod.Sessions.sessionStart
                var sessionEnd = res.Info.ElectionPeriod.Sessions.sessionEnd
                var numberOfDays = res.Info.ElectionPeriod.Sessions.numberOfDays
                var numberOfTops = 0;
                res.Info.ElectionPeriod.Sessions.meetings.map((meeting)=>{
                    numberOfTops = numberOfTops + parseInt(meeting.quantityItems)
                })

                apis.insertSession(res).then((result)=>{
                    if(result.status === 201){
                        console.log("Setting pXML true")
                        // pXML = true;
                        this.setState({
                            // plausibleXML:true,
                            plausibleSessionNumber : sessionNumber,
                            plausibleSessionStart: sessionStart,
                            plausibleSessionEnd: sessionEnd,
                            plausibleNumberOfDays: numberOfDays,
                            plausibleNumberOfTops: numberOfTops,
                        })
                    }
                    else{
                        // pXML = false;
                        console.log("Setting pXML false")
                        this.setState({plausibleXML:false,})
                    }
                    console.log("[SessionBanner] (handleOnchange) result: ",result)
                    apis.getAllSessions().then(session =>{
                        let itemList = new ItemList(session.data.data[0])
                        itemList.convertItemListToMap();
                        console.log("[Navbar] itemlist:",itemList)
                        itemList.update2DB(sessionNumber,sessionStart,sessionEnd,numberOfDays).then((result)=>{
                            console.log("Navbar New Session result: ",result)
                            var payl = {
                                activeIndex: "0",
                            }
                            apis.updateActiveIndex(payl).then((respon)=>{
                                // window.location.reload(true);
                                console.log("[SessionBanner] (handleOnChange) Updating Utils with response: ",respon)
                                this.setState({
                                    plausibleXML: true,
                                })
                                
                            })
                            .catch((error)=>{
                                console.log("[SessionBanner] (handleOnChange) errored on updating Active Index")
                                this.setState({
                                    plausibleXML: true,
                                })
                            })
                            this.setState({
                                plausibleXML: true,
                            })
                        })
                    })
                }).catch((error)=>{
                    console.log("[SessionBanner] (handleOnchange) GOt error while entering XML Session. NOT PLAUSIBLE XML. ERROR: ",error)
                    this.setState({
                        plausibleXML: false,
                    })
                    
                });
                
            })
            
        })
        

    }


    popupClose = () =>{
        this.setState({
            popupVisible: false,
        })
    }
    
    //////////////////////////////////////////////
    importActiveClicked = () =>{
        this.setState({
            importActiveClicked: true,
        })
        this.getImportActiveInfo();
    }

    closeImportActivePopup = () =>{
        this.setState({
            importActiveClicked: false,
        })
    }


    getImportActiveInfo = async() =>{
        apis.getSessionWeb().then(data =>{
            var xmldata = data.data.data
            GermanTranslation.map((obj)=>{
                xmldata = xmldata.replaceAll(obj.german,obj.english)
             })
            let jsonn = new xml2js.Parser({explicitArray: false});
            jsonn.parseString(xmldata, (err,res) =>{
                
                var numberOfTops = 0;
                res.Info.ElectionPeriod.Sessions.meetings.map((meeting)=>{
                    numberOfTops = numberOfTops + parseInt(meeting.quantityItems)
                })

                var result = {
                    sessionNumber: res.Info.ElectionPeriod.Sessions.sessionNumber,
                    sessionStart: res.Info.ElectionPeriod.Sessions.sessionStart,
                    sessionEnd: res.Info.ElectionPeriod.Sessions.sessionEnd,
                    numberOfDays: res.Info.ElectionPeriod.Sessions.numberOfDays,
                    numberOfTops: numberOfTops,
                }

                this.setState({
                    importActiveResult: result,
                })
            })
        })
    }



    handleImportActive = () =>{
        apis.deleteAllSession()

        apis.getSessionWeb().then(data => {
            // console.log(data.data.data)
            var xmldata = data.data.data
            GermanTranslation.map((obj)=>{
                xmldata = xmldata.replaceAll(obj.german,obj.english)
             })
            let jsonn = new xml2js.Parser({explicitArray: false});
            jsonn.parseString(xmldata, function(err,res){
                // console.log("Got Latest session:",res);
                var sessionNumber = res.Info.ElectionPeriod.Sessions.sessionNumber
                var sessionStart = res.Info.ElectionPeriod.Sessions.sessionStart
                var sessionEnd = res.Info.ElectionPeriod.Sessions.sessionEnd
                var numberOfDays = res.Info.ElectionPeriod.Sessions.numberOfDays

                // new $ sign handling

                apis.insertSession(res).then(()=>{
                    apis.getAllSessions().then(session =>{
                        let itemList = new ItemList(session.data.data[0])
                        itemList.convertItemListToMap();
                        itemList.update2DB(sessionNumber,sessionStart,sessionEnd,numberOfDays).then(()=>{
                            // window.location.reload(true);
                            var payl = {
                                activeIndex: "0",
                            }
                            apis.updateActiveIndex(payl).then(()=>{
                                window.location.reload(true);
                            })
                        });
                    })
                })

            })
        });
    }

    //////////////////////////////////////////////
    handleSpeakersImport =() =>{
        apis.getAllSpeakers().then(data =>{
            // console.log(data.data.data.Abgeordnetenliste);
            var payload = {
                Abgeordnetenliste: data.data.data.Abgeordnetenliste,
            }
            apis.updateSpeakerList(payload).then(response =>{
                window.location.reload(true);
            })
        })
    }

    ////////////////////////////////

    //// ADD NEW TOP /////////

    addTOPClicked = (/*e,index*/) =>{
        let emptyItem = new Item();
        emptyItem = emptyItem.toMap();
        this.setState({
            // popupVisible: true,
            newTOPVisible: true,
            emptyItem: emptyItem,
            // newItemIndex: index,
        })
    }

    

    addNewTOP = (e) =>{
        e.preventDefault();
        // console.log("[NavBar] (addNewTOP) ",this.state.blankSelected)
        // console.log("[NavBar] (addNewTOP) ",this.state.unterSelected)
        // console.log("[NavBar] (addNewTOP) ",this.state.firstSelected)
        // console.log("[NavBar] (addNewTOP) ",this.state.lastSelected)
        if(this.state.blankSelected === false &&
            this.state.unterSelected === false &&
            this.state.firstSelected === false &&
            this.state.lastSelected === false &&
            this.state.pauseSelected === false &&
            this.state.unterbrechungSelected === false){
                this.setState({
                    consultationTypeSelectionError: true,
                    newTOPVisible: true,
                })
                console.log("[NavBar] No selection")
                
        }
        console.log("[NavBar] xx closing popu")
        this.setState({
            emptyItem: this.state.emptyItem,
            // popupVisible: false,
        })
        var newIndexNumber = this.state.emptyItem.itemNumber + 1
        var item_duration = parseInt(this.state.emptyItem.itemDuration) * 60
        var ItemObj = new Item();
        console.log("[NavBar] (addNewTOP) Index to add:", newIndexNumber)
        if(this.state.blankSelected){
            // var BlankItemObj = new Item(" ","0","00:00");
            var BlankItemObj = new Item();
            BlankItemObj.fromMap(this.state.emptyItem)
            BlankItemObj.setItemNumber("außerhalb der"," TO")
            BlankItemObj.setDuration(item_duration)
            BlankItemObj.setConsultationType("Blanko")
            BlankItemObj.giveTimeOnPercentageSeats();
            BlankItemObj = BlankItemObj.toMap();

            console.log("New created:",BlankItemObj)
            // ItemObj.fromMap(this.state.emptyItem)
            this.addTOPpopupClose();
            var ItemListToUpdate = new ItemList()
            console.log("[NavBar] itemlist: ",this.state.items)
            ItemListToUpdate.fromList(this.state.items)
            ItemListToUpdate.insertAt(BlankItemObj,parseInt(newIndexNumber))
            console.log("[NavBar] (addNewTOP) ItemList Updated created: ",ItemListToUpdate);
            // console.log("ItemList update: ",ItemListToUpdate)
            ItemListToUpdate.update2DB(this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays).then(() =>{
                window.location.reload(true);
            })
        }
        if(this.state.unterSelected){
            ItemObj.fromMap(this.state.emptyItem)
            this.addTOPpopupClose();
            ItemObj.setDuration(item_duration)
            ItemObj.setItemNumber("außerhalb der"," TO")
            ItemObj.setConsultationType("Unterrichtung")
            ItemObj.giveTimeOnPercentageSeats();
            ItemObj = ItemObj.toMap();
            console.log("New created:",ItemObj)
            var ItemListToUpdate = new ItemList()
            console.log("[NavBar] itemlist: ",this.state.items)
            ItemListToUpdate.fromList(this.state.items)
            console.log("[NavBar] (addNewTOP) ItemList created: ",ItemListToUpdate);
            ItemListToUpdate.insertAt(ItemObj,parseInt(newIndexNumber) )
            console.log("[NavBar] (addNewTOP) ItemList Updated created: ",ItemListToUpdate);
            ItemListToUpdate.update2DB(this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays).then(() =>{
                window.location.reload(true);
            })
        }

        if(this.state.firstSelected){
            ItemObj.fromMap(this.state.emptyItem)
            this.addTOPpopupClose();
            ItemObj.setDuration(item_duration)
            ItemObj.setItemNumber("außerhalb der"," TO")
            ItemObj.setConsultationType("erste Beratung")
            ItemObj.giveTimeOnPercentageSeats();
            ItemObj = ItemObj.toMap();
            console.log("New created:",ItemObj)
            var ItemListToUpdate = new ItemList()
            console.log("[NavBar] itemlist: ",this.state.items)
            ItemListToUpdate.fromList(this.state.items)
            ItemListToUpdate.insertAt(ItemObj,parseInt(newIndexNumber))
            console.log("[NavBar] (addNewTOP) ItemList Updated created: ",ItemListToUpdate);
            // console.log("UPDATING ITEMLIST: ",ItemListToUpdate)
            // console.log("UPDATING ITEMLIST with session Number: ",this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays)
            ItemListToUpdate.update2DB(this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays).then(() =>{
                window.location.reload(true);
            })
        }

        if(this.state.lastSelected || this.state.pauseSelected || this.state.unterbrechungSelected){
            ItemObj.fromMap(this.state.emptyItem)
            this.addTOPpopupClose();
            ItemObj.setDuration(item_duration)
            ItemObj.setItemNumber("außerhalb der"," TO")
            if(this.state.lastSelected){
                ItemObj.setConsultationType("abschlieBende Beratung")
            }
            if(this.state.pauseSelected){
                ItemObj.setConsultationType("pause")
            }
            if(this.state.unterbrechungSelected){
                ItemObj.setConsultationType("unterbrechung")
            }
            
            ItemObj.giveTimeOnPercentageSeats();
            ItemObj = ItemObj.toMap();
            console.log("New created:",ItemObj)
            var ItemListToUpdate = new ItemList()
            console.log("[NavBar] itemlist: ",this.state.items)
            ItemListToUpdate.fromList(this.state.items)
            console.log("items:",this.state.items)
            ItemListToUpdate.insertAt(ItemObj,parseInt(newIndexNumber))
            console.log("[NavBar] (addNewTOP) ItemList Updated created: ",ItemListToUpdate);
            // console.log("UPDATING ITEMLIST: ",ItemListToUpdate)
            // console.log("UPDATING ITEMLIST with session Number: ",this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays)
            ItemListToUpdate.update2DB(this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays).then(() =>{
                window.location.reload(true);
            })
        }
        
        


    }
    addTOPpopupClose = () =>{
        this.setState({
            newTOPVisible: false,
            unterSelected: false,
            firstSelected: false,
            lastSelected: false,
            blankSelected: false,
            consultationTypeSelectionError: false,
            pauseSelected: false,
            unterbrechungSelected: false,
        })
    }

    /// xxxx ADD NEW TOP END xxxxxx

    newTOPList = (data,index) =>{
        console.log("data"+data)
        return <ItemListCard onClick={()=>{
            this.state.emptyItem.itemNumber = index;
            this.setState({
                emptyItem: this.state.emptyItem,
                listItemSelected: index,
                });
            }}>
            {data.itemNumber + data.subjectOfItems[0].itemPostfix + " "}{data.subjectOfItems[0].title}
        </ItemListCard>
     }

    //// STOPWATCH FUNCTIONS
    start= (event) => {
        this.setState({
          isRunning : true 
        }, () => {
          this.timerRef = setInterval(
            () => { this.setState({
                time: this.state.time + 1000,
            }) }, 1000
          )
        });
        console.log('start button pressed!')
    }

    stop = (event)=> {
        this.setState({
          isRunning : false 
        }, () => {
          clearInterval(this.timerRef);
        });
    }
    
    reset = (event) => {
        this.setState({isRunning : false,
            time      : 0},
            () => {
                clearInterval(this.timerRef);
              });
    }


    getListOfActiveItems = () =>{
        var finalList = []
        for(let i=0;i<this.props.itemList.length;i++){
            if(i>this.state.activeIndex){
                finalList.push(this.state.items[i])
            }
        }
        console.log("getListOfActiveItems",finalList)
        return finalList
    }

    adminPanelpopupClose = () =>{
        this.setState({
            adminPanelClicked: false,
        })
    }
    
    checkPassword = (e) =>{
        e.preventDefault();
        console.log(this.state.passwordItem)
        apis.getSettings().then((result)=>{
            var pass = result.data.data.adminPassword
            if(pass == this.state.passwordItem){
                console.log("LOGGED")
                window.location.href = '/admin'
            }
        })
    }

    passwordValidation = () =>{
        

        return new Promise((resolve,reject)=>{
            apis.getSettings().then((result)=>{
                var pass = result.data.data.adminPassword
                if(pass == this.state.passwordItem){
                    resolve()
                    window.location.href = '/admin'
                }
                else{
                    reject()
                }
            })
        })
        
    }

    render() {
        return (
            <Container>
                <Nav>
                    <Wrapper  onClick={()=>{this.setState({adminPanelClicked: true})}}>
                    {/* <Link onClick style={{float:'right'}} to={'/admin'}> */}
                        <img src={Logo} width="200" height="72" alt="" />
                    {/* </Link> */}
                    </Wrapper>
                    {/* {this.state.stopwatchNavbar ?  */}
                        <StopwatchContainer>
                            {this.state.isRunning?
                            <StopwatchBtn>
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#08435C" className="bi bi-play-fill" viewBox="0 0 16 16">
                                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                                </svg>
                            </StopwatchBtn>
                            :
                            <StopwatchBtn onClick={()=>{this.start();this.setState({isRunning: true,})}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#08435C" className="bi bi-play-fill" viewBox="0 0 16 16">
                                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                                </svg>
                            </StopwatchBtn>
                            }
                            <StopwatchBtn onClick={()=>{this.stop();this.setState({isRunning: false,})}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#08435C" className="bi bi-pause-fill" viewBox="0 0 16 16">
                                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                                </svg>
                            </StopwatchBtn>
                            <StopwatchBtn onClick={()=>{this.reset();this.setState({isRunning: false,})}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#08435C" className="bi bi-arrow-counterclockwise" viewBox="0 0 17 14">
                                <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                                <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                                </svg>
                            </StopwatchBtn>
                            {/* <NavBarTimer  >{this.props.independentStopwatchTime?timeFormat(this.props.independentStopwatchTime):timeFormat(0)}</NavBarTimer> */}
                            <NavBarTimer  >{timeFormat(this.state.time)}</NavBarTimer>
                            <DateWrapper>{this.state.currDate}</DateWrapper>
                            {/* <DateWrapper >{this.state.currTime}</DateWrapper> */}
                            <CurrentTime />
                        </StopwatchContainer> 
                        {/* : null */}
                    {/* } */}

                    <MainHeading> REALMODUS </MainHeading>
                    <TabBtnWrapper>
                        <TabBtn className="hovertext" data-hover="Testmodus starten">
                            <Link to='/test' id="test-link-id">
                                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="16" fill="#08435C" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
                                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                                <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                                </svg><br/>
                                test
                            </Link>
                        </TabBtn>
                        <TabBtn onClick={this.importActiveClicked} className="hovertext" data-hover="aktuelle Sitzung importieren">
                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="#08435C" class="bi bi-download" viewBox="0 0 16 16">
                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                            </svg>
                        </TabBtn>
                        <TabBtn onClick={(e)=>{this.handleImportXML(e)}} className="hovertext" data-hover="Sitzung von USB importieren">
                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="#08435C" class="bi bi-usb-drive" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M6 .5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4H6v-4ZM7 1h1v1H7V1Zm2 0h1v1H9V1ZM6 5a1 1 0 0 0-1 1v8.5A1.5 1.5 0 0 0 6.5 16h4a1.5 1.5 0 0 0 1.5-1.5V6a1 1 0 0 0-1-1H6Zm0 1h5v8.5a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5V6Z"/>
                            </svg>
                        </TabBtn>
                        {/* <TabBtn onClick={this.handleSpeakersImport}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="#08435C" class="bi bi-person-plus-fill" viewBox="0 0 16 16">
                            <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                            <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
                            </svg>
                        </TabBtn> */}
                        <TabBtn onClick={(e)=>this.addTOPClicked(/*e,this.props.activeIndex+1*/)} className="hovertext" data-hover="neuen Beratungsgegenstand hinzufügen">
                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="#08435C" class="bi bi-plus-lg" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                            </svg>
                        </TabBtn>
                    </TabBtnWrapper>
                    
                    

                </Nav>
                <Popup
                            width={600}
                            height={240}
                            showTitle={true}
                            title="XML-Datei auswählen"
                            closeOnOutsideClick={true}
                            visible={this.state.popupVisible}
                            onHiding={() => {this.popupClose()}} >
                                <input type="file" onChange={this.handleOnchange} style={{float: "left"}}/>
                                
                                {this.state.plausibleXML === false?
                                <div>Unglaubwürdig XML!</div>:null}

                                {
                                    this.state.plausibleXML === true?
                                    <div style={{float: "left"},{clear:"left"}}>
                                        <div>Plenarsitzung: {this.state.plausibleSessionNumber}</div>
                                        <div>Start: {this.state.plausibleSessionStart}</div>
                                        <div>Ende: {this.state.plausibleSessionEnd}</div>
                                        <div>Sitzungstage: {this.state.plausibleNumberOfDays}</div>
                                        <div>Anzahl der TOP: {this.state.plausibleNumberOfTops}</div>
                                    </div>:
                                    <div style={{float: "left",clear:"both",height:"75px"}}>
                                        &nbsp;
                                    </div>
                                }
                                {this.state.plausibleXML ?
                                    <div className="import-btn font-link" onClick={this.fileSelected} style={{clear: "both"}}>Absenden</div>
                                :
                                    this.state.plausibleXML === false ?
                                        <div className="import-btn-negative font-link" style={{clear: "both"}}>Absenden</div>
                                        :
                                        <div className="import-btn-disable font-link" style={{clear: "both"}}>Absenden</div>
                                }

                </Popup>
                {this.props.itemList?
                <Popup
                    width={800}
                    height={600}
                    showTitle={true}
                    title="Neuer BG einfügen nach:"
                    closeOnOutsideClick={true}
                    visible={this.state.newTOPVisible}
                    onHiding={() => {this.addTOPpopupClose()}} > 
                    <AddTOPOptionWrapper style={{border:this.state.consultationTypeSelectionError === false ? 'none' : 'red solid 4px'}}>
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
                                        pauseSelected: false,
                                        unterbrechungSelected: false,
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
                                        pauseSelected: false,
                                        unterbrechungSelected: false,
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
                                        pauseSelected: false,
                                        unterbrechungSelected: false,
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
                                        pauseSelected: false,
                                        unterbrechungSelected: false,
                                        emptyItem: tempItem,
                                        })
                                    }
                                }>
                                Blanko
                            </AddTOPOption>
                        }
                        {this.state.pauseSelected?
                            <AddTOPOption style={{paddingTop: "15px",paddingBottom:"15px",backgroundColor: "#08435C"}}>Pause</AddTOPOption>
                            :<AddTOPOption 
                                style={{paddingTop: "15px",paddingBottom:"15px"}}
                                onClick={()=>{
                                    // var tempItem = this.state.emptyItem
                                    // tempItem.itemDuration = 26
                                    this.state.emptyItem.subjectOfItems[0].title = "Pause"
                                    this.setState({
                                        firstSelected: false,
                                        unterSelected: false,
                                        lastSelected: false,
                                        blankSelected: false,
                                        pauseSelected: true,
                                        unterbrechungSelected: false,
                                        emptyItem: this.state.emptyItem,
                                        // emptyItem: tempItem,
                                    })
                                    }
                                }>
                                Pause
                            </AddTOPOption>

                        }
                        {this.state.unterbrechungSelected?
                            <AddTOPOption style={{paddingTop: "15px",paddingBottom:"15px",backgroundColor: "#08435C"}}>Unterbrechung</AddTOPOption>
                            :
                            <AddTOPOption 
                                style={{paddingTop: "15px",paddingBottom:"15px"}}
                                onClick={()=>{
                                    // var tempItem = this.state.emptyItem
                                    // tempItem.itemDuration = 26
                                    this.setState({
                                        firstSelected: false,
                                        unterSelected: false,
                                        lastSelected: false,
                                        blankSelected: false,
                                        pauseSelected: false,
                                        unterbrechungSelected: true,
                                        // emptyItem: tempItem,
                                    })
                                    }
                                }>Unterbrechung</AddTOPOption>

                        }
                    </AddTOPOptionWrapper>
                    <form  onSubmit={(e)=>{this.addNewTOP(e)}}>
                    <Form
                        id="form"
                        formData={this.state.emptyItem}
                        validationGroup="newtop"

                    >
                        <GroupItem >
                            <SimpleItem dataField="subjectOfItems[0].title" label={{text:"Titel des BG"}} >
                                <RequiredRule message="titel erforderlich" />
                            </SimpleItem>
                        </GroupItem>

                        <GroupItem colCount={3}>
                            <GroupItem>
                            {this.state.pauseSelected?null:
                                <SimpleItem dataField="itemDuration" label={{text:"TOP Dauer (Minuten)",}}  /*editorOptions={this.NumbersOptions}*/>
                                    <PatternRule message="nur Zahlen eingeben" pattern={/^[0-9]/}/>
                                    <RequiredRule message="TOP Dauer erforderlich" />
                                </SimpleItem>
                            }
                                <SimpleItem dataField="itemNumber" label={{text:"Position"}} >
                                    <RequiredRule message="Position erforderlich" />
                                </SimpleItem>
                            </GroupItem>
                            {this.state.pauseSelected?
                                <SimpleItem dataField="endTime" label={{text:"Ende (Uhrzeit)"}}>
                                    {/* <PatternRule message="nur Zahlen eingeben" pattern={/^[0-9]+$/}/> */}
                                    <RequiredRule message="ende time erforderlich" />
                                </SimpleItem>
                            :null}
                            
                        </GroupItem>
                        <GroupItem caption="Kurz TO">
                            {/* <ItemListWrapper> */}
                            <List 
                            dataSource={this.props.itemList}
                            height={200}
                            width = {'100%'}
                            itemRender={this.newTOPList}
                            noDataText= "Keine Daten zum Anzeigen"
                            showScrollbar= "always"
                            pageLoadMode= 'scrollBottom'
                            />
                            
                            {/* </ItemListWrapper> */}
                        </GroupItem>

                        
                        <ButtonItem
                        horizontalAlignment="right"
                        buttonOptions={this.buttonOptions}
                        />
                        
                    </Form>
                    </form>
                </Popup>
                :null}

                {this.state.adminPanelClicked?
                <Popup
                    width={480}
                    height={200}
                    showTitle={true}
                    title="Möchten Sie das Admin-Panel öffnen?"
                    closeOnOutsideClick={true}
                    visible={this.state.adminPanelClicked}
                    onHiding={() => {this.adminPanelpopupClose()}} >
                        <form  onSubmit={(e)=>{this.checkPassword(e)}}>
                        <Form
                        id="form"
                        formData={this.state}
                        validationGroup="password">
                            <GroupItem>
                                {/* <SimpleItem dataField="passwordItem" label={{text:"passwort"}}> */}
                                <SimpleItem dataField="passwordItem" editorType="dxTextBox" label={{text:"Passwort"}} editorOptions={this.passwordOptions}>
                                    <RequiredRule message="passwort erforderlich" />
                                    <AsyncRule
                                    message="falsches Passwort"
                                    validationCallback={this.passwordValidation} />
                                </SimpleItem>
                            </GroupItem>
                            <GroupItem>
                                &nbsp;
                            </GroupItem>
                            <GroupItem colCount={4}>
                                    <SimpleItem>
                                        &nbsp;
                                    </SimpleItem>
                                    <ButtonItem
                                    horizontalAlignment="left"
                                    buttonOptions={this.passwordButtonOptions}
                                    />
                                    <ButtonItem
                                    horizontalAlignment="right"
                                    buttonOptions={this.neinButtonOptions}
                                    />
                                </GroupItem>
                            {/* <Link to={'/admin'}>
                                <ConfirmButton style={{backgroundColor: "green",marginLeft: "30%"}}>
                                    Ja
                                </ConfirmButton>
                            </Link> */}
                            {/* <ConfirmButton style={{backgroundColor: "red"}} onClick={this.adminPanelpopupClose}>
                                Nein
                            </ConfirmButton> */}
                        </Form>
                        </form>


                </Popup>
                :null}

                {this.state.importActiveClicked?
                <Popup
                    width={480}
                    height={250}
                    showTitle={true}
                    title="aktuelle Sitzung importieren"
                    closeOnOutsideClick={true}
                    visible={this.state.importActiveClicked}
                    onHiding={() => {this.closeImportActivePopup()}}>
                        <div>
                        { this.state.importActiveResult === "Herunterladen ..."?
                                <div>
                                    Herunterladen ...
                                </div>
                                :
                                <div>
                                    <div>
                                        Plenarsitzung: {this.state.importActiveResult.sessionNumber}
                                    </div>
                                    <div>
                                        Start: {this.state.importActiveResult.sessionStart}
                                    </div>
                                    <div>
                                        Ende: {this.state.importActiveResult.sessionEnd}
                                    </div>
                                    <div>
                                        Sitzungstage: {this.state.importActiveResult.numberOfDays}
                                    </div>
                                    <div>
                                        Anzahl der TOP: {this.state.importActiveResult.numberOfTops}
                                    </div>
                                    
                                </div>
                        }
                        
                        <div style={{width: "100%",bottom:"5px"}}>
                        <ImportActiveButton onClick={()=>{this.setState({importActiveBtn: "importieren ..."});this.handleImportActive();}}>
                            {this.state.importActiveBtn}
                        </ImportActiveButton>
                        </div>
                        
                                
                         
                        </div>
                </Popup>
                :null}

                {this.state.stopwatchNavbar?
                <div id="sessionbanner-hover">
                    <SessionBanner 
                        getStopwatchFuntions={this.props.getStopwatchFuntions} 
                        hover={true} sessionNumber={this.sessionNumber} 
                        totalSessionTime={this.props.totalSessionTime} 
                        sessionStart={this.sessionStart} 
                        sessionEnd={this.sessionEnd}
                        changeStreamStatus = {this.props.changeStreamStatus}
                        activeIndex={this.state.activeIndex}
                        />
                </div>
                :null}

            </Container>
        )
    }
}

export default NavBar


////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////    STYLED FUNCTIONAL COMPONENTS         ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

const Container = styled.div.attrs({
    className: 'container-navbar-wrapper',
})`
    position: fixed;
    width: 100%;
    z-index: 3;
`

const Nav = styled.nav.attrs({
    className: 'fff',
})`
    margin-bottom: 20 px;
    background-color: #08435C !important;
    height:72px;
`

const Wrapper = styled.a.attrs({
    className: 'navbar-brand',
})`
    float: right;
    padding: 0;
    margin: 0;

`

const MainHeading = styled.div.attrs({
    className: 'font-link'
})`
    text-decoration: none;
    padding: 5px;
    font-size: 25px;
    color: white;
    height: 100%;
    padding-top: 20px;
    padding-left: 20px;
    float: left;
    

`

const TabBtnWrapper = styled.div.attrs({
    className: 'tab-btn-wrapper-nav'
})`

    
    float: left;
    width: 30%;
    height: 100%;
    margin-left: 20px;

`

const TabBtn = styled.div.attrs({className: "session-tab font-fill hoverpointer"})`

    float: left;
    width: 15%;
    height: 50%;
    background-color: white;
    border-radius: 4px;
    padding: 5px;
    margin: 10px;
    margin-top: 20px;
    color: black;
    font-size: 7px;
    text-align: center;
`

const StopwatchContainer = styled.div.attrs({className: "navbar-stopwatch"})`
    float: right;
    height: 100%;
    width: 40%;

`

const StopwatchBtn = styled.div.attrs({})`
    background: white;
    border-radius: 5px;
    margin:10px;
    float: left;
    margin-top: 15px;
`

const NavBarTimer = styled.div.attrs({className: "navbar-timer"})`
    font-size: 20px;
    font-weight: bold;
    padding-top: 3px;
    float: left;
    width: 20%;
    text-align: center;
    background: white;
    border-radius: 5px;
    color: #08435C;
    padding: 5px;
    margin: 10px;
    margin-right: 0;
    margin-top: 20px;

    font-family: Abel;
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 23px;
`

const DateWrapper = styled.div.attrs({className: "date-wrapper"})`
    float: left;
    width: 20%;
    text-align: center;
    background: white;
    border-radius: 5px;
    color: #08435C;
    padding: 5px;
    margin: 10px;
    margin-top: 20px;
    font-family: Abel;
    font-style: normal;
    font-weight: normal;
    font-size: 15px;
    line-height: 23px;

`

const AddTOPOption = styled.div.attrs({className:"add-top-option"})`

    border-radius: 5px;
    width: 15%;
    margin: 5px;
    background-color: #5C778E;
    color: white;
    text-align: center;
    padding: 5px;
    margin: auto;
`

const AddTOPOptionWrapper = styled.div.attrs({className: "add-top-options-wrapper font-link"})`

    width: 100%;
    margin: 5px;
    display: flex;

`

const ItemListWrapper = styled.div.attrs({className: "itemlist-wrapper"})`
    width: 100%;
    height: 200px;
    overflow: auto;
`

const ItemListCard = styled.div.attrs({className: "itemlist-card"})`
    width: 100%;
    text-align: left;
    margin-top: 5px;
`

const ConfirmButton = styled.div.attrs({className: 'font-link btn'})`
    border-radius: 10px;
    padding: 10px;
    text-align: center;
    float: left;
    margin: 10px;
    color: white;
    width: 20%;
`

const ImportActiveButton = styled.div.attrs({className: 'active-import-btn btn'})`
    border-radius: 10px;
    padding: 10px;
    text-align: center;
    margin: 10px;
    color: white;
    width: 30%;
    background-color: #5C778E;
    float: right;
    bottom: 5px;
`


//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

function zeroPad(number, size = 2) {
    let s = String(number);
    while (s.length < size) { s = '0' + s;}
    return s;
}

function timeFormat(miliseconds){

    if(miliseconds < 0){
  
      miliseconds *= -1;
      let remaining = miliseconds / 1000;
  
      const hh = parseInt( remaining / 3600, 10 );
      
      remaining %= 3600;
  
      const mm = parseInt( remaining / 60, 10 );
      const ss = parseInt( remaining % 60, 10 );
      const S  = parseInt( (miliseconds % 1000) / 100, 10 );
  
      return `- ${ zeroPad( hh ) }:${ zeroPad( mm ) }:${ zeroPad( ss ) }`;
  
    }
    else{
      let remaining = miliseconds / 1000;
  
      const hh = parseInt( remaining / 3600, 10 );
      
      remaining %= 3600;
  
      const mm = parseInt( remaining / 60, 10 );
      const ss = parseInt( remaining % 60, 10 );
      const S  = parseInt( (miliseconds % 1000) / 100, 10 );
  
      return `${ zeroPad( hh ) }:${ zeroPad( mm ) }:${ zeroPad( ss ) }`;
    }
  
    
  }