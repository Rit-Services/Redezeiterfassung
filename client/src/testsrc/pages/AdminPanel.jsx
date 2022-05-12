import { Component } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import apis from "../api";
import AdminItemCard from "../components/AdminPanel/AdminItemCard";
import { Popup} from 'devextreme-react/popup';

import Form, {
    SimpleItem,
    GroupItem,
    ButtonItem,
  } from "devextreme-react/form";
import { PatternRule, RequiredRule } from 'devextreme-react/validator';
import SettingsPage from "../components/AdminPanel/SettingsPage";
import UserManagment from "../components/AdminPanel/UserManagment";


class AdminPanel extends Component{
    constructor(props){
        super(props)
        this.state = {
            itemListReady: false,
            speakerListReady: false,
            partiesListReady: false,
            itemListDisplay: true,
            speakerListDisplay: false,
            partiesListDisplay: false,
            settingsDisplay : false,
            userManagementDisplay: false,
            parties : {},
            importSpeakersBtn: "Absenden",
            speakersNumber: 0,
        }

        this.buttonOptions = {
            id:"button",
            text:"Absenden",
            type:"success",
            useSubmitBehavior:true,
        }
        apis.getActiveItemList().then(result=>{
            var itemList = result.data.data[0].itemlist
            var sessionInfo = {
                sessionNumber: result.data.data[0].sessionNumber,
                sessionStart: result.data.data[0].sessionStart,
                sessionEnd: result.data.data[0].sessionEnd,
                numberOfDays: result.data.data[0].numberOfDays,
            }
            this.setState({
                itemList: itemList,
                sessionInfo: sessionInfo,
                itemListReady: true,
            })
        })

        
    }

    handleItemListClick = () =>{
        this.setState({
            itemListDisplay:true,
            speakerListDisplay: false,
            partiesListDisplay: false,
            settingsDisplay: false,
            userManagementDisplay: false,
        })
    }

    handleSpeakerListClick = () =>{
        this.setState({
            itemListDisplay:false,
            speakerListDisplay: true,
            partiesListDisplay: false,
            settingsDisplay: false,
            userManagementDisplay: false,
        })
    }

    clickSpeakersImport = () =>{
       
        this.setState({
            importSpeakersClicked: true,
        })
        this.getSpeakersInfo();
    }

    closeSpeakersImport = () =>{
        this.setState({
            importSpeakersClicked: false,
        })
    }

    getSpeakersInfo = () =>{
        apis.getAllSpeakers().then(data => {
            this.setState({
                speakersNumber: data.data.data.Abgeordnetenliste[0].redner.length
            })
        })
    }

    handleSpeakersImport =() =>{
        apis.getAllSpeakers().then(data =>{
            var payload = {
                Abgeordnetenliste: data.data.data.Abgeordnetenliste,
            }
            apis.updateSpeakerList(payload).then(response =>{
                window.location.reload(true);
            })
        })
    }

    handlePartiesListClick = async() =>{
        await apis.getUtil().then(result=>{
            console.log(result.data.data[0])
            var parties = {
                CDU:result.data.data[0].CDU,
                FDP:result.data.data[0].FDP,
                LR:result.data.data[0].LR,
                SPD:result.data.data[0].SPD,
                greens:result.data.data[0].greens
            }
            this.setState({
                parties: parties,
            },()=>{
                this.setState({
                    itemListDisplay:false,
                    speakerListDisplay: false,
                    partiesListDisplay: true,
                    settingsDisplay: false,
                    userManagementDisplay: false,
                })
            })
        })
        
    }


    handleSettingsClick = async() =>{
        this.setState({
            itemListDisplay:false,
            speakerListDisplay: false,
            partiesListDisplay: false,
            settingsDisplay: true,
            userManagementDisplay: false,
        })
    }

    handleUserManagmentClick = () =>{
        this.setState({
            itemListDisplay:false,
            speakerListDisplay: false,
            partiesListDisplay: false,
            settingsDisplay: false,
            userManagementDisplay: true,
        })
    }

    submitParties = async() =>{
        await apis.updateParties(this.state.parties).then(result=>{
            window.location.reload()
        })
    }

