// Functional React Imports
import React, {Component} from "react";
import styled from "styled-components";

import axios from 'axios'
import ReactLoading from "react-loading";



// const health = payload => api.post(`/health`, payload)

class ProcessTile extends Component{
    constructor(props){
        super(props)

        this.state = {
            status: "down"
        }

        


        this.healthCheck()
    }


    healthCheck = () =>{
        var payload = {
            ip: this.props.ip,
        }
        var api
        if(this.props.server == "1"){
            console.log("SERVER 1")
            api = axios.create({
                baseURL: 'http://192.168.18.13:2000/api',
            })
        }
        if(this.props.server == "2"){
            api = axios.create({
                baseURL: 'http://192.168.18.12:2000/api',
            })
        }
        // console.log(api)
        var health = payload => api.post(`/health`, payload)

        this.statusRef = setInterval(()=>{
            health(payload).then((response)=>{
                console.log(response.status)
                if(response.status === 201){
                    // console.log("UP")
                    this.setState({
                        status: "up",
                    })
                }
            }).catch((error)=>{
                // console.log("ERROR CAUGHT:",error)
                this.setState({
                    status: "down",
                })
            });
        },this.props.timeInterval)
    }

    handleStartButton = () =>{
        var api
        if(this.props.server == "1"){
            console.log("SERVER 1")
            api = axios.create({
                baseURL: 'http://192.168.18.13:2000/api',
            })
        }
        if(this.props.server == "2"){
            api = axios.create({
                baseURL: 'http://192.168.18.12:2000/api',
            })
        }
        
        if(this.props.type === "Frontend"){
            var start = () => api.get(`/startfe`)
            this.setState({
                startWait: true,
            },
            ()=>{
                start().then(()=>{
                    this.setState({
                        startWait: false,
                    })
                }).catch((error)=>{
                    console.log(error)
                })
            })
        }
        if(this.props.type === "Backend"){
            var start = () => api.get(`/startbe`)
            this.setState({
                startWait: true,
            },
            ()=>{
                start().then(()=>{
                    this.setState({
                        startWait: false,
                    })
                }).catch((error)=>{
                    console.log(error)
                })
            })
        }
        if(this.props.type === "Database"){
            var start = () => api.get(`/startdb`)
            this.setState({
                startWait: true,
            },
            ()=>{
                start().then(()=>{
                    this.setState({
                        startWait: false,
                    })
                }).catch((error)=>{
                    console.log(error)
                })
            })
        }
    }

    handleStopButton = () =>{
        var api
        if(this.props.server == "1"){
            console.log("SERVER 1")
            api = axios.create({
                baseURL: 'http://192.168.18.13:2000/api',
            })
        }
        if(this.props.server == "2"){
            api = axios.create({
                baseURL: 'http://192.168.18.12:2000/api',
            })
        }
        
        if(this.props.type === "Frontend"){
            var start = () => api.get(`/stopfe`)
            this.setState({
                stopWait: true,
            },
            ()=>{
                start().then(()=>{
                    this.setState({
                        stopWait: false,
                    })
                }).catch((error)=>{
                    console.log(error)
                })
            })
        }
        if(this.props.type === "Backend"){
            var start = () => api.get(`/stopbe`)
            this.setState({
                stopWait: true,
            },
            ()=>{
                start().then(()=>{
                    this.setState({
                        stopWait: false,
                    })
                }).catch((error)=>{
                    console.log(error)
                })
            })
        }
        if(this.props.type === "Database"){
            var start = () => api.get(`/stopdb`)
            this.setState({
                stopWait: true,
            },
            ()=>{
                start().then(()=>{
                    this.setState({
                        stopWait: false,
                    })
                }).catch((error)=>{
                    console.log(error)
                })
            })
        }
    }

    render(){
        return (
            <TileWrapper>
                <LogoWrapper>
                    <img src={this.props.logo} width="80px" height="80px" alt="react logo"/>
                </LogoWrapper>
                <ServiceName>
                    {this.props.name}
                </ServiceName>
                <ServiceType>
                    {this.props.type}
                </ServiceType>
                <ButtonWrapper>
                    {this.state.startWait?
                        <ReactLoading height="60px" width="60px" className="loading" type="cylon" color="#000" />
                    :
                        <Button onClick={this.handleStartButton}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" className="bi bi-play-fill" viewBox="0 0 16 16">
                            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                            </svg>
                        </Button>
                    }
                    
                    {this.state.stopWait?
                        <ReactLoading height="60px" width="60px" className="loading" type="cylon" color="#000" />
                    :
                        <Button onClick={this.handleStopButton}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" className="bi bi-stop-fill" viewBox="0 0 16 16">
                            <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
                            </svg>
                        </Button>
                    }
                </ButtonWrapper>

                <StatusWrapper>
                    {this.state.status === "up" ?
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="#149E00" className="bi bi-record-fill" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10z"/>
                        </svg>
                    :
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="#B60202" className="bi bi-record-fill" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10z"/>
                        </svg>
                    }
                    <br/>
                    STATUS

                    {this.state.status === "up" ?
                        <StatusText style={{color: "#149E00"}}>
                            UP
                        </StatusText>
                    :
                        <StatusText style={{color: "#B60202"}}>
                            DOWN
                        </StatusText>
                    }
                </StatusWrapper>

            </TileWrapper>
        )
    }
}

export default ProcessTile

////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////    STYLED FUNCTIONAL COMPONENTS         ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////

const TileWrapper = styled.div.attrs({className: "tile-wrapper"})`
    width: 40%;
    float: left;
    border-radius: 10px;
    border: 1px solid black;
    box-shadow: 0px 0px 10px 5px #888888;

    margin:25px;
    
`

const LogoWrapper = styled.div.attrs({className: "logo"})`
    
    padding: 10px;
    padding-left: 15px;
    float: left;
`

const ServiceName = styled.div.attrs({className: "name"})`

    float: left;
    font: Abel;
    color: black;
    font-size: 22px;
    font-weight: bold;
    padding: 5px;
    padding-left: 10px;
`

const ServiceType = styled.div.attrs({className: 'service-type'})`

    float: left;
    font: Abel;
    color: #767676;
    font-size: 16px;
    padding: 5px;
    padding-top: 10px;
    clear: right;
    width: 35%;

`

const ButtonWrapper = styled.div.attrs({className: "button-wrapper"})`
    width: 35%;
    float: left;
    margin-left: -310px;
    margin-top: 35px;

`

const Button = styled.div.attrs({})`

    float: left;
    padding: 5px;

`


const StatusWrapper = styled.div.attrs({})`
    float: right;
    padding-right: 10px;
    text-align: center;

`

const StatusText = styled.div.attrs({})`
    font-size: 20px;
    font-weight: bold;
    text-align: center;

`


