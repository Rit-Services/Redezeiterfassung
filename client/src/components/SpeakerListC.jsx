import React from 'react';
import List from 'devextreme-react/list';
import styled from 'styled-components';
import api from '../api';
import {  ItemList, GroupList } from '../model'

import "devextreme-react/text-area";
import { Popup, Position } from 'devextreme-react/popup';
// import Button from 'devextreme-react/button';
import Form, {
  SimpleItem,
  GroupItem,
} from "devextreme-react/form";

import Timer from './stopwatch/components/Timer'
import Config from './stopwatch/constants/Config'
import timeFormat from './stopwatch/utils/timeFormat';
import cloneDeep from 'lodash/cloneDeep';

import '../styles/speakerlistc.css'
// import 'devextreme/dist/css/dx.light.css';

class SpeakerListC extends React.Component{

    constructor(props){
        super(props);
        window.onkeyup = this.keyPressed
        console.log("[SpeakerListC] (constructor) Entering SpeakerListC constructor ...");

        this.state = {
            searchMode: 'startsWith',
            users: [],
            userClicked: false,
            userSelected: {},
            isRunning: false,
            time: 0,
            timeQ: 0,
            timeA: 0,
            speakersFullList:this.props.itemList[this.props.index].speakerTimings,  /// add here
            partiesActiveRef: [],
            ninetySecSelected: false,
            defaultSelected: false,
            otherOptionsSelected: false,
            onGoSelected: false,
            personalRemarkSelected: false,
            miscSelected: false,
            mitteilungen:false,
            typeSpeechSelected: '',
            ninetySecTime: 90000,
            questionTime:90000,
            answerTime: 90000,
            fiveminTime: 300000,
            popupVisible: false,
            editAllForm: new Map(),
            deletedRedenerTime: 0,
            
          };
        //   this.onSearchModeChange = this.onSearchModeChange.bind(this);
          this.getUsers();
      
          if(this.props.item.itemTimings.length <= 0){
            var emptyGroupList = new GroupList();
            console.log("emyty rouplist created: ",emptyGroupList)
            var list = emptyGroupList.getList();
            console.log("List created of groups: ",list)
            this.props.item.itemTimings = [{
              groups: [],
            }];
            this.props.item.itemTimings[0].groups = list;  
            console.log("After props assigned: ",this.props.item.itemTimings[0].groups)
            
      
          }
      
          //if(this.props.item.itemTimings.length > 0){
      
      
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
      
        //   this.changeActiveStateTrue = this.changeActiveStateTrue.bind(this);
        //   this.changeActiveStateFalse = this.changeActiveStateFalse.bind(this);
        //   this.updatePartiesTimer = this.updatePartiesTimer.bind(this);
      
          //}
          console.log("[SpeakerListC] (constructor) Making an Itemcard with :",this.props.item.itemTimings)

          this.UDPPartiesData = setInterval(()=>{
            var data = {
                Tagesordnungspunkt: this.props.item.subjectOfItems[0].title,
                Fraktion: [
                    {
                        Fraktion: "SPD",
                        RestRedezeit: timeFormatSec(this.getDuration("SPD"))
                    },
                    {
                        Fraktion: "CDU",
                        RestRedezeit: timeFormatSec(this.getDuration("CDU"))
                    },
                    {
                        Fraktion: "Grunen",
                        RestRedezeit: timeFormatSec(this.getDuration("Bündnis 90/Die Grünen"))
                    },
                    {
                        Fraktion: "FDP",
                        RestRedezeit: timeFormatSec(this.getDuration("FDP"))
                    },
                    {
                        Fraktion: "Landesregierung",
                        RestRedezeit: timeFormatSec(this.getDuration("LR"))
                    },
                    {
                      Fraktion: "BE",
                      RestRedezeit: timeFormatSec(this.getDuration("BE"))
                  }
                ]
            }
            api.UDPData(data).then(()=>{

            });

        },1000)
    }

    componentWillUnmount() {
      clearInterval(this.UDPPartiesData)
    }

