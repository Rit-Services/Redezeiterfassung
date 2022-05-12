const express = require('express')
const xml2js = require('xml2js');
const xml2json = require('xml2json')
const https = require('https');
const request = require('request');
const { json } = require('body-parser');
const { exec } = require("child_process");


startOBS = async (req,res) =>{

  exec('ls ',(error,stdout,stderr)=>{
    if(error){

    }
    if(stderr){
        console.log(`stderr: ${stderr}`);
           return res.status(400).json({success:false, error:stderr});
    }
    console.log(`stdout: ${stdout}`);
    return res.status(200).json({success:true, message:'OBS start successfull!'});
  });
}

module.exports = {
    startOBS,
}