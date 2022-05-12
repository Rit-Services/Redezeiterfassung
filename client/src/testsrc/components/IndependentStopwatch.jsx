// Functional React Imports
import React, {Component} from "react";
import styled from "styled-components";

import Timer from './stopwatch/components/Timer'
import Config from './stopwatch/constants/Config'




class IndependentStopwatch extends Component{

    constructor(props){
        super(props);
        this.state={
            isRunning: false,
            time: 0,
            currDate: new Date().toDateString(),
            currTime: new Date().toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'}),
        }

        this.currTimeRef = setInterval(
            ()=>{this.setState(
                {currTime: new Date().toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'}),}
            )}, 10000
        )

        this.stopwatchFuntionsToSessionBanner = this.props.getStopwatchFuntions
        this.stopwatchFuntionsToSessionBanner(this.start,this.reset,this.stop)
    }

    /////////// STOPWATCH METHODS //////////////////////
    ////////////////////////////////////////////////////

    updateTimer(extraTime) {
        const { time } = this.state;
        this.setState({ time : time + extraTime },()=>{
            console.log("[IndependentStopwatch] [updateTimer] sending time:"+ this.state.time )
            this.stopwatchFuntionsToSessionBanner(this.start,this.reset,this.stop,this.state.time)
        });
    }

    start= (event) => {
        this.setState({
          isRunning : true 
        }, () => {
          this.timerRef = setInterval(
            () => { this.updateTimer( Config.updateInterval ) }, Config.updateInterval
          )
        });
        console.log('start button pressed!')
    }

    stop = (event)=> {
        this.setState({
          isRunning : false 
        }, () => {
          clearInterval(this.timerRef);
        });
    }
    
    reset = (event) => {
        this.setState({isRunning : false,
            time      : 0},
            () => {
                clearInterval(this.timerRef);
              });
        this.stopwatchFuntionsToSessionBanner(this.start,this.reset,this.stop,0)
    }

    //xxxxxxxxx  END Stopwatch Methods xxxxxxxxxxxxxxxxx



    render(){
        return (
            <MainWrapper>
                <StopwatchText>Unabhängige Stoppuhr</StopwatchText>
                <DateWrapper style={{width:"25%"}}>{this.state.currTime}</DateWrapper>
                <StopwatchWrapper>
                    <div style={{width:"50%",float:"left"}}>
                    {this.state.isRunning?
                        <StopwatchBtn className="start-ind-watch stopwatch-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="white" className="bi bi-play-fill" viewBox="0 0 16 16">
                            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                            </svg>
                        </StopwatchBtn>
                        :<StopwatchBtn className="start-ind-watch stopwatch-btn" onClick={this.start}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="white" className="bi bi-play-fill" viewBox="0 0 16 16">
                            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                            </svg>
                        </StopwatchBtn>
                    }
                    
                    <div>
                        <StopwatchBtn className="pause-ind-watch stopwatch-btn" onClick={this.stop}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="white" className="bi bi-pause-fill" viewBox="0 0 16 16">
                            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                            </svg>
                        </StopwatchBtn>
                        <StopwatchBtn className="stop-ind-watch stopwatch-btn" onClick={this.reset}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="white" className="bi bi-stop-fill" viewBox="0 0 16 16">
                            <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
                            </svg>
                        </StopwatchBtn>
                    </div>
                    </div>
                    {/* } */}
                    <Timer time={this.state.time} />
                </StopwatchWrapper>
                {/* <DateWrapper>{this.state.currDate}</DateWrapper> */}
                {/* <DateWrapper style={{float:"left",marginLeft:"11%",width:"25%"}}>{this.state.currTime}</DateWrapper> */}
            </MainWrapper>
        );
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////    STYLED FUNCTIONAL COMPONENTS         ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

const MainWrapper = styled.div.attrs({ className: "IndependentStopwatch-wrapper"})`

    width: 100%;
    height:100%;

`

const StopwatchText = styled.div.attrs({className:" stopwatch-text font-link"})`
    width: 50%;
    padding: 5px;
    margin: 5px;
    font-size: 22px;
    line-height: 28px;
    float: left;
    margin-right: 0px;
    padding-right: 0px;
    margin-top: 25px;
    margin-left: 0px;

`

const DateWrapper = styled.div.attrs({ className: "date-wrapper font-link"})`
    float: left;
    width: 160px;
    text-align: center;
    background: #08435C;
    border-radius: 5px;
    color: white;
    padding: 5px;
    margin: 10px;
    margin-bottom: 10px;
    margin-left: 10px;
    margin-top: 27px;
`


const StopwatchWrapper = styled.div.attrs({ className: "ind-stopwatch-wrapper"})`
    float:left;
    width: 100%;
    margin-top: 10px;
    margin-bottom: 20px;

    .Timer{
        font-size: 20px;
        font-weight: bold;
        float:right;
        padding-top: 3px;
    }

    .Timer{
        float: left;
        margin-left: 0px;
        width: 25%;
        text-align: center;
        background: #08435C;
        border-radius: 5px;
        color: white;
        padding: 5px;
        margin: 10px;
        margin-right: 0;

        font-family: Abel;
        font-style: normal;
        font-weight: normal;
        font-size: 18px;
        line-height: 23px;

    }

    .stopwatch-btn{
        
        float:left;
    }
    .stopwatch-btn:hover{
        cursor:pointer;
    }
`

const StopwatchBtn = styled.div.attrs({})`
    background: #08435C;
    border-radius: 5px;
    margin:10px;

`

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//xxxxxxxxxxxxxxxxxxxxxxxxx   END OF STYLED FUNCTIONAL COMPONENTS      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


export default IndependentStopwatch