/// Group Object
///  {
//     name: {type: String, required: false},
//     duration: {type: String, required: false},
//    }
/// Stores party name and their duration for speaking
class Group{
    constructor(name= ' ',duration=0){
        this.name = name;
        this.duration = duration;
    }

    setDuration(duration){
        this.duration = duration;
    }

    getDuration(){
        return this.duration;
    }

    toMap(){
        return {
            name: this.name,
            duration: this.duration
        }
    }

    fromMap(map){
        this.name = map.name;
        this.duration = map.name;
    }

}

export default Group