    render(){
        return (
        <Wrapper>
            <NavBar>
                <MainHeading>ADMIN PANEL</MainHeading>
                <BackButton>
                    <Link to={"/"}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="white" className="bi bi-arrow-left-circle" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"/>
                    </svg>
                    </Link>
                </BackButton>

                <TabBtnWrapper>
                    <TabBtn onClick={this.handleItemListClick}>
                        <TabBtnText>TOP-liste</TabBtnText>
                        {this.state.itemListDisplay ?
                        <Triangle>
                            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="20" fill="white" class="bi bi-triangle-fill" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M7.022 1.566a1.13 1.13 0 0 1 1.96 0l6.857 11.667c.457.778-.092 1.767-.98 1.767H1.144c-.889 0-1.437-.99-.98-1.767L7.022 1.566z"/>
                            </svg>
                        </Triangle>:null}
                    </TabBtn>
                    
                    
                    <TabBtn onClick={this.handlePartiesListClick}>
                        <TabBtnText>Fraktion</TabBtnText>
                        {this.state.partiesListDisplay ?
                        <Triangle>
                            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="20" fill="white" class="bi bi-triangle-fill" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M7.022 1.566a1.13 1.13 0 0 1 1.96 0l6.857 11.667c.457.778-.092 1.767-.98 1.767H1.144c-.889 0-1.437-.99-.98-1.767L7.022 1.566z"/>
                            </svg>
                        </Triangle>:null}
                    </TabBtn>

                    <TabBtn  onClick={this.clickSpeakersImport} className="hovertext" data-hover="import rednerliste">
                        <TabBtnText style={{padding:"0px"}}><svg xmlns="http://www.w3.org/2000/svg" width="30px" height="29px" fill="#08435C" class="bi bi-person-plus-fill" viewBox="0 0 16 16">
                            <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                            <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
                        </svg></TabBtnText>
                        {/* <TabBtnText>Import Rednerliste</TabBtnText> */}
                        {/* {this.state.speakerListDisplay ?
                        <Triangle>
                            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="20" fill="white" class="bi bi-triangle-fill" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M7.022 1.566a1.13 1.13 0 0 1 1.96 0l6.857 11.667c.457.778-.092 1.767-.98 1.767H1.144c-.889 0-1.437-.99-.98-1.767L7.022 1.566z"/>
                            </svg>
                        </Triangle>:null} */}
                    </TabBtn>

                    <TabBtn>
                        <TabBtnText onClick={this.handleSettingsClick}>
                            Settings
                        </TabBtnText>
                        {this.state.settingsDisplay ?
                        <Triangle>
                            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="20" fill="white" class="bi bi-triangle-fill" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M7.022 1.566a1.13 1.13 0 0 1 1.96 0l6.857 11.667c.457.778-.092 1.767-.98 1.767H1.144c-.889 0-1.437-.99-.98-1.767L7.022 1.566z"/>
                            </svg>
                        </Triangle>:null}
                    </TabBtn>

                    <TabBtn>
                        <TabBtnText onClick={this.handleUserManagmentClick}>
                            User Management
                        </TabBtnText>
                        {this.state.userManagementDisplay ?
                        <Triangle>
                            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="20" fill="white" class="bi bi-triangle-fill" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M7.022 1.566a1.13 1.13 0 0 1 1.96 0l6.857 11.667c.457.778-.092 1.767-.98 1.767H1.144c-.889 0-1.437-.99-.98-1.767L7.022 1.566z"/>
                            </svg>
                        </Triangle>:null}
                    </TabBtn>
                </TabBtnWrapper>

            </NavBar>

            <MainBody>
                {this.state.itemListDisplay && this.state.itemListReady ?
                <ItemListWrapper>
                    {this.state.itemList.map((item)=>{
                        return <AdminItemCard item={item} itemList={this.state.itemList} sessionInfo={this.state.sessionInfo}/>
                    })}
                </ItemListWrapper>
                :null}

                {/* {this.state.speakerListDisplay?
                <SpeakerWrapper>
                </SpeakerWrapper>
                :null} */}

                {this.state.partiesListDisplay?
                <PartiesWrapper style={{height:"900px"}}>
                    <FormWrapper>
                    <form  onSubmit={()=>{this.submitParties()}}>
                        <Form
                            id="form"
                            formData={this.state.parties}
                            validationGroup="parties"

                        >
                            <GroupItem >
                                <SimpleItem dataField="CDU" label={{text:"CDU"}} >
                                    <RequiredRule message="erforderlich" />
                                    <PatternRule message="nur Zahlen eingeben" pattern={/^[0-9]+$/}/>
                                </SimpleItem>
                            </GroupItem>
                            <GroupItem >
                                <SimpleItem dataField="FDP" label={{text:"FDP"}} >
                                    <RequiredRule message="erforderlich" />
                                    <PatternRule message="nur Zahlen eingeben" pattern={/^[0-9]+$/}/>
                                </SimpleItem>
                            </GroupItem>
                            <GroupItem >
                                <SimpleItem dataField="LR" label={{text:"LR"}} >
                                    <RequiredRule message="erforderlich" />
                                    <PatternRule message="nur Zahlen eingeben" pattern={/^[0-9]+$/}/>
                                </SimpleItem>
                            </GroupItem>
                            <GroupItem >
                                <SimpleItem dataField="SPD" label={{text:"SPD"}} >
                                    <RequiredRule message="erforderlich" />
                                    <PatternRule message="nur Zahlen eingeben" pattern={/^[0-9]+$/}/>
                                </SimpleItem>
                            </GroupItem>
                            <GroupItem >
                                <SimpleItem dataField="greens" label={{text:"Bündnis 90/Die Grünen"}} >
                                    <RequiredRule message="erforderlich" />
                                    <PatternRule message="nur Zahlen eingeben" pattern={/^[0-9]+$/}/>
                                </SimpleItem>
                            </GroupItem>
                            <ButtonItem
                                    horizontalAlignment="right"
                                    buttonOptions={this.buttonOptions}
                            />
                        </Form>
                    </form>
                    </FormWrapper>
                </PartiesWrapper>
                :null}


                {this.state.settingsDisplay ?
                    <SettingsWrapper>
                        <SettingsPage/>
                    </SettingsWrapper>
                :null}

                {this.state.userManagementDisplay ?
                <UserManagmentWrapper>
                    <UserManagment/>
                </UserManagmentWrapper>
                :null}

                {this.state.importSpeakersClicked?
                <Popup
                    width={480}
                    height={180}
                    showTitle={true}
                    title="import rednerliste"
                    closeOnOutsideClick={true}
                    visible={this.state.importSpeakersClicked}
                    onHiding={() => {this.closeSpeakersImport();}}>
                        <div>
                        { this.state.speakersNumber === 0?
                                <div>
                                    Herunterladen ...
                                </div>
                                :
                                <div>
                                    <div>
                                        Anzahl der Redner: {this.state.speakersNumber}
                                    </div>
                                </div>
                        }
                        
                        <div style={{width: "100%",bottom:"5px"}}>
                        <ImportSpeakersButton onClick={()=>{this.setState({importSpeakersBtn: "importieren ..."});this.handleSpeakersImport();}}>
                            {this.state.importSpeakersBtn}
                        </ImportSpeakersButton>
                        </div>
                        
                                
                         
                        </div>
                </Popup>
                :null}

            </MainBody>


        </Wrapper>)
    }
}

