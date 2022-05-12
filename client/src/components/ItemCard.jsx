import React, { Component } from 'react'
import styled from 'styled-components'
import api from '../api'
import { SpeechTypes } from '.'
import {  ItemList, GroupList } from '../model'
import '../styles/ItemCard.css'
import '../styles/hover.css'
import '../styles/fonts.css'
import SpeakerListC from './SpeakerListC'
import Form, {
    SimpleItem,
    GroupItem,
  } from "devextreme-react/form";
import "devextreme-react/text-area";
import Popup from 'devextreme-react/popup';
import Button from 'devextreme-react/button';


class ItemCard extends Component{
    constructor(props){
        super(props);
        console.log("[ItemCard] (constructor) Entered ItemCard Constructor")

        this.state = {
            item: this.props.item,
            itemIndex: -1,
            expanded: false,
            users:[],
            partiesActiveRef: [],        ///manages the active states of parties
            popupVisible: false,
            tempitem:{},
            isRecording: false,
            editAllForm: new Map(),
            recButtonPressed: this.props.active ? true : false,
            // recButtonPressed: true,
            // anfang: new Date().toLocaleString('en-US', {minute: 'numeric', hour: 'numeric', hour12: false }),
            
        }
        this.setState({item:this.props.item})

        
        
        

        if(this.props.item.itemTimings.length <= 0){
            var emptyGroupList = new GroupList();
            // console.log("emyty rouplist created: ",emptyGroupList)
            var list = emptyGroupList.getList();
            // console.log("List created of groups: ",list)
            this.props.item.itemTimings = [{
              groups: [],
            }];
            this.props.item.itemTimings[0].groups = list;  
            // console.log("After props assigned: ",this.props.item.itemTimings[0].groups)
            
      
          }
          this.props.item.itemTimings[0].groups.map((group) => {
              var temp={
                  name: group.name,
                  activeState: false,
                  duration: group.duration,
              };
              var merge = this.state.partiesActiveRef;
              merge.push(temp);
              this.setState({partiesActiveRef: merge});
          })

        /// if the item no longer remains active it should just call stop because sometimes when item active next one presses
        /// which should automatically stop the item.
        // if(this.props.activeIndex != this.props.index){
        //     this.itemRecStopPress()
        // }
        
        // if(this.props.active){
        //     document.getElementById('scroll-active').scrollIntoView({ behavior: 'smooth', block: 'center' });
        // }

        var getStopButtonFunctions = this.props.getStopButtonFunctions;
        getStopButtonFunctions(this.props.index,this.itemRecStopPress);

        

    }


    // closeEdit = () =>{
    //     this.setState({
    //         popupVisible: false,
    //     })
    // }


    // editAnfang = (e) =>{
    //     this.setState({
    //         item: this.state.item,
    //         changeAnfangVisible: false,
    //     });
    //     let list = [...this.props.itemList]
    //     list[this.props.index] = this.state.item;

    //     let ListItemObj = new ItemList();
    //     ListItemObj.fromList(list)
    //     var sessionInfo = this.props.sessionInfo
    //     ListItemObj.update2DB(sessionInfo.sessionNumber,sessionInfo.sessionStart,sessionInfo.sessionEnd,sessionInfo.numberOfDays);

    // }

    changeAnfangPopupClose = () =>{
        this.setState({
            changeAnfangVisible: false,
        })
    }

    handleTimesEdit = () =>{
        api.getActiveItemList().then(result =>{
            var itemNeeded = result.data.data[0].itemlist[this.props.index]
            this.setState({
                popupEditAll: true,
                bgEditItem: itemNeeded,
            })
        })
        
    }

    closeEditAllPartyTimer = () =>{
        this.setState({
            popupEditAll: false,
        })
    }

    itemRecButtonPress = () =>{
        if(this.props.active){
            
        }
    }
    /// This saves data in BG Bearbeiten Forms
    submitData(){
        this.setState({item:this.state.item,popupVisible:false})
        let list = [...this.props.itemList]
        list[this.props.index] = this.state.item;

        let ListItemObj = new ItemList();
        ListItemObj.fromList(list)
        var sessionInfo = this.props.sessionInfo
        ListItemObj.update2DB(sessionInfo.sessionNumber,sessionInfo.sessionStart,sessionInfo.sessionEnd,sessionInfo.numberOfDays);
    }

