import axios from 'axios'

const api = axios.create({
    // baseURL: 'http://58.65.129.130:3008/api',
    baseURL: 'http://10.15.28.160:2929/api',
    // baseURL: 'http://192.168.18.31:3000/api',
    // baseURL: `${process.env.REACT_APP_REAL_API}`,
})

export const insertSession = payload => api.post(`/session`, payload)
export const insertSessionXML = payload => api.post(`/sessionxml`,payload)
export const getAllSessions = () => api.get(`/sessions`)
export const getAllSpeakers = () => api.get(`/getspeakers`)
export const startOBS = () => api.get(`/startobs`)
export const startRecording = () => api.get(`/startrecording`)
export const stopRecording = () => api.get(`/stoprecording`)
export const getRecordingInfo = () => api.get(`/getinfo`)
export const renameFile = payload => api.post(`/renamefile`,payload)
export const updateItemsList = payload => api.post(`/updateitemslist`,payload)
export const createActiveSession = payload => api.post(`/createactive`,payload)
export const updateActiveSession = payload => api.post(`/updateactive`,payload)
export const getActiveItemList = () => api.get(`/getactive`)
export const resetActiveSession = () => api.get(`/resetactive`)
export const deleteAllSession = () => api.get(`/deletesessions`)
export const getSessionWeb = () => api.get(`/sessionweb`)
export const updateSpeakerList = payload => api.post(`/speakersdb`,payload)
export const getSpeakersDB = () => api.get(`/getspeakersdb`)
export const updateUtil = payload => api.post(`/util`,payload)
export const getUtil = () => api.get(`/getutil`)
export const updateActiveIndex = payload => api.post(`/utilindex`,payload)
export const updateParties = payload => api.post(`/updateparties`,payload)
export const startStream = payload => api.post(`/startstream`,payload)
export const stopStream = payload => api.post(`/stopstream`,payload)
export const getStreamInfo = () => api.get(`/streaminfo`)
export const sendToVOD = () => api.get(`/sendtovod`)
export const updateSettings = payload => api.post(`/updatesettings`,payload)
export const getSettings = () => api.get(`/getsettings`)
export const startUDPTime = () => api.get(`/sendudptime`)
export const stopUDPTime = () => api.get(`/stopudptime`)
export const UDPData = payload => api.post(`/sendudpdata`,payload)

const apis = {
    insertSession,
    insertSessionXML,
    getAllSessions,
    getAllSpeakers,
    deleteAllSession,
    startOBS,
    startRecording,
    stopRecording,
    getRecordingInfo,
    renameFile,
    updateItemsList,
    createActiveSession,
    updateActiveSession,
    getActiveItemList,
    resetActiveSession,
    getSessionWeb,
    updateSpeakerList,
    getSpeakersDB,
    updateUtil,
    getUtil,
    updateActiveIndex,
    updateParties,
    startStream,
    stopStream,
    getStreamInfo,
    sendToVOD,
    updateSettings,
    getSettings,
    UDPData,
    startUDPTime,
    stopUDPTime,
}

export default apis