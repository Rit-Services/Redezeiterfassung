// Functional React Imports
import React, {Component} from "react";
import styled from "styled-components";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

/// Self Imports
import { SessionBanner, ItemCard, NavBar } from "../components";
import { ItemList, Item } from '../model'
import api from '../api'
import "../styles/RedaktionPage.css"
import "../styles/hover.css"

import cloneDeep from 'lodash/cloneDeep';
import Form, {
    SimpleItem,
    GroupItem,
  } from "devextreme-react/form";
  import List from 'devextreme-react/list';
import "devextreme-react/text-area";
import { Popup, Position } from 'devextreme-react/popup';
// import Button from 'devextreme-react/button';




class RedaktionPage extends Component{
    constructor(props){
        super(props);
        console.log("[RedaktionPage] (constructor) Constructor Start")
        


        this.state = {
            itemsReady: false,
            popupVisible: false,
            activeState: 0,
            changePosVariable: '',
            stopButtonFunctions: [],
            independentStopwatchTime: 0,
        }

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
                this.setState({
                    activeIndex: util.data.data[0].activeIndex,
                })
            }).catch(()=>{
                var payl = {
                    activeIndex: "0",
                }
                api.updateActiveIndex(payl).then((respon)=>{
                    // window.location.reload(true);
                    
                })
            })

            this.setState({
                items: itemList,
                itemsReady: true,
                streamActive: false,
                // sessionInfo: this.sessionInfo
            })
        })


    }

    changeStreamStatus = (value) =>{
        this.setState({
            streamActive: value,
        })
    }

    getStopButtonFunctions = (index,functionRef) =>{
        this.state.stopButtonFunctions[index] = functionRef;
        this.setState({
            stopButtonFunctions: this.state.stopButtonFunctions,
        })
        
    }

    callStopButtonFunctions = async (index) =>{
        var stopButtonFunction = this.state.stopButtonFunctions[index];
        await stopButtonFunction();
    }

    handleIndexChange = (index) =>{
        this.setState({
            activeIndex: index,
        })
        var payload = {
            activeIndex: index,
        }
        api.updateActiveIndex(payload).then((res)=>{
            console.log("[RedaktionPage] (handleIndexChange) Updated utils active Index in DB with: ",index)
        })
        
    }


    addTOPpopupClose = () =>{
        this.setState({
            newTOPVisible: false,
            unterSelected: false,
            firstSelected: false,
            lastSelected: false,
            blankSelected: false,
        })
    }

    handleChangePos = (index,type,newIndex=0) =>{
        var itemlist = new ItemList();
        itemlist.fromList(this.state.items);

        if(type === "up"){
            console.log("[RedaktionPage] (handleChangePos) Trying to take item UP")
            if(index == 0){
                console.log("[RedaktionPage] (handleChangePos) Trying to move index 0 data. Doing Nothing")
            }
            else{
                itemlist.replaceAt(index, index-1)
            }
        }
        if(type === "down"){
            console.log("[RedaktionPage] (handleChangePos) Trying to take item DOWN")
            itemlist.replaceAt(index,index+1)
        }
        if(type === "index"){
            console.log("[RedaktionPage] (handleChangePos) Trying to take item at index",newIndex)
            itemlist.replaceAt(index,newIndex)

        }
        console.log("[RedaktionPage] (handleChangePos) variables: ",this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays)
        itemlist.update2DB(this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays).then(()=>{
            console.log("[RedaktionPage] (handleChangePos) Updated DB after changing th pos");
            window.location.reload(true);
        })
    }

    onChangeOfRadio = (e) =>{
        var destinationIndex = parseInt(e) + parseInt(this.state.activeIndex) + 1;
        
        var sourceIndex = parseInt(this.state.changePosIndex) ;
        console.log(`[RedaktionPage] (onChangeOfRadio) changing from index ${sourceIndex} to ${destinationIndex}`)
        this.handleClosePosPopup();
        // this.changePos(sourceIndex,destinationIndex)
        this.handleChangePos(sourceIndex,"index",destinationIndex)
    }


    handleOpenPosPopup = (index) =>{
        console.log("changePosIndex:",index)
        this.setState({
            posPopupVisible : true,
            positionOf: `#index${index}`,
            changePosIndex: index,
        })
    }

    handleClosePosPopup = () =>{
        this.setState({
            posPopupVisible: false,
            positionOf: '',
            changePosIndex: '',
            changePosVariable: '',
        })
    }

    handleChangePosSubmit = () =>{
        this.handleClosePosPopup();
        this.handleChangePos(this.state.changePosIndex,"index",this.state.changePosVariable-1)

    }

    addTOPClicked = (e,index) =>{
        let emptyItem = new Item();
        emptyItem = emptyItem.toMap();
        this.setState({
            // popupVisible: true,
            newTOPVisible: true,
            emptyItem: emptyItem,
            newItemIndex: index,
        })
    }

    addNewTOP = () =>{


        this.setState({
            emptyItem: this.state.emptyItem,
            popupVisible: false,
        })
        var item_duration = parseInt(this.state.emptyItem.itemDuration) * 60
        var ItemObj = new Item();
        if(this.state.blankSelected){
            var BlankItemObj = new Item(" ","0","00:00");
            BlankItemObj = BlankItemObj.toMap();
            // console.log("New created:",ItemObj)
            // ItemObj.fromMap(this.state.emptyItem)
            this.addTOPpopupClose();
            var ItemListToUpdate = new ItemList()
            ItemListToUpdate.fromList(this.state.items)
            ItemListToUpdate.insertAt(BlankItemObj,this.state.newItemIndex)
            // console.log("ItemList update: ",ItemListToUpdate)
            ItemListToUpdate.update2DB(this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays).then(() =>{
                window.location.reload(true);
            })
        }
        if(this.state.unterSelected){
            ItemObj.fromMap(this.state.emptyItem)
            this.addTOPpopupClose();
            ItemObj.setDuration(item_duration)
            this.addTOPpopupClose();
            ItemObj.giveTimeOnPercentageSeats();
            ItemObj = ItemObj.toMap();
            var ItemListToUpdate = new ItemList()
            ItemListToUpdate.fromList(this.state.items)
            ItemListToUpdate.insertAt(ItemObj,this.state.newItemIndex)
            // console.log("UPDATING ITEMLIST: ",ItemListToUpdate)
            // console.log("UPDATING ITEMLIST with session Number: ",this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays)
            ItemListToUpdate.update2DB(this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays).then(() =>{
                window.location.reload(true);
            })
        }

        if(this.state.firstSelected){
            ItemObj.fromMap(this.state.emptyItem)
            this.addTOPpopupClose();
            ItemObj.setDuration(item_duration)
            this.addTOPpopupClose();
            ItemObj.giveTimeOnPercentageSeats();
            ItemObj = ItemObj.toMap();
            var ItemListToUpdate = new ItemList()
            ItemListToUpdate.fromList(this.state.items)
            ItemListToUpdate.insertAt(ItemObj,"0")
            // console.log("UPDATING ITEMLIST: ",ItemListToUpdate)
            // console.log("UPDATING ITEMLIST with session Number: ",this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays)
            ItemListToUpdate.update2DB(this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays).then(() =>{
                window.location.reload(true);
            })
        }

        if(this.state.lastSelected){
            ItemObj.fromMap(this.state.emptyItem)
            this.addTOPpopupClose();
            ItemObj.setDuration(item_duration)
            this.addTOPpopupClose();
            ItemObj.giveTimeOnPercentageSeats();
            ItemObj = ItemObj.toMap();
            var ItemListToUpdate = new ItemList()
            ItemListToUpdate.fromList(this.state.items)
            console.log("items:",this.state.items)
            ItemListToUpdate.insertAt(ItemObj,this.state.items.length)
            // console.log("UPDATING ITEMLIST: ",ItemListToUpdate)
            // console.log("UPDATING ITEMLIST with session Number: ",this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays)
            ItemListToUpdate.update2DB(this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays).then(() =>{
                window.location.reload(true);
            })
        }
        
        


    }



    onDragEnd = (result) =>{
        console.log("Drag:",result)
        if (!result.destination) {
            return;
        }

        const Itemresult = Array.from(this.state.items);
        const [removed] = Itemresult.splice(result.source.index, 1);
        Itemresult.splice(result.destination.index, 0, removed);

        this.setState({
            items: Itemresult,
        })

        /// saving the new list to Database
        let ItemListObj = new ItemList();
        ItemListObj.fromList(Itemresult)
        ItemListObj.update2DB(this.sessionNumber,this.sessionStart,this.sessionEnd,this.numberOfDays);
        

    }

    changePosList = (data,index) =>{
        return <InputRadioButton onClick={()=>{this.onChangeOfRadio(index)}}>
        {/* <input type="radio" value={index} name="pos" /> */}
        <span>{/*data.itemNumber+data.subjectOfItems[0].itemPostfix}{/*" "+data.subjectOfItems[0].title.split(' ')[0]+" "+data.subjectOfItems[0].title.split(' ')[1]*/}{" "+data.subjectOfItems[0].title}</span>
        </InputRadioButton>;
    }

    getItemStyle = (draggableStyle) => ({
        float: "left",
        width: "100%",
      
        // styles we need to apply on draggables
        ...draggableStyle
      });
    
    getListOfActiveItems = () =>{
        var finalList = []
        var item = {}
        for(let i=0;i<this.state.items.length;i++){
            if(i>this.state.activeIndex){
                item = cloneDeep(this.state.items[i])
                item.subjectOfItems[0].title = item.itemNumber+item.subjectOfItems[0].itemPostfix+" "+item.subjectOfItems[0].title
                finalList.push(item)
            }
        }
        return finalList
    }

    render(){
        return (
            <Wrapper className="redaktionpage-wrapper">
                <NavBar 
                    // stopwatchStartBtn={this.stopwatchStartBtn} 
                    // stopwatchStopBtn={this.stopwatchStopBtn} 
                    // stopwatchPauseBtn={this.stopwatchPauseBtn} 
                    // independentStopwatchTime={this.state.independentStopwatchTime} 
                    itemList={this.state.items} 
                    sessionNumber={this.sessionNumber}
                    sessionEnd={this.sessionEnd} 
                    sessionStart={this.sessionStart} 
                    numberOfDays={this.numberOfDays} 
                    // getStopwatchFuntions={this.getStopwatchFuntions} 
                    // totalSessionTime={this.state.totalSessionTime}
                    changeStreamStatus = {this.changeStreamStatus}
                     />

                <SessionBanner 
                    sessionNumber={this.sessionNumber} 
                    sessionEnd={this.sessionEnd} 
                    sessionStart={this.sessionStart} 
                    numberOfDays={this.numberOfDays} 
                    // totalSessionTime={this.state.totalSessionTime} 
                    activeIndex={this.state.activeIndex} 
                    itemList={this.state.items} 
                    // getStopwatchFuntions={this.getStopwatchFuntions}
                    changeStreamStatus = {this.changeStreamStatus}
                    />
                <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="droppable">
                {(provided)=>(
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{float:"left",width:"100%"}}
                >
                {this.state.itemsReady ?
                    this.state.items.map((item,index)=>{
                        var active = false;
                        console.log("[RedaktionPage] (Render) Active Index: ",this.state.activeIndex)
                        if(index == this.state.activeIndex){
                            console.log("index :",index," Active INdex: ",this.state.activeIndex)
                            active = true;
                        }
                        if(index > this.state.activeIndex){
                            return ( 
                                
                                <Draggable key={item.itemNumber+item.subjectOfItems[0].title} draggableId={item.itemNumber+item.subjectOfItems[0].title} index={index}  >
                                {(provided)=>(
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={this.getItemStyle(
                                        provided.draggableProps.style
                                    )}
                                >
                                <TOPMainWrapper>
                                <PositionWrap>
                                    
                                    <Spacer />
                                    {index > this.state.activeIndex?
                                        <PosText id={"index"+index} onClick={()=>{this.handleOpenPosPopup(index)}}>BG <br/> {index+1}</PosText>
                                    :
                                        <PosText id={"index"+index} >BG <br/> {index+1}</PosText>
                                    }
                                    
                                </PositionWrap>

                                <ItemCard 
                                    item={item} 
                                    streamActive={this.state.streamActive} 
                                    active={active} 
                                    activeIndex={this.state.activeIndex} 
                                    index={index} 
                                    itemList={this.state.items}
                                    handleIndexChange = {this.handleIndexChange} 
                                    // handleTotalSessionTime={this.handleTotalSessionTime} 
                                    sessionInfo={this.sessionInfo}  
                                    callStopButtonFunctions={this.callStopButtonFunctions} 
                                    getStopButtonFunctions={this.getStopButtonFunctions}
                                    changeStreamStatus = {this.changeStreamStatus}
                                    />
                                
                                </TOPMainWrapper>

                                

                                </div>)}</Draggable>
                                )//return
                            } ///if(index > this.state.activeIndex)
                            else{
                                return(
                                <TOPMainWrapper>
                                <PositionWrap>
                                    <Spacer />
                                    {index > this.state.activeIndex?
                                        <PosText id={"index"+index} onClick={()=>{this.handleOpenPosPopup(index)}}>BG <br/> {index+1}</PosText>
                                    :
                                        <PosText id={"index"+index} >BG <br/> {index+1}</PosText>
                                    }
                                    
                                </PositionWrap>

                                <ItemCard 
                                    item={item} 
                                    streamActive={this.state.streamActive} 
                                    active={active} 
                                    activeIndex={this.state.activeIndex} 
                                    index={index} 
                                    itemList={this.state.items}
                                    handleIndexChange = {this.handleIndexChange} 
                                    // handleTotalSessionTime={this.handleTotalSessionTime} 
                                    sessionInfo={this.sessionInfo}  
                                    callStopButtonFunctions={this.callStopButtonFunctions} 
                                    getStopButtonFunctions={this.getStopButtonFunctions} 
                                    changeStreamStatus = {this.changeStreamStatus}
                                    />
                                
                                </TOPMainWrapper>)//return
                            }
                        }//map
                        )//map
                        :null}
                        {provided.placeholder}
                </div>)}</Droppable>
                    </DragDropContext>

                        
                        {this.state.activeIndex?
                        <Popup
                            width={550}
                            height={330}
                            showTitle={true}
                            title="Position verschieben nach:"
                            closeOnOutsideClick={true}
                            visible={this.state.posPopupVisible}
                            onHiding={() => {this.handleClosePosPopup()}} >
                                <Position at="bottom" my="top" offset={{x:300,y:-50}} of={this.state.positionOf}/>
                                
                                {
                                
                                this.state.itemsReady ?
                                    
                                    
                                    <List 
                                        // dataSource={this.state.items}
                                        dataSource={this.getListOfActiveItems()}
                                        height={250}
                                        width = {525}
                                        itemRender={this.changePosList}
                                        searchExpr="subjectOfItems[0].title"
                                        searchEnabled={true}
                                        searchMode={'contains'}
                                        noDataText= "Keine Daten zum Anzeigen"
                                        showScrollbar= "always"
                                        pageLoadMode= 'scrollBottom' 
                                        />
                                    
                                : null}
                                {/* </div> */}

                        </Popup>:null}

                        
                <ScrollToActiveButton onClick={()=>{document.getElementById('scroll-active').scrollIntoView({ behavior: 'smooth', block: 'center' });}}>
                    zu aktiv blättern
                </ScrollToActiveButton>
            </Wrapper>
        );
    }
}