    itemRecStartPress = async() =>{
        // this.setState({
        //     anfang: new Date().toLocaleString('en-US', {minute: 'numeric', hour: 'numeric', hour12: false }),
        //     recButtonPressed: true,
        // },()=>{
        //     console.log("[ItemCard S] anfang start changed in state")
        // })
        console.log("[ItemCard S] Rec Start Press start")

        if(localStorage.getItem("stream_start_time") !== null){
            console.log("Stream Start Time",localStorage.getItem("stream_start_time"))
        }

        if(this.props.item.subjectOfItems[0].consultationType === "pause"){
            /// call the Stop Stream Function

            api.stopStream().then(()=>{
                console.log("[ItemCard S] api stopStream'd")
                var changeStreamStatus = this.props.changeStreamStatus
                changeStreamStatus(false)
            })
            .catch((error)=>{
                console.log("[ItemCard S] api stopStream'd")
                var changeStreamStatus = this.props.changeStreamStatus
                changeStreamStatus(false)
            })
            localStorage.setItem("stream_start_time",null)

            /// Make a setInterval function which check current time and end time. 
            /// If difference less than 5 minutes then start Stream
            /// If less than 5 minutes then Stop the Pause Item otherwise wait.

            
            this.PauseItemTimeChecking = setInterval(async()=>{
                var endTimehh = this.props.item.endTime.split(":")[0]
                var endTimemm = this.props.item.endTime.split(":")[1]
                var now = new Date().toLocaleTimeString('en-US',{minute:'numeric',hour: 'numeric', hour12: false})
                var nowhh = now.split(":")[0]
                var nowmm = now.split(":")[1]

                console.log(`[ItemCard] (ItemRecStart) hour difference end-timehh:${endTimehh} nowhh:${nowhh} and minute difference end-time:${endTimemm}&nowtime:${nowmm}`)
                if(endTimehh === nowhh && parseInt(endTimemm)-parseInt(nowmm) < 6){
                    //End this Pause Item
                    console.log("[ItemCard] (ItemRecStart) Pause Stopped")
                    api.startStream({
                        sessionNumber: this.props.sessionInfo.sessionNumber,
                        meetingNumber: this.props.itemList[this.props.index+1].meetingNumber
                    }).then(async(result)=>{
                        var changeStreamStatus = this.props.changeStreamStatus
                        changeStreamStatus(true)
                        console.log("[ItemCard] (ItemRecStart) API Called with REC Stopped about to be called")
                        // this.itemRecStopPress(); /// possiblly wrong index
                        var callStopButtonFunctions = this.props.callStopButtonFunctions
                        await callStopButtonFunctions(this.props.index + 1);
                        localStorage.setItem("stream_start_time",new Date().getTime())
                        console.log("[ItemCard] (ItemRecStart) API Called with REC Stopped")
                        clearInterval(this.PauseItemTimeChecking)
                    })
                    .catch(async (error)=>{
                        var changeStreamStatus = this.props.changeStreamStatus
                        changeStreamStatus(true)
                        console.log("[ItemCard] (ItemRecStart) API Errored with REC Stopped about to be called")
                        // this.itemRecStopPress();
                        var callStopButtonFunctions = this.props.callStopButtonFunctions
                        await callStopButtonFunctions(this.props.index + 1);
                        localStorage.setItem("stream_start_time",new Date().getTime())
                        console.log("[ItemCard] (ItemRecStart) API Errored with REC Stopped")
                        console.log("Interval Function:")
                        clearInterval(this.PauseItemTimeChecking)
                    })
                    
                }
            },10000)/// after every 10 sec

        }
        
        
        // this.UDPPartiesData = setInterval(()=>{
        //     console.log("[Item Rec Press] state",this.state.partiesActiveRef)
        //     var data = {
        //         Tagesordnungspunkt: this.state.item.subjectOfItems[0].title,
        //         Fraktion: [
        //             {
        //                 Fraktion: "SPD",
        //                 RestRedezeit: timeFormatSec(String(this.state.partiesActiveRef[1].duration))
        //             },
        //             {
        //                 Fraktion: "CDU",
        //                 RestRedezeit: timeFormatSec(String(this.state.partiesActiveRef[2].duration))
        //             },
        //             {
        //                 Fraktion: "Grünen",
        //                 RestRedezeit: timeFormatSec(String(this.state.partiesActiveRef[3].duration))
        //             },
        //             {
        //                 Fraktion: "FDP",
        //                 RestRedezeit: timeFormatSec(String(this.state.partiesActiveRef[4].duration))
        //             },
        //             {
        //                 Fraktion: "Landesregierung",
        //                 RestRedezeit: timeFormatSec(String(this.state.partiesActiveRef[0].duration))
        //             }
        //         ]
        //     }
        //     api.UDPData(data).then(()=>{

        //     });

        // },1000)

        this.setState({
            anfang: new Date().toLocaleString('en-US', {minute: 'numeric', hour: 'numeric', hour12: false }),
            recButtonPressed: true,
        },()=>{
            console.log("[ItemCard S] Anfang and recButtonPressed state called")
            
            var itemStartTimeInStream = ( new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")) ) / 1000 ; 

            let ItemListObj = new ItemList();
            let list = [...this.props.itemList]
            list[this.props.index].itemBeginning = this.state.anfang ;
            list[this.props.index].itemStartTimeInStreamSecs = itemStartTimeInStream
            ItemListObj.fromList(list)
            var sessionInfo = this.props.sessionInfo
            ItemListObj.update2DB(sessionInfo.sessionNumber,sessionInfo.sessionStart,sessionInfo.sessionEnd,sessionInfo.numberOfDays).then(async()=>{
                console.log("Start Time sent to DB")
                console.log("[ItemCard S] Updated in the DB")
                if(this.props.index > 0){
                    console.log("[ItemCard S] start about to call stop of previous")
                    var callStopButtonFunctions = this.props.callStopButtonFunctions
                    await callStopButtonFunctions(this.props.index - 1);
                    console.log("[ItemCard S] Rec Start after press stop")
                }
            });
        })

        
        // if(this.props.index > 0){
        //     console.log("[ItemCard S] start about to call stop of previous")
        //     var callStopButtonFunctions = this.props.callStopButtonFunctions
        //     await callStopButtonFunctions(this.props.index - 1);
        //     console.log("[ItemCard S] Rec Start after press stop")
        // }
        
        

    }

    itemRecPausePress = () =>{
        clearInterval(this.totalSessionTimeRef)
    }

    itemRecStopPress = async(e) =>{
        var Index = this.props.index + 1

        console.log("[ItemCard] (ItemRecStart) Rec stop called")

        // clearInterval(this.UDPPartiesData)

        // console.log("[ItemCard S] Rec stop about to call handleIndexChange")
        // var handleIndexChange = this.props.handleIndexChange;
        // setTimeout(() => { handleIndexChange(Index)},5000);

        // console.log("[ItemCard S] Rec stop called handleIndexChanged")

        
        this.setState({
            expanded: false,
            isRecording: false,
            recButtonPressed: false,
            endeTime: new Date().toLocaleString('en-US', {minute: 'numeric', hour: 'numeric', hour12: false }),
            
        },()=>{
            /// uploading ende time to DB.
            console.log("[ItemCard] (ItemRecStart) Rec stop state is done updating")
            var itemStopTimeInStream = ( new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")) ) / 1000 ; 
            let ItemListObj = new ItemList();
            let list = [...this.props.itemList]
            list[this.props.index].endTime = this.state.endeTime ;
            list[this.props.index].totalItemTime = this.state.totalItemTime ;
            list[this.props.index].itemStopTimeInStreamSecs = itemStopTimeInStream
            ItemListObj.fromList(list)
            var sessionInfo = this.props.sessionInfo
            ItemListObj.update2DB(sessionInfo.sessionNumber,sessionInfo.sessionStart,sessionInfo.sessionEnd,sessionInfo.numberOfDays).then(async()=>{
                console.log("[ItemCard] (ItemRecStart) Rec stop updated in the DB")
                // await api.sendToVOD(); /// After updating the TOP it will send to The VOD platform Backend.
                console.log("[ItemCard] (ItemRecStart) Rec stop about to call handleIndexChange")
                var handleIndexChange = this.props.handleIndexChange;
                var Index = this.props.index + 1
                // setTimeout(() => { handleIndexChange(Index)},5000);
                console.log("[ItemCard] (ItemRecStart) handle",Index)
                handleIndexChange(Index)
                setTimeout(()=>{document.getElementById('scroll-active').scrollIntoView({ behavior: 'smooth', block: 'center' });},200)
            })
            .catch((error)=>{
                console.log("[ItemCard] (ItemRecStart) Rec stop about to call handleIndexChange")
                var handleIndexChange = this.props.handleIndexChange;
                var Index = this.props.index + 1
                // setTimeout(() => { handleIndexChange(Index)},5000);
                console.log("[ItemCard] (ItemRecStart) handle",Index)
                handleIndexChange(Index)
            });
        })
        
    }

    getDuration = (groupname) => {
        var duration = -1;
        this.state.partiesActiveRef.map((data) => {
          if(data.name == groupname){
            duration=data.duration
          }
        })
        
        return duration
    }

    ///////----------------------------------------

    Add2PartiesTimer(groupname,timeInSec,EditAllSign = 'plus'){
        var now = this.getDuration(groupname);
        
        console.log("Custom add2parties with sign:",EditAllSign," party: ", groupname)
        // if(EditAllSign == 'plus'){
        //     var updated = parseInt(now) + parseInt(timeInSec);
        // }
        // if(EditAllSign == 'minus'){
        //     var updated = parseInt(now) - parseInt(timeInSec);
        // }
        var updated = parseInt(timeInSec)
        // if(this.state.editIconSelected == ' '){
        //   updated= now;
        // }
         /// 1 is time to deduct in seconds.
        console.log("updated time: ",updated)
        this.state.partiesActiveRef.map((data,index) => {
          if(data.name == groupname){
            this.state.partiesActiveRef[index] = {name:data.name,activeState:data.activeState,duration:updated}
          }
        })
    
        this.setState({partiesActiveRef:this.state.partiesActiveRef})
        
    
    }

    clearEditAllForm(){
        console.log("Clearing Edit All form")

        // if(this.props.item.itemTimings.length > 0){
        //     var temp = new Map()
        //     temp.set("Hrs","0");
        //     temp.set("Mins","0");
        //     temp.set("Secs","0");
        //     temp.set("Sign","plus")

            
            var myMap = new Map()
        //     this.props.item.itemTimings[0].groups.map((group)=>{
        //         myMap.set(group.name,temp)
        //     })

            this.setState({editAllForm:myMap})
        //     console.log("Closing the dialog and reseting: ",myMap)

        // }
    

    }

    closeEditAllPartyTimer = (e) =>{
    this.setState({popupEditAll: false,editIconSelected:' '})
    this.clearEditAllForm(); /// Clears the editAllForm
    }

    updateTimersAllParties(groupname){
        console.log("update Timers All Parties")
        var temp = {
            Hrs: 0,
            Mins: 0,
            Secs: 0,
        }
        this.setState({
            editAllForm: this.state.editAllForm.set(groupname,temp)
        })

    }

    timeConversion2Sec(hrs,mins,sec){

        hrs = parseInt(hrs);
        mins = parseInt(mins);
        sec = parseInt(sec);

        var hrsS = hrs* 3600;
        var minS = mins * 60;
        var insecs = hrsS+minS+sec
        return insecs;
    }

    onChangeAllTimes = (e,groupname,type) =>{
    // console.log("GOT GROUP",groupname)
        var newMAP = new Map()
        if(type == "Hrs"){
            newMAP.set("Hrs",e.target.value)
            newMAP.set("Mins",this.state.editAllForm.get(groupname).get("Mins"))
            newMAP.set("Secs",this.state.editAllForm.get(groupname).get("Secs"))
            newMAP.set("Sign",this.state.editAllForm.get(groupname).get("Sign"))
        }
        if(type == "Mins"){
            newMAP.set("Hrs",this.state.editAllForm.get(groupname).get("Hrs"))
            newMAP.set("Mins",e.target.value)
            newMAP.set("Secs",this.state.editAllForm.get(groupname).get("Secs"))
            newMAP.set("Sign",this.state.editAllForm.get(groupname).get("Sign"))
        }
        if(type == "Secs"){
            newMAP.set("Hrs",this.state.editAllForm.get(groupname).get("Hrs"))
            newMAP.set("Mins",this.state.editAllForm.get(groupname).get("Mins"))
            newMAP.set("Sign",this.state.editAllForm.get(groupname).get("Sign"))
            newMAP.set("Secs",e.target.value)
        }
        if(type == "Sign"){
            newMAP.set("Hrs",this.state.editAllForm.get(groupname).get("Hrs"))
            newMAP.set("Mins",this.state.editAllForm.get(groupname).get("Mins"))
            newMAP.set("Secs",this.state.editAllForm.get(groupname).get("Secs"))
            newMAP.set("Sign",e.target.value)

        }
        
        this.state.editAllForm.set(groupname,newMAP)
        console.log("AFTER CHANGE IN STATE: ",this.state.editAllForm)
        this.setState({editAllForm: this.state.editAllForm})
    }

    changeTime = (groupname,hrs,mins,secs) =>{
        console.log("Change Time")
        var newMAP = new Map()
        newMAP.set("Hrs",hrs)
        newMAP.set("Mins",mins)
        newMAP.set("Secs",secs)

        this.state.editAllForm.set(groupname,newMAP)
        this.setState({editAllForm: this.state.editAllForm})
    }

    onSubmitEditAllTimes = (e) =>{
        console.log("Submit button for Edit all times pressed.")
        this.setState({editIconSelected: 'custom'},
                        () =>{
                            this.state.editAllForm.forEach((value,key) => {
                                // console.log(value,key)
                                var hrs = value.get("Hrs")
                                var mins = value.get("Mins")
                                var secs = value.get("Secs")
                                var sign = value.get("Sign")
                                var time2Add = this.timeConversion2Sec(hrs,mins,secs)
                                this.Add2PartiesTimer(key,time2Add,sign)
                            })
                            this.closeEditAllPartyTimer();
                            let list = [...this.props.itemList]
                            list[this.props.index].itemTimings = [{groups: []}];
                            console.log("parties active ref:",this.state.partiesActiveRef)
                            list[this.props.index].itemTimings[0].groups = this.state.partiesActiveRef
                            console.log("[SpeakerListC] (onSubmitEditAllTimes) chceking ACtive refs: ",this.state.partiesActiveRef)
                            let ListItemObj = new ItemList();
                            ListItemObj.fromList(list)
                            var sessionInfo = this.props.sessionInfo
                            ListItemObj.update2DB(sessionInfo.sessionNumber,sessionInfo.sessionStart,sessionInfo.sessionEnd,sessionInfo.numberOfDays).then(()=>{
                                window.location.reload();
                            });
                        })
        
    }

    render(){
        return (
            <Wrapper>
                
                
                <LeadingWrapper>
                    
                    <BtnWrapper>
                        {this.state.recButtonPressed ? 
                            ///If the recording is started then Pause Btn is showed.
                            <PauseBtn onClick={()=>{this.setState({recButtonPressed: false});this.itemRecPausePress();}}> 
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="yellow" class="bi bi-play-fill" viewBox="0 0 16 16">
                                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                                    </svg></div>
                                AKTIV
                            </PauseBtn>
                            :
                            (parseInt(this.props.index) === parseInt(this.props.activeIndex) || parseInt(this.props.index-1) === parseInt(this.props.activeIndex)) && (this.props.streamActive === true || this.props.item.subjectOfItems[0].consultationType === "pause")  ? /// This condition is when current top is active index or activeIndex+1
                            
                                <RecBtn onClick={()=>{/*this.setState({recButtonPressed: true,})*/;this.itemRecStartPress();}}>
                                    <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="green" class="bi bi-play-fill" viewBox="0 0 16 16">
                                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                                    </svg></div>
                                    START
                                </RecBtn> 
                                :
                                /// This button is for all other tops which aren't active or active+1
                                <RecBtn>
                                    <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="grey" class="bi bi-play-fill" viewBox="0 0 16 16">
                                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                                    </svg></div>
                                    START
                                </RecBtn>
                        }
                        
                        
                    </BtnWrapper>
                    
                    {this.state.item.itemNumber !== "außerhalb der"?
                    <TOPNr>TOP {this.state.item.itemNumber+this.state.item.subjectOfItems[0].itemPostfix}</TOPNr>
                    :
                    <TOPNr style={{fontSize:"20px",lineHeight:"16px"}}>{this.state.item.itemNumber+this.state.item.subjectOfItems[0].itemPostfix}</TOPNr>

                    }

                    
                    
                    {this.props.item.endTime?
                        <ZeitTime>
                        Ende <br/> <div style={{fontSize: "13"}}>{this.props.item.endTime}</div>
                        </ZeitTime>
                        :this.state.endeTime?
                        <ZeitTime>
                            Ende <br/> <div style={{fontSize: "13"}}>{this.state.endeTime}</div>
                        </ZeitTime>
                    :   <Zeit>Ende</Zeit>
                    }
                        
                    {/* <RedVer>Redezeit-verwaltung</RedVer> */}
                    
                    {/* {this.props.activeIndex > this.props.index  ?
                    <Anfang >Beginn<br/> {this.state.item.itemBeginning}</Anfang>
                    :
                    this.state.anfang && this.state.recButtonPressed ?
                        <Anfang onClick={()=>{this.setState({changeAnfangVisible:true,})}}>Beginn <br/> {this.state.anfang}</Anfang>
                        :<Anfang >Beginn <br/>  {this.state.anfang}</Anfang>
                     } */}

                    {
                        this.props.index >= this.props.activeIndex || parseInt(this.props.activeIndex) - 1 === parseInt(this.props.index) ?
                        <Anfang onClick={()=>{this.setState({changeAnfangVisible:true,})}}>Beginn <br/> {this.state.item.itemBeginning}</Anfang>
                        :
                        <Anfang >Beginn<br/> {this.state.item.itemBeginning}</Anfang>
                    }

                    {/* <Anfang>
                        Beginn<br/> {this.state.item.itemBeginning}
                    </Anfang> */}
                    
                    

                </LeadingWrapper>
                

                <Title>{this.state.item.subjectOfItems[0].title}</Title>

                

                <TrailingWrapper>
                    <BGEdit  onClick={this.handleTimesEdit}>
                        BG<br/> bearbeiten
                    </BGEdit>
                </TrailingWrapper>
                
                {/* This div doesn't contain content. It is included in only active TOP and used to scroll to the div using FLoating Btn. */}
                {/* {this.props.active ?
                <div id={'scroll-active'} style={{float: "left",clear:"both"}}>&nbsp;</div> 
                :null} */}
                
                {this.props.active ?
                    <SpeakerListC  item={this.state.item} index={this.props.index} itemList={this.props.itemList} sessionInfo={this.props.sessionInfo} /*totalItemTime={this.state.totalItemTime}*//>
                :null}

                

                

                {this.props.item.itemTimings.length > 0 && this.state.popupEditAll ?
                    <Popup
                        width={550}
                        height={720}
                        showTitle={true}
                        title="BG bearbeiten"
                        closeOnOutsideClick={true}
                        visible={this.state.popupEditAll}
                        onHiding={this.closeEditAllPartyTimer}>

                        <Form
                            id="form"
                            formData={this.state.item}>
                            <GroupItem colCount={2}>
                                <GroupItem>
                                    <SimpleItem  dataField="itemNumber" label={{text:"TOP",}}>
                                    </SimpleItem>
                                </GroupItem>
                            </GroupItem>
                            <GroupItem >
                                <SimpleItem dataField="subjectOfItems[0].title"  label={{text:"Titel",}}/>
                            </GroupItem>
                        </Form>
                        <hr/>


                        <div className="edit-boxes-label" style={{width: "40%"}}>Stunden</div>
                        <div className="edit-boxes-label">Minuten</div>
                        <div className="edit-boxes-label">Sekunden</div>

                        <div>
                        { this.state.bgEditItem.itemTimings[0].groups.map((group)=>{
                            
                            var groupname = this.state.editAllForm.get(group.name);
                            if(!groupname){
                                var newMAP = new Map()
                                newMAP.set("Hrs",getHrs(group.duration))
                                newMAP.set("Mins",getMins(group.duration))
                                newMAP.set("Secs",getSecs(group.duration))
                                newMAP.set("Sign","plus")
                                this.state.editAllForm.set(group.name,newMAP)
                            }
                            
                            groupname = this.state.editAllForm.get(group.name);
                            if(groupname){
                            return (
                                <div className="edit-wrapper">
                                <div className="edit-label">
                                    {group.name}
                                </div>
                                <div className="edit-fields-wrapper" >
                                    {/* <select id="plus-minus-select" value={this.state.editAllForm.get(group.name).get("Sign")} onChange={(e) => {this.onChangeAllTimes(e,group.name,"Sign")}}> 
                                    <option value="plus" >+</option>
                                    <option value="minus" >-</option>
                                    </select> */}
                                    
                                    <input className="edit-field" type="number" min="0" value={this.state.editAllForm.get(group.name).get("Hrs")} onChange={(e) => {this.onChangeAllTimes(e,group.name,"Hrs")}}/>
                                    <input className="edit-field" type="number" min="0" value={this.state.editAllForm.get(group.name).get("Mins")} onChange={(e) => {this.onChangeAllTimes(e,group.name,"Mins")}} />
                                    <input className="edit-field" type="number" min="0" value={this.state.editAllForm.get(group.name).get("Secs")} onChange={(e) => {this.onChangeAllTimes(e,group.name,"Secs")}}/>
                                    {group.name === "LR" && (this.state.item.subjectOfItems[0].consultationType === "Unterrichtung" || this.state.item.subjectOfItems[0].consultationType === "unterrichtung") ?
                                        
                                        <CalculateBtn
                                           onClick={()=>{
                                               var lrsecs = this.state.editAllForm.get(group.name).get("Secs")
                                               var lrmins = this.state.editAllForm.get(group.name).get("Mins")
                                               var lrhrs = this.state.editAllForm.get(group.name).get("Hrs")
                                               console.log("EEE",this.state)
                                               this.props.item.itemTimings[0].groups.map((groupChangeTimes)=>{
                                                   if(groupChangeTimes.name === "LR" || groupChangeTimes.name === "SPD" || groupChangeTimes.name === "CDU" ){
                                                    this.changeTime(groupChangeTimes.name,lrhrs,lrmins,lrsecs)
                                                   }
                                                   else{
                                                    if(groupChangeTimes.name === "Bündnis 90/Die Grünen" || groupChangeTimes.name === "FDP"){
                                                        var timeInSec = parseInt(parseInt(lrmins) * 60) + parseInt(parseInt(lrhrs) * 3600) + parseInt(lrsecs)
                                                        var timeToGive = parseInt((timeInSec * 2) / 3)
                                                        this.changeTime(groupChangeTimes.name,getHrs(timeToGive),getMins(timeToGive),getSecs(timeToGive))
                                                    }
                                                    else{
                                                        this.changeTime(groupChangeTimes.name,0,1,30)

                                                    }

                                                   }
                                                   
                                                    
                                               })

                                           }} >
                                            Berechnen
                                        </CalculateBtn>
                                    :   <CalculateBtnSpacer> &nbsp;
                                        </CalculateBtnSpacer>}
                                </div>
                                </div>
                                );
                            }
                        })}
                        </div>
                        <div className="party-edit-submit-btn" onClick={this.onSubmitEditAllTimes}>Absenden</div>
                    </Popup>
                :null}

                {this.state.changeAnfangVisible?
                    <Popup
                    width={400}
                    height={200}
                    showTitle={true}
                    title="Anfang ändern"
                    closeOnOutsideClick={true}
                    visible={this.state.changeAnfangVisible}
                    onHiding={() => {this.changeAnfangPopupClose()}} >
                        <Form
                            id="form"
                            formData={this.state.item}
                        >
                        <GroupItem colCount={2}>
                        <GroupItem >
                            <SimpleItem dataField="itemBeginning" label={{text:"Neuer Anfang"}} />
                        </GroupItem>
                        </GroupItem>
                        <GroupItem>
                        <div onClick={(e)=>{this.editAnfang(e)}}>
                            <Button
                            id="button"
                            text="Absenden"
                            type="success"
                            useSubmitBehavior={true}
                            />
                        </div>
                        </GroupItem>

                        </Form>

                    </Popup>
                :null}

            </Wrapper>
        );
        
    }

}

export default ItemCard

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////    STYLED FUNCTIONAL COMPONENTS         ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// UTILITY COMPONENTS

const Wrapper = styled.div.attrs({className:"top-wrapper"})`
    padding: 10px 0 10px 0;
    margin: 0px;
    width:90%;
    height: 100%;
    float: left;
    margin-top: 15px;

    
`

////////////////////////////////////// LEADING ELEMENTS //////////////////////////////////

const LeadingWrapper = styled.div.attrs({className: "leading-wrapper"})`
    
    height: 100%;
    float: left;

    align-content: center;
    justify-content: center;
    text-align: center;
    margin-left: 5%;

`

const TOPNr = styled.div.attrs({className: "top-nr font-link hoverpointer"})`
    width: 140px;
    height: 40%;
    border-radius: 10px;
    background-color: white;
    color: black;
    float: right;

    text-align: center;
    font-size: 24px;
    line-height: 31px;
    padding: 15px;
    margin: 5px;



`

const Anfang = styled.div.attrs({className: "anfang font-link hoverpointer", name:"anfang-test"})`

    width: 140px;
    height: 60px;
    border-radius: 10px;
    // background-color: #BDC6D1;
    background-color: white;
    color: #081D34;
    float: right;

    text-align: center;
    font-size: 18px;
    line-height: 15.5px;
    padding: 15px;
    margin: 5px;

    // box-shadow: 0px 0px 10px 1px #888888;


`


const Zeit = styled.div.attrs({className: "zeit font-link hoverpointer"})`

    width: 80px;
    height: 40%;
    border-radius: 10px;
    //background-color:  #5C778E;
    background-color: white;
    color: black;
    float: right;

    text-align: center;
    font-size: 20px;
    line-height: 45px;
    padding: 8px;
    margin: 5px;
    clear:right;

`

const ZeitTime = styled.div.attrs({className: "zeit font-link hoverpointer"})`

    width: 80px;
    height: 40%;
    border-radius: 10px;
    background-color:  white;
    color: black;
    float: right;

    text-align: center;
    font-size: 16.5px;
    padding: 8px;
    margin: 5px;
    clear:right;

    white-space:nowrap;
    overflow: hidden;
`

const BtnWrapper = styled.div.attrs({className: "btn-wrap"})`

    width: 80px;
    // height:100%;
    float: right;
    margin: 5px;

`

const RecBtn = styled.div.attrs({className: "rec-btn font-link hoverpointer"})`

    width: 80px;
    height: 60px;
    background: #08435C;
    border-radius: 10px;
    color: white;
    text-align: center;

    // margin: 10px;
    // margin-top: 5px;
    float: left;

    box-shadow: 0px 0px 10px 1px #888888;

`



//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx END OF LEADING ELEMENTS xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

////////////////////////////////////  MIDDLE ELEMENTS ////////////////////////////////////////////////////////


const Title = styled.div.attrs({className: "top-title font-link"})`

    font-size: 26px;
    line-height: 33px;
    color: #081D34;
    width: 55%;
    float:left;
    margin-left: 2.5%;
    height: 40%;


`
const TrailingWrapper = styled.div.attrs({className: "trailing-wrap"})`

    float:right;
    width: 12%;
    height: 100%;

`


const BGEdit = styled.div.attrs({className: "bg-edit font-link hoverpointer", name: "bg-edit-test"})`

    float: right;
    width: 80%;
    height: 40%;

    background: #BDC6D1;
    border-radius: 10px;

    font-size: 22px;

    text-align: center;
    line-height: 31px;
    margin: 8px;
    padding: 0 0px 0 0px;
    color: #081D34;

    box-shadow: 0px 0px 10px 1px #888888;

`

const PauseBtn = styled.div.attrs({className: "session-pause-btn font-link hoverpointer"})`

width: 80px;
height: 60px;
background: #08435C;
border-radius: 10px;
color: white;
text-align: center;

// margin: 10px;
// margin-top: 5px;
float: left;

box-shadow: 0px 0px 10px 1px #888888;

`
const CalculateBtn = styled.div.attrs({})`
    background: #08435C;
    color: white;
    padding: 5px;
    margin: 5px;
    width: 21%;
    float: left;
    text-align: center;
`

const CalculateBtnSpacer = styled.div.attrs({})`

padding: 5px;
margin: 5px;
width: 20%;
float: left;
`


//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx END OF MIDDLE ELEMENTS xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx



//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//xxxxxxxxxxxxxxxxxxxxxxxxx   END OF STYLED FUNCTIONAL COMPONENTS      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx





function getHrs(time){
    const hh = parseInt( time / 3600, 10 );
  
    return hh
}

function getMins(time){
    const mm = parseInt( time / 60, 10 );
    return mm
}

function getSecs(time){
    const ss = parseInt( time % 60, 10 );
    return ss
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