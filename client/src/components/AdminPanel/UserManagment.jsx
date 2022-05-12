import { Component } from "react";
import styled from "styled-components";
import apis from "../../api";

import Form, {
    SimpleItem,
    GroupItem,
    ButtonItem,
  } from "devextreme-react/form";
import { RequiredRule , AsyncRule} from 'devextreme-react/validator';

class UserManagment extends Component{
    constructor(props){
        super(props)
        this.state = {
            changePassword:{
                currentPassword:"",
                newPassword:""
            }
        }

        this.buttonOptions = {
            id:"button",
            text:"Absenden",
            type:"success",
            useSubmitBehavior:true,
        }
        this.passwordOptions = {
            mode: 'password',
          };
    }

    submitChangePassword = async(e) =>{
        e.preventDefault();
        console.log("HEEEEEEEEEEEEEEEEEEEEEEELLLLLLLLLLLLLLLLLLLOOOOOOOOOOOOOOOOOO")
        console.log(this.state.passwordItem)
        apis.getSettings().then((result)=>{
            var pass = result.data.data.adminPassword
            var streamingIP = result.data.data.streamingIP
            var apiKey = result.data.data.apiKey
            console.log("new pass: ",this.state.changePassword.newPassword)
            apis.updateSettings({
                adminPassword: this.state.changePassword.newPassword,
                streamingIP: streamingIP,
                apiKey: apiKey
            }).then((result)=>{
                console.log(result)
            })
        })
    }

    passwordValidation = () =>{
        console.log(this.state.changePassword)

        return new Promise((resolve,reject)=>{
            apis.getSettings().then((result)=>{
                var pass = result.data.data.adminPassword
                if(pass == this.state.changePassword.currentPassword){
                    resolve()
                    apis.getSettings().then((result)=>{
                        var pass = result.data.data.adminPassword
                        var streamingIP = result.data.data.streamingIP
                        var apiKey = result.data.data.apiKey
                        console.log("new pass: ",this.state.changePassword.newPassword)
                        apis.updateSettings({
                            adminPassword: this.state.changePassword.newPassword,
                            streamingIP: streamingIP,
                            apiKey: apiKey
                        }).then((result)=>{
                            window.location.href = '/'
                        })
                    })
                    
                }
                else{
                    reject()
                }
            })
        })
        
    }

    render(){
        return(
            <Wrapper>
                <FormWrapper>
                <form  onSubmit={()=>{this.submitChangePassword()}}>
                        <Form
                            id="form"
                            formData={this.state.changePassword}
                            validationGroup="changePassword"

                        >
                            <GroupItem >
                                <SimpleItem dataField="currentPassword" editorType="dxTextBox" label={{text:"aktuelles Passwort"}} editorOptions={this.passwordOptions}>
                                    <RequiredRule message="passwort erforderlich" />
                                    <AsyncRule
                                    message="falsches Passwort"
                                    validationCallback={this.passwordValidation} />
                                </SimpleItem>
                                <SimpleItem dataField="newPassword" label={{text:"neues Passwort"}} >
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

            </Wrapper>
        )
    }
}

export default UserManagment


const Wrapper = styled.div.attrs({})`
    width: 100%;
    height: 1080px;
`

const FormWrapper = styled.div.attrs({})`
    width: 50%;
    margin: 15px;
`