export default RedaktionPage

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////    STYLED FUNCTIONAL COMPONENTS         ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// UTILITY COMPONENTS

const ScrollToActiveButton = styled.div.attrs({className: "scroll-to-active-btn"})`
    // float: right;
    padding: 10px;
    border-radius: 15px;
    text-align: center;
    width: 8%;

    z-index: 3;
    position:fixed;
    bottom: 50px;
    right: 50px;
    background-color: #08435C;
    color: white;
    cursor: pointer;
    opacity: 0.85;
`

const Wrapper = styled.div.attrs({className:"main-wrapper"})`
    padding: 0px;
    margin: 0px;
    width:100%;
    height: 100%;
    float: left;
    background-color: #BDC6D1;
`

const TOPMainWrapper = styled.div.attrs({ className:"main-top-wrapper"})`
    float:left;
    width: 100%;
    background-color: #EDEFF1;
    margin: 0;
    margin-top: 15px;

`

const PositionWrap = styled.div.attrs({className: "position-wrapper"})`
    
    height: 100%;
    float: left;
    /*width: 10%;*/
    margin-top: 15px;


`



const InputRadioButton = styled.div.attrs({ className: "radio-btn"})`
    float: left;
    width: 100%;
`

const PosText = styled.div.attrs({className: "pos-text font-link hoverpointer"})`
    background: white;
    border-radius: 10px;
    float: left;
    margin-left: 5px;
    text-align: center;
    clear: left;
    width: 50px;
    padding-top: 14px;
    padding-bottom: 14px;
    color: #081D34;

    box-shadow: 0px 0px 10px 1px #888888;
    z-index: -999;
`


const Spacer = styled.div.attrs({className: "spacer"})`

    float: left;
    height: 55px;

`

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//xxxxxxxxxxxxxxxxxxxxxxxxx   END OF STYLED FUNCTIONAL COMPONENTS      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////             UTILIY  FUNCTIONS           ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////




