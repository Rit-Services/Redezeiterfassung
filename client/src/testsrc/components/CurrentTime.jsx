import { Component } from "react";
import styled from 'styled-components'

class CurrentTime extends Component{
    constructor(props){
        super(props)
        this.state = {
            currTime: new Date().toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'}),
        }

        this.currTimeRef = setInterval(
            ()=>{this.setState(
                {currTime: new Date().toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'}),}
            )}, 20000
        )
    }
    render(){
        return(
            <DateWrapper style={{marginLeft: '0px'}}>
                {this.state.currTime}
            </DateWrapper>
        )
    }
}

export default CurrentTime


const DateWrapper = styled.div.attrs({className: "date-wrapper"})`
    float: left;
    width: 20%;
    text-align: center;
    background: white;
    border-radius: 5px;
    color: #08435C;
    padding: 5px;
    margin: 10px;
    margin-top: 20px;
    font-family: Abel;
    font-style: normal;
    font-weight: normal;
    font-size: 15px;
    line-height: 23px;

`