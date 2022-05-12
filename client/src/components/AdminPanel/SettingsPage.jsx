import { Component } from "react";
import styled from "styled-components";
import apis from "../../api";

import Form, {
    SimpleItem,
    GroupItem,
    ButtonItem,
  } from "devextreme-react/form";
import { PatternRule, RequiredRule } from 'devextreme-react/validator';

class SettingsPage extends Component{
    constructor(props){
        super(props)

        this.state = {
            settings: {},
            settingsLoaded: false,
        }

        this.buttonOptions = {
            id:"button",
            text:"Absenden",
            type:"success",
            useSubmitBehavior:true,
        }

        apis.getSettings().then((result)=>{
            var settingsObject = {
                streamingIP: result.data.data.streamingIP,
                apiKey: result.data.data.apiKey
            }
            this.setState({
                settings: settingsObject,
                settingsLoaded: true,
            })
        })
        
    }

    submitSettings = (e) =>{
        var settingsObject = this.state.settings
        apis.updateSettings(settingsObject).then((result)=>{
            window.location.reload()
        })
    }

    render() {
        return (<Wrapper>
            <FormWrapper>
            <form  onSubmit={()=>{this.submitSettings()}}>
                        <Form
                            id="form"
                            formData={this.state.settings}
                            validationGroup="settings"

                        >
                            <GroupItem >
                                <SimpleItem dataField="streamingIP" label={{text:"Streaming IP"}} >
                                    <RequiredRule message="erforderlich" />
                                </SimpleItem>
                                <SimpleItem dataField="apiKey" label={{text:"API Key"}} >
                                    <RequiredRule message="erforderlich" />
                                </SimpleItem>
                            </GroupItem>
                            <ButtonItem
                                    horizontalAlignment="right"
                                    buttonOptions={this.buttonOptions}
                            />

                        </Form>
            </form>
            </FormWrapper>

        </Wrapper>)
    }

}

export default SettingsPage

const Wrapper = styled.div.attrs({})`
    width: 100%;
    height: 1080px;
`

const FormWrapper = styled.div.attrs({})`
    width: 50%;
    margin: 15px;
`