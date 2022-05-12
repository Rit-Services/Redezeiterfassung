import { Component } from "react";
import styled from "styled-components";
import Form, {
    SimpleItem,
    GroupItem,
    ButtonItem
  } from "devextreme-react/form";
import { PatternRule, RequiredRule } from 'devextreme-react/validator';
import Popup from 'devextreme-react/popup';
// import Button from 'devextreme-react/button';
import { ItemList } from "../../model";

class AdminItemCard extends Component{
    constructor(props){
        super(props)

        this.state = {
            popupVisible: false,
            item: this.props.item,
        }
        this.buttonOptions = {
            id:"button",
            text:"Absenden",
            type:"success",
            useSubmitBehavior:true,
        }
    }

    openTOPEdit = () =>{
        this.setState({
            popupVisible: true,
        })
    }

    closeTOPEdit = () =>{
        this.setState({
            popupVisible: false,
        })
    }

    submitData(){
        this.setState({item:this.state.item,popupVisible:false})
        let list = [...this.props.itemList]
        list[this.props.index] = this.state.item;

        let ListItemObj = new ItemList();
        ListItemObj.fromList(list)
        var sessionInfo = this.props.sessionInfo
        ListItemObj.update2DB(sessionInfo.sessionNumber,sessionInfo.sessionStart,sessionInfo.sessionEnd,sessionInfo.numberOfDays).then(()=>{
            window.location.reload(true);
        });
    }

    render(){
        return(
        <Wrapper>
            <LeadingWrapper>
                <TOPNr>
                    {this.props.item.itemNumber}{this.props.item.subjectOfItems[0].itemPostfix}
                </TOPNr>
            </LeadingWrapper>
            <Title>
                {this.props.item.subjectOfItems[0].title}
            </Title>
            <TrailingWrapper>
                <TOPEdit onClick={this.openTOPEdit}>
                    TOP <br/> bearbeiten
                </TOPEdit>
            </TrailingWrapper>

            {/* AFTER THIS ONLY POPUPS */}
            {/* ********************** */}
            {this.state.popupVisible ?
                    <Popup
                    width={900}
                    height={620}
                    showTitle={true}
                    title= 'TOP Bearbeiten'
                    closeOnOutsideClick={true}
                    visible={this.state.popupVisible}
                    onHiding={this.closeTOPEdit}>
                        <form  onSubmit={()=>{this.submitData()}}>
                        <Form
                            id="form"
                            formData={this.state.item}
                        >
                            <GroupItem colCount={2}>
                                <GroupItem>
                                    <SimpleItem  dataField="itemNumber" label={{text:"TOP Nr",}}>
                                        {/* <PatternRule message="nur Zahlen eingeben" pattern={/^[0-9]/}/> */}
                                        <RequiredRule message="TOP Nr erforderlich" />
                                    </SimpleItem>
                                    <SimpleItem dataField="subjectOfItems[0].itemPostfix" label={{text:"Postfix",}}>
                                    </SimpleItem>
                                </GroupItem>
                                <GroupItem>
                                    <SimpleItem dataField="itemBeginning" label={{text:"Anfang",}}>

                                    </SimpleItem>
                                </GroupItem>
                            </GroupItem>

                            <GroupItem >
                                <SimpleItem dataField="subjectOfItems[0].title"  label={{text:"Titel",}}>
                                    <RequiredRule message="Titel erforderlich" />
                                </SimpleItem>
                            </GroupItem>
                            <GroupItem colCount={2}>
                                <GroupItem>
                                    <SimpleItem dataField="subjectOfItems[0].consultationType"  label={{text:"Beratungsart",}}/>
                                    <SimpleItem dataField="subjectOfItems[0].subjectArt"  label={{text:"BGArt",}}/>

                                </GroupItem>
                                <GroupItem>
                                    <SimpleItem dataField="subjectOfItems[0].subjectNumber"  label={{text:"BGBuchstabe",}}/>
                                </GroupItem>

                            </GroupItem>

                            <GroupItem colCount={2}>
                                <GroupItem caption="Antragsteller" >
                                    <SimpleItem dataField="subjectOfItems[0].applicant"  label={{text:"Antragsteller",}}/>
                                    <SimpleItem dataField="subjectOfItems[0].applicantText"  label={{text:"AntragstellerText",}}/>
                                    <SimpleItem dataField="subjectOfItems[0].incomingPrint"  label={{text:"Eingangsdrucksache",}}/>
                                    <SimpleItem dataField="subjectOfItems[0].incomingPrintLink"  label={{text:"EingangsdrucksacheLink",}}/>
                                </GroupItem>
                                <GroupItem caption="Ausschussempf">
                                    <SimpleItem dataField="subjectOfItems[0].rejects"  label={{text:"Ausschussempf",}}/>
                                    <SimpleItem dataField="subjectOfItems[0].rejectRecommendation" label={{text:"Ausschussempfehlung",}}/>
                                    <SimpleItem dataField="subjectOfItems[0].rejectsdrs"  label={{text:"AusschussempfDrs",}}/>
                                    <SimpleItem dataField="subjectOfItems[0].rejectsdrsLink"  label={{text:"AusschussempfDrsLink",}}/>

                                </GroupItem>
                            </GroupItem>
                            {/* <GroupItem>
                                <div onClick={() => {this.submitData()}}>
                                    <Button
                                    id="button"
                                    text="Absenden"
                                    type="success"
                                    useSubmitBehavior={true}
                                    />
                                </div>
                            </GroupItem> */}
                            <ButtonItem
                                horizontalAlignment="right"
                                buttonOptions={this.buttonOptions}
                            />


                        </Form>
                        </form>
                    </Popup>
                :null}
        </Wrapper>
        )
    }

}

export default AdminItemCard


const Wrapper = styled.div.attrs({className:"top-wrapper"})`
    padding: 10px 0 10px 0;
    margin: 0px;
    width:100%;
    height: 100%;
    float: left;
    margin-top: 15px;
    background-color:white;
    
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
    background-color: #08435C;
    color: white;
    float: right;

    text-align: center;
    font-size: 24px;
    line-height: 31px;
    padding: 15px;
    margin: 5px;



`

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

const TOPEdit = styled.div.attrs({className: "top-edit font-link hoverpointer", name:"top-edit-test"})`

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