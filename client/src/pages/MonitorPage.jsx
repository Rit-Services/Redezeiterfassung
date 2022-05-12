// Functional React Imports
import React, {Component} from "react";
import styled from "styled-components";

import ProcessTile from '../components/Monitor/ProcessTile'
import "../styles/MonitorPage.css"
class MonitorPage extends Component{
    constructor(props){
        super(props);

        console.log("[MonitorPage] (constructor) Constructor Starting")
    }

    render(){
        return (<MainWrapper>
            <ServerName>
                Server1 
            </ServerName>
            <ServerName>
                Server2 
            </ServerName>
            <Rule/>
            <ProcessTile name="Node 1" type="Frontend" logo="./logo192.png" ip="http://192.168.18.13:3001/" timeInterval="10000" server="1"/>
            
            <ProcessTile name="Node 2" type="Frontend" logo="./logo192.png" ip="http://192.168.18.12:2500/" timeInterval="5000" server="2"/>

            <ProcessTile name="Node 1" type="Backend"  logo="./node.PNG" ip="http://192.168.18.13:3000/" timeInterval="7000" server="1"/>
            <ProcessTile name="Node 2" type="Backend"  logo="./node.PNG" ip="http://192.168.18.12:2600/" timeInterval="8000" server="2"/>

            <ProcessTile name="Mongo1" type="Database" logo="./mongodb.png" ip="http://192.168.18.13:30001" timeInterval="5000" server="1" />
            <ProcessTile name="Mongo2" type="Database" logo="./mongodb.png" ip="http://192.168.18.12:30002" timeInterval="10000" server="2" />

        </MainWrapper>)
    }

}

export default MonitorPage




const MainWrapper = styled.div.attrs({className:"main-wrapper"})`

    float:left;
    width:100%;

`

const ServerName = styled.div.attrs({className:"server-name"})`

    font-size: 22px;
    width: 40%;
    margin: 10px 30px 0px 25px;
    float: left;



`
const Rule = styled.hr.attrs({})`

    width: 100%;
    float:left;

`
