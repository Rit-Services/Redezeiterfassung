/// ItemList Object which contains a list of All the items.


import { Item } from '.'
import cloneDeep from 'lodash/cloneDeep';
import api from '../api'

class ItemList{

    constructor(session){
        this.itemlist = []
        // console.log("[ItemList] (constructor) session recieved: ", session)

        if(!session){
            return
        }        

        /// These Loops extract items from array of meetings and push into main this.itemist
        session.meetings.map((meeting)=>{
            // console.log("[ItemList] (constructor) meeting recieved: ", meeting)
            meeting.items.map((item)=>{
                // console.log("[ItemList] (constructor) item recieved: ", item)
                item.subjectOfItems.map((subjectOfItem)=>{
                    // console.log("[ItemList] (constructor) Subject Item title: ", subjectOfItem)
                    var tempItem = cloneDeep(item);
                    tempItem.subjectOfItems = [subjectOfItem]
                    tempItem.meetingNumber = meeting.meetingNumber
                    tempItem.meetingDate = meeting.meetingDate
                    console.log("[ItemList] (constructor) Subjectitem being pushed: ", tempItem)
                    var tempItem2 = new Item()
                    tempItem2.fromMap(tempItem)
                    this.itemlist.push(tempItem2)
                    // console.log("[ItemList] (constructor) item being pushed: ", tempItem2)
                    
                })
            })
        })
    }

    toMap(){
        var itemListMap=[];
        this.itemlist.map((item) =>{
            itemListMap.push(item.toMap());
        })
        return itemListMap;
    }

    convertItemListToMap(){
        var itemListMap=[];
        this.itemlist.map((item) =>{
            itemListMap.push(item.toMap());
        })
        this.itemlist = itemListMap;
    }

    fromList(itemlist){
        console.log("[NOW] Got list: ",itemlist)
        this.itemlist = itemlist;
    }

    getItemsList(){
        return this.itemlist;
    }

    insertAt(newItem,index){
        this.itemlist.splice(index,0,newItem);
    }

    deleteAtIndex(index){
        this.itemlist.splice(index, 1)
    }

    replaceAt(sourceIndex,destinationIndex){
        console.log("[ItemList] (replaceAt) source index: ",sourceIndex," to :",destinationIndex)
        var tempItem = this.itemlist[sourceIndex]
        console.log("[ItemList] (replaceAt) temp Item: ",tempItem)
        this.deleteAtIndex(sourceIndex);
        console.log("[ItemList] (replaceAt) After delete: ",this.itemlist)
        this.insertAt(tempItem,destinationIndex);
        console.log("[ItemList] (replaceAt) After evrything: ",this.itemlist)

    }


    update2DB = async(sessionNumber=' ',sessionStart=' ',sessionEnd=' ',numberOfDays='0') =>{
        console.log("[ItemList] (update2DB) recived variables: ",sessionNumber,sessionStart,sessionEnd,numberOfDays)
        var payload = {
            itemlist : this.itemlist,
            sessionNumber : sessionNumber,
            sessionStart : sessionStart,
            sessionEnd : sessionEnd,
            numberOfDays : numberOfDays,

        }
        
        await api.updateActiveSession(payload).then((result)=>{
            console.log("[ItemList] (update2DB) errored out with error:",result)
            
        })
        .catch((err)=>{
            console.log("[ItemList] (update2DB) errored out with error:",err)
            api.createActiveSession(payload)
        })
    }


    sessionInfo(sessInfo){
        this.sessionNumber = sessInfo.sessionNumber;
        this.sessionStart = sessInfo.sessionStart;
        this.sessionEnd = sessInfo.sessionEnd;
        this.numberOfDays = sessInfo.numberOfDays;
    }

    deleteAt(index){
        this.itemlist.splice(index,1);
        console.log("[ItemList] (deleteAt) checking session info: ",this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays)
        this.update2DB(this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays);
    }

}

export default ItemList