export default AdminPanel

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////    STYLED FUNCTIONAL COMPONENTS         ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

const Wrapper = styled.div.attrs({className: 'admin-panel-wrapper'})`
    float:left;
    width:100%;
`

const NavBar = styled.div.attrs({className: 'admin-navbar'})`
    background-color: #08435C !important;
    width: 100%;
    float:left;
`

const MainHeading = styled.div.attrs({className: 'admin-mainheading font-link'})`
    text-decoration: none;
    padding: 5px;
    font-size: 25px;
    color: white;
    height: 100%;
    padding-top: 20px;
    padding-left: 20px;
    float: left;
    font: Abel;
`

const BackButton = styled.div.attrs({className: 'back'})`
    float: right;
    color: white;
    padding: 10px;
    padding-top: 15px;
`

const TabBtnWrapper = styled.div.attrs({
    className: 'tab-btn-wrapper-nav'
})`

    
    float: left;
    width: 60%;
    height: 100%;
    margin-left: 20px;

`

const TabBtn = styled.div.attrs({className: "session-tab font-fill hoverpointer"})`

    float: left;
    width: 15%;
    height: 100%;
    margin-right: 10px;
    
`

const TabBtnText = styled.div.attrs({})`
    float:left;
    width: 100%;
    background-color: white;
    border-radius: 4px;
    padding: 5px;
    margin: 10px;
    margin-top: 20px;
    margin-bottom: 0px;
    color: black;
    font-size: 14px;
    text-align: center;
`

const Triangle = styled.div.attrs({className: 'tri'})`
    text-align: center;
    width: 100%;
    margin-bottom: -3px;

`

const MainBody = styled.div.attrs({className:'admin-main-body'})`
    width: 100%;
    float: left;
    background-color:#BDC6D1;
`

const ItemListWrapper = styled.div.attrs({className: 'admin-itemlist-wrapper'})`
    width:100%;
    float: left;
`

const SpeakerWrapper = styled.div.attrs({className: 'admin-speakerlist-wrapper'})`
    width:100%;
    float: left;
`

const PartiesWrapper = styled.div.attrs({className: 'admin-partieslist-wrapper'})`
    width:100%;
    float: left;
`

const FormWrapper  =styled.div.attrs({})`
    width: 40%;
    padding: 20px;
`

const SettingsWrapper = styled.div.attrs({})`
    width: 100%;
    float: left;
`

const UserManagmentWrapper = styled.div.attrs({})`
    width: 100%;
    float: left;
`

const ImportSpeakersButton = styled.div.attrs({className: 'speaker-import-btn btn'})`
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