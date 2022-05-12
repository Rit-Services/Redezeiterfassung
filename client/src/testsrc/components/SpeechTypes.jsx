import React, { Component } from 'react'
import styled from 'styled-components'


class SpeechTypes extends Component{

    constructor(props){
        super(props);

        console.log("[SpeechTypes] (constructor) Entering constructor of SpeechTypes");
    }

    render(){

        return(
            <Wrapper>
                <SpeechBox>
                    Kurz- <br/>intervention
                </SpeechBox>
                <SpeechBox>
                    Sonstiges <br/> zum TOP
                </SpeechBox>
                <SpeechBox>
                    Redner-<br/>liste
                </SpeechBox>
            </Wrapper>
        );

    }

}

export default SpeechTypes

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////    STYLED FUNCTIONAL COMPONENTS         ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

/// UTILITY COMPONENTS

const Wrapper = styled.div.attrs({className:"type-speech-wrapper"})`
    padding: 10px 0 10px 0;
    margin: 0px;
    width:50%;
    float: left;
    margin-top: 15px;
    text-align: center;
    height: 50%;
    justify-content: center;
    display: flex;

    
`


const SpeechBox = styled.div.attrs({className:"ninety-sec font-link"})`
    padding: 5px;
    color: white;
    background-color: #5C778E;
    border-radius: 10px;
    width: 17%;
    float:left;
    text-align:center;
    margin: 5px;
    font-size: 18px;
    line-height: 23px;
    height: 70px;
    padding-top:12px;

`

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//xxxxxxxxxxxxxxxxxxxxxxxxx   END OF STYLED FUNCTIONAL COMPONENTS      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx