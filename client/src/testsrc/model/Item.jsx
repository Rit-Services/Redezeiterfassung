/// Item Object which contain 


import GroupList from "./GroupList";
import apis from "../api";


class Item{
    constructor(title= " ",itemDuration='', itemBeginning= ' ', itemNumber='', meetingNumber='-1' , meetingDate='-1' ){
        var grouplist = new GroupList();
        grouplist = grouplist.getList()
        this.item = {
            itemNumber:itemNumber,
            itemBeginning:itemBeginning,
            itemDuration: itemDuration,
            meetingNumber: meetingNumber,
            meetingDate: meetingDate,
            itemLR: '',
            itemBuffer: '10',
            itemQuantitybg: '',
            itemStartTimeInStreamSecs:'',
            itemStopTimeInStreamSecs:'',
            endTime: '',
            totalItemTime:'',
            itemTimings: [
                {groups : grouplist}
            ],
            subjectOfItems: [
                {
                    subjectNumber: " ",
                    subjectVisible: " ",
                    itemPostfix:" ",
                    title: title,
                    consultationType: " ",
                    consultationTypeKZ: " ",
                    subjectArt: " ",
                    incomingPrint: " ",
                    incomingPrintLink: " ",
                    applicant: " ",
                    applicantText: " ",
                    rejects: " ",
                    rejectsdrs: " ",
                    rejectsdrsLink: " ",
                    rejectRecommendation: " ",
                    additionalApplicationdrs: " ",
                    additionalApplication: " ",
                    additionalApplicationGroup: " ",
                    additionalApplicationGroupText: " ",
                }
            ],
            speakerTimings: []

        }
    }

    toMap(){
        return this.item;
    }

    fromMap(map){
        // console.log("[Item] (fromMap) Map of Item recieved: ",map)
        this.item = map;
    }

    setItemStartStreamTime(timeInSec){
        this.itemStartTimeInStreamSecs = timeInSec;
    }
    setItemStopStreamTime(timeInSec){
        this.itemStopTimeInStreamSecs = timeInSec;
    }

    giveTimeOnPercentageSeats(LR = 0,SPD=0.394,CDU =0.365,green=0.0876,fdp=0.08){
        var updatedGroupList = new GroupList()
        
        // apis.getUtil().then((result)=>{
        //     var updatedGroupList = new GroupList()
        //     console.log("Creating Item",result.data.data[0].CDU)
        //     var parties = {
        //         CDU:result.data.data[0].CDU,
        //         FDP:result.data.data[0].FDP,
        //         LR:result.data.data[0].LR,
        //         SPD:result.data.data[0].SPD,
        //         greens:result.data.data[0].greens
        //     }
        //     var totalSeats = 137
        //     console.log(`Creating Item with party times: ${parties.LR} ${SPDp} ${CDUp} ${greensp} ${FDPp}`)
        //     var LRp = parseInt(parties.LR) / totalSeats
        //     var SPDp = parseInt(parties.SPD) / totalSeats
        //     var CDUp = parseInt(parties.CDU) / totalSeats
        //     var greensp = parseInt(parties.greens) / totalSeats
        //     var FDPp = parseInt(parties.FDP) / totalSeats
        //     console.log(`Creating Item with party times: itemDuration: ${this.item.itemDuration} ${LRp} ${SPDp} ${CDUp} ${greensp} ${FDPp}`)
        //     updatedGroupList.giveTimeOnPercentageSeats(this.item.itemDuration,LRp,SPDp,CDUp,greensp,FDPp)
        //     updatedGroupList = updatedGroupList.getList();
        //     this.item.itemTimings[0].groups= updatedGroupList;
        //     console.log("Creating Item",this.item.itemTimings[0])
        // })
        
        updatedGroupList.giveTimeOnPercentageSeats(this.item.itemDuration,LR,SPD,CDU,green,fdp)
        updatedGroupList = updatedGroupList.getList();
        this.item.itemTimings[0].groups= updatedGroupList;
        
    }

    setDuration(duration){
        this.item.itemDuration = String(duration);
    }

    setItemNumber(itemNumber,itemPostfix){
        this.item.itemNumber = itemNumber;
        this.item.subjectOfItems[0].itemPostfix = itemPostfix
    }

    setConsultationType(consultationType){
        this.item.subjectOfItems[0].consultationType = consultationType
    }
    
    

}

export default Item