    keyPressed = (e) =>{
      // if(this.state.keyDownUsed === true){

      // }else{
      //   if(e.key === 'ArrowDown'){
      //     var elements = document.getElementsByClassName('dx-list-item')
      //     console.log("Key Pressed",elements)
      //     elements[0].classList.add('dx-state-focused')
      //     this.setState({
      //       keyDownUsed : true,
      //     })
      //   }
      // }
      if(e.key === 'Enter'){
        if(document.getElementsByClassName('dx-list-item dx-state-focused').length !== 0){
          /// There is already some focused element
          var element = document.getElementsByClassName('dx-list-item dx-state-focused')[0]
          var SpeakerTile = element.getElementsByClassName('speaker-list-item')[0]
          
          SpeakerTile.click()
        }
        else{
          /// Choose the forst speaker from the list
          var element = document.getElementsByClassName('dx-list-item')[0]
          var SpeakerTile = element.getElementsByClassName('speaker-list-item')[0]
          SpeakerTile.click()
        }
      }
      
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

    getUsers = async() =>{
        /*  This gets the speaker list saved in the DB */
        var use;
        await api.getSpeakersDB().then(speaks => {  /// chainging from WEB API TO LOCAL DB. (getAllSPeakers() -> getspeakersDB())
          // console.log(speaks.data.data.Abgeordnetenliste[0].redner)
          // console.log(speaks)
          use = speaks.data.data[0].Abgeordnetenliste[0].redner
        })
    
        use.map((u)=>{
          if(u.funktion){
            u.search = "."
            if(u.funktion === "Ministerpräsident"){
              u.search = ".mp"
            }
            if(u.funktion === "Minister für Wirtschaft, Arbeit, Verkehr und Digitalisierung"){
              u.search = ".mw"
            }
            if(u.funktion === "Minister für Inneres und Sport"){
              u.search = ".mi"
            }
            if(u.funktion === "Ministerin für Soziales, Gesundheit und Gleichstellung"){
              u.search = ".ms"
            }
            if(u.funktion === "Justizministerin"){
              u.search = ".mj"
            }
            if(u.funktion === "Finanzminister"){
              u.search = ".mf"
            }
            if(u.funktion === "Kultusminister"){
              u.search = ".mk"
            }
            if(u.funktion === "Ministerin für Ernährung, Landwirtschaft und Verbraucherschutz"){
              u.search = ".ml"
            }
            if(u.funktion === "Minister für Wissenschaft und Kultur"){
              u.search = ".mwk"
            }
            if(u.funktion === "Minister für Umwelt, Energie, Bauen und Klimaschutz"){
              u.search = ".mu"
            }
            if(u.funktion === "Ministerin für Bundes- und Europaangelegenheiten und Regionale Entwicklung"){
              u.search = ".mb"
            }
            if(u.funktion === "Landtagspräsidentin"){
              u.search = ".p"
            }
    
    
          }
          else{
            u.search = u.nachname
          }
        
        })
        /// Specific Entries

        var Beaufrage = {
          fraktion: " ",
          nachname: "Beauftrage/r Landesregierung",
          vorname: " ",
          search: "Beauftrage"
        }

        var Sitzungsunter = {
          fraktion: " ",
          nachname: "Sitzungsunterbrechung",
          vorname: " ",
          search: "Sitzungsunterbrechung"
        }

        var Sitzungsleitung = {
          fraktion: " ",
          nachname: "Sitzungsleitung",
          vorname: " ",
          search: "Sitzungsleitung"
        }

        var Gast = {
          fraktion: " ",
          nachname: "Gast",
          vorname: " ",
          search: "Gast"
        }


        /// Default Users List
        var defaultUserList = cloneDeep(use);

        defaultUserList.map((data)=>{
          let uTemp = cloneDeep(data);
          if(!uTemp.funktion){// if user in not a part of government
            uTemp.search = "_"+uTemp.nachname;
            uTemp.nachname = "BE:  "+uTemp.nachname;
            
            defaultUserList.push(uTemp)
          }
          
        })

        defaultUserList.push(Beaufrage)
        defaultUserList.push(Sitzungsunter)
        defaultUserList.push(Gast)

        /// 90 Second List

        var ninetySecList = cloneDeep(use);
        ninetySecList.push(Beaufrage)

        /// Other options List

        var otherOptionList = cloneDeep(use);
        otherOptionList.push(Beaufrage);
        otherOptionList.push(Sitzungsleitung)
        otherOptionList.push(Gast)
        otherOptionList.push(Sitzungsunter)
        


        this.setState({
          users: use,
          defaultList: defaultUserList,
          ninetySecList: ninetySecList,
          otherList: otherOptionList,
        })
    
    }

  updateTimer(extraTime) {
    const { time } = this.state;
    this.setState({ time : time + extraTime });
  }


  defaultOptionPress = (e) =>{
    console.log("default pressed!");
    this.setState({
      defaultSelected:true,
      typeSpeechSelected:'RZ',
    });
  }

    /////////////////////////////////////// START STOP RESET /////////////////////////////////
  start = (event) => {
    if(!this.state.AskerSelected){
      this.setState({
        isRunning : true 
      }, () => {
        this.timerRef = setInterval(
          () => { this.updateTimer( Config.updateInterval ) }, Config.updateInterval
        )
      });
    }
    else{
      if(this.state.AskerSelected){
        this.setState({
          QisRunning : true 
        }, () => {
          this.QtimerRef = setInterval(
            () => { this.setState({timeQ: this.state.timeQ + 1000,}); },1000
          )
        });
      }
      else{
        if(this.state.questionAnswerSelected){
          this.setState({
            AisRunning: true,
          },()=>{
            this.AtimerRef = setInterval(
              ()=>{
                this.setState({timeA: this.state.timeA + 1000,})
              },1000
            )
          })
        }
      }
      

    }

    if(this.state.questionAnswerSelected){
      this.setState({},()=>{
        this.answerRef = setInterval(()=>{
          this.setState({
            answerTime: this.state.answerTime -1000,
          })
        },1000)
      })
    }
    

    if(this.state.AskerSelected){
      this.setState({

      },
      () => {this.questionRef = setInterval(
        () => {this.setState({questionTime: this.state.questionTime-1000,})}, 1000
      )}
      )
    }

    if(this.state.ninetySecSelected){
      this.setState({

      },
      () => {this.ninetySecRef = setInterval(
        () => {this.setState({ninetySecTime: this.state.ninetySecTime-1000,})}, 1000
      )}
      )
    }

    if(this.state.onGoSelected || this.state.personalRemarkSelected){
      this.setState({

      },
      () => {this.fiveminRef = setInterval(
        () => {this.setState({fiveminTime: this.state.fiveminTime-1000,})}, 1000
      )}
      )
    }

    console.log('start button pressed!')
  }

  stop = (event)=> {
      this.setState({
        isRunning : false,
        QisRunning: false,
        AisRunning: false,
      }, () => {
        clearInterval(this.timerRef);
      });
      this.setState({},
        ()=> {
          clearInterval(this.ninetySecRef);
        })

      this.setState({},
        ()=>{
          clearInterval(this.fiveminRef)
        })
      this.setState({},
        ()=>{
          clearInterval(this.QtimerRef);
          clearInterval(this.questionRef);
          clearInterval(this.AtimerRef);
          clearInterval(this.answerRef);
        })
  }

  reset = (event) => {///TODO: Add functionality to save the speaker name and times
      if(this.state.AskerSelected){
        var temp = {
          nachname:this.state.userSelectedQuestion.nachname,
          vorname:this.state.userSelectedQuestion.vorname,
          fraktion: this.state.userSelectedQuestion.fraktion,
          duration:this.state.timeQ,
          speechType: this.state.typeSpeechSelected,
          funktion: this.state.userSelectedQuestion.funktion,
          deleted: false,
          // endTime: this.props.totalItemTime,
          startTimeInStreamSecs: (( new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")) ) / 1000) - (this.state.timeQ / 1000),
          stopTimeInStreamSecs: ( new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")) ) / 1000 ,
        }
      }else{
        if(this.state.questionAnswerSelected){
          var temp = {
            nachname:this.state.userSelected.nachname,
            vorname:this.state.userSelected.vorname,
            fraktion: this.state.userSelected.fraktion,
            duration:this.state.timeA,
            speechType: "Answer",
            funktion: this.state.userSelected.funktion,
            deleted: false,
            // endTime: this.props.totalItemTime,
            startTimeInStreamSecs: (( new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")) ) / 1000) - (this.state.timeA / 1000),
            stopTimeInStreamSecs: ( new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")) ) / 1000 ,
          }
        }
        else{
          var temp = {
            nachname:this.state.userSelected.nachname,
            vorname:this.state.userSelected.vorname,
            fraktion: this.state.userSelected.fraktion,
            duration:this.state.time,
            speechType: this.state.typeSpeechSelected,
            funktion: this.state.userSelected.funktion,
            deleted: false,
            // endTime: this.props.totalItemTime,
            startTimeInStreamSecs: (( new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")) ) / 1000) - (this.state.time / 1000),
            stopTimeInStreamSecs: ( new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")) ) / 1000 ,
          }
        }
        
      }
      
      if(this.state.deletedRedenerTime > 0){
        temp.duration += this.state.deletedRedenerTime
        this.setState({
          deletedRedenerTime: 0,
        })
      }
      // console.log('Temp: ',temp);

      // console.log('function state: ',this.state.speakersFullList)

      var merge = this.state.speakersFullList;
      merge.push(temp)
      let ItemListObj = new ItemList();
      console.log("[NOW] object created: ",ItemListObj)
      let list = [...this.props.itemList]
      console.log("[NOW] list: ",list)
      list[this.props.index].speakerTimings = merge ;
      list[this.props.index].itemTimings[0].groups = this.state.partiesActiveRef
      console.log("[NOW] list with updated speaker times: ",list)
      ItemListObj.fromList(list)
      console.log("[NOW] PartiesActiveRef: ",this.state.partiesActiveRef)
      console.log("[NOW] PartiesActiveRef: ",this.props.item.itemTimings)
      console.log("[NOW] ITEMOBject: ",ItemListObj)
      var sessionInfo = this.props.sessionInfo
      ItemListObj.update2DB(sessionInfo.sessionNumber,sessionInfo.sessionStart,sessionInfo.sessionEnd,sessionInfo.numberOfDays);

      // var merge = [ ...this.state.speakerFullList, temp];

      console.log('After DB Update: ',this.state)
      this.setState({speakerFullList:merge})

      
      
      // this.setState((prevState) => ({speakerFullList: [...prevState.speakersFullList, temp]}));

      // this.setState({speakerFullList:speakerFullList})
      // this.setState({speakersFullList:temp});
      if(!this.state.AskerSelected){
        this.setState({isRunning : false,userClicked:false,userSelected:{},QisRunning:false,
          time      : 0,
          timeQ: 0,},
          () => {
              clearInterval(this.timerRef);
            });
      }
      else{
        if(!this.state.questionAnswerSelected){
          this.setState({
            QisRunning:false,
            timeQ: 0,
            userSelectedQuestion: {},
          }//,
            // () => {
            //     clearInterval(this.timerRef);
            //   }
            );
        }
        else{
          this.setState({
            AisRunning:false,
            timeA: 0,
            // userSelectedQuestion: {},
          }//,
            // () => {
            //     clearInterval(this.timerRef);
            //   }
            );
        }
        
      }
      


      this.setState({ninetySecTime:90000,ninetySecSelected:false},
        () => {
          clearInterval(this.ninetySecRef);
        });

      this.setState({fiveminTime:300000,onGoSelected: false, personalRemarkSelected: false,},
        ()=>{
          clearInterval(this.fiveminRef)
        })
      this.setState({
        questionTime: 90000,
        answerTime: 90000,
      },
        ()=>{
          clearInterval(this.QtimerRef);
          clearInterval(this.questionRef);
          clearInterval(this.AtimerRef);
          clearInterval(this.answerRef);
        })
      if(this.state.AskerSelected){
        this.setState({
          AskerSelected: false,
          defaultSelected: true,
          // userSelected: true,
          userClicked: true,
          questionAnswerSelected: false,
        })
      }

      console.log('After After DB Update: ',this.state)
      
      


  }

  changeActiveStateTrue = (groupname)=> {
    this.state.partiesActiveRef.map((data,index) => {
      if(data.name == groupname){
        this.state.partiesActiveRef[index] = {name:data.name,activeState:true,duration:data.duration,};
        
      }
    })
    this.setState({partiesActiveRef:this.state.partiesActiveRef},
                    () => {this.partiesRef = setInterval(
                      () => { this.updatePartiesTimer(groupname)}, 1000
                    )} )
    
  }

  changeActiveStateFalse = (groupname)=> {
    this.state.partiesActiveRef.map((data,index) => {
      if(data.name == groupname){
        this.state.partiesActiveRef[index] = {name:data.name,activeState:false,duration:data.duration,};
        
      }
    })
    this.setState({partiesActiveRef:this.state.partiesActiveRef},
                  () => {
                    clearInterval(this.partiesRef)
                  })
    
  }

  getActiveStateIndex = (groupname) =>{
    var foundindex = -1;
    this.state.partiesActiveRef.map((data,index) => {
      if(data.name == groupname){
        foundindex = index
      }
    })
    return foundindex;
    

  }

  updatePartiesTimer(groupname){
    var now = this.getDuration(groupname);
    var updated = now - 1; /// 1 is time to deduct in seconds.
    this.state.partiesActiveRef.map((data,index) => {
      if(data.name == groupname){
        this.state.partiesActiveRef[index] = {name:data.name,activeState:data.activeState,duration:updated}
      }
    })

    this.setState({partiesActiveRef:this.state.partiesActiveRef})
    
  }


  

  startButtonQuestion = () =>{
    this.setState({
      QisRunning: true,
    },()=>{
      this.QtimerRef = setInterval(()=>{
        this.setState({
          timeQ: this.state.timeQ + 1000
        });
      },1000);
      this.questionRef = setInterval(()=>{
        this.setState({
          questionTime: this.state.questionTime - 1000
        });
      },1000);
    })
  }

  pauseButtonQuestion = () =>{
    this.setState({
      QisRunning: false,
    },()=>{
      clearInterval(this.QtimerRef);
      clearInterval(this.questionRef);
    })

    

    
  }

  stopButtonQuestion = () =>{
    this.setState({
      QisRunning: false,
    })
    var temp = {
      nachname:this.state.userSelectedQuestion.nachname,
      vorname:this.state.userSelectedQuestion.vorname,
      fraktion: this.state.userSelectedQuestion.fraktion,
      duration:this.state.timeQ,
      speechType: "Zwischenfrage",
      funktion: this.state.userSelectedQuestion.funktion,
      deleted: false,
      startTimeInStreamSecs: (( new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")) ) / 1000) - (this.state.timeQ / 1000),
      stopTimeInStreamSecs: ( new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")) ) / 1000 ,
    }

    

    if(this.state.deletedRedenerTime > 0){
      temp.duration += this.state.deletedRedenerTime
      this.setState({
        deletedRedenerTime: 0,
      })
    }

    var merge = this.state.speakersFullList;
    merge.push(temp)
    let ItemListObj = new ItemList();
    
    let list = [...this.props.itemList]
    list[this.props.index].speakerTimings = merge ;
    list[this.props.index].itemTimings[0].groups = this.state.partiesActiveRef
    ItemListObj.fromList(list)
    var sessionInfo = this.props.sessionInfo
    ItemListObj.update2DB(sessionInfo.sessionNumber,sessionInfo.sessionStart,sessionInfo.sessionEnd,sessionInfo.numberOfDays);

    this.setState({speakerFullList:merge})

    this.setState({
      timeQ: 0,
      questionTime: 90000,
      QisRunning:false,
      AskerSelected: false,
      questionAnswerSelected: true,
    },()=>{
      clearInterval(this.AtimerRef);
      clearInterval(this.answerRef);
    })

  }


  startButtonAnswer = () =>{
    this.setState({
      AisRunning: true,
    },()=>{
      this.AtimerRef = setInterval(()=>{
        this.setState({
          timeA: this.state.timeA + 1000
        });
      },1000);
      this.answerRef = setInterval(()=>{
        this.setState({
          answerTime: this.state.answerTime - 1000
        });
      },1000);
    })
  }

  pauseButtonAnswer = () =>{
    this.setState({
      AisRunning: false,
    },()=>{
      clearInterval(this.AtimerRef);
      clearInterval(this.answerRef);
    })
  }

  stopButtonAnswer = async() =>{
    var temp = {
      nachname:this.state.userSelected.nachname,
      vorname:this.state.userSelected.vorname,
      fraktion: this.state.userSelected.fraktion,
      duration:this.state.timeA,
      speechType: "Antwort",
      funktion: this.state.userSelected.funktion,
      deleted: false,
      startTimeInStreamSecs: (( new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")) ) / 1000) - (this.state.timeA / 1000),
      stopTimeInStreamSecs: ( new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")) ) / 1000 ,
    }


    if(this.state.deletedRedenerTime > 0){
      temp.duration += this.state.deletedRedenerTime
      this.setState({
        deletedRedenerTime: 0,
      })
    }

    var merge = this.state.speakersFullList;
    merge.push(temp)
    let ItemListObj = new ItemList();
    
    let list = [...this.props.itemList]
    list[this.props.index].speakerTimings = merge ;
    list[this.props.index].itemTimings[0].groups = this.state.partiesActiveRef
    ItemListObj.fromList(list)
    var sessionInfo = this.props.sessionInfo
    ItemListObj.update2DB(sessionInfo.sessionNumber,sessionInfo.sessionStart,sessionInfo.sessionEnd,sessionInfo.numberOfDays);

    this.setState({speakerFullList:merge})

    this.setState({
      timeA: 0,
      answerTime: 90000,
      AisRunning:false,
      questionAnswerSelected: false,
      
    },()=>{
      clearInterval(this.AtimerRef);
      clearInterval(this.answerRef);
    })

  }

  breakForQuestion =() =>{
    this.setState({
      isRunning: false,
    },()=>{
      clearInterval(this.timerRef)
    })

    var temp = {
      nachname:this.state.userSelected.nachname,
      vorname:this.state.userSelected.vorname,
      fraktion: this.state.userSelected.fraktion,
      duration:this.state.time,
      speechType: "RZ",
      funktion: this.state.userSelected.funktion,
      deleted: false,
      startTimeInStreamSecs: (( new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")) ) / 1000) - (this.state.time / 1000),
      stopTimeInStreamSecs: ( new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")) ) / 1000 ,
    }

    if(this.state.userSelected.funktion){
      this.changeActiveStateFalse('BE')
    }
    else{
      if(this.state.userSelected.fraktion == 'Fraktionslos'){
        this.changeActiveStateFalse(this.state.userSelected.nachname);
      }
      else{
        this.changeActiveStateFalse(this.state.userSelected.fraktion);
      }
    }


    if(this.state.deletedRedenerTime > 0){
      temp.duration += this.state.deletedRedenerTime
      this.setState({
        deletedRedenerTime: 0,
      })
    }

    var merge = this.state.speakersFullList;
    merge.push(temp)
    let ItemListObj = new ItemList();
    
    let list = [...this.props.itemList]
    list[this.props.index].speakerTimings = merge ;
    list[this.props.index].itemTimings[0].groups = this.state.partiesActiveRef
    ItemListObj.fromList(list)
    var sessionInfo = this.props.sessionInfo
    ItemListObj.update2DB(sessionInfo.sessionNumber,sessionInfo.sessionStart,sessionInfo.sessionEnd,sessionInfo.numberOfDays);

    this.setState({speakerFullList:merge})

    setTimeout(()=>{document.getElementsByClassName('bottom--wrapper')[0].getElementsByClassName('dx-texteditor-input')[0].focus();},300)


  }

  //////////////////////////////////////////////////////////////////////////////////////////
  speakerRecButton = async () =>{

    if(this.state.QisRunning){
      this.stopButtonQuestion();
      // this.setState({
      //   questionAnswerSelected: false,
      // })
      // this.startButtonAnswer();
    }
    if(this.state.AisRunning){
      await this.stopButtonAnswer();
    }
    var SpeakerStartTimeInStream = ( new Date().getTime() - parseInt(localStorage.getItem("stream_start_time")) ) / 1000 ;

    if(this.state.ninetySecSelected || this.state.defaultSelected || this.state.onGoSelected || this.state.personalRemarkSelected || this.state.miscSelected ||this.state.mitteilungen || this.state.sitz || this.state.wahl){
      if(this.state.defaultSelected && !this.state.AskerSelected){
        console.log("!!! first start ")
        this.start();
        if(this.state.userSelected.nachname[0] === "B" && this.state.userSelected.nachname[1] === "E" &&this.state.userSelected.nachname[2] === ":"){
          this.changeActiveStateTrue('BE')
        }
        else{
          if(this.state.userSelected.funktion){
            this.changeActiveStateTrue('LR')
          }
          else{
            if(this.state.userSelected.fraktion == 'Fraktionslos'){
              this.changeActiveStateTrue(this.state.userSelected.nachname);
            }
            else{
              
              this.changeActiveStateTrue(this.state.userSelected.fraktion);
            }
          }
        }
        
        
      
      }
      if(this.state.ninetySecSelected){
        console.log("!!! 90 start ")
        this.start();
      }
      if(this.state.onGoSelected || this.state.personalRemarkSelected || this.state.miscSelected || this.state.mitteilungen || this.state.sitz || this.state.wahl){
        console.log("!!! after 90 start ")
        this.start();
      }

      if(this.state.AskerSelected){
        console.log("!!! asker start ")
        this.start();
      }

      if(this.state.questionAnswerSelected){
        console.log("!!! QA start ")
        this.start();
      }

    }
    else{
      console.log("No options is selected!")
    }
    

  }

  speakerPauseButton = () =>{
    if(this.state.defaultSelected){
      this.stop();
      if(this.state.userSelected.funktion){
        this.changeActiveStateFalse('BE')
      }
      else{
        if(this.state.userSelected.fraktion == 'Fraktionslos'){
          this.changeActiveStateFalse(this.state.userSelected.nachname);
        }
        else{
          this.changeActiveStateFalse(this.state.userSelected.fraktion);
        }
      }
      
    
    }
    // if(this.state.ninetySecSelected){
    //   this.stop();
    // }
    this.stop();
     

  }

  speakerStopButton = () =>{
    if(this.state.defaultSelected){
      this.reset();
      if(this.state.userSelected.funktion){
        this.changeActiveStateFalse('BE')
      }
      else{
        if(this.state.userSelected.fraktion == 'Fraktionslos'){
          this.changeActiveStateFalse(this.state.userSelected.nachname);
        }
        else{
          this.changeActiveStateFalse(this.state.userSelected.fraktion);
        }
      }
      
    
    }
    if(this.state.ninetySecSelected || this.state.personalRemarkSelected || this.state.onGoSelected || this.state.miscSelected || this.state.mitteilungen || this.state.sitz || this.state.wahl){
      this.reset();
    }
    // this.reset();
    /// TODO: save the type of speech with the user selected
    this.setState({
      ninetySecSelected:false,
      defaultSelected:false,
      otherOptionsSelected:false,
      onGoSelected:false,
      personalRemarkSelected: false,
      miscSelected: false,
      mitteilungen:false,
      sitz: false,
      wahl: false,
    })

    if(this.state.AskerSelected)
    {
      this.setState({
        defaultSelected: true,
        questionAnswerSelected: true,
      })
    }

    setTimeout(()=>{document.getElementsByClassName('bottom--wrapper')[0].getElementsByClassName('dx-texteditor-input')[0].focus();},500)
    // console.log("after speakerStop: ",this.state)
  }

  /// Enter Gast Name //////////////////////////////

  enterGastName = () =>{
    this.setState({
      GastNameEnter: true,
    })
  }

  ////////// ITEM RENDER FOR LISTS ////////////////

  ItemTemplateDefault = (data) =>{
      return <UserTile 
              className="speaker-list-item" 
              onClick={() => {
                              this.setState({userClicked:true, userSelected:data,});
                              // if(data.search.charAt(0) === "."){
                              //   this.setState({
                              //     otherOptionsSelected: true,
                              //     defaultSelected: false,
                              //     ninetySecSelected: false,
                              //   }) 
                              // }
                              if(data.search.charAt(0) === "_"){
                                this.setState({
                                  defaultSelected: true,
                                  ninetySecSelected: false,
                                  otherOptionsSelected: false,
                                  typeSpeechSelected:'RZ',
                                })
                              }
                              if(data.nachname === "Gast"){
                                  this.setState({
                                    otherOptionsSelected: true,
                                    defaultSelected: false,
                                    ninetySecSelected: false,
                                    miscSelected: true,
                                    typeSpeechSelected:'sonstiges',
                                  })
                              }
                              
                            }
                          } 
                        onKeyDown={(e) => {console.log("Key Pressed",e)}} 
                        onSelect={(e) => {console.log("Key Pressed")}}>
              {data.funktion ?
              <span style={{float:"left",}}>
                <div style={{float:"left", clear:"both"}} className="hovertextside" data-hover="zum Starten antippen">{data.nachname+", "+data.vorname}</div>
                <div style={{float:"left",clear:"both"}}>{data.funktion}</div>
              </span>
              :
              <span className="hovertextside" data-hover="zum Starten antippen">{data.nachname+", "+data.vorname}</span>
              }
              {data.funktion ? null:
                <PartyLabel>{data.fraktion}</PartyLabel>
              }
              
          </UserTile>;
  
  }

  undoUserSelection = () =>{
    this.setState({
      userClicked: false,
      userSelected: "",
      userSelectedQuestion: "",
      defaultSelected: false,
      ninetySecSelected: false,
      otherOptionsSelected: false,
      onGoSelected: false,
      miscSelected: false,
      mitteilungen: false,
      sitz: false,
      personalRemarkSelected: false,
      wahl: false,
      questionClicked: false,
      AskerSelected: false,
    })
  }

  undoQuestionUserSelection = () =>{
    this.setState({
      userSelectedQuestion: "",
      AskerSelected: false,
      questionClicked: true,
    })
  }

  backUserSelection = () =>{
    this.setState({
      defaultSelected: false,
      ninetySecSelected: false,
      otherOptionsSelected: false,
      onGoSelected: false,
      miscSelected: false,
      mitteilungen: false,
      sitz: false,
      personalRemarkSelected: false,
      wahl: false,
      questionClicked: false,
      AskerSelected: false,
    })
  }

  ItemTemplateQuestion = (data) =>{
    return <UserTile
            className="speaker-list-item" 
             onClick={() => {this.setState({userClicked:true, userSelectedQuestion:data,AskerSelected: true,questionClicked: false,});}} >
            {data.funktion ?
            //{this.setState}
            <span>
              <div style={{float:"left", clear:"both"}} className="hovertextside" data-hover="zum Starten antippen">{data.nachname+", "+data.vorname}</div>
              {/* <div style={{float:"left", marginLeft:"5px"}}><img src="./landtag.png" width="40" height="20" alt=""/></div> */}
              <div style={{float:"left",clear:"both"}}>{data.funktion}</div>
            </span>
            :
            <span className="hovertextside" data-hover="zum Starten antippen">{data.nachname+", "+data.vorname}</span>
            }
            {data.funktion ? null:
              <PartyLabel>{data.fraktion}</PartyLabel>
            }
            
        </UserTile>;

  }

  ItemTemplate90Sec = (data) =>{
    return <UserTile onClick={() => {this.setState({userClicked:true, userSelected:data,/*ninetySecSelected: true,typeSpeechSelected: '90 Sek.',*/});}} >
            {data.funktion ?
            //{this.setState}
            <span>
              <div style={{float:"left", clear:"both"}} className="hovertextside" data-hover="Tap on Person">{data.nachname+", "+data.vorname}</div>
              <div style={{float:"left", marginLeft:"5px"}}><img src="./landtag.png" width="40" height="20" alt=""/></div>
              <div style={{float:"left",clear:"both"}}>{data.funktion}</div>
            </span>
            :
            <span className="hovertextside" data-hover="Tap on Person">{data.nachname+", "+data.vorname}</span>
            }
            {data.funktion ? null:
              <PartyLabel>{data.fraktion}</PartyLabel>
            }
            
        </UserTile>;

  }

  ItemTemplateMisc = (data) =>{
    return <UserTile onClick={() => {
      this.setState({
        userClicked:true, 
        userSelected:data, 
        otherOptionsSelected: true,
        },()=>{
          if(data.nachname == "Gast"){
            this.enterGastName();
          }
        });
      }} >
            {data.funktion ?
            //{this.setState}
            <span>
              <div style={{float:"left", clear:"both"}} className="hovertextside" data-hover="Tap on Person">{data.nachname+", "+data.vorname}</div>
              <div style={{float:"left", marginLeft:"5px"}}><img src="./landtag.png" width="40" height="20" alt=""/></div>
              <div style={{float:"left",clear:"both"}}>{data.funktion}</div>
            </span>
            :
            <span className="hovertextside" data-hover="Tap on Person">{data.nachname+", "+data.vorname}</span>
            }
            {data.funktion ? null:
              <PartyLabel>{data.fraktion}</PartyLabel>
            }
            
        </UserTile>;

  }

  handleGastPopupClose = () =>{
    this.setState({
      GastNameEnter: false,
    })
  }

  //xxxxxxx END OF ITEM RENDER FOR LISTS xxxxxxxxxxx

  strikeOutRedner = (data,index) =>{
    console.log("[SpeakerListC] (strikeOutRedner) Strike out button pressed on ",this.state.speakersFullList)
    var speakerlist = [...this.state.speakersFullList]
    speakerlist[index].deleted = true;
    if(speakerlist[index+1] ){
      if(speakerlist[index+1].deleted === true){
        if(speakerlist[index+2]){
          speakerlist[index+2].duration = parseInt(speakerlist[index+2].duration) + parseInt(speakerlist[index].duration)
        }
        else{
          this.setState({
            deletedRedenerTime: speakerlist[index].duration
          })
        }
      }
      else{
        speakerlist[index+1].duration = parseInt(speakerlist[index+1].duration) + parseInt(speakerlist[index].duration)
      }
      
    }
    else{
      this.setState({
        deletedRedenerTime: parseInt(speakerlist[index].duration)
      })
    }
    

    this.setState({
      speakersFullList: speakerlist,
    },()=>{
      let ItemListObj = new ItemList();
      // console.log("[NOW] object created: ",ItemListObj)
      let list = [...this.props.itemList]
      // console.log("[NOW] list: ",list)
      list[this.props.index].speakerTimings = this.state.speakersFullList ;
      list[this.props.index].itemTimings[0].groups = this.state.partiesActiveRef
      
      if(this.state.speakersFullList[index].speechType === "RZ"){
        for(let i=0;i < list[this.props.index].itemTimings[0].groups.length;i++){
          console.log("[SpeakerListC] (strikeOutRedner) party names ",this.state.speakersFullList[index].fraktion)
          console.log("[SpeakerListC] (strikeOutRedner) party times ",this.state.partiesActiveRef)
          if(list[this.props.index].itemTimings[0].groups[i].name === this.state.speakersFullList[index].fraktion){
            var time = parseInt(list[this.props.index].itemTimings[0].groups[i].duration) + (parseInt(this.state.speakersFullList[index].duration)/1000)
            list[this.props.index].itemTimings[0].groups[i].duration = time;
            
            for(let j=0;j<this.state.partiesActiveRef.length;j++){
              if(this.state.partiesActiveRef[j].name === list[this.props.index].itemTimings[0].groups[i].name){
                this.state.partiesActiveRef[j].duration = time;
                this.setState({
                  partiesActiveRef: this.state.partiesActiveRef
                })
              }
            }
          }
        }
        
      }
      // console.log("[NOW] list with updated speaker times: ",list)
      ItemListObj.fromList(list)
      // console.log("[NOW] PartiesActiveRef: ",this.state.partiesActiveRef)
      // console.log("[NOW] PartiesActiveRef: ",this.props.item.itemTimings)
      // console.log("[NOW] ITEMOBject: ",ItemListObj)
      var sessionInfo = this.props.sessionInfo
      ItemListObj.update2DB(sessionInfo.sessionNumber,sessionInfo.sessionStart,sessionInfo.sessionEnd,sessionInfo.numberOfDays);
    })
  }

  undoStrikeoutRedner = (data,index) =>{
    var speakerlist = [...this.state.speakersFullList]
    speakerlist[index].deleted = false;
    if(speakerlist[index+1] ){
      if(speakerlist[index+1].deleted === true){
        if(speakerlist[index+2]){
          speakerlist[index+2].duration = parseInt(speakerlist[index+2].duration) - parseInt(speakerlist[index].duration)
        }
        else{
          this.setState({
            deletedRedenerTime: speakerlist[index].duration
          })
        }
      }
      else{
        speakerlist[index+1].duration = parseInt(speakerlist[index+1].duration) - parseInt(speakerlist[index].duration)
      }
      
    }
    this.setState({
      speakersFullList: speakerlist,
    },()=>{
      let ItemListObj = new ItemList();
      // console.log("[NOW] object created: ",ItemListObj)
      let list = [...this.props.itemList]
      // console.log("[NOW] list: ",list)
      list[this.props.index].speakerTimings = this.state.speakersFullList ;
      list[this.props.index].itemTimings[0].groups = this.state.partiesActiveRef;

      if(this.state.speakersFullList[index].speechType === "RZ"){
        for(let i=0;i < list[this.props.index].itemTimings[0].groups.length;i++){
          if(list[this.props.index].itemTimings[0].groups[i].name === this.state.speakersFullList[index].fraktion){
            var time = parseInt(list[this.props.index].itemTimings[0].groups[i].duration) - (parseInt(this.state.speakersFullList[index].duration)/1000)
            list[this.props.index].itemTimings[0].groups[i].duration = time;
            
            for(let j=0;j<this.state.partiesActiveRef.length;j++){
              if(this.state.partiesActiveRef[j].name === list[this.props.index].itemTimings[0].groups[i].name){
                this.state.partiesActiveRef[j].duration = time;
                this.setState({
                  partiesActiveRef: this.state.partiesActiveRef
                })
              }
            }
          }
        }
        
      }
      
      // console.log("[NOW] list with updated speaker times: ",list)
      ItemListObj.fromList(list)
      // console.log("[NOW] PartiesActiveRef: ",this.state.partiesActiveRef)
      // console.log("[NOW] PartiesActiveRef: ",this.props.item.itemTimings)
      // console.log("[NOW] ITEMOBject: ",ItemListObj)
      var sessionInfo = this.props.sessionInfo
      ItemListObj.update2DB(sessionInfo.sessionNumber,sessionInfo.sessionStart,sessionInfo.sessionEnd,sessionInfo.numberOfDays);
    })
  }

  getRecentSpeakers = () =>{
    var speakersNameList = []
    this.state.speakersFullList.map((data)=>{
      var name = data.nachname + ", "+ data.vorname;
      speakersNameList.push(name);
    })
    var recentList = [...new Set(speakersNameList)]
    return recentList.reverse().slice(0,5)
  }

  getSpeakerDataFromName = (name) =>{
    var nachname = name.split(",")[0]
    var vorname = name.split(",")[1].trim()
    var foundUser = {}
    this.state.defaultList.map((data)=>{
      if(data.nachname == nachname && data.vorname == vorname){
        foundUser = data
      }
    })
    return foundUser

  }

  render(){
      return(
          <Wrapper>
            <PartyTimerWrapper id='scroll-active'>
                    {this.props.item.itemTimings[0].groups.map((group) => {
                      if(group.name === "LR" ||group.name === "SPD" ||group.name === "CDU" ||group.name === "Bündnis 90/Die Grünen" || group.name === "FDP" ||group.name === "BE" || group.duration != 0){
                        if(this.getDuration(group.name) < 0){
                          return(
                            <PartyTimerTile className="negative-party-tile">
                              <PartyName>
                                  {group.name}
                              </PartyName>
                              <PartyTime>
                                  {timeFormatSec(this.getDuration(group.name))}
                              </PartyTime>
                            </PartyTimerTile>
                          );
                        }
                        else{
                          return(
                            <PartyTimerTile>
                              <PartyName>
                                  {group.name}
                              </PartyName>
                              <PartyTime>
                                  {timeFormatSec(this.getDuration(group.name))}
                              </PartyTime>
                            </PartyTimerTile>
                          );
                        }
                        
                      }

                    })
                    }
            </PartyTimerWrapper>
            {/* This div doesn't contain content. It is included in only active TOP and used to scroll to the div using FLoating Btn. */}
                {/* {this.props.active ?
                <div id={'scroll-active'} style={{float: "left",clear:"both"}}>&nbsp;</div> 
                :null} */}
              {this.state.userClicked ? 
                this.state.defaultSelected ?
                  <SpeakerRecordingBoxWrapper> {/* User is clicked and default option is selected and you have to start recording of speaker */}
                    <UndoUserSelectionBtn onClick={this.undoUserSelection}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"/>
                      </svg>
                    </UndoUserSelectionBtn>
                    <BackButton onClick={this.backUserSelection}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                      </svg>
                    </BackButton>
                    <span style={{float:"left",clear:"right"}}>{this.state.userSelected.nachname+", "+this.state.userSelected.vorname}</span>
                    <PartyLabel>{this.state.userSelected.fraktion}</PartyLabel>
                    <SpeakerTimerWrapper>
                    {!this.state.isRunning?
                      <IconWrapper className="play-but" onClick={this.speakerRecButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                          <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                        </svg>
                      </IconWrapper>:
                      <IconWrapper onClick={this.speakerPauseButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
                          <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                        </svg>
                      </IconWrapper>}
                      <IconWrapper onClick={this.speakerStopButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-stop-fill" viewBox="0 0 16 16">
                          <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
                        </svg>
                      </IconWrapper>
                      <div className="speaker-timer-div">
                        <Timer className="speaker-timer" id="sp-timer" time={this.state.time} />
                      </div>
                  </SpeakerTimerWrapper>
                  {this.state.userSelected.search.charAt(0) !== "_"?
                    <QuestionBtn onClick={()=>{this.setState({questionClicked: true,});this.breakForQuestion();}}>
                      Zwischenfrage
                    </QuestionBtn>
                    :null
                  }
                    {
                      this.state.questionAnswerSelected?

                        <SpeakerRecordingBoxWrapper style={{clear:"none",float:"left",marginLeft:"0",width:"300px"}}>
                        {/* <span style={{float:"left"}}>{this.state.userSelected.nachname+", "+this.state.userSelected.vorname}</span> */}
                        <hr/>
                        <span style={{float:"left"}}>{"Antwort"}</span>
                        {/* <PartyLabel>{this.state.userSelected.fraktion}</PartyLabel> */}
                        <SpeakerTimerWrapper>
                        {!this.state.AisRunning?
                          <IconWrapper className="play-but" onClick={this.startButtonAnswer}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                            </svg>
                          </IconWrapper>:
                          <IconWrapper onClick={this.pauseButtonAnswer}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
                              <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                            </svg>
                          </IconWrapper>}
                          <IconWrapper onClick={this.stopButtonAnswer}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-stop-fill" viewBox="0 0 16 16">
                              <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
                            </svg>
                          </IconWrapper>
                          <div className="speaker-timer-div">
                            <Timer className="speaker-timer" id="sp-timer" time={this.state.timeA} />
                            {this.state.ninetySecTime > 0?
                              <Timer className="ninty-sec-timer-remain" time={this.state.answerTime}/>
                            : <Timer className="ninty-sec-timer-remain ninety-sec-remain-negative" time={this.state.answerTime}/>
                            }
                            {/* {
                              this.state.answerTime <= 0 ? this.stopButtonAnswer() :null
                            } */}
                            
                          </div>
                        </SpeakerTimerWrapper>
                        </SpeakerRecordingBoxWrapper>

                      :null
                    }
                  </SpeakerRecordingBoxWrapper> : 
                    this.state.ninetySecSelected || this.state.otherOptionsSelected ? 
                      null :
                      <SpeakerRecordingBoxWrapper> {/** User is Clicked and you get the option to choose default, Kurzintervention, Sonstiges zum TOP*/}
                        <UndoUserSelectionBtn onClick={this.undoUserSelection}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                            <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"/>
                          </svg>
                        </UndoUserSelectionBtn>
                        <span style={{float:"left",clear:"right"}}>{this.state.userSelected.nachname+", "+this.state.userSelected.vorname}</span>
                        <PartyLabel>{this.state.userSelected.fraktion}</PartyLabel>
                        <OptionBtn style={{clear:"left"}} onClick={()=>{this.setState({defaultSelected: true,ninetySecSelected: false,otherOptionsSelected: false,typeSpeechSelected:'RZ',},()=>{
                              if(this.state.userSelected.nachname == "Gast"){
                                this.enterGastName();
                              }
                            })}}>Redezeitverwaltung</OptionBtn>
                        {this.state.userSelected.funktion ? /// Kurzintervention doesn't show when speakerSelected is a minister
                          null:
                          <OptionBtn onClick={()=>{this.setState({ninetySecSelected: true,otherOptionsSelected: false,defaultSelected: false,typeSpeechSelected: '90 Sek.',},()=>{
                            if(this.state.userSelected.nachname == "Gast"){
                              this.enterGastName();
                            }
                          })}}>Kurzintervention</OptionBtn>
                        }
                        
                        <OptionBtn onClick={()=>{
                          this.setState({ 
                            otherOptionsSelected: true,
                            defaultSelected: false,
                            ninetySecSelected: false,
                            },()=>{
                              if(this.state.userSelected.nachname == "Gast"){
                                this.enterGastName();
                              }
                            });
                        }}>Sonstiges zum TOP</OptionBtn>
                      </SpeakerRecordingBoxWrapper>
              :this.state.ninetySecSelected || this.state.otherOptionsSelected ? null :
              <DefaultSearchWrap style={{clear:"left"}}>
                {console.log("Speakerlist items:",this.state.defaultList)}
                  <List 
                      dataSource={this.state.defaultList}
                      height={400}
                      width = {315}
                      itemRender={this.ItemTemplateDefault}
                      searchExpr="search"
                      searchEnabled={true}
                      searchMode={this.state.searchMode} 
                      noDataText= "Keine Daten zum Anzeigen"
                      showScrollbar= "always"
                      pageLoadMode= 'scrollBottom'
                      />
              </DefaultSearchWrap>}
              {this.state.questionClicked ?
                <QuestionSearchWrap>
                  <List 
                      dataSource={this.state.users}
                      height={400}
                      width = {300}
                      itemRender={this.ItemTemplateQuestion}
                      searchExpr="search"
                      searchEnabled={true}
                      searchMode={this.state.searchMode} 
                      noDataText= "Keine Daten zum Anzeigen"
                      showScrollbar= "always"
                      pageLoadMode= 'scrollBottom'/>
                </QuestionSearchWrap>
                :null
              }
              {
                this.state.AskerSelected ?
                <SpeakerRecordingBoxWrapper style={{clear:"none",float:"left",marginLeft:"20px",paddingBottom:"22px"}}>
                <UndoUserSelectionBtn onClick={this.undoQuestionUserSelection} >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"/>
                      </svg>
                </UndoUserSelectionBtn>
                <span style={{float:"left",clear:"right"}}>{this.state.userSelectedQuestion.nachname+", "+this.state.userSelectedQuestion.vorname}</span>
                <PartyLabel>{this.state.userSelectedQuestion.fraktion}</PartyLabel>
                <SpeakerTimerWrapper>
                {!this.state.QisRunning?
                  <IconWrapper className="play-but" onClick={this.startButtonQuestion}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                      <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                    </svg>
                  </IconWrapper>:
                  <IconWrapper onClick={this.pauseButtonQuestion}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
                      <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                    </svg>
                  </IconWrapper>}
                  <IconWrapper onClick={this.stopButtonQuestion}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-stop-fill" viewBox="0 0 16 16">
                      <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
                    </svg>
                  </IconWrapper>
                  <div className="speaker-timer-div">
                    <Timer className="speaker-timer" id="sp-timer" time={this.state.timeQ} />
                    {this.state.ninetySecTime > 0?
                      <Timer className="ninty-sec-timer-remain" time={this.state.questionTime}/>
                    : <Timer className="ninty-sec-timer-remain ninety-sec-remain-negative" time={this.state.questionTime}/>
                    }
                    {/* {
                      this.state.questionTime <= 0 ? this.stopButtonQuestion() :null
                    } */}
                    
                  </div>
                </SpeakerTimerWrapper>
                </SpeakerRecordingBoxWrapper>

                :null

              }
              {this.state.userClicked && this.state.ninetySecSelected?
                <SpeakerRecordingBoxWrapper /*style={{clear:"none",float:"left",marginLeft:"20px"}}*/>
                <UndoUserSelectionBtn onClick={this.undoUserSelection}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                      <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"/>
                    </svg>
                </UndoUserSelectionBtn>
                <BackButton onClick={this.backUserSelection}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                    </svg>
                </BackButton>
                <span style={{float:"left",clear:"right"}}>{this.state.userSelected.nachname+", "+this.state.userSelected.vorname}</span>
                <PartyLabel>{this.state.userSelected.fraktion}</PartyLabel>
                <SpeakerTimerWrapper>
                {!this.state.isRunning?
                  <IconWrapper className="play-but" onClick={this.speakerRecButton}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                      <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                    </svg>
                  </IconWrapper>:
                  <IconWrapper onClick={this.speakerPauseButton}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
                      <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                    </svg>
                  </IconWrapper>}
                  <IconWrapper onClick={this.speakerStopButton}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-stop-fill" viewBox="0 0 16 16">
                      <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
                    </svg>
                  </IconWrapper>
                  <div className="speaker-timer-div">
                    <Timer className="speaker-timer" id="sp-timer" time={this.state.time} />
                    {this.state.ninetySecTime > 0?
                      <Timer className="ninty-sec-timer-remain" time={this.state.ninetySecTime}/>
                    : <Timer className="ninty-sec-timer-remain ninety-sec-remain-negative" time={this.state.ninetySecTime}/>
                    }
                    
                  </div>
                </SpeakerTimerWrapper>
                </SpeakerRecordingBoxWrapper>
                :null}
              {this.state.otherOptionsSelected?
                  <SpeakerRecordingBoxWrapper /*style={{clear:"none",float:"left",marginLeft:"320px"}}*/>
                  <UndoUserSelectionBtn onClick={this.undoUserSelection}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                      <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"/>
                    </svg>
                  </UndoUserSelectionBtn>
                  <BackButton onClick={this.backUserSelection}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                    </svg>
                  </BackButton>
                  <span style={{float:"left",clear:"right"}}>{this.state.userSelected.nachname+", "+this.state.userSelected.vorname}</span>
                  <PartyLabel>{this.state.userSelected.fraktion}</PartyLabel>
                  {console.log("State Snap: ",this.state)}
                  {this.state.onGoSelected || this.state.personalRemarkSelected || this.state.miscSelected || this.state.mitteilungen || this.state.sitz || this.state.wahl ?
                    
                    <SpeakerTimerWrapper>
                    <OtherOptionsWrapper>
                        { this.state.onGoSelected ? 
                          <OtherOption className="active-option">
                          zur GO
                          </OtherOption>:null
                        }
                        { this.state.miscSelected ? 
                          <OtherOption className="active-option">
                          Sonstiges
                          </OtherOption>:null
                        }
                        { this.state.mitteilungen? 
                          <OtherOption className="active-option">
                          Mitteilungen
                          </OtherOption>:null
                        }
                        { this.state.sitz? 
                          <OtherOption className="active-option">
                          Sitzungsleitung
                          </OtherOption> :null
                        }
                        { this.state.personalRemarkSelected?
                          <OtherOption className="active-option">
                          pers. Bemerkung
                          </OtherOption>:null
                        }
                        { this.state.wahl?
                          <OtherOption className="active-option">
                          Wahl/Abstimmung
                          </OtherOption>:null
                        }

                      </OtherOptionsWrapper>
                    {!this.state.isRunning ?
                      <IconWrapper className="play-but" onClick={this.speakerRecButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                          <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                        </svg>
                      </IconWrapper>:
                      <IconWrapper onClick={this.speakerPauseButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
                          <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                        </svg>
                      </IconWrapper>}
                      <IconWrapper onClick={this.speakerStopButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-stop-fill" viewBox="0 0 16 16">
                          <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
                        </svg>
                      </IconWrapper>
                      
                      <div className="speaker-timer-div">
                        <Timer className="speaker-timer" id="sp-timer" time={this.state.time} />
                        {this.state.onGoSelected || this.state.personalRemarkSelected ? 
                          <Timer className="ninty-sec-timer-remain" time={this.state.fiveminTime}/>
                        :null}
                      </div>
                    </SpeakerTimerWrapper>
                    :
                    <OtherOptionsWrapper>
                      <OtherOption onClick={()=>{this.setState({onGoSelected: true,typeSpeechSelected:'zur Geschäftsordnung'})}}>
                          zur GO
                      </OtherOption>
                      <OtherOption onClick={()=>{this.setState({personalRemarkSelected: true,typeSpeechSelected:'pers. Bemerkung'})}}>
                        pers. Bemerkung
                      </OtherOption>
                      <OtherOption onClick={()=>{this.setState({miscSelected: true,typeSpeechSelected:'sonstiges'})}}>
                        Sonstiges
                      </OtherOption>
                      <OtherOption onClick={()=>{this.setState({mitteilungen: true,typeSpeechSelected:'Mitteilungen'})}}>
                        Mitteilungen
                      </OtherOption>
                      <OtherOption onClick={()=>{this.setState({sitz: true,typeSpeechSelected:'Sitzung'})}}>
                        Sitzungsleitung
                      </OtherOption>
                      <OtherOption onClick={()=>{this.setState({wahl: true,typeSpeechSelected:'Wahl'})}}>
                        Wahl/Abstimmung
                      </OtherOption>
                    </OtherOptionsWrapper>
                    }
                  
                  </SpeakerRecordingBoxWrapper>
                :null}

              

              {/** RIGHT SIDE */}
              <RednerlisteLabel>Rednerliste<hr/></RednerlisteLabel>
              <SpeakerSpokenWrapper>
                
                {this.state.speakersFullList.map((data,index)=>{
                  console.log("Speaker List: ",data)
                  return (
                    <SpeakersSpoken>
                      
                      
                      {data.deleted === true || data.deleted === "true" ? 
                      <StrikeRednerIcon onClick={()=>{this.undoStrikeoutRedner(data,index)}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                          <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                        </svg>
                      </StrikeRednerIcon>  
                      :
                      <StrikeRednerIcon onClick={()=>{this.strikeOutRedner(data,index)}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"/>
                        </svg>
                      </StrikeRednerIcon>}
                      {/* {
                        data.deleted === true || data.deleted === "true" ?
                        <div>
                          <div>
                            <s><span>{data.nachname+", "+data.vorname}</span></s>
                            <div style={{float: 'right'}}><s>{" ( "+data.fraktion+" ) "}</s></div>
                          </div>
                          <div style={{float: 'left'}}>
                            <s>{" ( "+data.speechType+" ) "}</s>
                          </div>
                        </div>
                        :data.fraktion === ' ' || data.fraktion === ''?
                          <div>
                            <div>
                              <span>{data.nachname+", "+data.vorname}</span>
                              <span style={{float: 'right'}}>{" ( "+data.fraktion+" ) "}</span>
                            </div>
                            <div>
                              {" ( "+data.speechType+" ) "}
                            </div>
                          </div>
                        :
                          <div>
                            <div>
                              <span>{data.nachname+", "+data.vorname}</span>
                              <span style={{float: 'right'}}>{" ( "+data.fraktion+" ) "}</span>
                            </div>
                            <div style={{float: 'left'}}>
                              {" ( "+data.speechType+" ) "}
                            </div>
                          </div>
                      }
                      
                      
                      {data.deleted === true || data.deleted === "true" ?
                      <span><SizedBoxStrikeRedner/>
                      <PartyLabel><s>{timeFormat(data.duration)}</s></PartyLabel></span>
                      :
                      <PartyLabel>{timeFormat(data.duration)}</PartyLabel>} */}

                      {
                        data.deleted === true || data.deleted === "true" ?
                          <div>
                            {
                              data.funktion?
                              <s>
                                {data.nachname + ", " + data.vorname + "/" + data.funktion + "/" + data.speechType +"/"+ timeFormat(data.duration)}
                              </s>
                              :
                              <s>
                                {data.nachname + ", " + data.vorname + "/" + data.fraktion + "/" + data.speechType +"/"+ timeFormat(data.duration)}
                              </s>
                            }
                          </div>
                          :
                          <div>
                            {
                              data.funktion?
                              <span>
                                {data.nachname + ", " + data.vorname + "/" + data.funktion + "/" + data.speechType +"/"+ timeFormat(data.duration)}
                              </span>
                              :
                              <span>
                                {data.nachname + ", " + data.vorname + "/" + data.fraktion + "/" + data.speechType +"/"+ timeFormat(data.duration)}
                              </span>
                            }
                          </div>

                      }
                      
                    </SpeakersSpoken>
                  );
                })
                }
              </SpeakerSpokenWrapper>

              {/* Middle section */}

              <RecentSpeakersWrapper>
                <RecentSpeakersTitle>
                  Aktuelle Redner
                </RecentSpeakersTitle>
                {
                  this.getRecentSpeakers().map((data)=>{
                    return <RecentSpeakersTile onClick={()=>{
                      var speakerSelected = this.getSpeakerDataFromName(data)
                      this.setState({
                        userClicked:true, 
                        userSelected:speakerSelected,
                      })
                    }}>
                        {data}
                      </RecentSpeakersTile>
                  }) 
                }
              </RecentSpeakersWrapper>


              {/* END of Middle section*/}

              {this.state.GastNameEnter ? 
                <Popup
                width={500}
                height={150}
                showTitle={true}
                title="Gast Name"
                closeOnOutsideClick={true}
                visible={this.state.GastNameEnter}
                onHiding={() => {this.handleGastPopupClose()}} >
                    {/* <Position at="bottom" my="top" of={this.state.positionOf}/> */}
                    <div onChange={this.onChangeOfRadio}>
                    <Form
                        id="changepos-form"
                        formData={this.state.userSelected}
                    >
                        <GroupItem colCount={2}>
                            <SimpleItem dataField="vorname" label={{text:"Gast Name (optional)"}} />
                            <SimpleItem>
                                <svg onClick={()=>{this.setState({userSelected: this.state.userSelected, GastNameEnter: false,})}} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="green" class="bi bi-check-square-fill" viewBox="0 0 16 16">
                                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z"/>
                                </svg>
                            </SimpleItem>
                        </GroupItem>

                    </Form>

                    </div>
                


                </Popup>
              :null}
          </Wrapper>
      );
  }

}

export default SpeakerListC

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////    STYLED FUNCTIONAL COMPONENTS         ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// UTILITY COMPONENTS

const Wrapper = styled.div.attrs({className:"bottom--wrapper"})`
    padding: 10px 0 10px 0;
    margin: 0;
    float: left;
    margin-top: 15px;
    text-align: center;
    width: 100%;

    
`

const DefaultSearchWrap = styled.div.attrs({className: "deafult-search"})`
    padding: 10px;
    float: left;
    margin-left: 4%;

`

const NinetySearchWrap = styled.div.attrs({className: "deafult-search"})`
    padding: 10px;
    float: left;

`

const MiscSearchWrap = styled.div.attrs({className: "deafult-search"})`
    padding: 10px;
    float: left;
    

`
const QuestionSearchWrap = styled.div.attrs({className: "deafult-search"})`
    padding: 10px;
    float: left;
    

`

/////////////////////////  LIST //////////////////////////////////////

const UserTile = styled.div.attrs({className: "users font-link"})`
  text-align: left;
    

`
const PartyLabel = styled.div.attrs({
  className: "party-label"
})`
  float:right;

`


const SpeakersSpoken = styled.div.attrs({
  className: "speaker-spoken font-link"
})`
  float:right;
  //width: 300px;
  width: 350px;
  padding: 15px;
  margin: 3px;
  background-color: #BDC6D1;
  color: #081D34;
  text-align:left;
`

const SpeakerSpokenWrapper = styled.div.attrs({})`
  float:right;
  //width: 330px;
  width: 380px;
  height: 630px;
  overflow-y: auto;
  clear: right;
  margin-top: -185px;
`

const StrikeRednerIcon = styled.div.attrs({})`
  float: right;
  padding-left: 5px;
  padding-bottom: 3px;
`

const SizedBoxStrikeRedner = styled.div.attrs({})`
  float:right;
  padding-left: 15px;
`

const PartyTimerWrapper = styled.div.attrs({})`
  float: left;
  width: 300px;
  clear: both;
  margin-left: 5%;


`

const PartyTimerTile = styled.div.attrs({})`
  float: left;
  width: 100%;
`

const PartyName = styled.div.attrs({className: "font-link"})`
  float: left;
  font-size: 18px;
`

const PartyTime = styled.div.attrs({className: "font-link"})`
  float: right;
  font-size: 18px;
`

const SpeakerRecordingBoxWrapper = styled.div.attrs({})`

  padding: 10px;
  float: left;
  margin-left: 5%;
  width: 310px;
  clear: left;
  background-color: #BDC6D1;
  margin-top: 10px;

`

const IconWrapper = styled.div.attrs({})`
  float:left;
  padding-top:15px;
`

const SpeakerTimerWrapper = styled.div.attrs({className:"speaker-timer"})`
  float: left;
  margin-top: 5px;
  width: 100%;
`

const OtherOptionsWrapper = styled.div.attrs({})`
  width: 100%;
  padding: 5px;
  float: left;
`

const OtherOption = styled.div.attrs({className:"font-link option-btn"})`
  border-radius: 5px;
  margin: 5px;
  background-color:#5C778E;
  color: white;
  text-align: left;
  padding-left: 5px;
`

const QuestionBtn = styled.div.attrs({className: "font-link question-btn"})`

  border-radius: 10px;
  background-color: #5C778E;
  padding : 5px;
  margin: 10px;
  font-size: 16px;
  float:left;
  color: white;
  width: 40%;
  height: 45px;
  padding-top: 12px;

`

const OptionBtn = styled.div.attrs({className: "option-btn"})`

  border-radius: 10px;
  background-color: #5C778E;
  padding : 5px;
  margin: 10px;
  font-size: 16px;
  float:left;
  color: white;
  width: 80%;
  margin-left: 25px;

`

const UndoUserSelectionBtn = styled.div.attrs({})`
  float: right;
  clear:both;
  margin-bottom: 10px;
`

const BackButton = styled.div.attrs({})`
  float: left;
`

const RednerlisteLabel = styled.div.attrs({className: "rednerliste-label font-link"})`
  float:right;
  //width: 330px;
  width: 350px;
  padding: 10px;
  text-align: center;
  font-size: 25px;
  padding-bootom: 0px;
  margin-top: -250px;
  margin-right: -10px;
`

const RecentSpeakersTitle = styled.div.attrs({className: "recent-speakers-title font-link"})`
  float: left;
  width: 100%;
  text-align: center;
  font-size: 25px;

`

const RecentSpeakersWrapper = styled.div.attrs({className: "recent-speakers-wrapper font-link"})`
  float: right;
  width: 250px;
  margin-right: 30px;
  margin-top: -95px;
`

const RecentSpeakersTile = styled.div.attrs({className: "recent-speakers-tile"})`
  float: left;
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  background-color: #BDC6D1;
  color: #081D34;
  text-align:left;
`

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//xxxxxxxxxxxxxxxxxxxxxxxxx   END OF STYLED FUNCTIONAL COMPONENTS      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

//---------------------------------------------------------------------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////            UTILITY FUNCTIONS            ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////



/// Timer formating and zero pad functions

function zeroPad(number, size = 2) {
  let s = String(number);
  while (s.length < size) { s = '0' + s;}
  return s;
}

// Convert time from miliseconds int to mm:ss string
function timeFormatmmss(miliseconds) {

  if(miliseconds < 0){

    miliseconds *= -1; 
    let remaining = miliseconds / 1000;

    const hh = parseInt( remaining / 3600, 10 );
    
    remaining %= 3600;
    console.log('mm',remaining)
    const mm = parseInt( remaining / 60, 10 );
    const ss = parseInt( remaining % 60, 10 );
    const S  = parseInt( (miliseconds % 1000) / 100, 10 );

    return `-${ zeroPad( mm ) }:${ zeroPad( ss ) }`;

  }

  let remaining = miliseconds / 1000;

  const hh = parseInt( remaining / 3600, 10 );
  
  remaining %= 3600;

  const mm = parseInt( remaining / 60, 10 );
  const ss = parseInt( remaining % 60, 10 );
  const S  = parseInt( (miliseconds % 1000) / 100, 10 );

  return `${ zeroPad( mm ) }:${ zeroPad( ss ) }`;
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




/// End Timer formating Functions
/////////////////////////////////////////////////


//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//xxxxxxxxxxxxxxxxxxxxxxxxx           END OF UTILITY FUNCTIONS         xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
